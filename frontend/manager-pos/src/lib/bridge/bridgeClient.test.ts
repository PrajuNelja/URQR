import { afterEach, describe, expect, it, vi } from "vitest";
import { BridgeWebSocketClient, type BridgePrintRequest } from "./bridgeClient";

class MockWebSocket extends EventTarget {
  static readonly OPEN = 1;
  static readonly instances: MockWebSocket[] = [];
  static respondToPings = true;
  readyState = 0;
  readonly sent: string[] = [];
  readonly url: string;

  constructor(url: string) {
    super();
    this.url = url;
    MockWebSocket.instances.push(this);
    queueMicrotask(() => {
      this.readyState = MockWebSocket.OPEN;
      this.dispatchEvent(new Event("open"));
    });
  }

  send(data: string): void {
    this.sent.push(data);
    const command = JSON.parse(data) as Record<string, unknown>;
    if (command.action === "ping" && MockWebSocket.respondToPings) {
      queueMicrotask(() => {
        this.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify({
              event: "pong",
              status: "PRINTER_READY",
              timestamp: Date.now(),
            }),
          }),
        );
      });
    } else if (command.action === "print") {
      queueMicrotask(() => {
        this.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify({
              success: true,
              orderId: command.orderId,
              status: "PRINTER_READY",
              message: "Receipt printed",
              latencyMs: 2,
            }),
          }),
        );
      });
    }
  }

  close(): void {
    this.readyState = 3;
    this.dispatchEvent(new Event("close"));
  }
}

const request: BridgePrintRequest = {
  action: "print",
  orderId: "order-1",
  tenantId: "tenant-1",
  store: { name: "Grand Horizon" },
  items: [{ name: "Coffee", quantity: 1, unitPrice: 5, totalPrice: 5 }],
  taxes: {
    cgst: 0.13,
    cgstRate: 2.5,
    sgst: 0.12,
    sgstRate: 2.5,
    totalTax: 0.25,
  },
  totals: { subtotal: 5, tax: 0.25, grandTotal: 5.25 },
};

describe("BridgeWebSocketClient", () => {
  afterEach(() => {
    for (const socket of MockWebSocket.instances) socket.close();
    MockWebSocket.instances.length = 0;
    MockWebSocket.respondToPings = true;
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("connects to the local print daemon and uses its heartbeat protocol", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    const client = new BridgeWebSocketClient();

    await client.connect();
    await Promise.resolve();

    const socket = MockWebSocket.instances[0];
    expect(socket.url).toBe("ws://localhost:9101/ws");
    expect(JSON.parse(socket.sent[0])).toEqual({ action: "ping" });
    expect(client.getState().status).toBe("CONNECTED");
    expect(client.getState().lastHeartbeat).not.toBeNull();
    client.disconnect();
  });

  it("dispatches the print contract and resolves the matching bridge response", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    const client = new BridgeWebSocketClient();
    await client.connect();

    let now = 10;
    vi.stubGlobal("performance", { now: () => now });
    const socket = MockWebSocket.instances[0];
    const send = socket.send.bind(socket);
    vi.spyOn(socket, "send").mockImplementation((data) => {
      now = 20;
      send(data);
    });
    const responsePromise = client.printReceipt(request, 0);
    const response = await responsePromise;

    expect(JSON.parse(socket.sent[1])).toEqual(request);
    expect(response).toMatchObject({
      success: true,
      orderId: "order-1",
      status: "PRINTER_READY",
      latencyMs: 2,
    });
    expect(response.dispatchLatencyMs).toBe(20);
    expect(response.dispatchLatencyMs).toBeLessThan(50);
    client.disconnect();
  });

  it("reports an offline dispatch instead of silently succeeding", async () => {
    const client = new BridgeWebSocketClient();
    await expect(client.printReceipt(request)).resolves.toMatchObject({
      success: false,
      status: "OFFLINE",
      orderId: "order-1",
    });
    client.disconnect();
  });

  it("publishes printer hardware status events to subscribers", async () => {
    vi.stubGlobal("WebSocket", MockWebSocket);
    const client = new BridgeWebSocketClient();
    await client.connect();
    const socket = MockWebSocket.instances[0];

    for (const [status, expected] of [
      ["PRINTER_READY", "PRINTER_READY"],
      ["PAPER_OUT", "PAPER_OUT"],
      ["COVER_OPEN", "COVER_OPEN"],
      ["PRINTER_OFFLINE", "PRINTER_OFFLINE"],
      ["PRINT_ERROR", "PRINT_ERROR"],
    ] as const) {
      socket.dispatchEvent(
        new MessageEvent("message", {
          data: JSON.stringify({
            event: "printer_status",
            status,
            message: `Status ${status}`,
          }),
        }),
      );
      expect(client.getState().printerStatus).toBe(expected);
    }

    client.disconnect();
  });

  it("marks the bridge offline when its heartbeat times out", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", MockWebSocket);
    MockWebSocket.respondToPings = false;
    const client = new BridgeWebSocketClient();

    await client.connect();
    await vi.advanceTimersByTimeAsync(2000);

    expect(client.getState().isOnline).toBe(false);
    expect(client.getState().status).not.toBe("CONNECTED");
    client.disconnect();
  });
});
