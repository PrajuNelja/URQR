
import { BrowserRouter, Routes, Route } from "react-router-dom";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>URQR Manager POS</h1>} />
        <Route path="/demo" element={<h1>Demo Page</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;


