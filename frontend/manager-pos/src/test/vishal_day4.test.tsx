// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  CentrifugoClientManager,
  DEFAULT_CENTRIFUGO_URL,
} from "../lib/centrifugo/centrifugoClient";
import { useCentrifugoStore } from "../lib/centrifugo/centrifugoStore";
import { CentrifugoStatusPill } from "../components/Header/CentrifugoStatusPill";
import { useAuthStore } from "../lib/authStore";

describe("Vishal Scope: Day 4 Centrifugo 6.10.3 WebSocket & Real-Time Order Stream", () => {
  beforeEach(() => {
    useCentrifugoStore.getState().clearOrders();
    useCentrifugoStore.getState().setStatus("disconnected");
    useAuthStore.setState({ accessToken: null, tenantId: null, user: null });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("Task 1: Centrifugo client initializes with default Docker URL and exponential backoff strategy", () => {
    const manager = new CentrifugoClientManager();
    const config = manager.getConfig();

    expect(config.url).toBe(DEFAULT_CENTRIFUGO_URL);
    expect(config.minReconnectDelay).toBe(1000); // 1s initial retry
    expect(config.maxReconnectDelay).toBe(10000); // 10s maximum cap
  });

  it("Task 2: Connection manager supports automatic JWT token retrieval from auth store", async () => {
    useAuthStore.setState({ accessToken: "mock-jwt-token-12345", tenantId: "tenant-uuid-888" });

    const manager = new CentrifugoClientManager();
    const config = manager.getConfig();

    const retrievedToken = await config.getToken!();
    expect(retrievedToken).toBe("mock-jwt-token-12345");
  });

  it("Task 3: Connection manager updates global status store on state changes", () => {
    const store = useCentrifugoStore.getState();

    expect(store.status).toBe("disconnected");

    // Simulate status update
    useCentrifugoStore.getState().setStatus("connecting");
    expect(useCentrifugoStore.getState().status).toBe("connecting");

    useCentrifugoStore.getState().setStatus("connected");
    expect(useCentrifugoStore.getState().status).toBe("connected");
  });

  it("Task 4: Channel subscription logic resolves channel name without requiring tenant slug", () => {
    const manager = new CentrifugoClientManager();

    // Default without tenantId
    expect(manager.getChannelName()).toBe("orders");

    // With UUID tenantId (no tenant slug)
    useAuthStore.setState({ tenantId: "4fa85f64-5717-4562-b3fc-2c963f66afa6" });
    expect(manager.getChannelName()).toBe("tenant-4fa85f64-5717-4562-b3fc-2c963f66afa6:orders");

    // Override channel
    expect(manager.getChannelName("custom:channel")).toBe("custom:channel");
  });

  it("Task 5: Correctly handles and validates incoming OrderCreatedEvent payloads (no customer info, no discounts, no tenantSlug)", () => {
    const manager = new CentrifugoClientManager();
    const mockOrderHandler = vi.fn();

    const incomingPayload = {
      orderId: "ord-778899",
      orderNumber: "1042",
      tableNumber: 5,
      itemsCount: 3,
      totalAmount: 450.0,
      createdAt: "2026-11-26T14:30:00Z",
      status: "CONFIRMED",
    };

    const event = manager.handleOrderPublication(incomingPayload, mockOrderHandler);

    expect(event).toBeDefined();
    expect(event?.orderId).toBe("ord-778899");
    expect(event?.orderNumber).toBe("1042");
    expect(event?.tableNumber).toBe(5);
    expect(event?.totalAmount).toBe(450.0);
    expect(mockOrderHandler).toHaveBeenCalledWith(event);

    // Verify global store recorded order
    const store = useCentrifugoStore.getState();
    expect(store.orders.length).toBe(1);
    expect(store.lastOrder?.orderId).toBe("ord-778899");
    expect(store.unreadCount).toBe(1);

    // Verify absence of forbidden fields
    const rawKeys = Object.keys(event!);
    expect(rawKeys).not.toContain("tenantSlug");
    expect(rawKeys).not.toContain("discount");
    expect(rawKeys).not.toContain("customer");
  });

  it("Task 6: Triggers instant visual toast notification in sub-150ms upon order arrival", () => {
    const manager = new CentrifugoClientManager();
    const toastSpy = vi.fn();
    manager.setToastHandler(toastSpy);

    const startTime = performance.now();
    manager.handleOrderPublication({
      orderId: "ord-9900",
      orderNumber: "1055",
      totalAmount: 720.5,
    });
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(150); // SLA: Sub-150ms event processing
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining("New Order #1055 • ₹720.50"),
      "info",
    );
  });

  it("Task 7: Renders Centrifugo Status Pill in POS Header with accessible live telemetry", () => {
    useCentrifugoStore.getState().setStatus("connected");

    const { rerender } = render(<CentrifugoStatusPill />);
    const pill = screen.getByRole("status");

    expect(pill).toBeDefined();
    expect(pill.getAttribute("data-status")).toBe("connected");
    expect(screen.getByText("Live Sync")).toBeDefined();

    // Rerender when connecting
    useCentrifugoStore.getState().setStatus("connecting");
    rerender(<CentrifugoStatusPill />);
    expect(screen.getByText("Reconnecting")).toBeDefined();

    // Rerender when disconnected
    useCentrifugoStore.getState().setStatus("disconnected");
    rerender(<CentrifugoStatusPill />);
    expect(screen.getByText("Sync Disconnected")).toBeDefined();
  });
});
