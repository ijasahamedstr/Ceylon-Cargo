import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Stack, Paper, TextField, Button, Avatar, IconButton,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Dialog, 
  Snackbar, Alert, ToggleButtonGroup, ToggleButton, Breadcrumbs, Link,
  ThemeProvider, createTheme, Card, CardContent, InputAdornment, Tooltip, useMediaQuery
} from "@mui/material";
import {
  MailOutline, Link as LinkIcon, AddCircleOutline, ArrowBack, EditOutlined, 
  Search, QrCode2, AccessTime, DeleteOutline, KeyboardArrowRight,
  ShieldMoonOutlined, SecurityUpdateGood, 
  NavigateNext, HistoryToggleOffOutlined, GridViewOutlined, ViewListOutlined, 
  CheckCircleOutline, CloseOutlined, SupervisorAccountOutlined,
  WarningAmberRounded, VisibilityOutlined
} from "@mui/icons-material";

// --- CONFIGURATION & CONSTANTS ---
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#CC9D2F";
const DANGER_RED = "#E11D48";
const PRIMARY_FONT = "'Montserrat', sans-serif";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const CACHE_KEY = "ADMIN_VAULT_DATA";

// Premium Theme configuration
const montserratTheme = createTheme({
  typography: {
    fontFamily: PRIMARY_FONT,
    allVariants: { fontFamily: PRIMARY_FONT },
  },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { fontFamily: PRIMARY_FONT, textTransform: 'none', fontWeight: 700, borderRadius: '8px', boxShadow: 'none' } 
      } 
    },
    MuiTableCell: { styleOverrides: { root: { fontFamily: PRIMARY_FONT, borderBottom: 'none' } } },
    MuiInputBase: { styleOverrides: { root: { fontFamily: PRIMARY_FONT } } },
    MuiChip: { styleOverrides: { root: { fontFamily: PRIMARY_FONT, borderRadius: '6px', fontWeight: 700 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)' } } },
    MuiAlert: { styleOverrides: { root: { fontFamily: PRIMARY_FONT } } },
  }
});

