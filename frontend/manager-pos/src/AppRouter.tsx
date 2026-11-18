// src/AppRouter.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import Showcase from "./components/Showcase"; // Adjust this path if needed

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* By default, load the Showcase page */}
        {/* <Route path="/" element={<Showcase />} />
        <Route path="/showcase" element={<Showcase />} /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;