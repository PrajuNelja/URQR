import { afterEach, describe, expect, it, vi } from "vitest";
import { BridgeWebSocketClient } from "./bridgeClient";

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
    void Promise.resolve().then(() => {
      this.readyState = MockWebSocket.OPEN;
      this.dispatchEvent(new Event("open"));
    });
  }

  send(data: string): void {
    this.sent.push(data);
    const command = JSON.parse(data) as { id: string; type: string };
    if (
      command.type === "hello" ||
      (command.type === "ping" && MockWebSocket.respondToPings)
    ) {
      void Promise.resolve().then(() => {
        this.dispatchEvent(
          new MessageEvent("message", {
            data: JSON.stringify({
              type: command.type === "hello" ? "ack" : "pong",
              id: command.id,
              status: "UP",
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

describe("BridgeWebSocketClient", () => {
  afterEach(() => {
    MockWebSocket.instances.length = 0;
    MockWebSocket.respondToPings = true;
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("completes the local bridge hello/ack handshake", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    });
    vi.stubGlobal("WebSocket", MockWebSocket);

    const client = new BridgeWebSocketClient("ws://127.0.0.1:9100/ws");
    await client.connect();

    const socket = MockWebSocket.instances[0];
    expect(socket).toBeDefined();
    expect(socket.url).toBe("ws://127.0.0.1:9100/ws");
    expect(JSON.parse(socket.sent[0])).toMatchObject({ type: "hello" });
    expect(client.getStatus()).toBe("connected");

    await vi.advanceTimersByTimeAsync(3000);
    expect(JSON.parse(socket.sent[1])).toMatchObject({ type: "ping" });
    expect(client.getStatus()).toBe("connected");

    client.disconnect();
    expect(client.getStatus()).toBe("disconnected");
  });

  it("marks the bridge disconnected when a heartbeat times out", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    });
    vi.stubGlobal("WebSocket", MockWebSocket);
    MockWebSocket.respondToPings = false;

    const client = new BridgeWebSocketClient("ws://127.0.0.1:9100/ws");
    await client.connect();
    await vi.advanceTimersByTimeAsync(5000);

    expect(client.getStatus()).toBe("disconnected");
  });
});
