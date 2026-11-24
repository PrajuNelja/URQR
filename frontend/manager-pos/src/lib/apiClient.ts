import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
});

// Request interceptor: inject tenant ID and Authorization token
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

// Response interceptor: global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
