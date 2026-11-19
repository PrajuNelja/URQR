import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Billing from "./pages/Table_Management/Components/Billing/Billing";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Billing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;