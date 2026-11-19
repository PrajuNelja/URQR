// src/AppRouter.tsx

// 1. Imports
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Showcase from "./components/Showcase/Showcase";
import Dashboard from "./pages/Table_Management/Components/Dashboard/Dashboard";

// 2. Component
function AppRouter() {
  // 3. Export / Return
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Showcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;