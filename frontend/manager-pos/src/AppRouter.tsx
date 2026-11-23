import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Showcase from "./components/Showcase/Showcase";
import Dashboard from "./pages/Table_Management/Components/Dashboard/Dashboard";
import ManagerLogin from "./pages/Table_Management/Components/ManagerLogin";
import Billing from "./pages/Table_Management/Components/Billing/Billing";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagerLogin />} />
        <Route path="/login" element={<ManagerLogin />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/" element={<Billing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
