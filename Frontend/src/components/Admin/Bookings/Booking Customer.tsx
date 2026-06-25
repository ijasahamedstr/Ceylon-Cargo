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
  FileDownloadOutlined, NavigateNext, HistoryToggleOffOutlined, 
  CheckCircleOutline, WarningAmberRounded, AddOutlined, 
  VisibilityOutlined, FlightTakeoffOutlined, DirectionsBoatOutlined, 
  PersonOutline, QrCode2Outlined, EastOutlined, LocalShippingOutlined
} from "@mui/icons-material";

// Import your views
import BookingCustomerView from "./Booking Customer View";
import UpdateBookingCustomer from "./UpdateBookingCustomer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const CACHE_KEY = "BOOKING_CUSTOMER_VAULT";
const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#CC9D2F";

// Premium Theme configuration
const montserratTheme = createTheme({
  typography: { fontFamily: "'Montserrat', sans-serif", allVariants: { fontFamily: "'Montserrat', sans-serif" } },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { fontFamily: "'Montserrat', sans-serif", textTransform: "none", boxShadow: "none", borderRadius: "8px", fontWeight: 700 } 
      } 
    },
    MuiTableCell: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", borderBottom: "none" } } },
    MuiInputBase: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiChip: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", borderRadius: "6px", fontWeight: 700 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: "16px", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)" } } },
    MuiPaginationItem: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } }
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

