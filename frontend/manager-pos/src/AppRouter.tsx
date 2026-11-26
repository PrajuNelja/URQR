import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Navigate,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";

import Showcase from "./components/Showcase/Showcase";
import Dashboard from "./pages/Table_Management/Components/Dashboard/Dashboard";
import ManagerLogin from "./pages/Table_Management/Components/ManagerLogin";
import Billing from "./pages/Table_Management/Components/Billing/Billing";
import { useAuthStore } from "./lib/authStore";

// 1. Define the search schema for the login route (Day 3 Afternoon Task 2)
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

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

// 4. Login route (Reverse Guard + Search Param Validation)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: ManagerLogin,
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: () => {
    // If already logged in, don't show the login page, send to billing
    if (useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: "/pos/billing" });
    }
  },
});

// 5. Dashboard route (PROTECTED)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
  beforeLoad: ({ location }) => {
    // Guard + Redirect with query param
    if (!useAuthStore.getState().isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
});

// 6. Billing route (Accessible directly in POS standalone mode)
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