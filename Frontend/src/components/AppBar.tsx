import * as React from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "@mui/material";

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
  { name: "Home", desc: "Back to main dashboard", path: "/", icon: <HomeRoundedIcon /> },
  { name: "Tracking", desc: "Locate your shipment", path: "/tracking", icon: <LocalShippingRoundedIcon /> },
  { name: "Booking", desc: "Schedule a new pickup", path: "/booking", icon: <EventNoteRoundedIcon /> },
  { name: "Services", desc: "Explore what we offer", path: "/services", icon: <MiscellaneousServicesRoundedIcon /> },
  { name: "About us", desc: "Our company story", path: "/about", icon: <InfoRoundedIcon /> },
];

const COLORS = {
  primaryBlue: "#1a539b",
  textDark: "#0F172A",
  textMuted: "#64748B",
  white: "#ffffff",
  gold: "#f59e0b",
  bgLight: "#eef2f7",
  drawerBg: "#eef2f7",
};



const FONT_FAMILY = "'Montserrat', sans-serif";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const handleOpenMobileMenu = () => setMobileOpen(true);
  const handleCloseMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid #E2E8F0",
          zIndex: 1100,
          overflow: "hidden",
        }}
      >
        {/* Background Decoration */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(11,95,255,0.06) 0, transparent 35%), radial-gradient(circle at 80% 40%, rgba(0,184,255,0.06) 0, transparent 40%)",
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
              height: { xs: 90, md: 120 },
              display: "flex",
              justifyContent: "space-between",
              px: { xs: 2, sm: 4, md: 10, lg: 16, xl: 20 },
              background: "transparent",
            }}
          >
            {/* LEFT: Logo & Desktop Links */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { md: 6, lg: 8 } }}>
              <Link to="/" style={{ display: "flex", alignItems: "center" }}>
                <Box
                  component="img"
                  src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png"
                  alt="Ceylon Cargo"
                  sx={{
                    height: { xs: 65, md: 110 },
                    width: "auto",
                    transition: "0.3s",
                    filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.08))",
                  }}
                />
              </Link>

              {/* Desktop Menu */}
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
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
                        fontSize: "0.9rem",
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? COLORS.primaryBlue : COLORS.textDark,
                        px: 2.5,
                        py: 1,
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        bgcolor: isActive ? "rgba(26, 83, 155, 0.08)" : "transparent",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "rgba(26, 83, 155, 0.04)",
                          color: COLORS.primaryBlue,
                          boxShadow: "none",
                        },
                      }}
                    >
                      {page.name}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            {/* RIGHT: Actions & Hamburger */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
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
                    bgcolor: "rgba(26, 83, 155, 0.04)",
                    padding: "8px 16px 8px 8px",
                    borderRadius: "14px",
                    border: "1px solid rgba(26, 83, 155, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(26, 83, 155, 0.08)",
                      boxShadow: "none",
                    },
                    "&:hover .login-icon-box": {
                      bgcolor: COLORS.primaryBlue,
                      color: COLORS.white,
                      transform: "rotate(-10deg) scale(1.05)",
                    },
                  }}
                >
                  <Box
                    className="login-icon-box"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(26, 83, 155, 0.08)",
                      color: COLORS.primaryBlue,
                      transition: "0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      mr: 1.5,
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 20 }} />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box
                      className="login-text"
                      component="span"
                      sx={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: COLORS.textDark,
                        transition: "0.3s",
                        lineHeight: 1.2,
                      }}
                    >
                      SIGN IN
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontFamily: FONT_FAMILY,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: COLORS.gold,
                        letterSpacing: "0.5px",
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
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: "10px !important" }} />}
                sx={{
                  display: { xs: "none", lg: "inline-flex" },
                  fontFamily: FONT_FAMILY,
                  borderColor: COLORS.primaryBlue,
                  bgcolor: "transparent",
                  color: COLORS.primaryBlue,
                  borderRadius: "14px",
                  boxShadow: "none",
                  px: 3.5,
                  py: 1.5,
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  "&:hover": {
                    borderColor: COLORS.primaryBlue,
                    bgcolor: "rgba(26, 83, 155, 0.04)",
                    color: COLORS.primaryBlue,
                    boxShadow: "none",
                  },
                  transition: "all 0.3s ease",
                }}
                component={Link}
                to="/tracking"
              >
                Track Now
              </Button>

              {/* Mobile Menu Toggle Icon */}
              <IconButton
                sx={{
                  display: { xs: "flex", md: "none" },
                  color: COLORS.primaryBlue,
                  bgcolor: "rgba(26, 83, 155, 0.04)",
                  borderRadius: "14px",
                  p: 1.5,
                  border: "1px solid rgba(26, 83, 155, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(26, 83, 155, 0.08)",
                  },
                }}
                onClick={handleOpenMobileMenu}
              >
                <MenuIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- PREMIUM MOBILE APP DRAWER --- */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleCloseMobileMenu}
        PaperProps={{
          sx: {
            width: { xs: "88%", sm: 400 },
            maxWidth: "100%",
            bgcolor: "#ffffff",
            borderTopLeftRadius: { xs: "30px", sm: "40px" },
            borderBottomLeftRadius: { xs: "30px", sm: "40px" },
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3, pt: 4 }}>
          <Box
            component="img"
            src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png"
            alt="Ceylon Cargo"
            sx={{ height: 45, width: "auto" }}
          />
          <IconButton
            onClick={handleCloseMobileMenu}
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.02)",
              color: COLORS.textDark,
              border: "1px solid rgba(0, 0, 0, 0.06)",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.06)",
                color: "#e11d48",
                boxShadow: "none"
              },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Drawer Navigation Links (Scrollable area) */}
        <Box sx={{ px: 2.5, flexGrow: 1, overflowY: "auto", pb: 2 }}>
          <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: "0.75rem", fontWeight: 800, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1.5, mb: 2, ml: 1 }}>
            Navigation
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {pages.map((page) => {
              const isActive = location.pathname === page.path;
              return (
                <Box
                  key={page.name}
                  component={Link}
                  to={page.path}
                  onClick={handleCloseMobileMenu}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    textDecoration: "none",
                    p: 1.8,
                    borderRadius: "20px",
                    bgcolor: isActive ? "rgba(26, 83, 155, 0.08)" : "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(26, 83, 155, 0.04)",
                      boxShadow: "none",
                    },
                  }}
                >
                  {/* App-style Icon Block */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isActive ? COLORS.primaryBlue : "rgba(26, 83, 155, 0.08)",
                      color: isActive ? COLORS.white : COLORS.primaryBlue,
                      mr: 2,
                    }}
                  >
                    {page.icon}
                  </Box>
                  
                  {/* Text Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: "1.05rem", color: COLORS.textDark }}>
                      {page.name}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: "0.75rem", color: COLORS.textMuted }}>
                      {page.desc}
                    </Typography>
                  </Box>

                  {isActive && <ArrowForwardIosIcon sx={{ fontSize: 14, color: COLORS.primaryBlue, mr: 1 }} />}
                </Box>
              );
            })}
          </Box>

          {/* Floating Support Banner inside Menu */}
          <Box
            sx={{
              mt: 4,
              mb: 2,
              p: 2.5,
              borderRadius: "24px",
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SupportAgentRoundedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: "0.9rem", color: COLORS.textDark }}>
                Need Help?
              </Typography>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: "0.75rem", color: COLORS.textMuted }}>
                Contact our 24/7 team
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Sticky Drawer Footer Actions */}
        <Box sx={{ p: 3, pt: 2, pb: 4, bgcolor: "#ffffff", borderTop: `1px solid rgba(0,0,0,0.06)`, display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            component={Link}
            to="/login"
            onClick={handleCloseMobileMenu}
            startIcon={<LoginIcon />}
            fullWidth
            sx={{
              fontFamily: FONT_FAMILY,
              bgcolor: "transparent",
              color: COLORS.primaryBlue,
              fontWeight: 800,
              py: 1.8,
              borderRadius: "16px",
              fontSize: "0.95rem",
              border: `1px solid ${COLORS.primaryBlue}`,
              "&:hover": {
                bgcolor: "rgba(26, 83, 155, 0.04)",
                boxShadow: "none",
              },
            }}
          >
            Client Portal Login
          </Button>
          
          <Button
            component={Link}
            to="/tracking"
            onClick={handleCloseMobileMenu}
            variant="contained"
            fullWidth
            sx={{
              fontFamily: FONT_FAMILY,
              bgcolor: COLORS.primaryBlue,
              color: COLORS.white,
              fontWeight: 800,
              py: 1.8,
              borderRadius: "16px",
              fontSize: "0.95rem",
              boxShadow: `0 8px 20px rgba(26, 83, 155, 0.25)`,
              "&:hover": {
                bgcolor: "#123f7a",
              },
            }}
          >
            Track Shipment
          </Button>
        </Box>
      </Drawer>

      {/* Spacer to match AppBar height */}
      <Box sx={{ height: { xs: 90, md: 120 } }} />
    </>
  );
}