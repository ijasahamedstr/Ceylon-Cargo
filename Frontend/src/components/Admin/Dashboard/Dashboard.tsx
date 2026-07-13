import React, { useState, useEffect, lazy, Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import {
  Box, Typography, Avatar, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Drawer, AppBar, Toolbar, Stack,
  useTheme, useMediaQuery, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Tooltip,
  Fade, Breadcrumbs, Link, Paper, Menu, MenuItem,
  Snackbar, Alert, BottomNavigation, BottomNavigationAction, CircularProgress
} from "@mui/material";
import {
  HomeOutlined, Inventory2Outlined, WarehouseOutlined, DescriptionOutlined,
  TrendingUpOutlined, QrCodeScannerOutlined, PointOfSaleOutlined,
  GroupsOutlined, AttachMoneyOutlined, AdminPanelSettingsOutlined,
  AssessmentOutlined, SettingsOutlined, LogoutOutlined, MenuOpen,
  ChevronRight, KeyboardArrowDownOutlined,
  CloudDoneOutlined, SecurityOutlined, SpeedOutlined, StorageOutlined,
  TranslateOutlined, ArrowForwardIos,
  WidgetsOutlined, CloseOutlined, PersonAddOutlined, LocalShippingOutlined,
  ListAltOutlined, CheckCircleOutline
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import './DashboardNeumorphism.css';

const Overview = lazy(() => import("../Overview/Overview"));
const SalesPersonForm = lazy(() => import("../Bookings/SalesPersonForm"));
const ShipmentManifest = lazy(() => import("../ShipmentManifest/ShipmentManifest"));
const Analytics = lazy(() => import("../Analytics/Analytics"));
const QRScanner = lazy(() => import("../QRScanner/QRScanner"));
const SalesDashboard = lazy(() => import("../SalesDashboard/SalesDashboard"));
const SalesPersons = lazy(() => import("../SalesPersons/SalesPersons"));
const Payments = lazy(() => import("../Payments/Payments"));
const Reports = lazy(() => import("../Reports/Reports"));
const CreateAdmin = lazy(() => import("../Settings/Settings"));
const BookingCustomer = lazy(() => import("../Bookings/Booking Customer"));
const WarehouseSA = lazy(() => import("../Warehouse SA/Warehouse SA"));
const WarehouseSL = lazy(() => import("../Warehouse SL/WarehouseSL"));
const LoadingLists = lazy(() => import("../LoadingLists/LoadingLists"));
const Delivery = lazy(() => import("../Delivery/Delivery"));
const Complete = lazy(() => import("../Complete/Complete"));

// Note: Import your specific components for Warehouse SA, Warehouse SL, and Delivery here when ready.
// import WarehouseSA from "../Warehouse/WarehouseSA";
// import WarehouseSL from "../Warehouse/WarehouseSL";
// import DeliveryManager from "../Delivery/DeliveryManager";

const DRAWER_WIDTH = 290;
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD  = "#CC9D2F";
const PRIMARY_FONT = "'Montserrat', sans-serif";
const LOGO_URL     = "https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png";

// ── Neumorphic design tokens ──
const NEU_BG       = "#F8FAFC";
const NEU_DARK_SH  = "#E2E8F0";
const NEU_RAISED   = "0 4px 12px rgba(0, 0, 0, 0.05)";
const NEU_INSET_SM = "none";

interface NavItem {
  text: string;
  icon: React.ReactNode;
}

const NAVIGATION_MAP: NavItem[] = [
  { text: "Dashboard",         icon: <HomeOutlined /> },
  { text: "New Booking",       icon: <Inventory2Outlined /> },
  { text: "Booking Customer",  icon: <PersonAddOutlined /> },
  { text: "Warehouse SA",      icon: <WarehouseOutlined /> },
  { text: "Loading List",      icon: <ListAltOutlined /> }, // <-- Added Loading List menu
  { text: "Shipment Manifest", icon: <DescriptionOutlined /> },
  { text: "Warehouse SL",      icon: <WarehouseOutlined /> },
  { text: "Delivery",          icon: <LocalShippingOutlined /> },
  { text: "Complete",          icon: <CheckCircleOutline /> },
  { text: "Analytics",         icon: <TrendingUpOutlined /> },
  { text: "QR Scanner",        icon: <QrCodeScannerOutlined /> },
  { text: "Sales Dashboard",   icon: <PointOfSaleOutlined /> },
  { text: "Sales Persons",     icon: <GroupsOutlined /> },
  { text: "Payments",          icon: <AttachMoneyOutlined /> },
  { text: "Reports",           icon: <AssessmentOutlined /> },
  { text: "Settings",          icon: <SettingsOutlined /> },
];

const LoaderBoundary = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={
    <Box sx={{ minHeight: "44vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress size={30} sx={{ color: PRIMARY_TEAL }} />
    </Box>
  }>
    {children}
  </Suspense>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const [activeTab,          setActiveTab]          = useState("Dashboard");
  const [bottomMenuOpen,     setBottomMenuOpen]     = useState(false); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [logoutDialogOpen,   setLogoutDialogOpen]   = useState(false);
  const [isLoaded,           setIsLoaded]           = useState(false);
  const [anchorEl,           setAnchorEl]           = useState<null | HTMLElement>(null);
  const [syncStatus]                                = useState("Online");
  const [snackbarOpen,       setSnackbarOpen]       = useState(false);
  const [userData, setUserData] = useState<any>({
    name: "System Administrator", profileImage: "", role: "Super Admin", allowedModules: undefined
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    const saved = localStorage.getItem("adminData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
        if (Array.isArray(parsed.allowedModules) && parsed.allowedModules.length > 0) {
          if (!parsed.allowedModules.includes("Dashboard")) {
            setActiveTab(parsed.allowedModules[0]);
          }
        }
      } catch {}
    }
    return () => clearTimeout(timer);
  }, []);

  // Auto-collapse sidebar on tablet to give more content space
  useEffect(() => {
    if (isTablet) setIsSidebarCollapsed(true);
    else if (!isMobile) setIsSidebarCollapsed(false);
  }, [isTablet, isMobile]);

  const filteredNavMap = useMemo(() => {
    if (Array.isArray(userData.allowedModules)) {
      return NAVIGATION_MAP.filter(item => userData.allowedModules.includes(item.text));
    }
    return NAVIGATION_MAP;
  }, [userData.allowedModules]);

  const drawerWidth = isSidebarCollapsed ? 72 : DRAWER_WIDTH;
  const handleProfileMenu  = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseProfile = () => setAnchorEl(null);
  const handleLogout = () => { setLogoutDialogOpen(false); localStorage.clear(); navigate("/login"); };
  
  const handleNavigation = (text: string) => {
    setActiveTab(text);
    if (isMobile) setBottomMenuOpen(false); 
    setSnackbarOpen(true);
  };

  const ActiveContent = () => {
    if (Array.isArray(userData.allowedModules)) {
      if (!userData.allowedModules.includes(activeTab)) {
        return (
          <Box sx={{ textAlign: "center", py: { xs: 10, md: 20 } }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontFamily: PRIMARY_FONT, fontWeight: 950, color: "#EF4444" }}>
              403 - Access Denied
            </Typography>
            <Typography sx={{ fontFamily: PRIMARY_FONT, color: "#64748B", mt: 1, fontWeight: 700 }}>
              You do not have permission to access the "{activeTab}" module.
            </Typography>
          </Box>
        );
      }
    }

    switch (activeTab) {
      case "Dashboard":         return <LoaderBoundary><Overview onNavigate={handleNavigation} /></LoaderBoundary>;
      case "New Booking":       return <LoaderBoundary><SalesPersonForm /></LoaderBoundary>;
      case "Booking Customer":  return <LoaderBoundary><BookingCustomer /></LoaderBoundary>;
      
      // Assigning LoadingListManager as a placeholder for the warehouses until specific components are created
      case "Warehouse SA":      return <LoaderBoundary><WarehouseSA /></LoaderBoundary>;
      case "Warehouse SL":      return <LoaderBoundary><WarehouseSL /></LoaderBoundary>;
      case "Loading List":      return <LoaderBoundary><LoadingLists /></LoaderBoundary>;
      case "Delivery":          return <LoaderBoundary><Delivery /></LoaderBoundary>;
      case "Complete":          return <LoaderBoundary><Complete /></LoaderBoundary>;

      case "Shipment Manifest": return <LoaderBoundary><ShipmentManifest /></LoaderBoundary>;
      case "Analytics":         return <LoaderBoundary><Analytics /></LoaderBoundary>;
      case "QR Scanner":        return <LoaderBoundary><QRScanner /></LoaderBoundary>;
      case "Sales Dashboard":   return <LoaderBoundary><SalesDashboard /></LoaderBoundary>;
      case "Sales Persons":     return <LoaderBoundary><SalesPersons /></LoaderBoundary>;
      case "Payments":          return <LoaderBoundary><Payments /></LoaderBoundary>;
      case "Reports":           return <LoaderBoundary><Reports /></LoaderBoundary>;
      case "Settings":          return <LoaderBoundary><CreateAdmin /></LoaderBoundary>;
      default:
        return (
          <Box sx={{ textAlign: "center", py: { xs: 10, md: 20 } }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontFamily: PRIMARY_FONT, fontWeight: 800, color: PRIMARY_TEAL }}>
              {activeTab}
            </Typography>
          </Box>
        );
    }
  };

  const DesktopSidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: NEU_BG, color: PRIMARY_TEAL }}>
      <Box sx={{ px: 4, py: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: isSidebarCollapsed ? 64 : 170, height: isSidebarCollapsed ? 64 : 170, borderRadius: "28px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, overflow: 'hidden' }}>
          <Box component="img" src={LOGO_URL} sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </Box>
      </Box>

      <List sx={{ px: isSidebarCollapsed ? 0.5 : 2, flexGrow: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: NEU_DARK_SH, borderRadius: 2 } }}>
        {filteredNavMap.map((item: NavItem) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.text)}
            sx={{
              borderRadius: "12px",
              mb: 0.5,
              py: 1.2,
              bgcolor: activeTab === item.text ? "rgba(0, 70, 82, 0.08)" : "transparent",
              borderLeft: activeTab === item.text ? `4px solid ${ACCENT_GOLD}` : "4px solid transparent",
              transition: "all 0.2s ease",
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              px: isSidebarCollapsed ? 1 : 2,
              "&:hover": {
                bgcolor: activeTab === item.text ? "rgba(0, 70, 82, 0.12)" : "rgba(0, 70, 82, 0.04)",
              },
              "&:active": { bgcolor: "rgba(0, 70, 82, 0.15)" }
            }}
          >
            <ListItemIcon sx={{ color: activeTab === item.text ? ACCENT_GOLD : PRIMARY_TEAL, minWidth: 40, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
            {!isSidebarCollapsed && (
              <ListItemText primary={item.text} slotProps={{ primary: { sx: { fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: "0.82rem", color: activeTab === item.text ? PRIMARY_TEAL : "#475569" } } }} />
            )}
            {!isSidebarCollapsed && activeTab === item.text && <ArrowForwardIos sx={{ fontSize: 10, color: ACCENT_GOLD }} />}
          </ListItemButton>
        ))}
      </List>

      {!isSidebarCollapsed && (
        <Box sx={{ p: 3, pt: 2 }}>
          <Box sx={{ p: 2, borderRadius: "14px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM, mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CloudDoneOutlined sx={{ fontSize: 18, color: "#10B981" }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#10B981", fontFamily: PRIMARY_FONT, letterSpacing: 0.5 }}>SYSTEM SECURE</Typography>
            </Stack>
          </Box>
          <Button fullWidth startIcon={<LogoutOutlined />} onClick={() => setLogoutDialogOpen(true)}
            sx={{ py: 1.2, bgcolor: "rgba(239, 68, 68, 0.05)", color: "#EF4444", border: "1px solid rgba(239, 68, 68, 0.12)", fontWeight: 800, textTransform: "none", borderRadius: "12px", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" }, fontFamily: PRIMARY_FONT }}>
            Sign Out
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box className="skeuo-root" sx={{ display: "flex", bgcolor: NEU_BG, minHeight: "100vh" }}>
      
      <AppBar className="skeuobar" 
        position="fixed" 
        elevation={0} 
        sx={{ 
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          ml: { md: `${drawerWidth}px` }, 
          bgcolor: NEU_BG, 
          boxShadow: `0 6px 24px ${NEU_DARK_SH}`,
          borderBottom: "none",
          zIndex: 1201,
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <Toolbar sx={{ height: { xs: 64, md: 80 }, px: { xs: 2, md: 4 }, justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setBottomMenuOpen(true)} sx={{ color: PRIMARY_TEAL, ml: -1 }}>
                <MenuOpen />
              </IconButton>
            )}
            <Box>
              {!isMobile && (
                <Breadcrumbs separator={<ChevronRight fontSize="small" sx={{ color: "#94A3B8" }} />}>
                  <Link underline="hover" color="#94A3B8" sx={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: PRIMARY_FONT }}>ADMIN</Link>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, fontFamily: PRIMARY_FONT, color: ACCENT_GOLD, letterSpacing: 0.5 }}>{activeTab.toUpperCase()}</Typography>
                </Breadcrumbs>
              )}
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 900, color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT }}>
                {activeTab}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 2 }}>
            <Tooltip title={isSidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}>
              <IconButton
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                sx={{
                  bgcolor: "rgba(0, 70, 82, 0.04)",
                  color: PRIMARY_TEAL,
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  border: "1px solid rgba(0, 70, 82, 0.1)",
                  transition: "all 0.2s ease",
                  "&:hover": { bgcolor: "rgba(0, 70, 82, 0.08)", color: ACCENT_GOLD },
                  "&:active": { transform: "scale(0.95)" }
                }}
              >
                {isSidebarCollapsed ? <MenuOpen sx={{ transform: "rotate(180deg)" }} /> : <MenuOpen />}
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ height: 35, my: "auto", display: { xs: "none", sm: "block" } }} />
            
            <Box onClick={handleProfileMenu} sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 1.5, p: 1, pl: 1, pr: 2, borderRadius: "50px", bgcolor: "rgba(0, 70, 82, 0.04)", border: "1px solid rgba(0, 70, 82, 0.1)", transition: "all 0.2s ease", "&:hover": { bgcolor: "rgba(0, 70, 82, 0.08)" } }}>
              <Avatar src={userData.profileImage} sx={{ width: { xs: 32, sm: 38 }, height: { xs: 32, sm: 38 }, border: `2px solid ${ACCENT_GOLD}` }} />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.82rem", color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT }}>{userData.name}</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "#10B981", fontWeight: 700 }}>● {userData.role}</Typography>
              </Box>
              <KeyboardArrowDownOutlined sx={{ color: PRIMARY_TEAL, display: { xs: "none", sm: "block" }, fontSize: 18 }} />
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0, transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
          <Drawer className="skeuodrawer" variant="permanent" open sx={{ 
            "& .MuiDrawer-paper": { 
              width: drawerWidth, 
              border: "none", 
              bgcolor: NEU_BG, 
              boxShadow: `6px 0 24px ${NEU_DARK_SH}, -2px 0 8px #FFFFFF`, 
              overflow: 'hidden',
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            } 
          }}>
            {DesktopSidebar}
          </Drawer>
        </Box>
      )}

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1.5, sm: 3, md: 4 }, 
          mt: { xs: "64px", md: "80px" },
          pb: { xs: "120px", md: 4 }, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <Fade in={isLoaded} timeout={600}>
          <Box>
            <Box 
              className="skeuocard"
              sx={{ p: { xs: 2, md: 5 }, borderRadius: { xs: "20px", md: "28px" }, minHeight: { xs: "calc(100vh - 180px)", md: "80vh" }, bgcolor: NEU_BG, boxShadow: NEU_RAISED }}
            >
              {ActiveContent()}
            </Box>
            
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="center" alignItems="center" spacing={{ xs: 1, sm: 4 }} sx={{ mt: { xs: 3, md: 5 }, opacity: 0.4, pb: { xs: 3, md: 0 } }}>
              {[
                { icon: <SecurityOutlined sx={{ fontSize: 16 }} />, label: "SSL ENCRYPTED" },
                { icon: <StorageOutlined sx={{ fontSize: 16 }} />, label: `DATABASE: ${syncStatus}` },
                { icon: <SpeedOutlined sx={{ fontSize: 16 }} />, label: "LATENCY: 24ms" },
              ].map(({ icon, label }) => (
                <Stack key={label} direction="row" spacing={1} alignItems="center">
                  {icon}
                  <Typography sx={{ fontSize: "0.65rem", fontWeight: 700,fontFamily: PRIMARY_FONT, }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Fade>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseProfile}
        slotProps={{ paper: { sx: { mt: 1, width: 220, borderRadius: "20px", p: 1, bgcolor: NEU_BG, border: "none", boxShadow: NEU_RAISED } } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#94A3B8",fontFamily: PRIMARY_FONT, }}>ACCOUNT</Typography>
        </Box>
        <MenuItem onClick={handleCloseProfile} sx={{ borderRadius: "12px", py: 1.2, mb: 0.5, bgcolor: NEU_BG, "&:hover": { bgcolor: NEU_BG, boxShadow: NEU_INSET_SM } }}>
          <ListItemIcon><AdminPanelSettingsOutlined fontSize="small" sx={{ color: PRIMARY_TEAL }} /></ListItemIcon>
          <ListItemText primary="Admin Profile" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: "0.85rem",fontFamily: PRIMARY_FONT, color: PRIMARY_TEAL } } }} />
        </MenuItem>
        <MenuItem onClick={handleCloseProfile} sx={{ borderRadius: "12px", py: 1.2, bgcolor: NEU_BG, "&:hover": { bgcolor: NEU_BG, boxShadow: NEU_INSET_SM } }}>
          <ListItemIcon><TranslateOutlined fontSize="small" sx={{ color: PRIMARY_TEAL }} /></ListItemIcon>
          <ListItemText primary="Language" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: "0.85rem",fontFamily: PRIMARY_FONT, color: PRIMARY_TEAL } } }} />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => { setLogoutDialogOpen(true); handleCloseProfile(); }} sx={{ borderRadius: "10px", color: "error.main" }}>
          <ListItemIcon><LogoutOutlined fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Sign Out" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: "0.85rem",fontFamily: PRIMARY_FONT, } } }} />
        </MenuItem>
      </Menu>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} slotProps={{ paper: { sx: { borderRadius: "28px", p: { xs: 1, sm: 2 }, maxWidth: 400, width: "90%", bgcolor: NEU_BG, border: "none", boxShadow: NEU_RAISED } } }}>
        <DialogTitle sx={{ fontFamily: PRIMARY_FONT, fontWeight: 900, color: PRIMARY_TEAL, textAlign: "center" }}>Sign Out</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#64748B", fontWeight: 500 }}>You will be redirected to the login page.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 3, justifyContent: "center", gap: 2 }}>
          <Button fullWidth onClick={() => setLogoutDialogOpen(false)} sx={{ color: "#64748B", fontWeight: 800, textTransform: "none", py: 1.5, borderRadius: "14px", border: "1px solid #E2E8F0", "&:hover": { bgcolor: "#F8FAFC" }, fontFamily: PRIMARY_FONT }}>Cancel</Button>
          <Button fullWidth onClick={handleLogout} sx={{ color: "#ffffff", fontWeight: 800, textTransform: "none", py: 1.5, borderRadius: "14px", bgcolor: "#EF4444", "&:hover": { bgcolor: "#DC2626" }, fontFamily: PRIMARY_FONT }}>Logout</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity="info" variant="filled" sx={{ borderRadius: "12px", fontWeight: 700, fontFamily: PRIMARY_FONT }}>
          {activeTab} loaded
        </Alert>
      </Snackbar>


      {/* 🚀 Mobile Grid Menu Drawer 🚀 */}
      <Drawer
        anchor="bottom"
        open={bottomMenuOpen}
        onClose={() => setBottomMenuOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "28px",
            borderTopRightRadius: "28px",
            bgcolor: NEU_BG,
            maxHeight: "85vh",
            pb: "env(safe-area-inset-bottom)",
            boxShadow: `0 -8px 32px ${NEU_DARK_SH}`
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ width: 40, height: 5, bgcolor: "#CBD5E1", borderRadius: 10, mx: "auto", mb: 3 }} />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 900, fontSize: "1.2rem", color: PRIMARY_TEAL }}>
              Menu
            </Typography>
            <IconButton onClick={() => setBottomMenuOpen(false)} sx={{ bgcolor: "#E2E8F0" }}>
              <CloseOutlined fontSize="small" sx={{ color: PRIMARY_TEAL }} />
            </IconButton>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {filteredNavMap.map((item: NavItem) => {
              const isActive = activeTab === item.text;
              return (
                <Paper
                  key={item.text}
                  elevation={0}
                  onClick={() => handleNavigation(item.text)}
                  sx={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    p: 1.5, borderRadius: "16px", cursor: "pointer", textAlign: "center",
                    bgcolor: isActive ? "rgba(0, 70, 82, 0.08)" : "#FFFFFF",
                    boxShadow: isActive ? "none" : "0 2px 8px rgba(0, 0, 0, 0.04)",
                    border: "1px solid #E2E8F0",
                    transition: "all 0.15s ease",
                    "&:active": { transform: "scale(0.97)" }
                  }}
                >
                  <Box sx={{ mb: 1, color: isActive ? ACCENT_GOLD : PRIMARY_TEAL, transition: "color 0.2s" }}>{item.icon}</Box>
                  <Typography sx={{ 
                    fontFamily: PRIMARY_FONT, fontWeight: isActive ? 800 : 600, 
                    fontSize: "0.7rem", lineHeight: 1.2, color: isActive ? PRIMARY_TEAL : "#475569"
                  }}>
                    {item.text}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>
      </Drawer>

      {/* 🚀 New Floating Pill Bottom Navigation 🚀 */}
      {isMobile && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: { xs: 16, sm: 24 }, 
            left: 16, 
            right: 16, 
            zIndex: 1100, 
            pb: "env(safe-area-inset-bottom)"
          }}
        >
          <Paper
            elevation={24}
            sx={{
              borderRadius: "32px", 
              overflow: "hidden",
              bgcolor: NEU_BG,
              boxShadow: NEU_RAISED,
            }}
          >
            <BottomNavigation
              showLabels
              value={activeTab}
              onChange={(_, newValue) => { 
                if (newValue === "Menu") {
                  setBottomMenuOpen(true);
                } else {
                  handleNavigation(newValue);
                }
              }}
              sx={{
                height: 75,
                bgcolor: "transparent",
                px: 1,
                "& .MuiBottomNavigationAction-root": { 
                  color: "#94A3B8", 
                  fontFamily: PRIMARY_FONT, 
                  minWidth: "auto", 
                  px: 0,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                },
                "& .Mui-selected": { 
                  color: PRIMARY_TEAL,
                  transform: "translateY(-3px)", 
                },
                "& .MuiBottomNavigationAction-label": { 
                  fontSize: "0.65rem", 
                  fontWeight: 600, 
                  mt: 0.5,
                  transition: "all 0.3s ease",
                },
                "& .MuiBottomNavigationAction-label.Mui-selected": { 
                  fontSize: "0.75rem", 
                  fontWeight: 800,
                  color: PRIMARY_TEAL,
                },
                "& .MuiSvgIcon-root": {
                  fontSize: "1.4rem",
                  transition: "all 0.3s ease",
                  mb: 0.5
                },
                "& .Mui-selected .MuiSvgIcon-root": {
                  fontSize: "1.7rem",
                  color: ACCENT_GOLD,
                  filter: `drop-shadow(0px 2px 4px ${NEU_DARK_SH})`
                }
              }}
            >
              {(!userData.allowedModules || userData.allowedModules.includes("Dashboard")) && (
                <BottomNavigationAction label="Home" value="Dashboard" icon={<HomeOutlined />} />
              )}
              {(!userData.allowedModules || userData.allowedModules.includes("New Booking")) && (
                <BottomNavigationAction label="Booking" value="New Booking" icon={<Inventory2Outlined />} />
              )}
              {(!userData.allowedModules || userData.allowedModules.includes("QR Scanner")) && (
                <BottomNavigationAction label="Scanner" value="QR Scanner" icon={<QrCodeScannerOutlined />} />
              )}
              <BottomNavigationAction label="Menu" value="Menu" icon={<WidgetsOutlined />} />
            </BottomNavigation>
          </Paper>
        </Box>
      )}

    </Box>
  );
};

export default Dashboard;
