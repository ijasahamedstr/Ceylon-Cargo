import React, { useState, useEffect } from "react";
import {
  Box, Typography, Avatar, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Drawer, AppBar, Toolbar, Stack,
  useTheme, useMediaQuery, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Tooltip,
  Fade, Breadcrumbs, Link, Paper, Badge, Menu, MenuItem,
  Snackbar, Alert, BottomNavigation, BottomNavigationAction
} from "@mui/material";
import {
  HomeOutlined, Inventory2Outlined, WarehouseOutlined, DescriptionOutlined,
  TrendingUpOutlined, QrCodeScannerOutlined, PointOfSaleOutlined,
  GroupsOutlined, AttachMoneyOutlined, AdminPanelSettingsOutlined,
  AssessmentOutlined, SettingsOutlined, LogoutOutlined, MenuOpen,
  ChevronRight, NotificationsActiveOutlined, KeyboardArrowDownOutlined,
  CloudDoneOutlined, SecurityOutlined, SpeedOutlined, StorageOutlined,
  TranslateOutlined, SupportAgentOutlined, ArrowForwardIos,
  WidgetsOutlined, CloseOutlined, PersonAddOutlined, LocalShippingOutlined,
  ListAltOutlined // <-- Added new icon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import Overview from "../Overview/Overview";
import SalesPersonForm from "../Bookings/SalesPersonForm";
import ShipmentManifest from "../ShipmentManifest/ShipmentManifest";
import Analytics from "../Analytics/Analytics";
import QRScanner from "../QRScanner/QRScanner";
import SalesDashboard from "../SalesDashboard/SalesDashboard";
import Payments from "../Payments/Payments";
import Reports from "../Reports/Reports";
import CreateAdmin from "../Settings/Settings";
import BookingCustomer from "../Bookings/Booking Customer";
import WarehouseSA from "../Warehouse SA/Warehouse SA";
import LoadingLists from "../LoadingLists/LoadingLists";
import WarehouseSL from "../Warehouse SL/Warehouse SA";
import Delivery from "../Delivery/Delivery";
import SalesPersonList from "../SalesPersons/SalesPersons";
import Staff from "../StaffRoles/Staff";

// Note: Import your specific components for Warehouse SA, Warehouse SL, and Delivery here when ready.
// import WarehouseSA from "../Warehouse/WarehouseSA";
// import WarehouseSL from "../Warehouse/WarehouseSL";
// import DeliveryManager from "../Delivery/DeliveryManager";

const DRAWER_WIDTH = 290;
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD  = "#CC9D2F";
const PRIMARY_FONT = "'Montserrat', sans-serif";
const LOGO_URL     = "https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png";

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
  { text: "Analytics",         icon: <TrendingUpOutlined /> },
  { text: "QR Scanner",        icon: <QrCodeScannerOutlined /> },
  { text: "Sales Dashboard",   icon: <PointOfSaleOutlined /> },
  { text: "Sales Persons",     icon: <GroupsOutlined /> },
  { text: "Payments",          icon: <AttachMoneyOutlined /> },
  { text: "Staff Roles",       icon: <AdminPanelSettingsOutlined /> },
  { text: "Reports",           icon: <AssessmentOutlined /> },
  { text: "Settings",          icon: <SettingsOutlined /> },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isVerySmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab,          setActiveTab]          = useState("Dashboard");
  const [bottomMenuOpen,     setBottomMenuOpen]     = useState(false); 
  const [logoutDialogOpen,   setLogoutDialogOpen]   = useState(false);
  const [isLoaded,           setIsLoaded]           = useState(false);
  const [anchorEl,           setAnchorEl]           = useState<null | HTMLElement>(null);
  const [syncStatus]                                = useState("Online");
  const [snackbarOpen,       setSnackbarOpen]       = useState(false);
  const [notificationCount,  setNotificationCount]  = useState(0);
  const [userData, setUserData] = useState({
    name: "System Administrator", profileImage: "", role: "Super Admin"
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 400);
    const saved = localStorage.getItem("adminData");
    if (saved) {
      try { setUserData(prev => ({ ...prev, ...JSON.parse(saved) })); } catch {}
    }
    return () => clearTimeout(timer);
  }, []);

  const handleProfileMenu  = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseProfile = () => setAnchorEl(null);
  const handleLogout = () => { setLogoutDialogOpen(false); localStorage.clear(); navigate("/login"); };
  
  const handleNavigation = (text: string) => {
    setActiveTab(text);
    if (isMobile) setBottomMenuOpen(false); 
    setSnackbarOpen(true);
  };

  const ActiveContent = () => {
    switch (activeTab) {
      case "Dashboard":         return <Overview />;
      case "New Booking":       return <SalesPersonForm />;
      case "Booking Customer":  return <BookingCustomer />;
      
      // Assigning LoadingListManager as a placeholder for the warehouses until specific components are created
      case "Warehouse SA":      return <WarehouseSA />; 
      case "Warehouse SL":      return <WarehouseSL />; 
      case "Loading List":      return <LoadingLists />; // <-- Renders the Loading List component
      case "Delivery":          return <Delivery />; // Placeholder component

      case "Shipment Manifest": return <ShipmentManifest />;
      case "Analytics":         return <Analytics />;
      case "QR Scanner":        return <QRScanner />;
      case "Sales Dashboard":   return <SalesDashboard />;
      case "Sales Persons":     return <SalesPersonList />;
      case "Payments":          return <Payments />;
      case "Staff Roles":       return <Staff />;
      case "Reports":           return <Reports />;
      case "Settings":          return <CreateAdmin />;
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
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: PRIMARY_TEAL, color: "white" }}>
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: "20px", bgcolor: "white", display: 'inline-block' }}>
          <Box component="img" src={LOGO_URL} sx={{ width: "100%", maxWidth: 150 }} />
        </Paper>
      </Box>

      <List sx={{ px: 2, flexGrow: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.1)" } }}>
        {NAVIGATION_MAP.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.text)}
            sx={{
              borderRadius: "14px", mb: 0.5, py: 1.2,
              bgcolor: activeTab === item.text ? "rgba(255,255,255,0.12)" : "transparent",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" }
            }}
          >
            <ListItemIcon sx={{ color: activeTab === item.text ? ACCENT_GOLD : "white", minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} slotProps={{ primary: { sx: { fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: "0.82rem" } } }} />
            {activeTab === item.text && <ArrowForwardIos sx={{ fontSize: 10, color: ACCENT_GOLD }} />}
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 3, bgcolor: "rgba(0,0,0,0.15)" }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <CloudDoneOutlined sx={{ fontSize: 18, color: "#10B981" }} />
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#10B981",fontFamily: PRIMARY_FONT }}>SYSTEM SECURE</Typography>
        </Stack>
        <Button fullWidth variant="contained" startIcon={<LogoutOutlined />} onClick={() => setLogoutDialogOpen(true)}
          sx={{ py: 1, bgcolor: "rgba(255,142,142,0.1)", color: "#FF8E8E", fontWeight: 800, textTransform: "none", borderRadius: "12px", "&:hover": { bgcolor: "rgba(255,142,142,0.2)" },fontFamily: PRIMARY_FONT }}>
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", bgcolor: "#F4F7F9", minHeight: "100vh" }}>
      
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, 
          ml: { md: `${DRAWER_WIDTH}px` }, 
          bgcolor: "rgba(255,255,255,0.95)", 
          backdropFilter: "blur(8px)", 
          borderBottom: "1px solid #E2E8F0", 
          zIndex: 1201 
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
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: PRIMARY_FONT, color: ACCENT_GOLD }}>{activeTab.toUpperCase()}</Typography>
                </Breadcrumbs>
              )}
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 900, color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT }}>
                {activeTab}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 2 }}>
            {!isVerySmall && (
              <Tooltip title="Help Center">
                <IconButton sx={{ bgcolor: "#F1F5F9" }}><SupportAgentOutlined sx={{ color: "#64748B", fontSize: 20 }} /></IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Notifications">
              <IconButton onClick={() => setNotificationCount(0)} sx={{ bgcolor: "#F1F5F9" }}>
                <Badge badgeContent={notificationCount} color="error"><NotificationsActiveOutlined sx={{ color: "#64748B", fontSize: 20 }} /></Badge>
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ height: 35, my: "auto", display: { xs: "none", sm: "block" } }} />
            
            <Box onClick={handleProfileMenu} sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 1.5, p: 0.8, borderRadius: "50px", "&:hover": { bgcolor: "#F1F5F9" } }}>
              <Avatar src={userData.profileImage} sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, border: `2px solid ${ACCENT_GOLD}` }} />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: PRIMARY_TEAL, fontFamily: PRIMARY_FONT }}>{userData.name}</Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "#10B981", fontWeight: 700 }}>● {userData.role}</Typography>
              </Box>
              <KeyboardArrowDownOutlined sx={{ color: "#64748B", display: { xs: "none", sm: "block" } }} />
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Box component="nav" sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Drawer variant="permanent" open sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none", boxShadow: "15px 0 35px rgba(0,0,0,0.03)" } }}>
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
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Fade in={isLoaded} timeout={600}>
          <Box>
            <Paper 
              elevation={0} 
              sx={{ p: { xs: 2, md: 5 }, borderRadius: { xs: "20px", md: "32px" }, minHeight: { xs: "calc(100vh - 180px)", md: "80vh" }, border: "1px solid #E2E8F0", bgcolor: "white" }}
            >
              <ActiveContent />
            </Paper>
            
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
        slotProps={{ paper: { sx: { mt: 1, width: 220, borderRadius: "18px", p: 1, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" } } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#94A3B8",fontFamily: PRIMARY_FONT, }}>ACCOUNT</Typography>
        </Box>
        <MenuItem onClick={handleCloseProfile} sx={{ borderRadius: "10px", py: 1.2, mb: 0.5 }}>
          <ListItemIcon><AdminPanelSettingsOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Admin Profile" slotProps={{ primary: { sx: { fontWeight: 600, fontSize: "0.85rem",fontFamily: PRIMARY_FONT, } } }} />
        </MenuItem>
        <MenuItem onClick={handleCloseProfile} sx={{ borderRadius: "10px", py: 1.2 }}>
          <ListItemIcon><TranslateOutlined fontSize="small" /></ListItemIcon>
          <ListItemText primary="Language" slotProps={{ primary: { sx: { fontWeight: 600, fontSize: "0.85rem",fontFamily: PRIMARY_FONT, } } }} />
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => { setLogoutDialogOpen(true); handleCloseProfile(); }} sx={{ borderRadius: "10px", color: "error.main" }}>
          <ListItemIcon><LogoutOutlined fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Sign Out" slotProps={{ primary: { sx: { fontWeight: 700, fontSize: "0.85rem",fontFamily: PRIMARY_FONT, } } }} />
        </MenuItem>
      </Menu>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)} slotProps={{ paper: { sx: { borderRadius: "28px", p: { xs: 1, sm: 2 }, maxWidth: 400, width: "90%" } } }}>
        <DialogTitle sx={{ fontFamily: PRIMARY_FONT, fontWeight: 900, color: PRIMARY_TEAL, textAlign: "center" }}>Sign Out</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#64748B", fontWeight: 500 }}>You will be redirected to the login page.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 3, justifyContent: "center", gap: 2 }}>
          <Button fullWidth onClick={() => setLogoutDialogOpen(false)} sx={{ color: "#94A3B8", fontWeight: 800, textTransform: "none", py: 1.5, borderRadius: "12px", bgcolor: "#F1F5F9" }}>Cancel</Button>
          <Button fullWidth onClick={handleLogout} variant="contained" sx={{ bgcolor: "#F43F5E", fontWeight: 800, textTransform: "none", py: 1.5, borderRadius: "12px", "&:hover": { bgcolor: "#E11D48" } }}>Logout</Button>
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
            bgcolor: "#F8FAFC",
            maxHeight: "85vh",
            pb: "env(safe-area-inset-bottom)"
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
            {NAVIGATION_MAP.map((item) => {
              const isActive = activeTab === item.text;
              return (
                <Paper
                  key={item.text}
                  elevation={isActive ? 2 : 0}
                  onClick={() => handleNavigation(item.text)}
                  sx={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    p: 1.5, borderRadius: "16px", cursor: "pointer", textAlign: "center",
                    bgcolor: isActive ? PRIMARY_TEAL : "white",
                    color: isActive ? ACCENT_GOLD : "#64748B",
                    border: isActive ? "none" : "1px solid #E2E8F0",
                    transition: "all 0.2s ease",
                    "&:active": { transform: "scale(0.95)" }
                  }}
                >
                  <Box sx={{ mb: 1, color: isActive ? ACCENT_GOLD : PRIMARY_TEAL }}>{item.icon}</Box>
                  <Typography sx={{ 
                    fontFamily: PRIMARY_FONT, fontWeight: isActive ? 800 : 600, 
                    fontSize: "0.7rem", lineHeight: 1.2, color: isActive ? "white" : "#475569"
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
              bgcolor: PRIMARY_TEAL,
              boxShadow: "0 12px 35px rgba(0, 70, 82, 0.4)", 
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
                  color: "rgba(255, 255, 255, 0.5)", 
                  fontFamily: PRIMARY_FONT, 
                  minWidth: "auto", 
                  px: 0,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                },
                "& .Mui-selected": { 
                  color: ACCENT_GOLD,
                  transform: "translateY(-4px)", 
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
                },
                "& .MuiSvgIcon-root": {
                  fontSize: "1.5rem",
                  transition: "all 0.3s ease",
                  mb: 0.5
                },
                "& .Mui-selected .MuiSvgIcon-root": {
                  fontSize: "1.8rem",
                  filter: "drop-shadow(0px 2px 5px rgba(204, 157, 47, 0.5))" 
                }
              }}
            >
              <BottomNavigationAction label="Home" value="Dashboard" icon={<HomeOutlined />} />
              <BottomNavigationAction label="Booking" value="New Booking" icon={<Inventory2Outlined />} />
              <BottomNavigationAction label="Scanner" value="QR Scanner" icon={<QrCodeScannerOutlined />} />
              <BottomNavigationAction label="Menu" value="Menu" icon={<WidgetsOutlined />} />
            </BottomNavigation>
          </Paper>
        </Box>
      )}

    </Box>
  );
};

export default Dashboard;