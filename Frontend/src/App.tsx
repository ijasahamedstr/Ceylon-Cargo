import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./components/AppBar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./components/Home"));
const Tracking = lazy(() => import("./components/Tracking"));
const ServicesPage = lazy(() => import("./components/pages/ServicesPage"));
const AboutPage = lazy(() => import("./components/pages/AboutPage"));
const BookingPage = lazy(() => import("./components/pages/BookingPage"));
const Login = lazy(() => import("./components/Admin/Login/Login"));
const Dashboard = lazy(() => import("./components/Admin/Dashboard/Dashboard"));

// Wrapper so Navbar/Footer hide on dashboard/login
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F8FAFC" }}>
      <Navbar />
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

const RouteFallback = (
  <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <CircularProgress />
  </Box>
);

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Suspense fallback={RouteFallback}><PublicLayout><Home /></PublicLayout></Suspense>} />
        <Route path="/tracking" element={<Suspense fallback={RouteFallback}><PublicLayout><Tracking /></PublicLayout></Suspense>} />
        <Route path="/services" element={<Suspense fallback={RouteFallback}><PublicLayout><ServicesPage /></PublicLayout></Suspense>} />
        <Route path="/about" element={<Suspense fallback={RouteFallback}><PublicLayout><AboutPage /></PublicLayout></Suspense>} />
        <Route path="/booking" element={<Suspense fallback={RouteFallback}><PublicLayout><BookingPage /></PublicLayout></Suspense>} />

        {/* Auth & Admin — no public navbar/footer */}
        <Route path="/login" element={<Suspense fallback={RouteFallback}><Login /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={RouteFallback}><Dashboard /></Suspense>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;