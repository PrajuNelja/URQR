import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import "./index.css";
import { queryClient } from "./queryClient";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Check index.html.");
}

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");

    await worker.start({
      onUnhandledRequest: "warn",
    });
  }
}

enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
});
