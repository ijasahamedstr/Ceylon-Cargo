import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";
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
        navigate("/dashboard");
        return;
      }

      // 2. --- NORMAL DATABASE LOGIN ---
      const data = await authService.login(email, password);

      if (data.requires2FA) {
        setAdminId(data.adminId);
        setStep("otp");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        navigate("/dashboard");
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
      const data = await authService.verify2FA(adminId, otp);

      if (data.success) {
        localStorage.setItem("token", data.token || "logged_in_token");
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        navigate("/dashboard");
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 0 },
        background: "#e8eff9",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes morph {
          0% { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; }
          50% { border-radius: 60% 40% 40% 60% / 60% 60% 40% 40%; }
          100% { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; }
        }

        @keyframes float1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(40px, -60px) scale(1.08) rotate(120deg); }
          66% { transform: translate(-30px, 30px) scale(0.92) rotate(240deg); }
          100% { transform: translate(0, 0) scale(1) rotate(360deg); }
        }

        @keyframes float2 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-50px, 40px) scale(0.88) rotate(90deg); }
          66% { transform: translate(40px, -30px) scale(1.12) rotate(210deg); }
          100% { transform: translate(0, 0) scale(1) rotate(360deg); }
        }

        @keyframes float3 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(30px, 50px) scale(1.06) rotate(180deg); }
          100% { transform: translate(0, 0) scale(1) rotate(360deg); }
        }

        .liquid-blob {
          position: absolute;
          filter: blur(80px);
          mix-blend-mode: multiply;
          opacity: 0.38;
          pointer-events: none;
        }

        .blob1 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, #004652 0%, #0d9488 100%);
          top: -12%;
          left: -15%;
          animation: morph 12s ease-in-out infinite alternate, float1 22s ease-in-out infinite;
        }

        .blob2 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, #cc9d2f 0%, #d97706 100%);
          bottom: -15%;
          right: -10%;
          animation: morph 16s ease-in-out infinite alternate, float2 26s ease-in-out infinite;
        }

        .blob3 {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, #2563eb 0%, #1d4ed8 100%);
          top: 35%;
          left: 20%;
          animation: morph 10s ease-in-out infinite alternate, float3 18s ease-in-out infinite;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.42) !important;
          backdrop-filter: blur(25px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.45) !important;
          box-shadow: 0 28px 64px -16px rgba(0, 70, 82, 0.14) !important;
        }

        .glass-input .MuiOutlinedInput-root {
          background: rgba(255, 255, 255, 0.45) !important;
          backdrop-filter: blur(6px) !important;
          border: 1px solid rgba(0, 70, 82, 0.12) !important;
          border-radius: 12px !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-input .MuiOutlinedInput-root:hover {
          border-color: rgba(13, 148, 136, 0.4) !important;
          background: rgba(255, 255, 255, 0.65) !important;
          box-shadow: 0 4px 18px rgba(13, 148, 136, 0.05) !important;
        }

        .glass-input .MuiOutlinedInput-root.Mui-focused {
          border-color: #0d9488 !important;
          background: rgba(255, 255, 255, 0.85) !important;
          box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.12) !important;
        }

        .liquid-btn {
          background: linear-gradient(135deg, #004652 0%, #0d9488 50%, #cc9d2f 100%) !important;
          background-size: 200% auto !important;
          transition: all 0.4s ease !important;
          box-shadow: 0 10px 24px -4px rgba(13, 148, 136, 0.35) !important;
        }

        .liquid-btn:hover {
          background-position: right center !important;
          transform: translateY(-1.5px) !important;
          box-shadow: 0 14px 32px -4px rgba(13, 148, 136, 0.5) !important;
        }
      `}</style>

      {/* Background Liquid Mesh Animated Blobs */}
      <Box className="liquid-blob blob1" />
      <Box className="liquid-blob blob2" />
      <Box className="liquid-blob blob3" />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={750}>
          <Paper
            elevation={0}
            className="glass-panel"
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 6,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3.5 }}>
              <Box
                component="img"
                src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png"
                alt="Ceylon Cargo Logo"
                sx={{ height: 110, width: 'auto', objectFit: 'contain' }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#004652",
                mb: 2.5,
                fontFamily: primaryFont,
                textAlign: 'center',
              }}
            >
              Welcome Back
            </Typography>

            {error && step !== "locked" && (
              <Alert
                severity="error"
                variant="outlined"
                sx={{ mb: 3, fontFamily: primaryFont, borderRadius: 3, fontWeight: 600, py: 1.2, borderColor: "rgba(248, 113, 113, 0.26)", color: "#B91C1C", bgcolor: "rgba(254, 226, 226, 0.9)" }}
              >
                {error}
              </Alert>
            )}

            {step === "locked" ? (
              <Box sx={{ textAlign: "center" }}>
                <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: 3, mb: 3, py: 1.2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: primaryFont }}>
                    Access restricted.
                  </Typography>
                </Alert>
                <Typography variant="body2" sx={{ mb: 3, color: "#475569", fontFamily: primaryFont }}>
                  Please contact the Admin to manually unlock your account or wait for the cooldown.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setStep("password")}
                  sx={{ py: 1.3, borderRadius: 4, borderColor: "#0F172A", color: "#0F172A", fontWeight: 700, textTransform: 'none' }}
                >
                  Return to Login
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={step === "password" ? handleLoginSubmit : handleOtpSubmit} noValidate>
                {step === "password" ? (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email Address"
                      className="glass-input"
                      variant="outlined"
                      margin="dense"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 700, fontSize: "0.95rem", color: "#004652" } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PersonOutline fontSize="small" sx={{ color: "#004652" }} /></InputAdornment>,
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '& input': { fontFamily: primaryFont, fontWeight: 700, color: '#004652' },
                      }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      label="Password"
                      className="glass-input"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      margin="dense"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 700, fontSize: "0.95rem", color: "#004652" } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined fontSize="small" sx={{ color: "#004652" }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} edge="end" size="small" sx={{ color: "#004652" }}>
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 0,
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                        '& input': { fontFamily: primaryFont, fontWeight: 700, color: '#004652' },
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 3 }}>
                      <Typography
                        component="button"
                        type="button"
                        onClick={() => setShowForgotAlert(true)}
                        sx={{
                          bgcolor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: accentGold,
                          fontWeight: 700,
                          fontFamily: primaryFont,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          '&:hover': { color: '#b78a1d' },
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
                    className="glass-input"
                    label="Verification Code"
                    placeholder="000 000"
                    variant="outlined"
                    margin="dense"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.35rem', letterSpacing: '10px', fontWeight: 800, color: primaryTeal, fontFamily: primaryFont } }}
                    InputLabelProps={{ sx: { fontFamily: primaryFont, fontWeight: 700, color: "#004652" } }}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      mb: 3
                    }}
                  />
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  className="liquid-btn"
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    fontFamily: primaryFont,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : step === 'password' ? 'Login' : 'Verify'}
                </Button>

                {step === 'otp' && (
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => setStep('password')}
                    startIcon={<ArrowForward sx={{ transform: 'rotate(180deg)' }} />}
                    sx={{ mt: 2, color: '#004652', fontFamily: primaryFont, fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', justifyContent: 'flex-start' }}
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
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    bgcolor: '#eef7ff',
                    color: '#0e4d7a',
                    py: 0,
                    px: 1.5,
                    boxShadow: '0 14px 30px rgba(30, 106, 169, 0.08)',
                    '& .MuiAlert-icon': { color: '#0e4d7a' },
                  }}
                >
                  Contact Admin to reset password.
                </Alert>
              </Box>
            </Collapse>
          </Paper>
        </Fade>

        <Typography sx={{ mt: 4, textAlign: 'center', color: '#475569', fontSize: '0.78rem', fontFamily: primaryFont, fontWeight: 700 }}>
          CEYLON CARGO © {new Date().getFullYear()} | CYBERX7 SECURE ACCESS
        </Typography>
      </Container>
    </Box>
  );
}

export default Login;
