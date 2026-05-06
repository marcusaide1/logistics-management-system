import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { RequireAuth } from "./components/RequireAuth.jsx";
import { Home } from "./pages/Home.jsx";
import { About } from "./pages/About.jsx";
import { Services } from "./pages/Services.jsx";
import { Contact } from "./pages/Contact.jsx";
import { Track } from "./pages/Track.jsx";
import { Login } from "./pages/Login.jsx";
import { Signup } from "./pages/Signup.jsx";
import { ForgotPassword } from "./pages/ForgotPassword.jsx";
import { AdminLogin } from "./pages/AdminLogin.jsx";
import { Privacy } from "./pages/Privacy.jsx";
import { Terms } from "./pages/Terms.jsx";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout.jsx";
import { DashboardOverview } from "./pages/dashboard/Overview.jsx";
import { DashboardShipments } from "./pages/dashboard/Shipments.jsx";
import { DashboardPayments } from "./pages/dashboard/Payments.jsx";
import { Admin } from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track" element={<Track />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth role="CLIENT">
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="shipments" element={<DashboardShipments />} />
          <Route path="payments" element={<DashboardPayments />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth role="ADMIN">
              <Admin />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
