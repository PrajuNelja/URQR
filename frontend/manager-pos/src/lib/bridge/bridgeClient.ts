export type BridgeMessage =
  | { type: "connected"; service: string }
  | { type: "ack"; id: string; status: string }
  | { type: "pong"; id: string; status: string }
  | { type: "error"; id?: string; error: string };

type BridgeCommand = {
  type: "hello" | "ping";
  id: string;
};

export type BridgeConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected";

const HEARTBEAT_INTERVAL_MS = 3000;
const HEARTBEAT_TIMEOUT_MS = 2000;

const bridgeUrl =
  import.meta.env.VITE_BRIDGE_WS_URL ?? "ws://127.0.0.1:9100/ws";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBridgeMessage(value: unknown): value is BridgeMessage {
  if (!isRecord(value) || !("type" in value)) {
    return false;
  }

  switch (value.type) {
    case "connected":
      return typeof value.service === "string";
    case "ack":
    case "pong":
      return typeof value.id === "string" && typeof value.status === "string";
    case "error":
      return typeof value.error === "string";
    default:
      return false;
  }
}

export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export class BridgeWebSocketClient {
  private socket: WebSocket | null = null;
  private connectPromise: Promise<void> | null = null;
  private messageId = 0;
  private listeners = new Set<(message: BridgeMessage) => void>();
  private statusListeners = new Set<
    (status: BridgeConnectionStatus) => void
  >();
  private readonly url: string;
  private status: BridgeConnectionStatus = "disconnected";
  private heartbeatIntervalId: number | null = null;
  private heartbeatTimeoutId: number | null = null;
  private pendingHeartbeatId: string | null = null;

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

    this.setStatus("connecting");
    const socket = new WebSocket(this.url);
    this.socket = socket;
    const helloId = this.nextId("hello");

    this.connectPromise = new Promise<void>((resolve, reject) => {
      let settled = false;
      const timeoutId = window.setTimeout(() => {
        finish(new Error("Timed out waiting for the URQR Bridge handshake"));
      }, 5000);

      const finish = (error?: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timeoutId);
        if (this.socket === socket) {
          this.connectPromise = null;
        }
        if (error) {
          this.setStatus("disconnected");
          if (this.socket === socket) {
            this.socket = null;
          }
          socket.close();
          reject(error);
        } else {
          this.setStatus("connected");
          this.startHeartbeat(socket);
          resolve();
        }
      };

      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ type: "hello", id: helloId }));
      });

      socket.addEventListener("message", (event: MessageEvent<string>) => {
        let value: unknown;
        try {
          value = JSON.parse(event.data);
        } catch (error) {
          console.error("URQR Bridge sent invalid JSON", error);
          return;
        }

        if (!isBridgeMessage(value)) {
          console.error("URQR Bridge sent an unsupported message", value);
          return;
        }

        for (const listener of this.listeners) {
          listener(value);
        }

        if (value.type === "ack" && value.id === helloId) {
          finish();
        } else if (
          value.type === "pong" &&
          value.id === this.pendingHeartbeatId
        ) {
          this.pendingHeartbeatId = null;
          if (this.heartbeatTimeoutId !== null) {
            window.clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
          }
        } else if (value.type === "error" && value.id === helloId) {
          finish(new Error(`URQR Bridge rejected handshake: ${value.error}`));
        }
      });

      socket.addEventListener("error", () => {
        const error = new Error(
          `Could not connect to the URQR Bridge at ${this.url}`,
        );
        if (!settled) {
          finish(error);
        } else {
          console.error(error.message);
          this.setStatus("disconnected");
          socket.close();
        }
      });

      socket.addEventListener("close", () => {
        if (this.socket === socket) {
          this.socket = null;
          this.stopHeartbeat();
          this.setStatus("disconnected");
        }
        if (!settled) {
          finish(new Error("URQR Bridge closed the WebSocket before handshake"));
        }
      });
    });

    return this.connectPromise;
  }

  send(command: BridgeCommand): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      throw new Error("URQR Bridge WebSocket is not connected");
    }
    this.socket.send(JSON.stringify(command));
  }

  subscribe(listener: (message: BridgeMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus(): BridgeConnectionStatus {
    return this.status;
  }

  subscribeStatus(
    listener: (status: BridgeConnectionStatus) => void,
  ): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  disconnect(): void {
    const socket = this.socket;
    this.socket = null;
    this.connectPromise = null;
    this.stopHeartbeat();
    this.setStatus("disconnected");
    socket?.close();
  }

  private startHeartbeat(socket: WebSocket): void {
    this.stopHeartbeat();
    this.heartbeatIntervalId = window.setInterval(() => {
      if (this.socket !== socket || socket.readyState !== WebSocket.OPEN) {
        this.stopHeartbeat();
        return;
      }
      if (this.pendingHeartbeatId !== null) {
        return;
      }

      const id = this.nextId("ping");
      this.pendingHeartbeatId = id;
      try {
        socket.send(JSON.stringify({ type: "ping", id }));
      } catch (error) {
        console.error("Could not send URQR Bridge heartbeat", error);
        this.setStatus("disconnected");
        socket.close();
        return;
      }

      this.heartbeatTimeoutId = window.setTimeout(() => {
        if (this.pendingHeartbeatId !== id) {
          return;
        }
        this.pendingHeartbeatId = null;
        this.heartbeatTimeoutId = null;
        this.setStatus("disconnected");
        socket.close();
      }, HEARTBEAT_TIMEOUT_MS);
    }, HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalId !== null) {
      window.clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
    if (this.heartbeatTimeoutId !== null) {
      window.clearTimeout(this.heartbeatTimeoutId);
      this.heartbeatTimeoutId = null;
    }
    this.pendingHeartbeatId = null;
  }

  private setStatus(status: BridgeConnectionStatus): void {
    if (this.status === status) {
      return;
    }
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }

  private nextId(prefix: string): string {
    this.messageId += 1;
    return `${prefix}-${Date.now()}-${this.messageId}`;
  }
}

export const bridgeClient = new BridgeWebSocketClient();
