import { useEffect } from "react";
import AppRouter from "./AppRouter";
import { NotificationProvider } from "./components/Notification/NotificationProvider";
import WindowControls from "./components/WindowControls/WindowControls";
import { bridgeClient, isTauriRuntime } from "./lib/bridge/bridgeClient";

function App() {
  useEffect(() => {
    if (!isTauriRuntime()) {
      return;
    }

    let active = true;
    void bridgeClient
      .connect()
      .then(() => {
        if (active) {
          console.info("Connected to the local URQR Bridge");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Could not connect to the local URQR Bridge", error);
        }
      });

    return () => {
      active = false;
      bridgeClient.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-app-bg text-primary">
      <WindowControls />
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </div>
  );
}

export default App;