const AdminManagement: React.FC = () => {
  const [view, setView] = useState<"list" | "form" | "details">("list");
  const [admins, setAdmins] = useState<any[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [syncStatus, setSyncStatus] = useState<"online" | "offline">("online");
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [history, setHistory] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const isMobile = useMediaQuery('(max-width:900px)');

  // Force grid view on mobile
  useEffect(() => {
    if (isMobile) setViewMode("grid");
  }, [isMobile]);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/all`);
      const newDataString = JSON.stringify(response.data);
      const currentCache = localStorage.getItem(CACHE_KEY);

      if (currentCache !== newDataString) {
        setAdmins(response.data);
        localStorage.setItem(CACHE_KEY, newDataString);
      }
      setSyncStatus("online");
    } catch (error) {
      setSyncStatus("offline");
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    const interval = setInterval(() => fetchAdmins(), 3000); 
    return () => clearInterval(interval);
  }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return admins.filter(a => 
      a.name.toLowerCase().includes(query) || a.email.toLowerCase().includes(query)
    );
  }, [searchQuery, admins]);

  const triggerSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddNew = () => {
    setSelectedAdmin(null);
    setIsEditing(false);
    setView("form");
  };

  const handleFormSave = async (formData: any) => {
    setLoading(true);
    try {
      if (isEditing && selectedAdmin) {
        await axios.put(`${BASE_URL}/api/edit/${selectedAdmin._id}`, formData);
        triggerSnackbar("Administrator Profile Updated", "success");
        setHistory(prev => [`Updated Profile: ${formData.name}`, ...prev].slice(0, 8));
      } else {
        await axios.post(`${BASE_URL}/api/create`, formData);
        triggerSnackbar("New Admin Provisioned", "success");
        setHistory(prev => [`Provisioned Admin: ${formData.name}`, ...prev].slice(0, 8));
      }
      fetchAdmins();
      setView("list");
    } catch (error: any) {
      triggerSnackbar("Operation Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    const targetId = deleteDialog.id;
    if (!targetId) return;
    const targetName = admins.find(a => a._id === targetId)?.name || "User";
    
    const updated = admins.filter(a => a._id !== targetId);
    setAdmins(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null });

    try {
      await axios.delete(`${BASE_URL}/api/delete/${targetId}`);
      triggerSnackbar("Access Revoked Successfully", "success");
      setHistory(prev => [`Revoked Access: ${targetName}`, ...prev].slice(0, 8));
      if (view === "details") setView("list");
    } catch {
      fetchAdmins();
      triggerSnackbar("De-provisioning Failed", "error");
    }
  };

  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1, sm: 2, md: 3 }, pb: { xs: 10, md: 3 } }}>
        
        {/* Header Section */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={isMobile ? 2 : 3} spacing={2}>
          <Box px={isMobile ? 1 : 0}>
            {!isMobile && (
              <Breadcrumbs separator={<NavigateNext sx={{ fontSize: '0.8rem' }} />} sx={{ mb: 0.5 }}>
                <Link underline="hover" color="inherit" href="/" sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 1, color: "#64748B" }}>SYSTEM</Link>
                <Typography color="text.primary" sx={{ fontSize: '0.65rem', fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: 1 }}>IDENTITY MANAGEMENT</Typography>
              </Breadcrumbs>
            )}
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: "-0.5px", fontSize: isMobile ? '1.4rem' : '1.8rem' }}>
              {view === "list" ? "Admin Console" : view === "form" ? "Provision Admin" : "Security Hub"}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: syncStatus === 'online' ? '#10B981' : '#EF4444' }} />
               <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>
                 {syncStatus === 'online' ? 'SECURITY SYNC ACTIVE' : 'CONNECTION INTERRUPTED'}
               </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: isMobile ? "100%" : "auto" }}>
            {view === "list" ? (
              <Button 
                variant="contained" onClick={handleAddNew} startIcon={<AddCircleOutline />} fullWidth={isMobile}
                sx={{ bgcolor: PRIMARY_TEAL, px: 3, py: 1, boxShadow: "0 4px 12px rgba(0,70,82,0.15)", "&:hover": { bgcolor: "#002d35" } }}
              >
                Create Admin
              </Button>
            ) : (
              <Button 
                variant="outlined" onClick={() => setView("list")} startIcon={<ArrowBack />} fullWidth={isMobile}
                sx={{ color: PRIMARY_TEAL, borderColor: "#E2E8F0", bgcolor: "white", "&:hover": { borderColor: PRIMARY_TEAL, bgcolor: "#F8FAFC" } }}
              >
                Back to Console
              </Button>
            )}
          </Stack>
        </Stack>

        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              
              {/* Search & Filter Bar */}
              <Paper elevation={0} sx={{ p: isMobile ? 2 : 2.5, mb: 3, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "white", display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth size="small" variant="standard"
                  placeholder="Filter by credentials or identity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: <Search sx={{ mr: 1.5, color: "#94A3B8", fontSize: '1.2rem' }} />,
                    sx: { fontWeight: 600, fontSize: '0.95rem', bgcolor: "#F8FAFC", p: 1.5, px: 2, borderRadius: "8px", border: "1px solid #E2E8F0", transition: "all 0.2s", "&:focus-within": { borderColor: PRIMARY_TEAL, bgcolor: "white" } }
                  }}
                />
                {!isMobile && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(_, m) => m && setViewMode(m)} size="small" sx={{ bgcolor: "#F8FAFC", p: 0.5, borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      <ToggleButton value="table" sx={{ px: 2, border: 'none', borderRadius: '6px !important', "&.Mui-selected": { bgcolor: PRIMARY_TEAL, color: 'white', "&:hover": { bgcolor: PRIMARY_TEAL } } }}>
                        <ViewListOutlined fontSize="small" sx={{ mr: 1 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>TABLE</Typography>
                      </ToggleButton>
                      <ToggleButton value="grid" sx={{ px: 2, border: 'none', borderRadius: '6px !important', "&.Mui-selected": { bgcolor: PRIMARY_TEAL, color: 'white', "&:hover": { bgcolor: PRIMARY_TEAL } } }}>
                        <GridViewOutlined fontSize="small" sx={{ mr: 1 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>GRID</Typography>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
              </Paper>

              {viewMode === "table" ? (
                /* 💻 DESKTOP TABLE VIEW 💻 */
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.02)" }}>
                  <Table size="medium" sx={{ borderCollapse: "collapse" }}>
                    <TableHead sx={{ bgcolor: PRIMARY_TEAL }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "white", letterSpacing: "0.05em", py: 2.5, pl: 3 }}>ADMINISTRATOR</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "white", letterSpacing: "0.05em", py: 2.5 }}>SECURITY STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "white", letterSpacing: "0.05em", py: 2.5 }}>ENROLLED</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", color: "white", letterSpacing: "0.05em", py: 2.5, pr: 3 }}>CONTROLS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {filteredAdmins.map((admin, index) => (
                          <TableRow 
                            key={admin._id} 
                            component={motion.tr as any} 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            sx={{ bgcolor: index % 2 === 0 ? "white" : "#F8FAFC", transition: "background-color 0.2s ease", "&:hover": { bgcolor: "#F1F5F9 !important" } }}
                          >
                            <TableCell sx={{ pl: 3 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={admin.profileImage} sx={{ width: 40, height: 40, borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                                <Box>
                                  <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: "0.85rem" }}>{admin.name}</Typography>
                                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>{admin.email}</Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip label={admin.twoFAEnabled ? "2FA SECURED" : "STANDARD"} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 800, bgcolor: admin.twoFAEnabled ? "#ECFDF5" : "#F1F5F9", color: admin.twoFAEnabled ? "#10B981" : "#64748B" }} />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>
                                {new Date(admin.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 3 }}>
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Tooltip title="Security Details">
                                  <IconButton onClick={() => {setSelectedAdmin(admin); setView("details");}} size="small" sx={{ color: PRIMARY_TEAL, border: "1px solid #E2E8F0", borderRadius: "8px", "&:hover": { bgcolor: "white", borderColor: PRIMARY_TEAL } }}>
                                    <KeyboardArrowRight fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Profile">
                                  <IconButton onClick={() => { setSelectedAdmin(admin); setIsEditing(true); setView("form"); }} size="small" sx={{ color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", "&:hover": { bgcolor: "white", color: "#1E293B", borderColor: "#1E293B" } }}>
                                    <EditOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Revoke Access">
                                  <IconButton onClick={() => setDeleteDialog({ open: true, id: admin._id })} size="small" sx={{ color: DANGER_RED, border: "1px solid transparent", borderRadius: "8px", "&:hover": { bgcolor: "#FEF2F2", borderColor: "#FECACA" } }}>
                                    <DeleteOutline fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                /* 📱 MOBILE / GRID CARDS VIEW 📱 */
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <AnimatePresence>
                    {filteredAdmins.map((admin) => (
                      <motion.div key={admin._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                        <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", bgcolor: "white", transition: "all 0.2s ease" }}>
                          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                            <Avatar src={admin.profileImage} sx={{ width: 64, height: 64, mb: 2, border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
                            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E293B', textAlign: 'center' }}>{admin.name}</Typography>
                            <Chip label={admin.twoFAEnabled ? "2FA SECURED" : "STANDARD"} size="small" sx={{ mt: 1.5, height: 20, fontSize: '0.6rem', fontWeight: 800, bgcolor: admin.twoFAEnabled ? "#10B981" : "#94A3B8", color: 'white' }} />
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2, justifyContent: 'center' }}>
                              <MailOutline sx={{ fontSize: 16 }} /> {admin.email}
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: "#F1F5F9" }} />
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Button size="small" variant="outlined" onClick={() => {setSelectedAdmin(admin); setView("details");}} sx={{ flexGrow: 1, color: PRIMARY_TEAL, borderColor: "#E2E8F0" }}>View</Button>
                              <IconButton onClick={() => { setSelectedAdmin(admin); setIsEditing(true); setView("form"); }} size="small" sx={{ color: "#64748B", bgcolor: "#F1F5F9", borderRadius: "8px" }}><EditOutlined fontSize="small" /></IconButton>
                              <IconButton onClick={() => setDeleteDialog({ open: true, id: admin._id })} size="small" sx={{ color: DANGER_RED, bgcolor: "#FEF2F2", borderRadius: "8px" }}><DeleteOutline fontSize="small" /></IconButton>
                            </Stack>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
              )}
            </motion.div>
          )}

          {/* 📝 FORM VIEW 📝 */}
          {view === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <AdminForm admin={selectedAdmin} isEditing={isEditing} onSave={handleFormSave} loading={loading} />
            </motion.div>
          )}

          {/* 🛡 DETAILS VIEW 🛡 */}
          {view === "details" && (
            <motion.div key="details" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
              <AdminDetails admin={selectedAdmin} onEdit={() => { setIsEditing(true); setView("form"); }} onDelete={(id: any) => setDeleteDialog({ open: true, id })} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🕒 Activity Log */}
        {view === "list" && (
          <Box sx={{ mt: 3 }}>
            <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "white" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <HistoryToggleOffOutlined sx={{ color: "#94A3B8", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#475569", letterSpacing: 0.5 }}>SESSION ACTIVITY LOG</Typography>
              </Stack>
              {history.length === 0 ? (
                <Typography sx={{ fontSize: "0.85rem", color: "#94A3B8", fontStyle: "italic" }}>No administrative actions recorded yet.</Typography>
              ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 1.5 }}>
                  {history.map((log, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#F8FAFC", display: "flex", alignItems: "flex-start", gap: 1.5, border: "1px solid #F1F5F9" }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: PRIMARY_TEAL, mt: 0.2 }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600, lineHeight: 1.4 }}>{log}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* 🚨 Delete Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: 400, width: "100%", m: 2 } }}>
          <Box textAlign="center" p={4}>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
              <WarningAmberRounded sx={{ color: DANGER_RED, fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem", mb: 1 }}>Confirm Revocation</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: "0.9rem", lineHeight: 1.5 }}>
              Are you sure you want to revoke this administrator's system access? This action is immediate and permanent.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined" sx={{ fontWeight: 700, color: "#475569", borderColor: "#CBD5E1", borderRadius: "8px" }}>Cancel</Button>
              <Button size="large" onClick={confirmDelete} fullWidth variant="contained" disableElevation sx={{ bgcolor: DANGER_RED, fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#DC2626" } }}>Revoke</Button>
            </Stack>
          </Box>
        </Dialog>

        {/* Global Notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%", borderRadius: "8px", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{snackbar.message}</Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
};

/* --- ADMIN FORM COMPONENT --- */
const AdminForm = ({ admin, isEditing, onSave, loading }: any) => {
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    password: "",
    profileImage: admin?.profileImage || "",
  });

  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: "16px", border: "1px solid #E2E8F0", maxWidth: "650px", mx: "auto", bgcolor: "white", boxShadow: "0px 4px 20px rgba(0,0,0,0.02)" }}>
      <Stack spacing={4}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar src={formData.profileImage} sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: `4px solid #F0F5F6`, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <SupervisorAccountOutlined sx={{ fontSize: 36, color: PRIMARY_TEAL }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL }}>{isEditing ? "Modify Credentials" : "Provision New Node"}</Typography>
        </Box>
        <Stack spacing={2.5}>
          <TextField 
            fullWidth label="Full Name" size="medium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
            InputProps={{ startAdornment: <InputAdornment position="start"><SupervisorAccountOutlined sx={{ color: "#94A3B8" }} /></InputAdornment>, sx: { borderRadius: '8px', bgcolor: "#F8FAFC", "&:focus-within": { bgcolor: "white" } } }} 
          />
          <TextField 
            fullWidth label="Institutional Email" size="medium" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
            InputProps={{ startAdornment: <InputAdornment position="start"><MailOutline sx={{ color: "#94A3B8" }} /></InputAdornment>, sx: { borderRadius: '8px', bgcolor: "#F8FAFC", "&:focus-within": { bgcolor: "white" } } }} 
          />
          <TextField 
            fullWidth label="Profile Image URL" size="medium" value={formData.profileImage} onChange={(e) => setFormData({...formData, profileImage: e.target.value})} 
            InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon sx={{ color: "#94A3B8" }} /></InputAdornment>, sx: { borderRadius: '8px', bgcolor: "#F8FAFC", "&:focus-within": { bgcolor: "white" } } }} 
          />
          <TextField 
            fullWidth type="password" label={isEditing ? "New Password (Optional)" : "Access Password"} size="medium" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
            InputProps={{ sx: { borderRadius: '8px', bgcolor: "#F8FAFC", "&:focus-within": { bgcolor: "white" } } }} 
          />
        </Stack>
        <Button variant="contained" fullWidth disabled={loading} onClick={() => onSave(formData)} sx={{ bgcolor: PRIMARY_TEAL, py: 1.5, borderRadius: "8px", fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(0,70,82,0.15)' }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? "Confirm Infrastructure Update" : "Deploy Admin Credentials")}
        </Button>
      </Stack>
    </Paper>
  );
};

