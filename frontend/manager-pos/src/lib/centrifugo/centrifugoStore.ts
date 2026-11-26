import { create } from "zustand";

export interface OrderCreatedEvent {
  orderId: string;
  orderNumber?: string;
  tableNumber?: string | number;
  itemsCount?: number;
  totalAmount: number;
  createdAt?: string;
  status?: string;
}

export type CentrifugoStatus = "connected" | "connecting" | "disconnected";

export interface CentrifugoState {
  status: CentrifugoStatus;
  orders: OrderCreatedEvent[];
  lastOrder: OrderCreatedEvent | null;
  unreadCount: number;
  setStatus: (status: CentrifugoStatus) => void;
  handleOrderCreated: (order: OrderCreatedEvent) => void;
  markAllRead: () => void;
  clearOrders: () => void;
}

export const useCentrifugoStore = create<CentrifugoState>((set) => ({
  status: "disconnected",
  orders: [],
  lastOrder: null,
  unreadCount: 0,

  setStatus: (status) => set({ status }),

  handleOrderCreated: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
      lastOrder: order,
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: () => set({ unreadCount: 0 }),

  clearOrders: () => set({ orders: [], lastOrder: null, unreadCount: 0 }),
}));
