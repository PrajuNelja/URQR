// src/components/SideBar/PosSidebar.tsx
import "../../Styles/PosNavigation.css";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PosIcon } from "../Icons/PosIcon";
import { Button } from "../Buttons/Button";

import { useAuthStore } from "../../lib/authStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export interface PosSidebarProps {
  collapsed?: boolean;

}

export function PosSidebar({
  collapsed = false,
}: PosSidebarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    queryClient.clear();
    void navigate({
      to: "/login",
      replace: true,
    });
  };

  return (
    <>
      <aside
        className={`dashboard-sidebar${collapsed ? " dashboard-sidebar--collapsed" : ""}`}
        id="pos-sidebar"
        aria-label="POS navigation"
      >
        <nav className="dashboard-sidebar-nav">
          <Link
            className="dashboard-nav-link"
            activeProps={{ className: "dashboard-nav-link dashboard-nav-link--active", "aria-current": "page" }}
            activeOptions={{ exact: true }}
            to="/pos/billing" aria-label="Billing" title="Billing"
          >
            <PosIcon name="billing" size={19} aria-hidden="true" />
            <span>Billing</span>
          </Link>
          <Link className="dashboard-nav-link" to="/pos/dashboard" aria-label="Dashboard" title="Dashboard"
            activeProps={{ className: "dashboard-nav-link dashboard-nav-link--active", "aria-current": "page" }}
            activeOptions={{ exact: true }}>
            <PosIcon name="dashboard" size={19} aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
        </nav>
        <div className="dashboard-sidebar-footer">
          <Button
            variant="ghost"
            fullWidth
            aria-label="Logout"
            leftIcon={<PosIcon name="logout" size={20} />}
            type="button"
            className="dashboard-nav-link dashboard-logout-button"
            onClick={() => setLogoutConfirmationOpen(true)}
          >
            Logout
          </Button>
        </div>
      </aside>

      <AlertDialog
        open={logoutConfirmationOpen}
        onOpenChange={setLogoutConfirmationOpen}
      >
        <AlertDialogContent className="urqr-logout-modal max-w-[400px] p-6 rounded-2xl border border-[#E3D9CB] dark:border-[#43352A] shadow-2xl bg-[#FFFDF8] dark:bg-[#251D17] text-[#3B2A1E] dark:text-[#F5EEE0]">
          <div className="flex flex-col items-center text-center">
            {/* Centered Large Alert Icon Badge */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F1] dark:bg-[#361A1A] border-2 border-[#FEE2E2] dark:border-[#4A2020] text-[#B91C1C] dark:text-[#E55353] shadow-xs mb-4">
              <PosIcon name="logout" size={28} strokeWidth={2.5} className="translate-x-0.5" aria-hidden="true" />
            </div>

            <AlertDialogTitle className="text-xl font-bold tracking-tight text-[#3B2A1E] dark:text-[#F5EEE0]">
              Log out of POS?
            </AlertDialogTitle>

            <AlertDialogDescription className="mt-2 text-sm leading-relaxed text-[#7A6A5A] dark:text-[#BFAEA0]">
              Are you sure you want to end your cashier session? Any unsaved orders will be cleared and you will need to sign in again.
            </AlertDialogDescription>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 w-full">
            <AlertDialogCancel className="flex-1 h-11 px-4 rounded-xl border border-[#E4D8C3] dark:border-[#43352A] bg-white dark:bg-[#2E241C] text-[#3B2A1E] dark:text-[#F5EEE0] font-semibold text-sm hover:bg-[#F5EEE0] dark:hover:bg-[#382A20] cursor-pointer shadow-xs transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="flex-1 h-11 px-4 rounded-xl bg-[#B91C1C] dark:bg-[#E55353] hover:bg-[#991B1B] dark:hover:bg-[#C53030] text-white font-semibold text-sm cursor-pointer shadow-sm active:scale-98 transition-all"
            >
              Log Out
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default PosSidebar;
