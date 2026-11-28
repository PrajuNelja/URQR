import { Centrifuge, type Subscription, type PublicationContext } from "centrifuge";
import { useAuthStore } from "../authStore";
import {
  useCentrifugoStore,
  type CentrifugoStatus,
  type OrderCreatedEvent,
} from "./centrifugoStore";

export interface CentrifugoConfig {
  url?: string;
  minReconnectDelay?: number;
  maxReconnectDelay?: number;
  getToken?: () => Promise<string> | string;
  onToast?: (message: string, type?: "info" | "success" | "warning") => void;
}

export const DEFAULT_CENTRIFUGO_URL = "ws://localhost:8000/connection/websocket";
export const DEFAULT_MIN_RECONNECT_DELAY = 1000; // 1s
export const DEFAULT_MAX_RECONNECT_DELAY = 10000; // 10s

export class CentrifugoClientManager {
  private client: Centrifuge | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private config: CentrifugoConfig;
  private onToastHandler?: (message: string, type?: "info" | "success" | "warning") => void;

  constructor(config: CentrifugoConfig = {}) {
    this.config = {
      url: config.url || (typeof import.meta !== "undefined" && import.meta.env?.VITE_CENTRIFUGO_URL) || DEFAULT_CENTRIFUGO_URL,
      minReconnectDelay: config.minReconnectDelay ?? DEFAULT_MIN_RECONNECT_DELAY,
      maxReconnectDelay: config.maxReconnectDelay ?? DEFAULT_MAX_RECONNECT_DELAY,
      getToken: config.getToken || (() => {
        const token = useAuthStore.getState().accessToken;
        return token || "";
      }),
    };
    this.onToastHandler = config.onToast;
  }

  public getClient(): Centrifuge {
    if (!this.client) {
      this.initClient();
    }
    return this.client!;
  }

  public setToastHandler(handler: (message: string, type?: "info" | "success" | "warning") => void) {
    this.onToastHandler = handler;
  }

  private initClient(): Centrifuge {
    const { url, minReconnectDelay, maxReconnectDelay, getToken } = this.config;

    this.client = new Centrifuge(url!, {
      minReconnectDelay,
      maxReconnectDelay,
      getToken: async () => {
        try {
          const token = await getToken!();
          return token;
        } catch {
          return "";
        }
      },
    });

    this.client.on("connecting", () => {
      this.updateStatus("connecting");
    });

    this.client.on("connected", () => {
      this.updateStatus("connected");
    });

    this.client.on("disconnected", () => {
      this.updateStatus("disconnected");
    });

    return this.client;
  }

  private updateStatus(status: CentrifugoStatus) {
    useCentrifugoStore.getState().setStatus(status);
  }

  public connect(): void {
    const client = this.getClient();
    client.connect();
  }

  public disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => {
        sub.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.disconnect();
      this.updateStatus("disconnected");
    }
  }

  public getChannelName(channelOverride?: string): string {
    if (channelOverride) return channelOverride;
    const tenantId = useAuthStore.getState().tenantId;
    return tenantId ? `tenant-${tenantId}:orders` : "orders";
  }

  public subscribeToOrders(
    channelOverride?: string,
    onOrder?: (event: OrderCreatedEvent) => void,
  ): Subscription {
    const channel = this.getChannelName(channelOverride);
    const client = this.getClient();

    let sub = this.subscriptions.get(channel);
    if (!sub) {
      sub = client.newSubscription(channel);
      this.subscriptions.set(channel, sub);

      sub.on("publication", (ctx: PublicationContext) => {
        this.handleOrderPublication(ctx.data, onOrder);
      });

      sub.subscribe();
    }

    return sub;
  }

  public handleOrderPublication(
    data: unknown,
    onOrder?: (event: OrderCreatedEvent) => void,
  ): OrderCreatedEvent | null {
    if (!data || typeof data !== "object") return null;

    const raw = data as Record<string, unknown>;
    const orderId = String(raw.orderId || raw.id || `order-${Date.now()}`);
    const orderNumber = raw.orderNumber ? String(raw.orderNumber) : undefined;
    const tableNumber = raw.tableNumber !== undefined ? (raw.tableNumber as string | number) : undefined;
    const itemsCount = typeof raw.itemsCount === "number" ? raw.itemsCount : Array.isArray(raw.items) ? raw.items.length : undefined;
    const totalAmount = Number(raw.totalAmount || raw.total || 0);
    const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString();
    const status = typeof raw.status === "string" ? raw.status : "CREATED";

    const event: OrderCreatedEvent = {
      orderId,
      orderNumber,
      tableNumber,
      itemsCount,
      totalAmount,
      createdAt,
      status,
    };

    // Update global store
    useCentrifugoStore.getState().handleOrderCreated(event);

    // Call custom handler if provided
    onOrder?.(event);

    // Trigger instant visual toast notification
    const displayNum = event.orderNumber || event.orderId.slice(-6);
    const tableInfo = event.tableNumber ? ` (Table ${event.tableNumber})` : "";
    const toastMsg = `New Order #${displayNum}${tableInfo} • ₹${event.totalAmount.toFixed(2)}`;
    
    if (this.onToastHandler) {
      this.onToastHandler(toastMsg, "info");
    }

    return event;
  }

  public getConfig(): CentrifugoConfig {
    return { ...this.config };
  }
}

// Global singleton instance for app-wide live order stream
export const centrifugoClient = new CentrifugoClientManager();
