export type BridgeConnectionStatus =
  "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";

export type BridgePrinterStatus =
  | "PRINTER_READY"
  | "PRINTER_OFFLINE"
  | "PAPER_OUT"
  | "COVER_OPEN"
  | "PRINTING"
  | "PRINT_ERROR"
  | "UNKNOWN";

export interface BridgePrintItem {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  category?: string;
}

export interface BridgePrintRequest {
  action: "print" | "reprint";
  orderId: string;
  tenantId: string;
  billNumber?: string;
  tableNumber?: string;
  serverName?: string;
  paymentMode?: string;
  transactionId?: string;
  timestamp?: string;
  notes?: string;
  store: {
    name: string;
    branch?: string;
    address?: string;
    gstin?: string;
    phone?: string;
  };
  items: BridgePrintItem[];
  taxes: {
    cgst: number;
    cgstRate?: number;
    sgst: number;
    sgstRate?: number;
    vat?: number;
    vatRate?: number;
    totalTax: number;
  };
  totals: {
    subtotal: number;
    discount?: number;
    tax: number;
    grandTotal: number;
  };
  rollWidth?: 58 | 80;
}

export interface BridgePrintResponse {
  success: boolean;
  orderId?: string;
  status: string;
  message?: string;
  latencyMs?: number;
  dispatchLatencyMs?: number;
}

export interface BridgeState {
  status: BridgeConnectionStatus;
  isOnline: boolean;
  printerStatus: BridgePrinterStatus | null;
  latencyMs: number;
  lastHeartbeat: number | null;
  reconnectAttempts: number;
  lastMessage: string;
}

type StateListener = (state: BridgeState) => void;
type BridgeEvent =
  | { event: "pong"; timestamp?: number; status: string }
  | {
      event: "printer_status";
      status: string;
      message?: string;
      timestamp?: number;
    }
  | BridgePrintResponse;

const HEARTBEAT_INTERVAL_MS = 3000;
const HEARTBEAT_TIMEOUT_MS = 2000;
const PRINT_TIMEOUT_MS = 5000;
const RECONNECT_DELAY_MS = 3000;

const bridgeUrl =
  import.meta.env.VITE_BRIDGE_WS_URL ?? "ws://localhost:9101/ws";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBridgeEvent(value: unknown): value is BridgeEvent {
  if (!isRecord(value)) return false;

  if ("event" in value && value.event === "pong") {
    return typeof value.status === "string";
  }
  if ("event" in value && value.event === "printer_status") {
    return typeof value.status === "string";
  }
  return typeof value.success === "boolean" && typeof value.status === "string";
}

function failureResponse(
  status: string,
  message: string,
  orderId?: string,
): BridgePrintResponse {
  return { success: false, orderId, status, message };
}

