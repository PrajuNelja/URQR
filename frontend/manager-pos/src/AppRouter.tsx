import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">URQR Manager POS</h1>
      <p className="mt-2 text-gray-600">
        Welcome to the Manager POS application.
      </p>
    </div>
  );
}

function DemoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Demo Page</h1>
      <p className="mt-2 text-gray-600">
        React Router is working successfully.
      </p>
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
