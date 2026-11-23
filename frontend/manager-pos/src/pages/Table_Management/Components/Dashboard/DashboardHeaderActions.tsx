// src/pages/Table_Management/Components/Dashboard/DashboardHeaderActions.tsx
import { Button } from "../../../../components/Buttons/Button";

interface Props {
  activeNav: string;
  setActiveNav: (val: string) => void;
}

export const DashboardHeaderActions = ({ activeNav, setActiveNav }: Props) => {
  const navBtn = (isActive: boolean) =>
    `px-3.5 py-2 rounded-md text-[13px] font-bold transition-all cursor-pointer border ${
      isActive
        ? "bg-primary text-button-text border-primary shadow-ivory"
        : "text-primary hover:text-accent-gold border-transparent"
    }`;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveNav("pos")}
          className={navBtn(activeNav === "pos")}
        >
          Billing POS
        </button>
        <button
          onClick={() => setActiveNav("dashboard")}
          className={navBtn(activeNav === "dashboard")}
        >
          Dashboard
        </button>
      </div>
      <Button variant="outline" size="sm">
        Logout
      </Button>
    </div>
  );
};