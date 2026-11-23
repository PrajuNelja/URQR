import { create } from "zustand";

interface AuthState {
  user: { id: string; name: string; role: string } | null;
  tenantId: string | null;
  accessToken: string | null;
  setAuth: (user: AuthState["user"], tenantId: string, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenantId: null,
  accessToken: null,
  setAuth: (user, tenantId, accessToken) => set({ user, tenantId, accessToken }),
  clearAuth: () => set({ user: null, tenantId: null, accessToken: null }),
}));