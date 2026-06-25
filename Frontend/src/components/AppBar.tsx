import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  Container,
  Tooltip,
  Drawer,
  Typography,
  Paper,
  Stack,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import MiscellaneousServicesRoundedIcon from "@mui/icons-material/MiscellaneousServicesRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

const pages = [
  { name: "Home", desc: "Back to dashboard", path: "/", icon: <HomeRoundedIcon sx={{ fontSize: "20px" }} /> },
  { name: "Tracking", desc: "Locate shipment", path: "/tracking", icon: <LocalShippingRoundedIcon sx={{ fontSize: "20px" }} /> },
  { name: "Booking", desc: "Schedule pickup", path: "/booking", icon: <EventNoteRoundedIcon sx={{ fontSize: "20px" }} /> },
  { name: "Services", desc: "Our core offerings", path: "/services", icon: <MiscellaneousServicesRoundedIcon sx={{ fontSize: "20px" }} /> },
  { name: "About Us", desc: "Our journey", path: "/about", icon: <InfoRoundedIcon sx={{ fontSize: "20px" }} /> },
];

const COLORS = {
  primaryBlue: "#1a539b",
  textDark: "#0F172A",
  textMuted: "#64748B",
  white: "#ffffff",
  gold: "#f59e0b",
  bgLight: "#F7FAFF",
  drawerBg: "#F8FAFC",
};

const FONT_FAMILY = "'Montserrat', sans-serif";

/* --- Styled Premium Components --- */
const FloatingBottomNav = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 14,
  left: 14,
  right: 14,
  zIndex: 1400,
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(26, 83, 155, 0.08)',
  boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  display: 'block',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

