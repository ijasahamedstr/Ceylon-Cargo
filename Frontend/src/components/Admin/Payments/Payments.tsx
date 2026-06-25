import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Stack, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Tabs, Tab,
  ThemeProvider, createTheme, useMediaQuery, Card,
  Pagination, Breadcrumbs, Link
} from "@mui/material";
import {
  NavigateNext, ReceiptLongOutlined,
  CheckCircleOutline, ErrorOutline, StorefrontOutlined,
  AccountBalanceWalletOutlined
} from "@mui/icons-material";

// --- CONFIGURATION & CONSTANTS ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const CACHE_KEY = "BOOKING_PAYMENTS_VAULT";
const PRIMARY_TEAL = "#004652";
const DANGER_RED = "#E11D48";
const SUCCESS_GREEN = "#10B981";

const montserratTheme = createTheme({
  typography: { fontFamily: "'Montserrat', sans-serif", allVariants: { fontFamily: "'Montserrat', sans-serif" } },
  components: {
    MuiButton: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", textTransform: "none", boxShadow: "none", borderRadius: "8px", fontWeight: 700 } } },
    MuiTableCell: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", borderBottom: "none" } } },
    MuiChip: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", borderRadius: "6px", fontWeight: 700 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: "16px", boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.04)" } } },
    MuiTab: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "none", minHeight: 48 } } },
    MuiPaginationItem: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
  }
});

interface Booking {
  _id: string;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  payment_status: string;
  payment_amount: number; // Updated from amount_paid
  branch: string;
  createdAt: string;
}

const STATUS_TABS = ["all", "unpaid", "paid"];

