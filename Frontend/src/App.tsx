import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/AppBar";
import Home from "./components/Home";
import Footer from "./components/Footer";
import Login from "./components/Admin/Login/Login";
import Tracking from "./components/Tracking";
import ServicesPage from "./components/pages/ServicesPage";
import AboutPage from "./components/pages/AboutPage";
import BookingPage from "./components/pages/BookingPage";
import Dashboard from "./components/Admin/Dashboard/Dashboard";

// Wrapper so Navbar/Footer hide on dashboard/login
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/tracking" element={<PublicLayout><Tracking /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/booking" element={<PublicLayout><BookingPage /></PublicLayout>} />

        {/* Auth & Admin — no public navbar/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;