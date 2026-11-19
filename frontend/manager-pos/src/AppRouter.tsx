// src/AppRouter.tsx

// 1. Imports
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Showcase from "./components/Showcase/Showcase";
import ManagerLogin from "./pages/Table_Management/Components/ManagerLogin";

// 2. Component
function AppRouter() {
  // 3. Export / Return
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagerLogin />} />
        <Route path="/login" element={<ManagerLogin />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;