export default function Payments() {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"online" | "offline">("online");
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  
  const isMobile = useMediaQuery('(max-width:900px)');
  const rowsPerPage = isMobile ? 5 : 8;

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data = json.data || json;
      
      const newStr = JSON.stringify(data);
      if (localStorage.getItem(CACHE_KEY) !== newStr) {
        setBookings(data);
        localStorage.setItem(CACHE_KEY, newStr);
      }
      setSyncStatus("online");
    } catch {
      setSyncStatus("offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  // --- CALCULATIONS: Total, Paid, Unpaid Sums ---
  const financialSummary = useMemo(() => {
    let total = 0;
    let paid = 0;
    let unpaid = 0;

    bookings.forEach((b) => {
      const amount = Number(b.payment_amount) || 0;
      total += amount;
      if (b.payment_status === "paid") paid += amount;
      if (b.payment_status === "unpaid") unpaid += amount;
    });

    return { total, paid, unpaid };
  }, [bookings]);

  // Filtering & Pagination
  const filter = STATUS_TABS[tab];
  const filteredData = useMemo(() => {
    let result = filter === "all" ? bookings : bookings.filter((b) => b.payment_status === filter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, filter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  useEffect(() => { setPage(1); }, [tab]);

  // Formatters
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const fmtCurrency = (amount: number) => amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getPaymentChip = (status: string) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "paid": return <Chip label="PAID" size="small" sx={{ bgcolor: "#DCFCE7", color: "#166534" }} />;
      case "unpaid": return <Chip label="UNPAID" size="small" sx={{ bgcolor: "#FEE2E2", color: "#991B1B" }} />;
      default: return <Chip label={status.toUpperCase()} size="small" sx={{ bgcolor: "#F8FAFC", color: "#64748B" }} />;
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#F4F7FA" }}>
        <CircularProgress sx={{ color: PRIMARY_TEAL }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, sm: 2, md: 3 }, pb: { xs: 10, md: 3 } }}>
        
        {/* Header Section */}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }} mb={isMobile ? 2 : 3} spacing={2}>
          <Box px={isMobile ? 1 : 0}>
            {!isMobile && (
              <Breadcrumbs separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />} sx={{ mb: 0.5 }}>
                <Link underline="hover" color="inherit" href="/" sx={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, color: "#64748B" }}>FINANCE</Link>
                <Typography color="text.primary" sx={{ fontSize: "0.65rem", fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: 1 }}>PAYMENTS</Typography>
              </Breadcrumbs>
            )}
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: isMobile ? "1.5rem" : "1.8rem", letterSpacing: "-0.5px" }}>
              Payment Tracking
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncStatus === "online" ? "#10B981" : "#EF4444" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>
                {syncStatus === "online" ? "LIVE SYNC ACTIVE" : "OFFLINE MODE"}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* 📊 Financial Summary Cards */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
          {[
            { label: "Total Volume", amount: financialSummary.total, color: PRIMARY_TEAL, icon: <AccountBalanceWalletOutlined fontSize="large" sx={{ opacity: 0.8 }} /> },
            { label: "Paid Amount", amount: financialSummary.paid, color: SUCCESS_GREEN, icon: <CheckCircleOutline fontSize="large" sx={{ opacity: 0.8 }} /> },
            { label: "Unpaid Amount", amount: financialSummary.unpaid, color: DANGER_RED, icon: <ErrorOutline fontSize="large" sx={{ opacity: 0.8 }} /> }
          ].map((s) => (
            <Paper key={s.label} elevation={0} sx={{ p: isMobile ? 2 : 2.5, flex: 1, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "white", position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", top: -10, right: -10, color: s.color, opacity: 0.08, transform: "scale(2.5)" }}>
                {s.icon}
              </Box>
              <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 2} sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: isMobile ? "1rem" : "1.2rem", color: "#1E293B", lineHeight: 1.2 }}>
                    SAR {fmtCurrency(s.amount)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>

        {/* 📑 Tab Filters */}
        <Paper elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "white", mb: 3 }}>
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            variant="fullWidth"
            sx={{ "& .MuiTabs-indicator": { backgroundColor: PRIMARY_TEAL, height: 3, borderRadius: "3px 3px 0 0" } }}
          >
            {STATUS_TABS.map((s) => (
              <Tab 
                key={s} 
                label={s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} 
                sx={{ color: "#64748B", "&.Mui-selected": { color: PRIMARY_TEAL } }} 
              />
            ))}
          </Tabs>
        </Paper>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          {isMobile ? (
            /* 📱 MODERN NATIVE APP STYLE MOBILE CARDS 📱 */
            <Stack spacing={2}>
              <AnimatePresence>
                {paginatedData.map(item => (
                  <motion.div key={item._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card elevation={0} sx={{ border: "1px solid #E2E8F0", bgcolor: "white", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                      
                      {/* Top Header: Tracking Details & Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: "#F0F5F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ReceiptLongOutlined sx={{ color: PRIMARY_TEAL, fontSize: 22 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "1.05rem", lineHeight: 1.1, fontFamily: "monospace" }}>
                              {item.tracking_number || "PENDING"}
                            </Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, mt: 0.3 }}>
                              {fmtDate(item.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                        {getPaymentChip(item.payment_status)}
                      </Stack>

                      {/* Route Details: Modern App Look */}
                      <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "12px", p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box sx={{ flex: 1, overflow: "hidden" }}>
                          <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, display: "block", mb: 0.3 }}>FROM</Typography>
                          <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.sender_name}
                          </Typography>
                        </Box>
                        <Box sx={{ px: 2, color: "#CBD5E1", display: "flex", alignItems: "center" }}>
                          <NavigateNext />
                        </Box>
                        <Box sx={{ flex: 1, overflow: "hidden", textAlign: "right" }}>
                          <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, display: "block", mb: 0.3 }}>TO</Typography>
                          <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.receiver_name}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Footer: Branch & Pricing */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StorefrontOutlined sx={{ fontSize: 16, color: "#94A3B8" }} />
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748B" }}>
                            {item.branch || "Unassigned"}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontWeight: 900, color: "#0F172A", fontSize: "1.2rem" }}>
                          SAR {fmtCurrency(item.payment_amount || 0)}
                        </Typography>
                      </Stack>
                      
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          ) : (
            /* 💻 DESKTOP VIEW */
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <Table size="medium" sx={{ minWidth: 1000, borderCollapse: "collapse" }}>
                <TableHead sx={{ bgcolor: PRIMARY_TEAL }}>
                  <TableRow>
                    {["TRACKING NO", "SHIPPER", "CONSIGNEE", "BRANCH", "PAYMENT STATUS", "AMOUNT", "DATE"].map((h, i) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem", color: "white", letterSpacing: "0.05em", py: 2.5, pl: i === 0 ? 3 : undefined }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedData.map((item, index) => (
                      <TableRow key={item._id} component={motion.tr as any} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} sx={{ bgcolor: index % 2 === 0 ? "white" : "#F8FAFC", "&:hover": { bgcolor: "#F1F5F9 !important" } }}>
                        <TableCell sx={{ pl: 3 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 28, height: 28, borderRadius: "6px", bgcolor: "#F0F5F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <ReceiptLongOutlined sx={{ color: PRIMARY_TEAL, fontSize: 14 }} />
                            </Box>
                            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem", fontFamily: "monospace" }}>
                              {item.tracking_number || "PENDING"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell><Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem" }}>{item.sender_name}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem" }}>{item.receiver_name}</Typography></TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <StorefrontOutlined sx={{ fontSize: 16, color: "#94A3B8" }} />
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>{item.branch || "—"}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{getPaymentChip(item.payment_status)}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: "0.95rem" }}>
                            SAR {fmtCurrency(item.payment_amount || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>{fmtDate(item.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty State Handler */}
          {paginatedData.length === 0 && (
            <Paper elevation={0} sx={{ p: isMobile ? 4 : 8, textAlign: "center", borderRadius: "12px", border: "2px dashed #E2E8F0", mt: 2, bgcolor: "transparent" }}>
              <ReceiptLongOutlined sx={{ fontSize: 48, color: "#CBD5E1", mb: 2 }} />
              <Typography sx={{ color: "#64748B", fontWeight: 700, fontSize: "1rem" }}>No payment records found.</Typography>
              <Typography sx={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.85rem", mt: 1 }}>Try adjusting your filters or check a different tab.</Typography>
            </Paper>
          )}
        </motion.div>

        {/* 🎛 Pagination Footer */}
        <Paper elevation={0} sx={{ mt: 3, p: isMobile ? 2 : 2.5, borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 2, bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: "#475569", textAlign: isMobile ? "center" : "left", px: isMobile ? 0 : 1 }}>
            TOTAL RECORDS: {filteredData.length}
          </Typography>
          
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination 
              count={Math.ceil(filteredData.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)}
              size={isMobile ? "small" : "medium"} shape="rounded"
              sx={{ "& .Mui-selected": { bgcolor: `${PRIMARY_TEAL} !important`, color: "#FFF", fontWeight: 800 }, "& .MuiPaginationItem-root": { fontWeight: 700, fontSize: "0.85rem", color: "#475569" } }} 
            />
          </Box>
        </Paper>

      </Box>
    </ThemeProvider>
  );
}