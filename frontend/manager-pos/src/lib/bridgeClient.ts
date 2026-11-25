/**
 * URQR Bridge Client (WebSocket ws://localhost:9101)
 *
 * Communicates with the local Go 1.27.4 URQR-Bridge daemon inside Tauri v2 desktop POS.
 * Handles:
 * 1. Dedicated WebSocket transport on ws://localhost:9101.
 * 2. 3-second heartbeat monitor ping loop for connection health.
 * 3. Automatic exponential reconnect logic when daemon restarts.
 * 4. ESC/POS print job dispatching and status broadcasting.
 */

export type BridgeConnectionStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "ERROR";

export interface BridgeStatusEvent {
  status: string;
  message: string;
  timestamp: number;
}

export interface BridgePongEvent {
  event: "pong";
  timestamp: number;
  status: string;
}

export interface BridgePrintItem {
  name: string;
  price: number;
  quantity: number;
}

export interface BridgePrintRequest {
  orderId: string;
  tableNumber?: string;
  serverName?: string;
  items: BridgePrintItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  date?: string;
  time?: string;
  notes?: string;
}

export interface BridgePrintResponse {
  success: boolean;
  orderId?: string;
  status: string;
  message: string;
  latencyMs?: number;
}

export interface BridgeState {
  status: BridgeConnectionStatus;
  isOnline: boolean;
  latencyMs: number;
  lastHeartbeat: number | null;
  reconnectAttempts: number;
  lastMessage: string;
}

type StateListener = (state: BridgeState) => void;

export class UrqrBridgeClient {
  private url: string;
  private ws: WebSocket | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPingSentAt: number = 0;
  private isExplicitlyClosed: boolean = false;

  private state: BridgeState = {
    status: "DISCONNECTED",
    isOnline: false,
    latencyMs: 0,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    lastMessage: "",
  };

  private listeners = new Set<StateListener>();

  constructor(url: string = "ws://localhost:9101") {
    this.url = url;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((listener) => listener(copy));
  }

  public getState(): BridgeState {
    return { ...this.state };
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.state.status = "CONNECTING";
    this.notify();

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.state.status = "CONNECTED";
        this.state.isOnline = true;
        this.state.reconnectAttempts = 0;
        this.state.lastMessage = "Connected to URQR-Bridge (ws://localhost:9101)";
        this.notify();

        // Start 3-second heartbeat monitor
        this.startHeartbeat();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = typeof event.data === "string" ? event.data : "";
          const parsed = JSON.parse(raw);

          // Handle pong event
          if (parsed.event === "pong" || parsed.action === "pong") {
            const now = Date.now();
            if (this.lastPingSentAt > 0) {
              this.state.latencyMs = Math.max(1, now - this.lastPingSentAt);
            }
            this.state.lastHeartbeat = now;
            this.notify();
            return;
          }

          // Handle initial status broadcast
          if (parsed.status) {
            this.state.lastMessage = parsed.message || parsed.status;
            this.notify();
          }
        } catch {
          // Ignore unparseable raw bytes
        }
      };

      this.ws.onerror = () => {
        this.state.status = "ERROR";
        this.state.isOnline = false;
        this.notify();
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.state.status = "DISCONNECTED";
        this.state.isOnline = false;
        this.notify();

        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.state.status = "ERROR";
      this.state.isOnline = false;
      this.notify();
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state.status = "DISCONNECTED";
    this.state.isOnline = false;
    this.notify();
  }

  /**
   * Heartbeat monitor pings local URQR-Bridge daemon every 3 seconds (3,000ms).
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    // Send immediate first ping
    this.sendPing();

    this.heartbeatInterval = setInterval(() => {
      this.sendPing();
    }, 3000); // 3 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.lastPingSentAt = Date.now();
      this.ws.send(JSON.stringify({ action: "ping" }));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.isExplicitlyClosed) return;

    this.state.reconnectAttempts += 1;
    // Fast reconnect: retry every 3 seconds for local daemon recovery
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  /**
   * Dispatches an ESC/POS print job to the URQR-Bridge daemon over WebSocket.
   */
  public async printReceipt(req: BridgePrintRequest): Promise<BridgePrintResponse> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return {
        success: false,
        status: "OFFLINE",
        message: "URQR Bridge offline (ws://localhost:9101 not reachable). Check printer daemon.",
      };
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          success: false,
          status: "TIMEOUT",
          message: "Print request timed out after 5 seconds.",
        });
      }, 5000);

      const oneTimeHandler = (event: MessageEvent) => {
        try {
          const res = JSON.parse(event.data);
          if (res.orderId === req.orderId || res.success !== undefined) {
            clearTimeout(timeout);
            this.ws?.removeEventListener("message", oneTimeHandler);
            resolve(res as BridgePrintResponse);
          }
        } catch {
          // Continue waiting
        }
      };

      this.ws?.addEventListener("message", oneTimeHandler);
      this.ws?.send(JSON.stringify(req));
    });
  }
}

// Singleton Bridge Client Instance
export const bridgeClient = new UrqrBridgeClient();
