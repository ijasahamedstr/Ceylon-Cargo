import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Stack, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, TextField,
  Pagination, Tooltip, Checkbox, Chip, Snackbar, Alert,
  Breadcrumbs, ThemeProvider, createTheme, Dialog,
  Select, MenuItem, FormControl, InputLabel, useMediaQuery,
  Card, CardContent, Divider
} from "@mui/material";
import {
  DeleteOutline, EditOutlined, SearchOutlined,
  NavigateNext, HistoryToggleOffOutlined, CheckCircleOutline, 
  WarningAmberRounded, VisibilityOutlined, FlightTakeoffOutlined, 
  DirectionsBoatOutlined, QrCode2Outlined,
  ArrowForwardIosOutlined
} from "@mui/icons-material";

// Import your views
import BookingCustomerView from "./Booking Customer View";
import UpdateBookingCustomer from "./UpdateBookingCustomer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const CACHE_KEY = "BOOKING_CUSTOMER_VAULT";
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#CC9D2F";

// 🔒 This page is locked to a single booking stage
const PAGE_STATUS = "move_to_warehouse_sa";

const montserratTheme = createTheme({
  typography: { fontFamily: "'Montserrat', sans-serif", allVariants: { fontFamily: "'Montserrat', sans-serif" } },
  components: {
    MuiButton: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", textTransform: "none", boxShadow: "none" } } },
    MuiTableCell: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", borderBottom: "none" } } },
    MuiInputBase: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiChip: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiAlert: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiPaginationItem: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
  }
});

interface BookingData {
  _id: string;
  tracking_number: string;
  status: 
    | "draft" | "collect_item" | "move_to_warehouse_sa" | "loading_box" 
    | "shipment_manifest" | "arrived_warehouse_sl" | "delivered" | "cancelled";
  
  sender_name: string;
  sender_mobile: string;
  sender_email?: string;
  sender_iqama: string;
  sender_passport?: string;
  pickup_city: string;
  pickup_address: string;
  collection_date?: string;

  receiver_name: string;
  receiver_mobile: string;
  receiver_email?: string;
  delivery_city: string;
  receiver_address: string;

  cargo_type: "air" | "sea";
  delivery_service: "door_to_door" | "self_clearance";
  packaging_type?: string;
  special_instructions?: string;
  package_description: string;
  insurance: boolean;

  payment_status: "unpaid" | "paid" | "partial" | "pending";
  payment_amount?: number;
  branch?: string;
  sales_person_id?: string;
  
  qr_code?: string;
  createdAt: string;
}