function normalizePrinterStatus(status: string): BridgePrinterStatus {
  switch (status.trim().toUpperCase()) {
    case "PRINTER_READY":
    case "READY":
      return "PRINTER_READY";
    case "PRINTER_OFFLINE":
    case "OFFLINE":
    case "DISCONNECTED":
      return "PRINTER_OFFLINE";
    case "PAPER_OUT":
      return "PAPER_OUT";
    case "COVER_OPEN":
      return "COVER_OPEN";
    case "PRINTING":
    case "SPOOLED":
      return "PRINTING";
    case "PRINT_ERROR":
    case "ERROR":
      return "PRINT_ERROR";
    default:
      return "UNKNOWN";
  }
}

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export class BridgeWebSocketClient {
  private socket: WebSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private listeners = new Set<StateListener>();
  private readonly url: string;
  private state: BridgeState = {
    status: "DISCONNECTED",
    isOnline: false,
    printerStatus: null,
    latencyMs: 0,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    lastMessage: "",
  };
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastPingSentAt: number | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isExplicitlyClosed = false;
  private pendingPrints = new Map<
    string,
    {
      resolve: (response: BridgePrintResponse) => void;
      timeout: ReturnType<typeof setTimeout>;
      dispatchLatencyMs: number;
    }
  >();

  constructor(url = bridgeUrl) {
    this.url = url;
  }

  connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.isExplicitlyClosed = false;
    this.setState({
      status: "CONNECTING",
      isOnline: false,
      printerStatus: null,
    });

    let socket: WebSocket;
    try {
      socket = new WebSocket(this.url);
    } catch (error) {
      this.setState({
        status: "ERROR",
        isOnline: false,
        printerStatus: null,
        lastMessage:
          error instanceof Error ? error.message : "Could not create WebSocket",
      });
      this.scheduleReconnect();
      return Promise.reject(error);
    }
    this.socket = socket;

    this.connectPromise = new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this.connectPromise = null;
        if (error) {
          this.setState(
            this.isExplicitlyClosed
              ? { status: "DISCONNECTED", isOnline: false }
              : {
                  status: "ERROR",
                  isOnline: false,
                  printerStatus: null,
                  lastMessage: error.message,
                },
          );
          socket.close();
          reject(error);
          return;
        }

        this.setState({
          status: "CONNECTED",
          isOnline: true,
          printerStatus: null,
          reconnectAttempts: 0,
          lastMessage: `Connected to URQR-Bridge (${this.url})`,
        });
        this.startHeartbeat(socket);
        resolve();
      };

      const timeout = setTimeout(
        () => finish(new Error("Timed out connecting to URQR-Bridge")),
        5000,
      );

      socket.addEventListener("open", () => {
        if (this.socket !== socket) {
          socket.close();
          return;
        }
        finish();
      });

      socket.addEventListener("message", (event: MessageEvent<string>) => {
        let value: unknown;
        try {
          value = JSON.parse(event.data);
        } catch (error) {
          console.error("URQR Bridge sent invalid JSON", error);
          return;
        }
        if (!isBridgeEvent(value)) {
          console.error("URQR Bridge sent an unsupported message", value);
          return;
        }

        if ("event" in value && value.event === "pong") {
          this.state.lastHeartbeat = Date.now();
          if (this.lastPingSentAt !== null) {
            this.state.latencyMs = Math.max(
              1,
              Date.now() - this.lastPingSentAt,
            );
          }
          this.lastPingSentAt = null;
          if (this.heartbeatTimeout !== null) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
          }
          this.notify();
          return;
        }
        if ("event" in value && value.event === "printer_status") {
          this.setState({
            printerStatus: normalizePrinterStatus(value.status),
            lastMessage: value.message ?? value.status,
          });
          return;
        }

        if (!("success" in value)) return;
        const pending = value.orderId
          ? this.pendingPrints.get(value.orderId)
          : undefined;
        if (pending && value.orderId) {
          clearTimeout(pending.timeout);
          this.pendingPrints.delete(value.orderId);
          pending.resolve({
            ...value,
            dispatchLatencyMs: pending.dispatchLatencyMs,
          });
        } else {
          this.setState({ lastMessage: value.message ?? value.status });
        }
      });

      socket.addEventListener("error", () => {
        const error = new Error(
          `Could not connect to the URQR Bridge at ${this.url}`,
        );
        if (!settled) {
          finish(error);
        } else {
          this.setState({
            status: "ERROR",
            isOnline: false,
            printerStatus: null,
            lastMessage: error.message,
          });
          socket.close();
        }
      });

      socket.addEventListener("close", () => {
        if (this.socket === socket) {
          this.socket = null;
          this.stopHeartbeat();
          this.setState({
            status: "DISCONNECTED",
            isOnline: false,
            printerStatus: null,
            lastMessage: "Connection to URQR-Bridge closed",
          });
          this.failPendingPrints("DISCONNECTED", "URQR-Bridge disconnected");
          this.scheduleReconnect();
        }
        if (!settled) {
          finish(
            new Error("URQR-Bridge closed the WebSocket before connecting"),
          );
        }
      });
    });

    return this.connectPromise;
  }

  disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    const socket = this.socket;
    this.socket = null;
    this.connectPromise = null;
    this.failPendingPrints("DISCONNECTED", "URQR-Bridge disconnected");
    this.setState({
      status: "DISCONNECTED",
      isOnline: false,
      printerStatus: null,
      lastMessage: "Disconnected from URQR-Bridge",
    });
    socket?.close();
  }

  getState(): BridgeState {
    return { ...this.state };
  }

  getStatus(): BridgeConnectionStatus {
    return this.state.status;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  subscribeStatus(
    listener: (status: BridgeConnectionStatus) => void,
  ): () => void {
    listener(this.state.status);
    return this.subscribe((state) => listener(state.status));
  }

  sendPing(): void {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error("URQR-Bridge WebSocket is not connected");
    }
    this.lastPingSentAt = Date.now();
    socket.send(JSON.stringify({ action: "ping" }));
  }

  printReceipt(
    request: BridgePrintRequest,
    checkoutStartedAt = performance.now(),
  ): Promise<BridgePrintResponse> {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.resolve(
        failureResponse(
          "OFFLINE",
          "URQR-Bridge is offline; the receipt was not dispatched.",
          request.orderId,
        ),
      );
    }
    if (this.pendingPrints.has(request.orderId)) {
      return Promise.resolve(
        failureResponse(
          "DUPLICATE_REQUEST",
          `A print request for order ${request.orderId} is already pending.`,
          request.orderId,
        ),
      );
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.pendingPrints.delete(request.orderId);
        resolve({
          ...failureResponse(
            "TIMEOUT",
            "Print request timed out after 5 seconds.",
            request.orderId,
          ),
          dispatchLatencyMs: pending.dispatchLatencyMs,
        });
      }, PRINT_TIMEOUT_MS);
      const pending = {
        resolve,
        timeout,
        dispatchLatencyMs: 0,
      };
      this.pendingPrints.set(request.orderId, pending);

      try {
        socket.send(JSON.stringify(request));
        pending.dispatchLatencyMs = Math.max(
          0,
          performance.now() - checkoutStartedAt,
        );
      } catch (error) {
        clearTimeout(timeout);
        this.pendingPrints.delete(request.orderId);
        pending.dispatchLatencyMs = Math.max(
          0,
          performance.now() - checkoutStartedAt,
        );
        resolve({
          ...failureResponse(
            "SEND_FAILED",
            error instanceof Error
              ? error.message
              : "Could not dispatch the print request.",
            request.orderId,
          ),
          dispatchLatencyMs: pending.dispatchLatencyMs,
        });
      }
    });
  }

  private startHeartbeat(socket: WebSocket): void {
    this.stopHeartbeat();
    const ping = () => {
      if (this.socket !== socket || socket.readyState !== WebSocket.OPEN) {
        this.stopHeartbeat();
        return;
      }
      if (this.lastPingSentAt !== null) return;

      try {
        this.sendPing();
      } catch (error) {
        console.error("Could not send URQR-Bridge heartbeat", error);
        socket.close();
        return;
      }

      this.heartbeatTimeout = setTimeout(() => {
        this.heartbeatTimeout = null;
        this.lastPingSentAt = null;
        this.setState({
          status: "ERROR",
          isOnline: false,
          printerStatus: null,
          lastMessage: "URQR-Bridge heartbeat timed out",
        });
        socket.close();
      }, HEARTBEAT_TIMEOUT_MS);
    };

    ping();
    this.heartbeatInterval = setInterval(ping, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout !== null) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    this.lastPingSentAt = null;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null || this.isExplicitlyClosed) return;
    this.state.reconnectAttempts += 1;
    this.notify();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect().catch((error: unknown) => {
        console.error("Could not reconnect to URQR-Bridge", error);
      });
    }, RECONNECT_DELAY_MS);
  }

  private failPendingPrints(status: string, message: string): void {
    for (const [orderId, pending] of this.pendingPrints) {
      clearTimeout(pending.timeout);
      pending.resolve({
        ...failureResponse(status, message, orderId),
        dispatchLatencyMs: pending.dispatchLatencyMs,
      });
    }
    this.pendingPrints.clear();
  }

  private setState(partial: Partial<BridgeState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export const bridgeClient = new BridgeWebSocketClient();
