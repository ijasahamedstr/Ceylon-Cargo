import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  InputAdornment, 
  Paper,
  CircularProgress,
  Alert,
  Fade,
  Collapse 
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  PersonOutline, 
  ArrowForward,
  InfoOutlined,
  ErrorOutline,
} from "@mui/icons-material";

// --- Secure Fallback Credentials ---
const getFallbackEmail = () => {
  const envEmail = import.meta.env.VITE_FALLBACK_EMAIL;
  return (envEmail ? String(envEmail) : atob("aWphc2FobWVkLnN0ckBnbWFpbC5jb20=")).replace(/['"]/g, '').trim();
};

const getFallbackPassword = () => {
  const envPass = import.meta.env.VITE_FALLBACK_PASSWORD;
  return (envPass ? String(envPass) : atob("Um9ja0A4Njk2NzMxMg==")).replace(/['"]/g, '').trim();
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // UI & Flow States
  const [step, setStep] = useState<"password" | "otp" | "locked">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotAlert, setShowForgotAlert] = useState(false);

  // Form Data States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [adminId, setAdminId] = useState("");

  // Styling Constants
  const primaryFont = '"Montserrat", sans-serif';
  const primaryTeal = "#004652";
  const accentGold = "#CC9D2F";
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotAlert(false);
    
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. --- INSTANT SECURE MANUAL OVERRIDE CHECK ---
      const inputEmail = email.trim();
      const inputPassword = password.trim();
      
      if (inputEmail === getFallbackEmail() && inputPassword === getFallbackPassword()) {
        console.warn("Logged in via secure manual override (Database Bypassed).");
        localStorage.setItem("token", "fallback_emergency_token");
        localStorage.setItem("adminData", JSON.stringify({ role: "admin", name: "Ijas Ahmed (Admin)" }));
        window.location.href = "/dashboard";
        return; 
      }

      // 2. --- NORMAL DATABASE LOGIN ---
      const response = await axios.post(`${BASE_URL}/api/login`, { email, password });
      
      if (response.data.requires2FA) {
        setAdminId(response.data.adminId);
        setStep("otp"); 
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
        window.location.href = "/dashboard";
      }
      
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 403) {
        setStep("locked");
        setError(message || "Account is temporarily locked");
      } else {
        setError(message || "Login failed, please check your credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${BASE_URL}/api/verify-2fa`, { 
        adminId, 
        token: otp 
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token || "logged_in_token");
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError("Invalid verification code, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        bgcolor: "#E2E8F0",
        py: { xs: 4, md: 6 },
        display: "flex",
        alignItems: "center",
        direction: "ltr",
      }}
    >
      <Container maxWidth="xs">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              textAlign: "left",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 50px rgba(0, 70, 82, 0.15)",
              border: "1px solid rgba(255,255,255,0.3)"
            }}
          >
            {/* --- LOGO SECTION (INSIDE CARD) --- */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box
                component="img"
                src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png" /* <-- UPDATE THIS PATH TO YOUR ACTUAL LOGO */
                alt="Digi Laser Real Estate Logo"
                sx={{
                  height: 100, // Slightly scaled down for inside the card
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: step === "locked" ? "#DC2626" : primaryTeal, mb: 1, fontFamily: primaryFont, textAlign: 'center' }}
            >
              {step === "password" && "Login"}
              {step === "otp" && "Security Check"}
              {step === "locked" && "Account Locked"}
            </Typography>
            
            <Typography
              variant="body2"
              sx={{ color: "#64748B", mb: 3, fontFamily: primaryFont, textAlign: 'center', lineHeight: 1.5 }}
            >
              {step === "password" && "Enter your details to access the dashboard."}
              {step === "otp" && "Enter the 6-digit code from your Authenticator app."}
              {step === "locked" && (error || "Too many failed attempts. Account suspended for 24 hours.")}
            </Typography>

            {/* --- ERROR ALERT --- */}
            {error && step !== "locked" && (
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ mb: 3, fontFamily: primaryFont, borderRadius: 2, fontWeight: 600, py: 0 }}
              >
                {error}
              </Alert>
            )}

            {/* --- LOCKOUT UI --- */}
            {step === "locked" ? (
              <Box sx={{ textAlign: "center" }}>
                <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: 2, mb: 3, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: primaryFont }}>
                    Access restricted.
                  </Typography>
                </Alert>
                <Typography variant="body2" sx={{ mb: 3, color: "#64748B", fontFamily: primaryFont }}>
                  Please contact the Admin to manually unlock your account or wait for the cooldown.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setStep("password")}
                  sx={{ py: 1.2, borderRadius: 2, borderColor: primaryTeal, color: primaryTeal, fontWeight: 700 }}
                >
                  Return to Login
                </Button>
              </Box>
            ) : (
              <Box 
                component="form" 
                onSubmit={step === "password" ? handleLoginSubmit : handleOtpSubmit} 
                noValidate
              >
                {step === "password" ? (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email Address"
                      variant="outlined"
                      margin="dense"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 600, fontSize: "0.9rem" } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small" sx={{ color: primaryTeal }} /></InputAdornment>,
                      }}
                      sx={{ 
                        mb: 1.5,
                        "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC", fontFamily: primaryFont },
                        "& input": { textAlign: 'left', fontFamily: primaryFont, fontWeight: 500 }
                      }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      margin="dense"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 600, fontSize: "0.9rem" } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" sx={{ color: primaryTeal }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} edge="end" size="small">
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC", fontFamily: primaryFont },
                        "& input": { textAlign: 'left', fontFamily: primaryFont, fontWeight: 500 }
                      }}
                    />
                    
                    <Box sx={{ textAlign: "right", mt: 0.5, mb: 3 }}>
                      <Typography
                        component="button"
                        type="button"
                        onClick={() => setShowForgotAlert(true)}
                        sx={{ 
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: accentGold, 
                          fontSize: "0.8rem", 
                          fontWeight: 700, 
                          fontFamily: primaryFont,
                          padding: 0,
                          "&:hover": { textDecoration: "underline" }
                        }}
                      >
                        Forgot Password?
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label="Verification Code"
                    placeholder="000 000"
                    variant="outlined"
                    margin="dense"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.6rem', letterSpacing: '6px', fontWeight: 800, color: primaryTeal, fontFamily: primaryFont } }}
                    InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 600 } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F8FAFC" }, mb: 3 }}
                  />
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    bgcolor: primaryTeal,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    fontFamily: primaryFont,
                    boxShadow: "0 8px 20px rgba(0, 70, 82, 0.2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    transition: "0.3s",
                    "&:hover": { bgcolor: "#065f6e", transform: "translateY(-1px)", boxShadow: "0 10px 22px rgba(0, 70, 82, 0.3)" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} sx={{ color: "#fff" }} />
                  ) : (
                    step === "password" ? "Login" : "Verify"
                  )}
                </Button>

                {step === "otp" && (
                  <Button 
                    fullWidth 
                    size="small"
                    onClick={() => setStep("password")}
                    startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
                    sx={{ mt: 2, color: "#64748B", fontFamily: primaryFont, fontWeight: 600, fontSize: '0.85rem', textTransform: "none" }}
                  >
                    Back to login
                  </Button>
                )}
              </Box>
            )}

            <Collapse in={showForgotAlert}>
              <Box sx={{ mt: 2 }}>
                <Alert 
                  severity="info" 
                  icon={<InfoOutlined fontSize="small" />}
                  onClose={() => setShowForgotAlert(false)}
                  sx={{ 
                    fontFamily: primaryFont, 
                    borderRadius: 2, 
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    bgcolor: "#f0f9ff",
                    color: "#0369a1",
                    py: 0,
                    "& .MuiAlert-icon": { color: "#0369a1" }
                  }}
                >
                  Contact Admin to reset password.
                </Alert>
              </Box>
            </Collapse>
          </Paper>
        </Fade>

        <Typography sx={{ mt: 4, textAlign: "center", color: "#64748B", fontSize: "0.75rem", fontFamily: primaryFont, fontWeight: 600 }}>
          DIGI LASER REAL ESTATE © {new Date().getFullYear()} | SECURE ACCESS
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;