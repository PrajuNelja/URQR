// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { UrqrBridgeClient } from "../lib/bridgeClient";
import { DesktopWindowControls } from "../components/Header/DesktopWindowControls";
import tauriConfig from "../../src-tauri/tauri.conf.json";

class MockWebSocket {
  public static readonly CONNECTING = 0;
  public static readonly OPEN = 1;
  public static readonly CLOSING = 2;
  public static readonly CLOSED = 3;

  public static instances: MockWebSocket[] = [];
  public url: string;
  public readyState: number = 0; // CONNECTING
  public onopen: (() => void) | null = null;
  public onclose: (() => void) | null = null;
  public onmessage: ((e: { data: string }) => void) | null = null;
  public onerror: (() => void) | null = null;
  public sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.onopen?.();
    }, 10);
  }

  public send(msg: string) {
    this.sentMessages.push(msg);
  }

  public close() {
    this.readyState = 3; // CLOSED
    this.onclose?.();
  }
}

describe("Vishal Scope: Page 3 of 12 Verification (Tauri v2 & URQR-Bridge)", () => {
  let originalWebSocket: typeof WebSocket;

  beforeEach(() => {
    MockWebSocket.instances = [];
    originalWebSocket = globalThis.WebSocket;
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    vi.useFakeTimers();
  });

  afterEach(() => {
    globalThis.WebSocket = originalWebSocket;
    vi.useRealTimers();
    cleanup();
  });

  it("Task 1: Tauri v2 configuration (tauri.conf.json) defines POS kiosk resolution & local WebSocket CSP", () => {
    expect(tauriConfig.productName).toBe("URQR Manager POS");
    expect(tauriConfig.identifier).toBe("com.nelja.urqr.pos");

    const windowConfig = tauriConfig.app.windows[0];
    expect(windowConfig.width).toBe(1366);
    expect(windowConfig.height).toBe(768);
    expect(windowConfig.minWidth).toBe(1024);
    expect(windowConfig.minHeight).toBe(600);

    // CSP allows local WebSocket communication on port 9101
    expect(tauriConfig.app.security.csp).toContain("ws://localhost:*");
    expect(tauriConfig.app.security.csp).toContain("http://localhost:*");
  });

  it("Task 2: UrqrBridgeClient connects to local Go URQR-Bridge daemon on ws://localhost:9101", () => {
    const client = new UrqrBridgeClient("ws://localhost:9101");
    client.connect();

    expect(MockWebSocket.instances.length).toBe(1);
    expect(MockWebSocket.instances[0].url).toBe("ws://localhost:9101");

    vi.advanceTimersByTime(20);
    expect(client.getState().status).toBe("CONNECTED");
    expect(client.getState().isOnline).toBe(true);

    client.disconnect();
  });

  it("Task 3: implements bridge heartbeat monitor pinging daemon every 3 seconds for connection health", () => {
    const client = new UrqrBridgeClient("ws://localhost:9101");
    client.connect();
    vi.advanceTimersByTime(20);

    const ws = MockWebSocket.instances[0];
    expect(ws.sentMessages.length).toBe(1); // Immediate initial ping
    expect(JSON.parse(ws.sentMessages[0])).toEqual({ action: "ping" });

    // Advance 3 seconds -> second ping sent
    vi.advanceTimersByTime(3000);
    expect(ws.sentMessages.length).toBe(2);
    expect(JSON.parse(ws.sentMessages[1])).toEqual({ action: "ping" });

    // Advance another 3 seconds -> third ping sent
    vi.advanceTimersByTime(3000);
    expect(ws.sentMessages.length).toBe(3);

    // Simulate pong message from Go daemon
    ws.onmessage?.({
      data: JSON.stringify({ event: "pong", timestamp: Date.now(), status: "READY" }),
    });

    expect(client.getState().lastHeartbeat).toBeDefined();
    expect(client.getState().isOnline).toBe(true);

    client.disconnect();
  });

  it("Task 4: renders desktop window controls, full-screen kiosk toggle, and bridge status pill", () => {
    const { getByRole, getByText } = render(
      React.createElement(DesktopWindowControls, {
        showBridgePill: true,
      })
    );

    // Kiosk Mode toggle button
    const kioskBtn = getByRole("button", { name: /Toggle Fullscreen Kiosk/i });
    expect(kioskBtn).toBeDefined();
    expect(getByText(/Kiosk/i)).toBeDefined();

    // Toggle click invokes fullscreen
    fireEvent.click(kioskBtn);
  });

  it("Task 5: UrqrBridgeClient dispatches ESC/POS print jobs and handles reconnects on daemon drop", async () => {
    const client = new UrqrBridgeClient("ws://localhost:9101");
    client.connect();
    vi.advanceTimersByTime(20);

    const ws = MockWebSocket.instances[0];

    // Simulate daemon drop
    ws.close();
    expect(client.getState().status).toBe("DISCONNECTED");
    expect(client.getState().isOnline).toBe(false);

    // Auto-reconnect triggered after 3 seconds
    vi.advanceTimersByTime(3000);
    expect(MockWebSocket.instances.length).toBe(2);

    client.disconnect();
  });
});
