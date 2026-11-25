// src/lib/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
});

// Request interceptor: inject tenant ID and Authorization token
apiClient.interceptors.request.use((config) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  }
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";

    // ⚠️ Do NOT redirect on 401 from the login endpoint itself —
    // that's an expected "wrong password" response, not an expired session.
    // Let useManagerLogin handle it and show the inline toast.
    const isLoginCall = url.includes("/auth/login");

    if (status === 401 && !isLoginCall) {
      // Only clear session + redirect for authenticated calls that expire
      localStorage.removeItem("access_token");
      localStorage.removeItem("tenant_id");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);