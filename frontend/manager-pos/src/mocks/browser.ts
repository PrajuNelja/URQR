import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker =
  typeof window !== "undefined" && "serviceWorker" in navigator
    ? setupWorker(...handlers)
    : (null as unknown as ReturnType<typeof setupWorker>);

if (import.meta.hot) {
  import.meta.hot.accept("./handlers", (module) => {
    if (module && worker) {
      worker.resetHandlers(...module.handlers);
    }
  });
}

