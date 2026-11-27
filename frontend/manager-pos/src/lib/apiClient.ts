// src/lib/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
});

// --- REFRESH QUEUE LOGIC ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: inject tenant ID, Authorization token, and Tracing IDs
apiClient.interceptors.request.use((config) => {
  const requestId = crypto.randomUUID();
  config.headers.set("X-Request-ID", requestId);
  config.headers.set("X-Correlation-ID", requestId);

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

// Response interceptor: global error handling & silent refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    const originalRequest = error.config;

    // ⚠️ Do NOT redirect on 401 from the login endpoint itself
    const isLoginCall = url.includes("/auth/login");

    if (status === 401 && !isLoginCall && !originalRequest._retry) {
      
      // If we are already refreshing, put this request in the queue
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call your refresh endpoint (Adjust URL if backend uses different path)
        // Note: withCredentials is true because refresh tokens should be HTTP-only cookies
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true } 
        );

        const newToken = response.data.accessToken;
        
        // Update LocalStorage
        localStorage.setItem("access_token", newToken);
        
        // Update the original request's header
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Resume queued requests
        processQueue(null, newToken);
        
        // Retry the original request
        return apiClient(originalRequest);

      } catch (refreshError) {
        // If refresh fails, clear auth and log out
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("tenant_id");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If it's a 401 but not a refreshable request, handle it
    if (status === 401 && !isLoginCall) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("tenant_id");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);