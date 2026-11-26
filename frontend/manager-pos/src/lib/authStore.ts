import { create } from "zustand";
import { decodeJWT } from "./jwt";

interface AuthState {
  user: { id: string; name: string; role: string } | null;
  tenantId: string | null;
  accessToken: string | null;
  setAuth: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenantId: null,
  accessToken: null,
  
  setAuth: (token) => {
    const payload = decodeJWT(token);
    if (!payload) return;

    // Keep a backup in localStorage strictly for Axios interceptors on refresh,
    // but treat Zustand as the source of truth.
    localStorage.setItem("access_token", token);
    localStorage.setItem("tenant_id", payload.tenant_id);

    set({
      accessToken: token,
      tenantId: payload.tenant_id,
      user: {
        id: payload.sub,
        name: payload.username || "Manager",
        role: payload.role,
      },
    });
  },

  clearAuth: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("tenant_id");
    set({ user: null, tenantId: null, accessToken: null });
  },

  isAuthenticated: () => !!get().accessToken,
}));