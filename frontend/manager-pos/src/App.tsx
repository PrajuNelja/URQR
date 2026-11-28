import { useEffect, useState, useRef } from "react";
import AppRouter from "./AppRouter";
import { NotificationProvider } from "./components/Notification/NotificationProvider";
import WindowControls from "./components/WindowControls/WindowControls";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { NetworkBanner } from "./components/NetworkBanner/NetworkBanner"; // <-- ADDED THIS
import { bridgeClient, isTauriRuntime } from "./lib/bridge/bridgeClient";

// ADD THESE IMPORTS
import { useAuthStore } from "./lib/authStore"; 
import { SessionTimeoutModal } from "./components/PopupModal/SessionTimeoutModal";
import { useNotification } from "./components/Notification/useNotification";

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
      <NetworkBanner /> {/* <-- ADDED THIS HERE */}
      <WindowControls />
      <ErrorBoundary>
        <NotificationProvider>
          <AppContent /> {/* <-- We wrap the router here to use the notification hook */}
        </NotificationProvider>
      </ErrorBoundary>
    </div>
  );
}

// ==========================================
// INNER COMPONENT FOR SESSION TIMEOUT
// ==========================================
function AppContent() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const notification = useNotification();
  
  const [isTimeoutOpen, setIsTimeoutOpen] = useState(false);
  const isExpiringRef = useRef(false);

  useEffect(() => {
    if (!accessToken) return;

    try {
      // Decode JWT to get expiration
      const base64Url = accessToken.split(".")[1];
      if (!base64Url) return;
      
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      
      const { exp } = JSON.parse(jsonPayload);
      if (!exp) return;

      const expirationTimeMs = exp * 1000;

      const checkTime = () => {
        const timeLeftMs = expirationTimeMs - Date.now();

        // Trigger warning modal 60 seconds before expiry
        if (timeLeftMs <= 60000 && timeLeftMs > 0) {
          if (!isExpiringRef.current) {
            isExpiringRef.current = true;
            setIsTimeoutOpen(true);
          }
        } 
        // Token has expired completely
        else if (timeLeftMs <= 0) {
          setIsTimeoutOpen(false);
          clearAuth();
          notification.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
      };

      checkTime();
      const interval = setInterval(checkTime, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    } catch (err) {
      console.error("Failed to parse JWT for session timeout", err);
    }
  }, [accessToken, clearAuth, notification]);

  return (
    <>
      <AppRouter />
      
      <SessionTimeoutModal
        isOpen={isTimeoutOpen}
        onClose={() => setIsTimeoutOpen(false)}
        initialSeconds={60}
        onExtend={() => {
          setIsTimeoutOpen(false);
          isExpiringRef.current = false; // Reset flag
          notification.success("Session extended.");
          // Note: In production, you'd call a refresh token API here.
        }}
        onLogout={() => {
          setIsTimeoutOpen(false);
          clearAuth();
          window.location.href = "/login";
        }}
      />
    </>
  );
}

export default App;