export default function Navbar() {
  const [bottomMenuOpen, setBottomMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setBottomMenuOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: COLORS.bgLight,
          zIndex: 1100,
          overflow: "hidden",
          borderBottom: "1px solid rgba(26, 83, 155, 0.05)"
        }}
      >
        {/* Background Decoration */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(11,95,255,0.08) 0, transparent 35%), radial-gradient(circle at 80% 40%, rgba(0,184,255,0.08) 0, transparent 40%)",
            pointerEvents: "none",
          }}
        />

        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            position: "relative",
            background: "transparent",
          }}
        >
          <Toolbar
            sx={{
              position: "relative",
              height: { xs: 80, md: 110 },
              display: "flex",
              justifyContent: "space-between",
              px: { xs: 2.5, sm: 4, md: 8, lg: 12 },
              background: "transparent",
            }}
          >
            {/* LEFT: Logo & Desktop Links */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { md: 4, lg: 6 } }}>
              <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                <Box
                  component="img"
                  src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png"
                  alt="Ceylon Cargo"
                  sx={{
                    height: { xs: 50, md: 90 },
                    width: "auto",
                    transition: "0.3s",
                  }}
                />
              </Link>

              {/* Desktop Menu Menu */}
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
                {pages.map((page) => {
                  const isActive = location.pathname === page.path;
                  return (
                    <Button
                      key={page.name}
                      component={Link}
                      to={page.path}
                      sx={{
                        fontFamily: FONT_FAMILY,
                        textTransform: "none",
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? COLORS.primaryBlue : COLORS.textDark,
                        px: 2,
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: "4px",
                          left: "50%",
                          transform: isActive ? "translateX(-50%) scaleX(1)" : "translateX(-50%) scaleX(0)",
                          width: "30%",
                          height: "3px",
                          backgroundColor: COLORS.primaryBlue,
                          borderRadius: "4px",
                          transition: "transform 0.25s ease",
                        },
                        "&:hover": {
                          bgcolor: "transparent",
                          color: COLORS.primaryBlue,
                          transform: "translateY(-1px)",
                          "&::after": { transform: "translateX(-50%) scaleX(1)" }
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      {page.name}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* RIGHT: Actions & Native Controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Desktop Sign In */}
              <Tooltip title="Secure Client Access" arrow>
                <Box
                  component={Link}
                  to="/login"
                  sx={{
                    textDecoration: "none",
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "6px 14px 6px 6px",
                    transition: "all 0.25s ease",
                    "&:hover": { transform: "translateY(-2px)" },
                    "&:hover .login-icon-box": {
                      bgcolor: COLORS.primaryBlue,
                      color: COLORS.white,
                      transform: "scale(1.05)",
                    },
                    "&:hover .login-text": {
                      color: COLORS.primaryBlue,
                    },
                  }}
                >
                  <Box
                    className="login-icon-box"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(COLORS.primaryBlue, 0.08),
                      color: COLORS.primaryBlue,
                      transition: "all 0.25s ease",
                      mr: 1.2,
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 18 }} />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box
                      className="login-text"
                      component="span"
                      sx={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: COLORS.textDark,
                        transition: "0.2s",
                        lineHeight: 1.2,
                      }}
                    >
                      SIGN IN
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: COLORS.gold,
                        letterSpacing: "0.3px",
                      }}
                    >
                      PORTAL ACCESS
                    </Box>
                  </Box>
                </Box>
              </Tooltip>

              {/* Desktop Track Button */}
              <Button
                variant="outlined"
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: "9px !important" }} />}
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  fontFamily: FONT_FAMILY,
                  borderColor: COLORS.primaryBlue,
                  borderWidth: "1.5px",
                  color: COLORS.primaryBlue,
                  borderRadius: "10px",
                  px: 2.5,
                  py: 1,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  "&:hover": {
                    borderWidth: "1.5px",
                    bgcolor: COLORS.primaryBlue,
                    color: COLORS.white,
                    boxShadow: "0 6px 16px rgba(26, 83, 155, 0.12)",
                  },
                  transition: "all 0.2s",
                }}
                component={Link}
                to="/tracking"
              >
                Track Now
              </Button>

              {/* Mobile Quick Action Buttons (Replaces default hamburger layout breaks) */}
              <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
                <IconButton 
                  onClick={() => handleNavigation('/tracking')}
                  sx={{ color: COLORS.primaryBlue, bgcolor: alpha(COLORS.primaryBlue, 0.06), borderRadius: "10px", p: 1 }}
                >
                  <LocalShippingRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton 
                  onClick={() => setBottomMenuOpen(true)}
                  sx={{ color: COLORS.textDark, bgcolor: COLORS.white, border: "1px solid #e2e8f0", borderRadius: "10px", p: 1 }}
                >
                  <MenuIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- Premium Mobile Tab Dock Controller --- */}
      <FloatingBottomNav elevation={0}>
        <BottomNavigation
          showLabels
          value={location.pathname}
          sx={{
            bgcolor: 'transparent',
            height: '62px',
            '& .MuiBottomNavigationAction-root': { color: COLORS.textMuted, minWidth: 'auto', padding: '6px 0', transition: 'all 0.2s ease' },
            '& .Mui-selected': { 
              color: COLORS.primaryBlue,
              '& .MuiSvgIcon-root': { filter: `drop-shadow(0 2px 4px ${alpha(COLORS.primaryBlue, 0.3)})` }
            },
            '& .MuiBottomNavigationAction-label': { fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1px', marginTop: '3px' }
          }}
        >
          <BottomNavigationAction label="Home" value="/" icon={<HomeRoundedIcon sx={{ fontSize: '20px' }} />} onClick={() => handleNavigation('/')} />
          <BottomNavigationAction label="Track" value="/tracking" icon={<LocalShippingRoundedIcon sx={{ fontSize: '20px' }} />} onClick={() => handleNavigation('/tracking')} />
          <BottomNavigationAction label="Book" value="/booking" icon={<EventNoteRoundedIcon sx={{ fontSize: '20px' }} />} onClick={() => handleNavigation('/booking')} />
          <BottomNavigationAction label="Menu" value="menu" icon={<MenuIcon sx={{ fontSize: '20px' }} />} onClick={() => setBottomMenuOpen(true)} />
        </BottomNavigation>
      </FloatingBottomNav>

      {/* 🚀 Premium Mobile Grid System Menu Drawer 🚀 */}
      <Drawer
        anchor="bottom"
        open={bottomMenuOpen}
        onClose={() => setBottomMenuOpen(false)}
        sx={{ zIndex: 1600 }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            bgcolor: COLORS.drawerBg,
            backgroundImage: `radial-gradient(circle at 50% 0%, ${alpha(COLORS.primaryBlue, 0.04)} 0%, transparent 60%)`,
            maxHeight: "82vh",
            boxShadow: "0 -12px 36px rgba(15, 23, 42, 0.12)",
            pb: "env(safe-area-inset-bottom)",
            display: "flex",
            flexDirection: "column"
          }
        }}
      >
        <Box sx={{ p: 2.5, pb: 6, overflowY: 'auto' }}>
          {/* Top Pill Window Drag Identifier */}
          <Box sx={{ width: 36, height: 4, bgcolor: "#CBD5E1", borderRadius: 10, mx: "auto", mb: 2.5 }} />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} px={0.5}>
            <Box>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: "1.1rem", color: COLORS.textDark, letterSpacing: "-0.2px" }}>
                System Operations
              </Typography>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: "0.65rem", color: COLORS.primaryBlue, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Ceylon Cargo Dashboard
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setBottomMenuOpen(false)} 
              sx={{ bgcolor: "#E2E8F0", width: 32, height: 32, color: COLORS.textDark, '&:hover': { bgcolor: '#cbd5e1' } }}
            >
              <CloseRoundedIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          </Stack>

          {/* 3-Column Highly Attractive Tactile Control Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 3 }}>
            {pages.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Paper
                  key={item.name}
                  elevation={0}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    p: 1.8, borderRadius: "12px", cursor: "pointer", textAlign: "center",
                    background: isActive ? `linear-gradient(145deg, ${alpha(COLORS.primaryBlue, 0.08)} 0%, ${alpha(COLORS.primaryBlue, 0.01)} 100%)` : COLORS.white,
                    color: isActive ? COLORS.primaryBlue : COLORS.textMuted,
                    border: isActive ? `1px solid ${alpha(COLORS.primaryBlue, 0.25)}` : "1px solid #E2E8F0",
                    boxShadow: isActive ? `0 4px 12px ${alpha(COLORS.primaryBlue, 0.05)}` : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:active": { transform: "scale(0.95)" }
                  }}
                >
                  <Box sx={{ mb: 1, color: isActive ? COLORS.primaryBlue : alpha(COLORS.primaryBlue, 0.6), filter: isActive ? `drop-shadow(0 2px 4px ${alpha(COLORS.primaryBlue, 0.2)})` : 'none' }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ 
                    fontFamily: FONT_FAMILY, fontWeight: isActive ? 700 : 500, 
                    fontSize: "0.7rem", lineHeight: 1.2, color: isActive ? COLORS.textDark : "#475569"
                  }}>
                    {item.name}
                  </Typography>
                </Paper>
              );
            })}

            {/* Portal Action Card Inside Grid */}
            <Paper
              elevation={0}
              onClick={() => handleNavigation('/login')}
              sx={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                p: 1.8, borderRadius: "12px", cursor: "pointer", textAlign: "center",
                background: COLORS.white,
                color: COLORS.textMuted,
                border: "1px solid #E2E8F0",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:active": { transform: "scale(0.95)" }
              }}
            >
              <Box sx={{ mb: 1, color: COLORS.gold }}>
                <LoginIcon sx={{ fontSize: "20px" }} />
              </Box>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: "0.7rem", lineHeight: 1.2, color: "#475569" }}>
                Sign In
              </Typography>
            </Paper>
          </Box>

          {/* Integrated Core Support Widget Card */}
          <Box sx={{ p: 2, borderRadius: "16px", bgcolor: COLORS.white, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: alpha(COLORS.primaryBlue, 0.06), color: COLORS.primaryBlue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SupportAgentRoundedIcon sx={{ fontSize: "20px" }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: "0.82rem", color: COLORS.textDark, lineHeight: 1.3 }}>
                Operations Support
              </Typography>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: "0.7rem", color: COLORS.textMuted }}>
                Live dispatch assistance desk available
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Structural Offset Spacing Layout Shield */}
      <Box sx={{ height: { xs: 80, md: 110 } }} />
    </>
  );
}