// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { BridgeWebSocketClient } from "../lib/bridge/bridgeClient";
import { DesktopWindowControls } from "../components/Header/DesktopWindowControls";
import tauriConfig from "../../src-tauri/tauri.conf.json";

class MockWebSocket extends EventTarget {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readonly url: string;
  readyState = MockWebSocket.CONNECTING;
  sentMessages: string[] = [];

  constructor(url: string) {
    super();
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.dispatchEvent(new Event("open"));
    }, 10);
  }

  send(message: string): void {
    this.sentMessages.push(message);
    const request = JSON.parse(message) as Record<string, unknown>;
    if (request.action === "ping") {
      queueMicrotask(() => {
        this.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify({
              event: "pong",
              timestamp: Date.now(),
              status: "PRINTER_READY",
            }),
          }),
        );
      });
    } else if (request.action === "print") {
      queueMicrotask(() => {
        this.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify({
              success: true,
              orderId: request.orderId,
              status: "PRINTER_READY",
              message: "Receipt printed",
              latencyMs: 1,
            }),
          }),
        );
      });
    }
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.dispatchEvent(new Event("close"));
  }
}

describe("Vishal Morning POS Bridge Tasks", () => {
  let originalWebSocket: typeof WebSocket;

  beforeEach(() => {
    MockWebSocket.instances = [];
    originalWebSocket = globalThis.WebSocket;
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    vi.useFakeTimers();
  });

  afterEach(() => {
    for (const socket of MockWebSocket.instances) socket.close();
    globalThis.WebSocket = originalWebSocket;
    vi.useRealTimers();
    cleanup();
  });

  it("uses the Tauri v2 kiosk configuration and local WebSocket CSP", () => {
    expect(tauriConfig.productName).toBe("URQR Manager POS");
    expect(tauriConfig.identifier).toBe("com.nelja.urqr.pos");

    const windowConfig = tauriConfig.app.windows[0];
    expect(windowConfig.width).toBe(1366);
    expect(windowConfig.height).toBe(768);
    expect(windowConfig.minWidth).toBe(1024);
    expect(windowConfig.minHeight).toBe(600);
    expect(tauriConfig.app.security.csp).toContain("ws://localhost:*");
  });

  it("connects to the Go bridge on port 9101", async () => {
    const client = new BridgeWebSocketClient("ws://localhost:9101/ws");
    const connected = client.connect();
    await vi.advanceTimersByTimeAsync(10);
    await connected;

    expect(MockWebSocket.instances[0].url).toBe("ws://localhost:9101/ws");
    expect(client.getState().status).toBe("CONNECTED");
    client.disconnect();
  });

  it("sends a ping every three seconds and records the pong", async () => {
    const client = new BridgeWebSocketClient("ws://localhost:9101/ws");
    const connected = client.connect();
    await vi.advanceTimersByTimeAsync(10);
    await connected;

    const socket = MockWebSocket.instances[0];
    expect(JSON.parse(socket.sentMessages[0])).toEqual({ action: "ping" });
    await vi.advanceTimersByTimeAsync(3000);
    expect(socket.sentMessages).toHaveLength(2);
    expect(client.getState().lastHeartbeat).not.toBeNull();
    client.disconnect();
  });

  it("renders the kiosk toggle and bridge status pill", () => {
    const { getByRole, getByText } = render(
      React.createElement(DesktopWindowControls, { showBridgePill: true }),
    );

    const kioskButton = getByRole("button", {
      name: /Toggle Fullscreen Kiosk/i,
    });
    expect(kioskButton).toBeDefined();
    expect(getByText(/Kiosk/i)).toBeDefined();
    fireEvent.click(kioskButton);
  });

  it("dispatches a print request and reconnects when the daemon drops", async () => {
    const client = new BridgeWebSocketClient("ws://localhost:9101/ws");
    const connected = client.connect();
    await vi.advanceTimersByTimeAsync(10);
    await connected;

    const request = {
      action: "print" as const,
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
    const printing = client.printReceipt(request);
    const response = await printing;
    expect(response.success).toBe(true);
    expect(JSON.parse(MockWebSocket.instances[0].sentMessages[1])).toEqual(
      request,
    );

    MockWebSocket.instances[0].close();
    expect(client.getState().isOnline).toBe(false);
    await vi.advanceTimersByTimeAsync(3000);
    expect(MockWebSocket.instances).toHaveLength(2);
    client.disconnect();
  });
});
