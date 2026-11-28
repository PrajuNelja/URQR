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
import PosLayout from "./components/Layout/PosLayout";
import { useAuthStore } from "./lib/authStore";

// 1. Define the search schema for the login route (Day 3 Afternoon Task 2)
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});
const isValidDashboardDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};
const dashboardSearchSchema = z
  .object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(isValidDashboardDate)
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(isValidDashboardDate)
      .optional(),
  })
  .refine(({ from, to }) => !from || !to || from <= to, {
    path: ["to"],
    message: "The end date must be on or after the start date.",
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
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: () => {
    // If already logged in, don't show the login page, send to billing
    if (useAuthStore.getState().isAuthenticated()) {
      throw redirect({ to: "/pos/billing" });
    }
  },
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

const posRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos",
  component: PosLayout,
});

// 5. Dashboard route (PROTECTED)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/dashboard",
  component: Dashboard,
  validateSearch: (search) => dashboardSearchSchema.parse(search),
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

const legacyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    throw redirect({ to: "/pos/dashboard", replace: true });
  },
});

// 6. Billing route (Accessible directly in POS standalone mode)
const billingRoute = createRoute({
  getParentRoute: () => posRoute,
  path: "billing",
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
  legacyDashboardRoute,
  posRoute.addChildren([billingRoute]),
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
