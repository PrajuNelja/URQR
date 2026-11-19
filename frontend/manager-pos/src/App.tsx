import AppRouter from "./AppRouter";
import { NotificationProvider } from "./components/Notification/NotificationProvider";

function App() {
  return (
    <div className="min-h-screen bg-app-bg text-primary">
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </div>
  );
}

export default App;