const WarehouseSA = () => {
  const [data, setData] = useState<BookingData[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });

  const [view, setView] = useState<"list" | "view" | "edit">("list");
  const [selectedItem, setSelectedItem] = useState<BookingData | null>(null);
  
  const [syncStatus, setSyncStatus] = useState<"online" | "offline">("online");
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filterCargoType, setFilterCargoType] = useState<string>("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>();
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const rowsPerPage = 8;

  const isMobile = useMediaQuery('(max-width:900px)');

  const notify = (message: string, severity: "success" | "error") => setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings?status=${PAGE_STATUS}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const newStr = JSON.stringify(json.data || json);
      if (localStorage.getItem(CACHE_KEY) !== newStr) {
        setData(json.data || json);
        localStorage.setItem(CACHE_KEY, newStr);
      }
      setSyncStatus("online");
    } catch { 
      setSyncStatus("offline"); 
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => { 
    setPage(1); 
  }, [searchQuery, filterCargoType, filterPaymentStatus, filterDate]);

  const handleDelete = async () => {
    const id = deleteDialog.id;
    if (!id) return;
    const updated = data.filter(d => d._id !== id);
    setData(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null });
    setSelected(prev => prev.filter(i => i !== id));
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: "DELETE" });
      notify("Booking deleted", "success");
      setHistory(prev => [`Deleted booking ${id.slice(-6).toUpperCase()}`, ...prev].slice(0, 8));
    } catch { 
      fetchData(); 
      notify("Delete failed", "error"); 
    }
  };

  const handleBulkDelete = async () => {
    const updated = data.filter(d => !selected.includes(d._id));
    setData(updated); localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    const count = selected.length; const ids = [...selected]; setSelected([]);
    notify(`Deleting ${count} bookings...`, "success");
    setHistory(prev => [`Bulk deleted ${count} bookings`, ...prev].slice(0, 8));
    ids.forEach(async id => {
      try { await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: "DELETE" }); } catch {}
    });
  };

  const handleBulkStatusUpdate = async (event: any) => {
    const newStatus = event.target.value;
    if (!newStatus) return;

    const count = selected.length;
    const updatedData = data
      .map(d => selected.includes(d._id) ? { ...d, status: newStatus as BookingData['status'] } : d)
      .filter(d => d.status === PAGE_STATUS);
    
    setData(updatedData);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedData));
    
    const formattedStatusName = newStatus.replace(/_/g, " ").toUpperCase();
    notify(`Updating ${count} bookings to ${formattedStatusName}...`, "success");
    setHistory(prev => [`Bulk updated ${count} bookings to ${formattedStatusName}`, ...prev].slice(0, 8));

    const ids = [...selected];
    setSelected([]); 
    setBulkStatus(""); 

    ids.forEach(async id => {
      try {
        await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (error) {
        console.error(`Failed to update booking ${id}`, error);
      }
    });
  };

  const handleClearFilters = () => {
    setFilterCargoType("");
    setFilterPaymentStatus("");
    setFilterDate("");
    setSearchQuery("");
    notify("Filters cleared", "success");
  };

  const filteredData = useMemo(() =>
    data.filter(d => {
      const matchesPageStatus = d.status === PAGE_STATUS;
      const matchesSearch =
        d.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sender_mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.receiver_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCargo = !filterCargoType || d.cargo_type === filterCargoType;
      const matchesPayment = !filterPaymentStatus || d.payment_status === filterPaymentStatus;

      let matchesDate = true;
      if (filterDate) {
        if (d.createdAt) {
          const itemDate = new Date(d.createdAt);
          itemDate.setHours(0, 0, 0, 0);
          const selectedDate = new Date(filterDate);
          selectedDate.setHours(0, 0, 0, 0);
          if (itemDate.getTime() !== selectedDate.getTime()) matchesDate = false;
        } else {
          matchesDate = false;
        }
      }
      return matchesPageStatus && matchesSearch && matchesCargo && matchesPayment && matchesDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data, searchQuery, filterCargoType, filterPaymentStatus, filterDate]
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(e.target.checked ? paginatedData.map(d => d._id) : []);
    
  const handleSelectOne = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const getStatusChip = (status: string) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "collect_item": 
      case "collect item":
        return <Chip label="Collect Item" size="small" sx={{ bgcolor: "#FFFBEB", color: "#D97706", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
      case "move_to_warehouse_sa":
      case "move to warehouse sa":
        return <Chip label="Warehouse SA" size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
      case "loading_box":
      case "loading box":
        return <Chip label="Loading Box" size="small" sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
      case "shipment_manifest":
      case "shipment manifest":
        return <Chip label="Manifest" size="small" sx={{ bgcolor: "#F5F3FF", color: "#7C3AED", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
      case "arrived_warehouse_sl":
      case "arrived warehouse sl":
        return <Chip label="Warehouse SL" size="small" sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
      case "delivered":
        return <Chip label="Delivered" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
      case "cancelled":
        return <Chip label="Cancelled" size="small" sx={{ bgcolor: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
      default:
        return <Chip label={status ? status.replace(/_/g, " ").toUpperCase() : "DRAFT"} size="small" sx={{ bgcolor: "#F8FAFC", color: "#64748B", fontWeight: 700, fontSize: "0.65rem", borderRadius: "4px" }} />;
    }
  };

  const goBack = () => { 
    setView("list"); 
    setSelectedItem(null); 
    fetchData(); 
  };

  if (view === "view" && selectedItem) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <BookingCustomerView booking={selectedItem as any} onBack={goBack} />
      </ThemeProvider>
    );
  }

  if (view === "edit" && selectedItem) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>
          <UpdateBookingCustomer 
            booking={selectedItem} 
            onBack={goBack} 
            onSuccess={() => {
              fetchData();
              notify("Booking updated successfully", "success");
              setHistory(prev => [`Updated booking ${selectedItem.tracking_number || selectedItem._id.slice(-6)}`, ...prev].slice(0, 8));
            }} 
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 }, pb: { xs: 8, md: 3 } }}>
        
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }} mb={isMobile ? 2 : 3} spacing={2}>
          <Box>
            {!isMobile && (
              <Breadcrumbs separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />} sx={{ mb: 0.5 }}>
                <Typography color="inherit" sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B", letterSpacing: 1 }}>DASHBOARD</Typography>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: 1 }}>WAREHOUSE SA</Typography>
              </Breadcrumbs>
            )}
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: isMobile ? "1.2rem" : "1.6rem", letterSpacing: "-0.5px" }}>
              Move to Warehouse SA
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncStatus === "online" ? "#10B981" : "#EF4444" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B", letterSpacing: 0.5 }}>
                {syncStatus === "online" ? "LIVE SYNC ACTIVE" : "OFFLINE MODE"}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, mb: 3, borderRadius: "8px", border: "1px solid #E2E8F0", bgcolor: "white", boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}>
          <Stack spacing={2}>
            <TextField 
              fullWidth size="small" variant="standard" 
              placeholder="Search tracking number, names..."
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{ 
                disableUnderline: true, 
                startAdornment: <SearchOutlined sx={{ mr: 1.5, color: "#94A3B8", fontSize: "1.2rem" }} />, 
                sx: { fontWeight: 600, fontSize: "0.9rem", bgcolor: "#F8FAFC", p: 1.5, px: 2, borderRadius: "6px", border: "1px solid #E2E8F0", transition: "all 0.2s", "&:hover": { borderColor: "#CBD5E1" } } 
              }} 
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={isMobile ? 1.5 : 2} alignItems="stretch" flexWrap="wrap">
              <Stack direction="row" spacing={isMobile ? 1.5 : 2} flexGrow={1}>
                <FormControl size="small" sx={{ flexGrow: 1 }}>
                  <InputLabel id="cargo-filter-label" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Cargo Type</InputLabel>
                  <Select
                    labelId="cargo-filter-label" value={filterCargoType} onChange={e => setFilterCargoType(e.target.value)}
                    label="Cargo Type" sx={{ borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, bgcolor: "white" }}
                  >
                    <MenuItem value=""><em>All Cargo</em></MenuItem>
                    <MenuItem value="air">Air Cargo</MenuItem>
                    <MenuItem value="sea">Sea Cargo</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ flexGrow: 1 }}>
                  <InputLabel id="payment-filter-label" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Payment Status</InputLabel>
                  <Select
                    labelId="payment-filter-label" value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)}
                    label="Payment Status" sx={{ borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, bgcolor: "white" }}
                  >
                    <MenuItem value=""><em>All Payments</em></MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="unpaid">Unpaid</MenuItem>
                    <MenuItem value="partial">Partial</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TextField
                label="Booking Date" type="date" size="small" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flexGrow: 1, "& .MuiInputBase-root": { borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, bgcolor: "white" } }}
              />

              {(filterCargoType || filterPaymentStatus || filterDate || searchQuery) && (
                <Button 
                  onClick={handleClearFilters} variant="text" color="error" fullWidth={isMobile}
                  sx={{ fontWeight: 700, fontSize: "0.75rem", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" } }}
                >
                  Clear Filters
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          
          {isMobile ? (
            <Stack spacing={2}>
              {paginatedData.length > 0 && (
                <Stack direction="row" alignItems="center" spacing={1} px={1}>
                  <Checkbox 
                    size="small" 
                    indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                    checked={paginatedData.length > 0 && selected.length === paginatedData.length} 
                    onChange={handleSelectAll} 
                  />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748B" }}>Select All</Typography>
                </Stack>
              )}

              <AnimatePresence>
                {paginatedData.map(item => (
                  <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "8px", bgcolor: selected.includes(item._id) ? "#F8FAFC" : "white" }}>
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Checkbox size="small" checked={selected.includes(item._id)} onChange={() => handleSelectOne(item._id)} sx={{ p: 0 }}/>
                            {item.qr_code && <QrCode2Outlined sx={{ color: ACCENT_GOLD, fontSize: 16 }} />}
                            <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem" }}>
                              {item.tracking_number || "PENDING"}
                            </Typography>
                          </Stack>
                          {getStatusChip(item.status)}
                        </Stack>
                        
                        <Divider sx={{ mb: 1.5, borderColor: "#F1F5F9" }} />
                        
                        {/* 🚀 FIXED: Replaced Grid with a flexbox Stack to avoid version issues 🚀 */}
                        <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
                          <Box sx={{ flex: 1, overflow: "hidden" }}>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, display: "block", mb: 0.2 }}>FROM</Typography>
                            <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem", lineHeight: 1.2 }} noWrap>{item.sender_name}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>{item.sender_mobile}</Typography>
                          </Box>
                          <Box sx={{ px: 1, display: "flex", justifyContent: "center" }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <ArrowForwardIosOutlined sx={{ fontSize: 10, color: PRIMARY_TEAL }} />
                            </Box>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: "right", overflow: "hidden" }}>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 700, display: "block", mb: 0.2 }}>TO</Typography>
                            <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem", lineHeight: 1.2 }} noWrap>{item.receiver_name}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>{item.receiver_mobile}</Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} p={1} sx={{ bgcolor: "#F8FAFC", borderRadius: "6px" }}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {item.cargo_type === "air" ? <FlightTakeoffOutlined sx={{ fontSize: 16, color: "#64748B" }} /> : <DirectionsBoatOutlined sx={{ fontSize: 16, color: "#64748B" }} />}
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>{item.cargo_type || "N/A"}</Typography>
                          </Stack>
                          <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem" }}>
                            SAR {item.payment_amount ? item.payment_amount.toFixed(2) : "0.00"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} justifyContent="space-between">
                          <Button 
                            size="small" variant="outlined" 
                            onClick={() => { setSelectedItem(item); setView("view"); }} 
                            startIcon={<VisibilityOutlined fontSize="small" />}
                            sx={{ flexGrow: 1, borderColor: "#E2E8F0", color: PRIMARY_TEAL, fontWeight: 700 }}>
                            View
                          </Button>
                          <Button 
                            size="small" variant="outlined" 
                            onClick={() => { setSelectedItem(item); setView("edit"); }} 
                            startIcon={<EditOutlined fontSize="small" />}
                            sx={{ flexGrow: 1, borderColor: "#E2E8F0", color: "#475569", fontWeight: 700 }}>
                            Edit
                          </Button>
                          <IconButton 
                            size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })}
                            sx={{ border: "1px solid #FECACA", color: "#EF4444", bgcolor: "#FEF2F2", borderRadius: "6px" }}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ 
              borderRadius: "8px", 
              border: "1px solid #E2E8F0", 
              overflow: "hidden",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.03)"
            }}>
              <Table size="medium" sx={{ minWidth: 1000, borderCollapse: "collapse" }}>
                <TableHead sx={{ bgcolor: PRIMARY_TEAL }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox 
                        size="small" 
                        sx={{ color: "rgba(255,255,255,0.7)", "&.Mui-checked": { color: "white" }, "&.MuiCheckbox-indeterminate": { color: "white" } }}
                        indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                        checked={paginatedData.length > 0 && selected.length === paginatedData.length} 
                        onChange={handleSelectAll} 
                      />
                    </TableCell>
                    {["TRACKING NO", "SHIPPER", "CONSIGNEE", "CARGO", "PAYMENT", "STATUS", "DATE", "ACTIONS"].map(h => (
                      <TableCell key={h} sx={{ 
                        fontWeight: 700, 
                        fontSize: "0.75rem", 
                        color: "white", 
                        letterSpacing: "0.05em",
                        py: 2
                      }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedData.map((item, index) => (
                      <TableRow 
                        key={item._id} 
                        component={motion.tr as any} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        sx={{
                          bgcolor: selected.includes(item._id) ? "rgba(0, 70, 82, 0.04)" : (index % 2 === 0 ? "white" : "#F8FAFC"), 
                          transition: "background-color 0.2s ease",
                          "&:hover": { bgcolor: "#F1F5F9 !important" }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={selected.includes(item._id)} onChange={() => handleSelectOne(item._id)} sx={{ color: "#CBD5E1" }}/>
                        </TableCell>
                        
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {item.qr_code && (
                              <Tooltip title="QR Code Generated">
                                <QrCode2Outlined sx={{ color: ACCENT_GOLD, fontSize: 16 }} />
                              </Tooltip>
                            )}
                            <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem", fontFamily: "monospace" }}>
                              {item.tracking_number || "PENDING"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem" }}>{item.sender_name}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>{item.sender_mobile}</Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem" }}>{item.receiver_name}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>{item.receiver_mobile}</Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {item.cargo_type === "air" ? <FlightTakeoffOutlined sx={{ fontSize: 16, color: "#94A3B8" }} /> : <DirectionsBoatOutlined sx={{ fontSize: 16, color: "#94A3B8" }} />}
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                              {item.cargo_type || "-"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem" }}>
                            SAR {item.payment_amount ? item.payment_amount.toFixed(2) : "0.00"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {getStatusChip(item.status)}
                        </TableCell>

                        <TableCell sx={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 500 }}>
                          {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => { setSelectedItem(item); setView("view"); }}
                                sx={{ color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "6px", "&:hover": { bgcolor: "white", color: PRIMARY_TEAL, borderColor: PRIMARY_TEAL } }}>
                                <VisibilityOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => { setSelectedItem(item); setView("edit"); }}
                                sx={{ color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "6px", "&:hover": { bgcolor: "white", color: "#1E293B", borderColor: "#1E293B" } }}>
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })}
                                sx={{ color: "#EF4444", border: "1px solid transparent", borderRadius: "6px", "&:hover": { bgcolor: "#FEF2F2", borderColor: "#FECACA" } }}>
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
          )}

          {paginatedData.length === 0 && (
            <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: "8px", border: "1px dashed #CBD5E1", mt: 2, bgcolor: "#F8FAFC" }}>
              <Typography sx={{ color: "#64748B", fontWeight: 600, fontSize: "0.95rem" }}>
                No active bookings found in the Warehouse SA pipeline.
              </Typography>
            </Paper>
          )}
        </motion.div>

        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: "8px", border: "1px solid #E2E8F0", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 2, bgcolor: "white" }}>
          <Stack direction={isMobile ? "column" : "row"} spacing={isMobile ? 2 : 3} alignItems={isMobile ? "stretch" : "center"}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#475569", textAlign: isMobile ? "center" : "left" }}>
              TOTAL RECORDS: {filteredData.length}
            </Typography>
            
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Stack direction={isMobile ? "column" : "row"} spacing={1.5} alignItems="stretch">
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel id="bulk-status-label" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Action: Change Status</InputLabel>
                      <Select
                        labelId="bulk-status-label" value={bulkStatus} onChange={handleBulkStatusUpdate}
                        label="Action: Change Status"
                        sx={{ borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, bgcolor: "#F8FAFC" }}
                      >
                        <MenuItem value="" disabled><em>Select New Status</em></MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="collect_item">Collect Item</MenuItem>
                        <MenuItem value="move_to_warehouse_sa">Move to Warehouse SA</MenuItem>
                        <MenuItem value="loading_box">Loading Box</MenuItem>
                        <MenuItem value="shipment_manifest">Shipment Manifest</MenuItem>
                        <MenuItem value="arrived_warehouse_sl">Arrived Warehouse SL</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>

                    <Button 
                      size="small" variant="outlined" color="error" onClick={handleBulkDelete}
                      startIcon={<DeleteOutline sx={{ fontSize: "1rem" }} />}
                      sx={{ fontWeight: 700, fontSize: "0.75rem", px: 2, borderRadius: "6px" }}>
                      DELETE ({selected.length})
                    </Button>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
          
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination 
              count={Math.ceil(filteredData.length / rowsPerPage)} 
              page={page} 
              onChange={(_, v) => setPage(v)}
              size={isMobile ? "small" : "medium"}
              shape="rounded"
              sx={{ "& .Mui-selected": { bgcolor: `${PRIMARY_TEAL} !important`, color: "#FFF", fontWeight: 800 }, "& .MuiPaginationItem-root": { fontWeight: 600, fontSize: "0.85rem" } }} 
            />
          </Box>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "8px", border: "1px solid #E2E8F0", bgcolor: "white" }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <HistoryToggleOffOutlined sx={{ color: "#94A3B8", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#475569", letterSpacing: 0.5 }}>SESSION LOG</Typography>
            </Stack>
            {history.length === 0
              ? <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8" }}>No administrative actions recorded in this session.</Typography>
              : <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 1.5 }}>
                  {history.map((log, i) => (
                    <Paper key={i} elevation={0} sx={{ p: 1.5, borderRadius: "6px", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", gap: 1.5, border: "1px solid #F1F5F9" }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: PRIMARY_TEAL }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600 }}>{log}</Typography>
                    </Paper>
                  ))}
                </Box>
            }
          </Paper>
        </Box>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "12px", p: 1, maxWidth: 400, width: "100%", m: 2 } }}>
          <Box textAlign="center" p={4}>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
              <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem", mb: 1 }}>Confirm Deletion</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: "0.9rem", lineHeight: 1.5 }}>
              Are you sure you want to delete this booking record? This action is permanent and cannot be undone.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined"
                sx={{ fontWeight: 700, color: "#475569", borderColor: "#CBD5E1", borderRadius: "6px" }}>Cancel</Button>
              <Button size="large" onClick={handleDelete} fullWidth variant="contained"
                sx={{ bgcolor: "#EF4444", fontWeight: 700, borderRadius: "6px", "&:hover": { bgcolor: "#DC2626", boxShadow: "none" }, boxShadow: "none" }}>Confirm Delete</Button>
            </Stack>
          </Box>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%", borderRadius: "6px", fontWeight: 600 }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default WarehouseSA;