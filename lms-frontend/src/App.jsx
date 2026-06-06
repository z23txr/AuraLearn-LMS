import { Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register/Register";
import Login from "./pages/auth/Login/Login";

import LandingPage from "./pages/LandingPage/LandingPage";
import ForgotPassword from "./pages/auth/Login/ForgotPassword";
import ResetPassword from "./pages/auth/Login/ResetPassword";
// Route imports
import StudentRoutes from "./routes/StudentRoutes";
import InstructorRoutes from "./routes/InstructorRoutes";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Role-Based Modular Routes */}
      {StudentRoutes}
      {InstructorRoutes}

      {/* 404 Page */}
      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
}

export default App;