/* --- ADMIN DETAILS COMPONENT --- */
const AdminDetails = ({ admin: initialAdmin, onEdit, onDelete }: any) => {
  const [admin, setAdmin] = useState(initialAdmin);
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleSetup2FA = async () => {
    setLoading2FA(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/setup-2fa`, { adminId: admin._id });
      setQrCode(res.data.qrCode);
      setIsVerifying(true);
    } catch (err) {
      setSnackbar({ open: true, message: "Handshake Error" });
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    setLoading2FA(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/verify-2fa`, { adminId: admin._id, token: verificationCode });
      if (res.data.success) {
        setAdmin({ ...admin, twoFAEnabled: true });
        setIsVerifying(false);
        setQrCode("");
        setSnackbar({ open: true, message: "Security Token Validated" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Validation Failed" });
    } finally {
      setLoading2FA(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "16px", border: "1px solid #E2E8F0", maxWidth: '800px', mx: 'auto', bgcolor: 'white', boxShadow: "0px 4px 20px rgba(0,0,0,0.02)" }}>
      <Stack spacing={4}>
        
        {/* Profile Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
          <Avatar src={admin.profileImage} sx={{ width: 100, height: 100, borderRadius: "20px", border: `4px solid #F8FAFC`, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>{admin.name}</Typography>
            <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>{admin.email}</Typography>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
               <Button size="small" variant="outlined" onClick={onEdit} startIcon={<EditOutlined />} sx={{ color: "#475569", borderColor: "#E2E8F0", borderRadius: "8px" }}>Edit Profile</Button>
               <Button size="small" variant="outlined" onClick={() => onDelete(admin._id)} startIcon={<DeleteOutline />} sx={{ color: DANGER_RED, borderColor: "#FECACA", bgcolor: "#FEF2F2", borderRadius: "8px", "&:hover": { borderColor: DANGER_RED } }}>Revoke Access</Button>
            </Stack>
          </Box>
        </Stack>
        
        <Divider sx={{ borderColor: "#F1F5F9" }} />
        
        {/* 2FA Security Module */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "16px", background: admin.twoFAEnabled ? `linear-gradient(135deg, ${PRIMARY_TEAL} 0%, #006D77 100%)` : "#1E293B", color: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems="center">
            <Box sx={{ bgcolor: "white", p: 1.5, borderRadius: "12px", minWidth: 100, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qrCode ? <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} src={qrCode} style={{ width: 90 }} /> : <QrCode2 sx={{ fontSize: 50, color: admin.twoFAEnabled ? PRIMARY_TEAL : "#475569" }} />}
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1.5 }}>
                {admin.twoFAEnabled ? <SecurityUpdateGood /> : <ShieldMoonOutlined />} {admin.twoFAEnabled ? "Biometric Hardening Active" : "Two-Step Verification"}
              </Typography>
              <Typography sx={{ opacity: 0.8, mt: 1, fontSize: '0.85rem', fontWeight: 500, maxWidth: 400 }}>
                {admin.twoFAEnabled ? "This account is protected by an external token layer. Access is highly secured." : "Add a defensive layer to this account. Scan the QR code with an authenticator app to begin."}
              </Typography>
              {!admin.twoFAEnabled && !isVerifying && (
                <Button variant="contained" onClick={handleSetup2FA} disabled={loading2FA} disableElevation sx={{ bgcolor: "white", color: "#0F172A", mt: 3, fontWeight: 800, px: 4, borderRadius: "8px", "&:hover": { bgcolor: "#F8FAFC" } }}>
                   {loading2FA ? <CircularProgress size={20} /> : "Initialize 2FA"}
                </Button>
              )}
              {isVerifying && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <TextField placeholder="TOKEN" size="small" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} InputProps={{ sx: { bgcolor: "white", borderRadius: "8px", fontWeight: 800, width: 120 } }} />
                  <Button onClick={handleVerifyAndEnable} disabled={loading2FA} variant="contained" disableElevation sx={{ bgcolor: "#10B981", borderRadius: "8px", "&:hover": { bgcolor: "#059669" } }}>
                    {loading2FA ? <CircularProgress size={20} color="inherit" /> : "Verify"}
                  </Button>
                  <IconButton onClick={() => setIsVerifying(false)} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}><CloseOutlined /></IconButton>
                </Stack>
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Info Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: "#F8FAFC" }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'white', color: PRIMARY_TEAL, border: "1px solid #E2E8F0" }}><AccessTime fontSize="small" /></Avatar>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Provisioned Date</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: "0.9rem" }}>{new Date(admin.createdAt || Date.now()).toLocaleDateString()}</Typography>
                </Box>
            </Stack>
          </Paper>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: "#F8FAFC" }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'white', color: PRIMARY_TEAL, border: "1px solid #E2E8F0" }}><ShieldMoonOutlined fontSize="small" /></Avatar>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Security Level</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: "0.9rem" }}>{admin.twoFAEnabled ? "Infrastructure Admin (L2)" : "Standard Admin (L1)"}</Typography>
                </Box>
            </Stack>
          </Paper>
        </Box>
      </Stack>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity="info" variant="filled" sx={{ fontWeight: 700, borderRadius: "8px" }}>{snackbar.message}</Alert></Snackbar>
    </Paper>
  );
};

export default AdminManagement;