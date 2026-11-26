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

// 2. Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <Navigate to="/" replace />,
});

// 3. Default Login route
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

// 7. Showcase route
const showcaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/showcase",
  component: Showcase,
});

// 8. Register all routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  billingRoute,
  showcaseRoute,
]);

// 9. Create the router
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// 10. Register router types for TypeScript
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 11. Application router component
function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;