const BookingCustomer = () => {
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
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>();

  const [bulkStatus, setBulkStatus] = useState<string>("");

  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  
  // Mobile breakpoint detector
  const isMobile = useMediaQuery('(max-width:900px)');
  const rowsPerPage = isMobile ? 5 : 8;

  const notify = (message: string, severity: "success" | "error") => setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`);
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
  }, [searchQuery, filterCargoType, filterPaymentStatus, filterStatus, filterDate]);

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
    
    // Optimistic UI Update - updates in place since this is the master list
    const updatedData = data.map(d => 
      selected.includes(d._id) ? { ...d, status: newStatus as BookingData['status'] } : d
    );
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
    setFilterStatus("");
    setFilterDate("");
    setSearchQuery("");
    notify("Filters cleared", "success");
  };

  const exportCSV = () => {
    const rows = filteredData.map(d =>
      `"${d.tracking_number}","${d.sender_name}","${d.sender_mobile}","${d.receiver_name}","${d.receiver_mobile}","${d.cargo_type}",${d.payment_amount || 0},"${d.status}","${new Date(d.createdAt).toLocaleDateString()}"`
    );
    const blob = new Blob([`Tracking No,Shipper Name,Shipper Mobile,Consignee Name,Consignee Mobile,Cargo Type,Payment Amount,Status,Date\n${rows.join("\n")}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "customer-bookings.csv"; a.click();
    notify("CSV exported", "success");
  };

  const filteredData = useMemo(() =>
    data.filter(d => {
      const matchesSearch =
        d.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sender_mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.receiver_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCargo = !filterCargoType || d.cargo_type === filterCargoType;
      const matchesPayment = !filterPaymentStatus || d.payment_status === filterPaymentStatus;
      const matchesStatus = !filterStatus || d.status === filterStatus;

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

      return matchesSearch && matchesCargo && matchesPayment && matchesStatus && matchesDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data, searchQuery, filterCargoType, filterPaymentStatus, filterStatus, filterDate]
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
      case "collect item": return <Chip label="Collect Item" size="small" sx={{ bgcolor: "#FFFBEB", color: "#D97706" }} />;
      case "move_to_warehouse_sa":
      case "move to warehouse sa": return <Chip label="Warehouse SA" size="small" sx={{ bgcolor: "#EFF6FF", color: "#2563EB" }} />;
      case "loading_box":
      case "loading box": return <Chip label="Loading Box" size="small" sx={{ bgcolor: "#F1F5F9", color: "#475569" }} />;
      case "shipment_manifest":
      case "shipment manifest": return <Chip label="Manifest" size="small" sx={{ bgcolor: "#F5F3FF", color: "#7C3AED" }} />;
      case "arrived_warehouse_sl":
      case "arrived warehouse sl": return <Chip label="Warehouse SL" size="small" sx={{ bgcolor: "#ECFDF5", color: "#059669" }} />;
      case "delivered": return <Chip label="Delivered" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A" }} />;
      case "cancelled": return <Chip label="Cancelled" size="small" sx={{ bgcolor: "#FEF2F2", color: "#DC2626" }} />;
      default: return <Chip label={status ? status.replace(/_/g, " ").toUpperCase() : "DRAFT"} size="small" sx={{ bgcolor: "#F8FAFC", color: "#64748B" }} />;
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
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1, sm: 2, md: 3 }, pb: { xs: 10, md: 3 } }}>

        {/* Header Section */}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }} mb={isMobile ? 2 : 3} spacing={2}>
          <Box px={isMobile ? 1 : 0}>
            {!isMobile && (
              <Breadcrumbs separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />} sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B", letterSpacing: 1 }}>DASHBOARD</Typography>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: PRIMARY_TEAL, letterSpacing: 1 }}>CUSTOMERS & BOOKINGS</Typography>
              </Breadcrumbs>
            )}
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: isMobile ? "1.4rem" : "1.8rem", letterSpacing: "-0.5px" }}>
              Customer Database
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncStatus === "online" ? "#10B981" : "#EF4444" }} />
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B" }}>
                {syncStatus === "online" ? "System Online" : "Offline Mode"}
              </Typography>
            </Stack>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: isMobile ? "100%" : "auto" }}>
            <Button variant="outlined" onClick={exportCSV} startIcon={<FileDownloadOutlined fontSize="small" />} fullWidth={isMobile}
              sx={{ color: PRIMARY_TEAL, borderColor: "#E2E8F0", bgcolor: "white", "&:hover": { borderColor: PRIMARY_TEAL, bgcolor: "#F8FAFC" } }}>
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<AddOutlined fontSize="small" />} fullWidth={isMobile}
              sx={{ bgcolor: PRIMARY_TEAL, color: "white", boxShadow: "0 4px 12px rgba(0,70,82,0.15)", "&:hover": { bgcolor: "#002d35" } }}>
              New Booking
            </Button>
          </Stack>
        </Stack>

        {/* Search & Filters Widget */}
        <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, mb: isMobile ? 2 : 3, borderRadius: isMobile ? "16px" : "12px", border: "1px solid #E2E8F0", bgcolor: "white" }}>
          <Stack spacing={isMobile ? 1.5 : 2}>
            <TextField 
              fullWidth size="small" variant="standard" 
              placeholder="Search by tracking no, names, or mobile..."
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{ 
                disableUnderline: true, 
                startAdornment: <SearchOutlined sx={{ mr: 1.5, color: "#94A3B8" }} />, 
                sx: { fontWeight: 600, fontSize: "0.95rem", bgcolor: "#F8FAFC", p: 1.5, px: 2, borderRadius: "8px", border: "1px solid #E2E8F0", transition: "all 0.2s", "&:focus-within": { borderColor: PRIMARY_TEAL, bgcolor: "white", boxShadow: "0 0 0 3px rgba(0,70,82,0.1)" } } 
              }} 
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={isMobile ? 1.5 : 2} alignItems="stretch">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexGrow={1}>
                <FormControl size="small" sx={{ flexGrow: 1 }}>
                  <InputLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B" }}>Cargo Type</InputLabel>
                  <Select value={filterCargoType} onChange={e => setFilterCargoType(e.target.value)} label="Cargo Type" sx={{ borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
                    <MenuItem value=""><em>All Cargo</em></MenuItem>
                    <MenuItem value="air">Air Cargo</MenuItem>
                    <MenuItem value="sea">Sea Cargo</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ flexGrow: 1 }}>
                  <InputLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B" }}>Payment</InputLabel>
                  <Select value={filterPaymentStatus} onChange={e => setFilterPaymentStatus(e.target.value)} label="Payment" sx={{ borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
                    <MenuItem value=""><em>All Payments</em></MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="unpaid">Unpaid</MenuItem>
                    <MenuItem value="partial">Partial</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexGrow={1}>
                <FormControl size="small" sx={{ flexGrow: 1 }}>
                  <InputLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748B" }}>Status</InputLabel>
                  <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} label="Status" sx={{ borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
                    <MenuItem value=""><em>All Statuses</em></MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="collect_item">Collect Item</MenuItem>
                    <MenuItem value="move_to_warehouse_sa">Warehouse SA</MenuItem>
                    <MenuItem value="loading_box">Loading Box</MenuItem>
                    <MenuItem value="shipment_manifest">Shipment Manifest</MenuItem>
                    <MenuItem value="arrived_warehouse_sl">Warehouse SL</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={1.5} flexGrow={1} alignItems="center">
                  <TextField type="date" size="small" value={filterDate} onChange={e => setFilterDate(e.target.value)} sx={{ flexGrow: 1, "& .MuiInputBase-root": { borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 } }} />
                  
                  {(filterCargoType || filterPaymentStatus || filterStatus || filterDate || searchQuery) && (
                    <Button onClick={handleClearFilters} variant="text" color="error" sx={{ minWidth: "auto", px: 2, fontWeight: 700, fontSize: "0.8rem", borderRadius: "8px" }}>
                      Clear
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          {isMobile ? (
            /* 📱 NATIVE APP STYLE MOBILE CARDS 📱 */
            <Stack spacing={2}>
              {paginatedData.length > 0 && (
                <Paper elevation={0} sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox size="small" indeterminate={selected.length > 0 && selected.length < paginatedData.length} checked={paginatedData.length > 0 && selected.length === paginatedData.length} onChange={handleSelectAll} sx={{ p: 0.5 }} />
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Select All ({paginatedData.length})</Typography>
                  </Stack>
                </Paper>
              )}

              <AnimatePresence>
                {paginatedData.map(item => (
                  <motion.div key={item._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card elevation={0} sx={{ border: "1px solid", borderColor: selected.includes(item._id) ? PRIMARY_TEAL : "#E2E8F0", bgcolor: selected.includes(item._id) ? "#F4F8F9" : "white", transition: "all 0.2s ease" }}>
                      
                      {/* Top Bar: Tracking & Status */}
                      <Box sx={{ p: 2, pb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Checkbox size="small" checked={selected.includes(item._id)} onChange={() => handleSelectOne(item._id)} sx={{ p: 0, mt: -0.2 }}/>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.95rem", lineHeight: 1.2, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 0.5 }}>
                              {item.tracking_number || "PENDING"} {item.qr_code && <QrCode2Outlined sx={{ color: ACCENT_GOLD, fontSize: 16 }} />}
                            </Typography>
                            <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 600, mt: 0.5 }}>
                              {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                          </Box>
                        </Stack>
                        {getStatusChip(item.status)}
                      </Box>

                      <Divider sx={{ mx: 2, borderColor: "#F1F5F9" }} />
                      
                      {/* Middle: Route Info (Ticket Style) */}
                      <Box sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {/* Sender */}
                          <Box sx={{ flex: 1, overflow: "hidden" }}>
                            <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 800, lineHeight: 1, display: "block", mb: 0.5 }}>FROM</Typography>
                            <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.9rem" }} noWrap>{item.sender_name}</Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }} noWrap>{item.pickup_city || "City N/A"}</Typography>
                          </Box>

                          {/* Arrow Divider */}
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "40px" }}>
                            <LocalShippingOutlined sx={{ color: "#CBD5E1", fontSize: 18, mb: 0.5 }} />
                            <Box sx={{ width: "100%", height: "2px", bgcolor: "#E2E8F0", position: "relative" }}>
                              <EastOutlined sx={{ fontSize: 12, color: "#94A3B8", position: "absolute", right: -4, top: -5 }} />
                            </Box>
                          </Box>

                          {/* Receiver */}
                          <Box sx={{ flex: 1, textAlign: "right", overflow: "hidden" }}>
                            <Typography variant="overline" sx={{ color: "#94A3B8", fontWeight: 800, lineHeight: 1, display: "block", mb: 0.5 }}>TO</Typography>
                            <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "0.9rem" }} noWrap>{item.receiver_name}</Typography>
                            <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 500 }} noWrap>{item.delivery_city || "City N/A"}</Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Cargo & Payment Banner */}
                      <Box sx={{ mx: 2, mb: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {item.cargo_type === "air" ? <FlightTakeoffOutlined sx={{ fontSize: 18, color: PRIMARY_TEAL }} /> : <DirectionsBoatOutlined sx={{ fontSize: 18, color: PRIMARY_TEAL }} />}
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>{item.cargo_type || "N/A"}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label={item.payment_status.toUpperCase()} size="small" sx={{ height: 20, fontSize: "0.6rem", fontWeight: 800, bgcolor: item.payment_status === "paid" ? "#DCFCE7" : "#FEE2E2", color: item.payment_status === "paid" ? "#166534" : "#991B1B" }} />
                          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.9rem" }}>
                            SAR {item.payment_amount ? item.payment_amount.toFixed(2) : "0.00"}
                          </Typography>
                        </Stack>
                      </Box>

                      <Divider sx={{ borderColor: "#F1F5F9" }} />

                      {/* Bottom Action Bar */}
                      <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#FCFDFD" }}>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => { setSelectedItem(item); setView("edit"); }} sx={{ color: "#64748B", bgcolor: "#F1F5F9", borderRadius: "8px" }}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })} sx={{ color: "#EF4444", bgcolor: "#FEF2F2", borderRadius: "8px" }}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Button 
                          variant="contained" size="small" disableElevation
                          onClick={() => { setSelectedItem(item); setView("view"); }} 
                          sx={{ bgcolor: PRIMARY_TEAL, color: "white", borderRadius: "8px", px: 3, py: 0.8, fontSize: "0.8rem" }}>
                          View Details
                        </Button>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          ) : (
            /* 💻 DESKTOP VIEW (Clean, Borderless, Official) 💻 */
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.02)" }}>
              <Table size="medium" sx={{ minWidth: 1000, borderCollapse: "collapse" }}>
                <TableHead sx={{ bgcolor: PRIMARY_TEAL }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" sx={{ color: "rgba(255,255,255,0.7)", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "white" } }}
                        indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                        checked={paginatedData.length > 0 && selected.length === paginatedData.length} onChange={handleSelectAll} />
                    </TableCell>
                    {["TRACKING NO", "SHIPPER", "CONSIGNEE", "CARGO", "PAYMENT", "STATUS", "DATE", "ACTIONS"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem", color: "white", letterSpacing: "0.05em", py: 2.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {paginatedData.map((item, index) => (
                      <TableRow key={item._id} component={motion.tr as any} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        sx={{ bgcolor: selected.includes(item._id) ? "rgba(0, 70, 82, 0.04)" : (index % 2 === 0 ? "white" : "#F8FAFC"), "&:hover": { bgcolor: "#F1F5F9 !important" } }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={selected.includes(item._id)} onChange={() => handleSelectOne(item._id)} sx={{ color: "#CBD5E1" }}/>
                        </TableCell>
                        
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {item.qr_code && <Tooltip title="QR Generated"><QrCode2Outlined sx={{ color: ACCENT_GOLD, fontSize: 16 }} /></Tooltip>}
                            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "0.85rem", fontFamily: "monospace" }}>{item.tracking_number || "PENDING"}</Typography>
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
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>{item.cargo_type || "-"}</Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: "0.85rem" }}>SAR {item.payment_amount ? item.payment_amount.toFixed(2) : "0.00"}</Typography>
                            {item.payment_status === "paid" && <CheckCircleOutline sx={{ fontSize: 14, color: "#10B981" }} />}
                          </Stack>
                        </TableCell>

                        <TableCell>{getStatusChip(item.status)}</TableCell>

                        <TableCell sx={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600 }}>
                          {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View">
                              <IconButton size="small" onClick={() => { setSelectedItem(item); setView("view"); }} sx={{ color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", "&:hover": { bgcolor: "white", color: PRIMARY_TEAL, borderColor: PRIMARY_TEAL } }}><VisibilityOutlined fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => { setSelectedItem(item); setView("edit"); }} sx={{ color: "#64748B", border: "1px solid #E2E8F0", borderRadius: "8px", "&:hover": { bgcolor: "white", color: "#1E293B", borderColor: "#1E293B" } }}><EditOutlined fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })} sx={{ color: "#EF4444", border: "1px solid transparent", borderRadius: "8px", "&:hover": { bgcolor: "#FEF2F2", borderColor: "#FECACA" } }}><DeleteOutline fontSize="small" /></IconButton>
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

          {/* Empty State Handler */}
          {paginatedData.length === 0 && (
            <Paper elevation={0} sx={{ p: isMobile ? 4 : 8, textAlign: "center", borderRadius: "12px", border: "2px dashed #E2E8F0", mt: 2, bgcolor: "transparent" }}>
              <LocalShippingOutlined sx={{ fontSize: 48, color: "#CBD5E1", mb: 2 }} />
              <Typography sx={{ color: "#64748B", fontWeight: 700, fontSize: "1rem" }}>No customer bookings found.</Typography>
              <Typography sx={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.85rem", mt: 1 }}>Adjust your search filters or add a new booking.</Typography>
            </Paper>
          )}
        </motion.div>

        {/* 🎛 Pagination & Bulk Actions Footer 🎛 */}
        <Paper elevation={0} sx={{ mt: 3, p: isMobile ? 2 : 2.5, borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 2, bgcolor: "white" }}>
          <Stack direction={isMobile ? "column" : "row"} spacing={isMobile ? 2 : 3} alignItems={isMobile ? "stretch" : "center"}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: "#475569", textAlign: isMobile ? "center" : "left", px: isMobile ? 0 : 1 }}>
              TOTAL RECORDS: {filteredData.length}
            </Typography>
            
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Stack direction={isMobile ? "column" : "row"} spacing={1.5} alignItems="stretch" p={1} sx={{ bgcolor: "#F8FAFC", borderRadius: "8px", border: "1px dashed #CBD5E1" }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel sx={{ fontSize: "0.8rem", fontWeight: 700, color: PRIMARY_TEAL }}>Bulk Status Update</InputLabel>
                      <Select value={bulkStatus} onChange={handleBulkStatusUpdate} label="Bulk Status Update" sx={{ borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, bgcolor: "white" }}>
                        <MenuItem value="" disabled><em>Select Destination Stage</em></MenuItem>
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

                    <Button size="small" variant="contained" color="error" disableElevation onClick={handleBulkDelete} startIcon={<DeleteOutline />} sx={{ fontWeight: 700, fontSize: "0.8rem", borderRadius: "8px", px: 2 }}>
                      Delete ({selected.length})
                    </Button>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
          
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination 
              count={Math.ceil(filteredData.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)}
              size={isMobile ? "small" : "medium"} shape="rounded"
              sx={{ "& .Mui-selected": { bgcolor: `${PRIMARY_TEAL} !important`, color: "#FFF", fontWeight: 800 }, "& .MuiPaginationItem-root": { fontWeight: 700, fontSize: "0.85rem", color: "#475569" } }} 
            />
          </Box>
        </Paper>

        {/* 🕒 Activity Log */}
        <Box sx={{ mt: 3 }}>
          <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "white" }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <HistoryToggleOffOutlined sx={{ color: "#94A3B8", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#475569", letterSpacing: 0.5 }}>SESSION ACTIVITY LOG</Typography>
            </Stack>
            {history.length === 0
              ? <Typography sx={{ fontSize: "0.85rem", color: "#94A3B8", fontStyle: "italic" }}>No administrative actions recorded yet.</Typography>
              : <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 1.5 }}>
                  {history.map((log, i) => (
                    <Paper key={i} elevation={0} sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#F8FAFC", display: "flex", alignItems: "flex-start", gap: 1.5, border: "1px solid #F1F5F9" }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: PRIMARY_TEAL, mt: 0.2 }} />
                      <Typography sx={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600, lineHeight: 1.4 }}>{log}</Typography>
                    </Paper>
                  ))}
                </Box>
            }
          </Paper>
        </Box>

        {/* 🚨 Delete Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: 400, width: "100%", m: 2 } }}>
          <Box textAlign="center" p={4}>
            <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
              <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem", mb: 1 }}>Confirm Deletion</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: "0.9rem", lineHeight: 1.5 }}>
              Are you sure you want to delete this booking record? This action is permanent.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined" sx={{ fontWeight: 700, color: "#475569", borderColor: "#CBD5E1", borderRadius: "8px" }}>Cancel</Button>
              <Button size="large" onClick={handleDelete} fullWidth variant="contained" disableElevation sx={{ bgcolor: "#EF4444", fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#DC2626" } }}>Delete</Button>
            </Stack>
          </Box>
        </Dialog>

        {/* Global Notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%", borderRadius: "8px", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{snackbar.message}</Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default BookingCustomer;