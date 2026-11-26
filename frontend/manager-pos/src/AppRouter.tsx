import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "@tanstack/react-router";

import Showcase from "./components/Showcase/Showcase";
import Dashboard from "./pages/Table_Management/Components/Dashboard/Dashboard";
import ManagerLogin from "./pages/Table_Management/Components/ManagerLogin";
import Billing from "./pages/Table_Management/Components/Billing/Billing";

// 2. Root route - UPDATED to catch errors
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <Navigate to="/" replace />,
  errorComponent: ({ error }) => (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-bg text-text">
      <h1 className="text-2xl font-bold">Something went wrong!</h1>
      {/* Cast error to Error type to fix TypeScript */}
      <pre className="text-sm text-error">{(error as Error).message || String(error)}</pre>
      <button 
        onClick={() => window.location.reload()} 
        className="rounded-md bg-primary px-4 py-2 text-on-primary"
      >
        Reload Page
      </button>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ManagerLogin,
});

// 4. Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: ManagerLogin,
});

// 5. Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

// 6. Billing route
const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/billing",
  component: Billing,
});

const showcaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/showcase",
  component: Showcase,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  billingRoute,
  showcaseRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;