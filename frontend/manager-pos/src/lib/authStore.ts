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

const getInitialState = () => {
  if (typeof window === "undefined") {
    return { accessToken: null, tenantId: null, user: null };
  }
  try {
    const token = localStorage.getItem("access_token");
    const tenantId = localStorage.getItem("tenant_id");
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        return {
          accessToken: token,
          tenantId: payload.tenant_id || tenantId,
          user: {
            id: payload.sub,
            name: payload.username || "Manager",
            role: payload.role || "ROLE_MANAGER",
          },
        };
      }
    }
  } catch {
    // ignore localStorage errors in non-browser envs
  }
  return { accessToken: null, tenantId: null, user: null };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  tenantId: initial.tenantId,
  accessToken: initial.accessToken,
  
  setAuth: (token) => {
    const payload = decodeJWT(token);
    if (!payload) return;

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