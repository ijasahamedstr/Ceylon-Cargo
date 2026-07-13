import { API_BASE_URL } from "@/config/api";
import { Fragment, useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Stack, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, TextField,
  Pagination, Checkbox, Chip, Snackbar, Alert,
  Breadcrumbs, ThemeProvider, createTheme, Dialog,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab, FormControlLabel, Switch, Tooltip,
  CircularProgress, useTheme, useMediaQuery, Divider
} from "@mui/material";
import {
  DeleteOutline, EditOutlined, SearchOutlined,
  FileDownloadOutlined, NavigateNext, ArrowForwardOutlined,
  HistoryToggleOffOutlined, CheckCircleOutline, WarningAmberRounded,
  VisibilityOutlined, FlightTakeoffOutlined,
  DirectionsBoatOutlined, QrCode2Outlined, GroupOutlined, ContentCopyOutlined
} from "@mui/icons-material";

import BookingCustomerView from "../Bookings/Booking Customer View";
import UpdateBookingCustomer from "../Bookings/UpdateBookingCustomer";
import { ALL_STATUS_OPTIONS } from "./bookingWorkflow";
import type { BookingStatus, WorkflowStageConfig } from "./bookingWorkflow";
import {
  MoveGroupDetailDialog,
  MoveGroupsHistory,
  type MoveGroupData,
} from "./MoveGroupPanel";
import { findDuplicates, personKey, getDuplicateLabel } from "./duplicateDetection";

const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#CC9D2F";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

const montserratTheme = createTheme({
  typography: { fontFamily: "'Montserrat', sans-serif", allVariants: { fontFamily: "'Montserrat', sans-serif" } },
  components: {
    MuiButton: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif", textTransform: "none" } } },
    MuiTableCell: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiInputBase: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiChip: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiAlert: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
    MuiPaginationItem: { styleOverrides: { root: { fontFamily: "'Montserrat', sans-serif" } } },
  }
});

export interface BookingData {
  _id: string;
  tracking_number: string;
  status: BookingStatus;
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

const STATUS_CHIP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  draft: { label: "Draft", bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  collect_item: { label: "Collect Item", bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  move_to_warehouse_sa: { label: "Warehouse SA", bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  loading_box: { label: "Loading", bg: "#EEF2F6", color: "#475569", border: "#CBD5E1" },
  shipment_manifest: { label: "Manifest", bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  arrived_warehouse_sl: { label: "Warehouse SL", bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  ready_for_delivery: { label: "Ready for Delivery", bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  delivered: { label: "Delivered", bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

function StatusChip({ status }: { status: string }) {
  const key = status?.toLowerCase().replace(/ /g, "_") || "draft";
  const cfg = STATUS_CHIP[key] || STATUS_CHIP.draft;
  return (
    <Chip label={cfg.label} size="small" sx={{
      bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      fontWeight: 800, fontSize: "0.65rem"
    }} />
  );
}

function startOfLocalDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateGroupKey(dateStr?: string) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return startOfLocalDay(date).toISOString();
}

function dateGroupLabel(dateStr?: string) {
  const date = dateStr ? startOfLocalDay(new Date(dateStr)) : startOfLocalDay(new Date());
  const today = startOfLocalDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

interface StageBookingBoardProps {
  stage: WorkflowStageConfig;
}

export default function StageBookingBoard({ stage }: StageBookingBoardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const PAGE_STATUS = stage.status;

  const [data, setData] = useState<BookingData[]>([]);
  const [view, setView] = useState<"list" | "view" | "edit">("list");
  const [selectedItem, setSelectedItem] = useState<BookingData | null>(null);
  const [syncStatus, setSyncStatus] = useState<"online" | "offline">("online");
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCargoType, setFilterCargoType] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterDate, setFilterDate] = useState<string>();
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);
  const [moveGroups, setMoveGroups] = useState<MoveGroupData[]>([]);
  const [incomingGroups, setIncomingGroups] = useState<MoveGroupData[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveNotes, setMoveNotes] = useState("");
  const [moving, setMoving] = useState(false);
  const [activeGroup, setActiveGroup] = useState<MoveGroupData | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const rowsPerPage = 8;

  const notify = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    try {
      const url = PAGE_STATUS === "collect_item"
        ? `${API_BASE_URL}/api/bookings`
        : `${API_BASE_URL}/api/bookings?status=${PAGE_STATUS}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const list: BookingData[] = json.data || json;
      if (PAGE_STATUS === "collect_item") {
        setData(list);
      } else {
        setData(list.filter(d => d.status === PAGE_STATUS));
      }
      localStorage.setItem(stage.cacheKey, JSON.stringify(list));
      setSyncStatus("online");
    } catch {
      const cached = localStorage.getItem(stage.cacheKey);
      if (cached) {
        try {
          const parsed: BookingData[] = JSON.parse(cached);
          if (PAGE_STATUS === "collect_item") {
            setData(parsed);
          } else {
            setData(parsed.filter(d => d.status === PAGE_STATUS));
          }
        } catch { /* ignore */ }
      }
      setSyncStatus("offline");
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }, [PAGE_STATUS, stage.cacheKey]);

  const fetchGroups = useCallback(async (isSilent = false) => {
    if (!isSilent) setGroupsLoading(true);
    try {
      const [outRes, inRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/move-groups?from_status=${PAGE_STATUS}`, { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/move-groups?to_status=${PAGE_STATUS}`, { headers: authHeaders() }),
      ]);
      if (outRes.ok) {
        const outJson = await outRes.json();
        setMoveGroups(outJson.data || []);
      }
      if (inRes.ok) {
        const inJson = await inRes.json();
        setIncomingGroups(inJson.data || []);
      }
    } catch {
      /* keep existing groups on error */
    } finally {
      if (!isSilent) setGroupsLoading(false);
    }
  }, [PAGE_STATUS]);

  useEffect(() => {
    fetchData(true);
    fetchGroups(false);
    const interval = setInterval(() => {
      fetchData(false);
      fetchGroups(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchData, fetchGroups]);

  useEffect(() => { setPage(1); }, [searchQuery, filterCargoType, filterPaymentStatus, filterDate, showDuplicatesOnly, filterStatus]);

  const createMoveGroup = async (ids: string[], newStatus: BookingStatus, notes = "") => {
    if (ids.length === 0 || !newStatus) return;
    setMoving(true);
    try {
      const adminData = localStorage.getItem("adminData");
      let movedBy = "";
      if (adminData) {
        try { movedBy = JSON.parse(adminData).name || ""; } catch { /* ignore */ }
      }

      const res = await fetch(`${API_BASE_URL}/api/move-groups`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          bookingIds: ids,
          fromStatus: PAGE_STATUS,
          toStatus: newStatus,
          fromLabel: stage.title,
          toLabel: ALL_STATUS_OPTIONS.find(o => o.value === newStatus)?.label || newStatus,
          notes,
          movedBy,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Move group failed");

      const group: MoveGroupData = json.data;
      setData(prev => prev.filter(d => !ids.includes(d._id)));
      setSelected([]);
      setMoveDialogOpen(false);
      setMoveNotes("");
      setActiveGroup(group);
      setGroupDialogOpen(true);
      setTabIndex(1);
      fetchGroups();
      fetchData();
      notify(`Group ${group.group_code} created — ${group.package_count} package(s) moved`, "success");
      setHistory(prev => [`Group ${group.group_code}: ${group.package_count} pkg → ${group.to_label}`, ...prev].slice(0, 8));
    } catch (err) {
      fetchData();
      notify(err instanceof Error ? err.message : "Failed to create move group", "error");
    } finally {
      setMoving(false);
    }
  };

  const applyStatusUpdate = async (ids: string[], newStatus: BookingStatus) => {
    if (ids.length === 0) return;
    const formatted = newStatus.replace(/_/g, " ").toUpperCase();
    setSelected([]);
    setBulkStatus("");

    let failed = 0;
    for (const id of ids) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status: newStatus, expectedStatus: PAGE_STATUS }),
        });
        if (!res.ok) {
          failed++;
          const j = await res.json().catch(() => ({}));
          console.warn(j.message || `Failed ${id}`);
        }
      } catch {
        failed++;
      }
    }
    fetchData();
    if (failed > 0) {
      notify(`${failed} package(s) could not move — already moved? Refresh the list.`, "error");
    } else {
      notify(`Updated ${ids.length} booking(s) to ${formatted}`, "success");
    }
  };

  const handleMoveToNext = () => {
    if (!stage.nextStatus || selected.length === 0) return;
    setMoveDialogOpen(true);
  };

  const confirmMoveGroup = () => {
    if (!stage.nextStatus) return;
    createMoveGroup([...selected], stage.nextStatus, moveNotes.trim());
  };

  const handleBulkStatusUpdate = (event: { target: { value: string } }) => {
    const newStatus = event.target.value as BookingStatus;
    if (!newStatus) return;
    applyStatusUpdate([...selected], newStatus);
  };

  const handleDelete = async () => {
    const id = deleteDialog.id;
    if (!id) return;
    setData(prev => prev.filter(d => d._id !== id));
    setDeleteDialog({ open: false, id: null });
    setSelected(prev => prev.filter(i => i !== id));
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: "DELETE", headers: authHeaders() });
      notify("Booking deleted", "success");
      setHistory(prev => [`Deleted booking`, ...prev].slice(0, 8));
    } catch {
      fetchData();
      notify("Delete failed", "error");
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    setData(prev => prev.filter(d => !ids.includes(d._id)));
    setSelected([]);
    notify(`Deleting ${ids.length} booking(s)...`, "success");
    ids.forEach(async id => {
      try { await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: "DELETE", headers: authHeaders() }); } catch { /* ignore */ }
    });
    fetchData();
  };

  const exportCSV = () => {
    const rows = filteredData.map(d =>
      `"${d.tracking_number}","${d.sender_name}","${d.sender_mobile}","${d.receiver_name}","${d.receiver_mobile}","${d.cargo_type}",${d.payment_amount || 0},"${d.status}","${new Date(d.createdAt).toLocaleDateString()}"`
    );
    const blob = new Blob([`Tracking No,Shipper,Mobile,Consignee,Mobile,Cargo,Amount,Status,Date\n${rows.join("\n")}`], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = stage.csvFilename;
    a.click();
    notify("CSV exported", "success");
  };

  const filteredData = useMemo(() =>
    data.filter(d => {
      const matchesSearch =
        d.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sender_mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.sender_iqama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.receiver_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCargo = !filterCargoType || d.cargo_type === filterCargoType;
      const matchesPayment = !filterPaymentStatus || d.payment_status === filterPaymentStatus;
      let matchesDate = true;
      if (filterDate && d.createdAt) {
        const itemDate = new Date(d.createdAt);
        itemDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(filterDate);
        selectedDate.setHours(0, 0, 0, 0);
        matchesDate = itemDate.getTime() === selectedDate.getTime();
      } else if (filterDate) {
        matchesDate = false;
      }
      const matchesStatus = PAGE_STATUS === "collect_item"
        ? (!filterStatus || d.status === filterStatus)
        : d.status === PAGE_STATUS;
      return matchesStatus && matchesSearch && matchesCargo && matchesPayment && matchesDate;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data, searchQuery, filterCargoType, filterPaymentStatus, filterDate, filterStatus, PAGE_STATUS]
  );

  const duplicateInfo = useMemo(() => findDuplicates(filteredData), [filteredData]);

  const displayData = useMemo(() => {
    if (!showDuplicatesOnly) return filteredData;
    return filteredData.filter(d => duplicateInfo.duplicateIds.has(d._id));
  }, [filteredData, showDuplicatesOnly, duplicateInfo]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return displayData.slice(start, start + rowsPerPage);
  }, [displayData, page]);

  const paginatedDateGroups = useMemo(() => {
    const groups = new Map<string, { label: string; items: BookingData[] }>();
    for (const item of paginatedData) {
      const key = dateGroupKey(item.createdAt);
      if (!groups.has(key)) {
        groups.set(key, { label: dateGroupLabel(item.createdAt), items: [] });
      }
      groups.get(key)!.items.push(item);
    }
    return [...groups.values()];
  }, [paginatedData]);

  const checkableData = useMemo(() => {
    return paginatedData.filter(d => PAGE_STATUS !== "collect_item" || d.status === "collect_item");
  }, [paginatedData, PAGE_STATUS]);

  const selectedBookings = useMemo(
    () => data.filter(d => selected.includes(d._id)),
    [data, selected]
  );

  const selectedHasDuplicates = useMemo(
    () => selectedBookings.some(b => duplicateInfo.duplicateIds.has(b._id)),
    [selectedBookings, duplicateInfo]
  );

  const handleBulkMoveGroups = (groupIds: string[]) => {
    if (!stage.nextStatus) return;
    const groupList = [...moveGroups, ...incomingGroups];
    const bookingIds = groupIds.flatMap(gId => {
      const g = groupList.find(x => x._id === gId);
      return g ? g.booking_ids.map(b => b._id) : [];
    });
    if (bookingIds.length === 0) {
      notify("No bookings found in the selected groups", "error");
      return;
    }
    createMoveGroup(bookingIds, stage.nextStatus, "Bulk moved via selected groups");
  };

  const handleBulkStatusUpdateGroups = (groupIds: string[], newStatus: string) => {
    const groupList = [...moveGroups, ...incomingGroups];
    const bookingIds = groupIds.flatMap(gId => {
      const g = groupList.find(x => x._id === gId);
      return g ? g.booking_ids.map(b => b._id) : [];
    });
    if (bookingIds.length === 0) {
      notify("No bookings found in the selected groups", "error");
      return;
    }
    applyStatusUpdate(bookingIds, newStatus as BookingStatus);
  };

  const handleBulkDeleteGroups = async (groupIds: string[]) => {
    notify(`Deleting ${groupIds.length} move group(s)...`, "success");
    try {
      const res = await fetch(`${API_BASE_URL}/api/move-groups/bulk/delete`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ids: groupIds }),
      });
      if (!res.ok) throw new Error("Bulk delete failed");
      setMoveGroups(prev => prev.filter(g => !groupIds.includes(g._id)));
      setIncomingGroups(prev => prev.filter(g => !groupIds.includes(g._id)));
      notify("Move groups deleted successfully", "success");
    } catch {
      notify("Failed to delete move groups", "error");
    }
  };

  const goBack = () => { setView("list"); setSelectedItem(null); fetchData(); };

  if (view === "view" && selectedItem) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <BookingCustomerView booking={selectedItem as never} onBack={goBack} />
      </ThemeProvider>
    );
  }

  if (view === "edit" && selectedItem && stage.allowEdit) {
    return (
      <ThemeProvider theme={montserratTheme}>
        <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>
          <UpdateBookingCustomer
            booking={selectedItem}
            onBack={goBack}
            onSuccess={() => {
              fetchData();
              notify("Booking updated", "success");
            }}
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }} mb={3} spacing={2}>
          <Box>
            <Breadcrumbs separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />} sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700 }}>DASHBOARD</Typography>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: PRIMARY_TEAL }}>{stage.breadcrumb}</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "1.4rem" }}>{stage.title}</Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#64748B", mt: 0.5, maxWidth: 520 }}>{stage.subtitle}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncStatus === "online" ? "#10B981" : "#EF4444" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B" }}>
                {syncStatus === "online" ? "LIVE SYNC" : "OFFLINE"} · {filteredData.length} at this stage
              </Typography>
            </Stack>
          </Box>
          <Button variant="outlined" onClick={exportCSV} startIcon={<FileDownloadOutlined fontSize="small" />}
            sx={{ color: PRIMARY_TEAL, borderColor: PRIMARY_TEAL, borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem" }}>
            Export CSV
          </Button>
        </Stack>

        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2, "& .MuiTab-root": { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "none" } }}>
          <Tab label={PAGE_STATUS === "collect_item" ? `All Bookings (${filteredData.length})` : `Packages at Stage (${filteredData.length})`} />
          <Tab label={`Move Groups (${moveGroups.length + incomingGroups.length})`} icon={<GroupOutlined sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>

        {tabIndex === 0 && (
        <>
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "white" }}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" variant="standard" placeholder="Search tracking, name, mobile, IQAMA..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: <SearchOutlined sx={{ mr: 1, color: PRIMARY_TEAL }} />,
                sx: { fontWeight: 600, fontSize: "0.85rem", bgcolor: "#F8FAFC", p: 1, px: 2, borderRadius: "8px", border: "1px solid #E2E8F0" }
              }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" useFlexGap>
              {PAGE_STATUS === "collect_item" && (
                <FormControl size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)} sx={{ borderRadius: "8px" }}>
                    <MenuItem value=""><em>All Statuses</em></MenuItem>
                    {ALL_STATUS_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl size="small" sx={{ minWidth: 140, flexGrow: 1 }}>
                <InputLabel>Cargo Type</InputLabel>
                <Select value={filterCargoType} label="Cargo Type" onChange={e => setFilterCargoType(e.target.value)} sx={{ borderRadius: "8px" }}>
                  <MenuItem value=""><em>All</em></MenuItem>
                  <MenuItem value="air">Air</MenuItem>
                  <MenuItem value="sea">Sea</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160, flexGrow: 1 }}>
                <InputLabel>Payment</InputLabel>
                <Select value={filterPaymentStatus} label="Payment" onChange={e => setFilterPaymentStatus(e.target.value)} sx={{ borderRadius: "8px" }}>
                  <MenuItem value=""><em>All</em></MenuItem>
                  {["paid", "unpaid", "partial", "pending"].map(s => (
                    <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Date" type="date" size="small" value={filterDate || ""} onChange={e => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 160, flexGrow: 1 }} />
              <FormControlLabel
                control={<Switch size="small" checked={showDuplicatesOnly} onChange={e => setShowDuplicatesOnly(e.target.checked)} />}
                label={<Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>Same client only</Typography>}
              />
            </Stack>
            {duplicateInfo.duplicateIds.size > 0 && (
              <Alert severity="warning" sx={{ borderRadius: "10px", fontSize: "0.8rem" }}>
                <strong>{duplicateInfo.duplicateIds.size} package(s)</strong> share the same client name/mobile/IQAMA.
                Use <strong>Tracking No</strong> or <strong>IQAMA</strong> to pick the correct one — do not move by name alone.
              </Alert>
            )}
          </Stack>
        </Paper>

        {isMobile ? (
          <Stack spacing={2} mb={3}>
            {paginatedData.map(item => {
              const isDup = duplicateInfo.duplicateIds.has(item._id);
              const dupCount = duplicateInfo.personCounts.get(personKey(item)) || 1;
              const isSel = selected.includes(item._id);
              return (
                <Paper key={item._id} variant="outlined" sx={{ p: 2, borderRadius: "16px", bgcolor: isSel ? "rgba(0, 70, 82, 0.02)" : "#FFFFFF", borderColor: isSel ? PRIMARY_TEAL : "#E2E8F0", borderLeft: isDup ? "4px solid #F59E0B" : undefined, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox size="small" checked={isSel}
                        disabled={PAGE_STATUS === "collect_item" && item.status !== "collect_item"}
                        onChange={() =>
                          setSelected(prev => prev.includes(item._id) ? prev.filter(i => i !== item._id) : [...prev, item._id])
                        } />
                      <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem" }}>{item.tracking_number}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => { setSelectedItem(item); setView("view"); }} sx={{ color: PRIMARY_TEAL, bgcolor: "#F0F5F6" }}>
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                      {stage.allowEdit && (
                        <IconButton size="small" onClick={() => { setSelectedItem(item); setView("edit"); }} sx={{ bgcolor: "#F1F5F9" }}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })} sx={{ color: "#EF4444", bgcolor: "#FEF2F2" }}>
                        <DeleteOutline sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack spacing={1} sx={{ pl: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.82rem" }}>{item.sender_name}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>{item.sender_mobile}</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: PRIMARY_TEAL, fontWeight: 700 }}>IQAMA: {item.sender_iqama}</Typography>
                    </Box>
                    <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>To: {item.receiver_name}</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>Destination: {item.delivery_city}</Typography>
                    </Box>
                    <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {item.cargo_type === "air" ? <FlightTakeoffOutlined sx={{ fontSize: 14, color: "#CC9D2F" }} /> : <DirectionsBoatOutlined sx={{ fontSize: 14, color: "#CC9D2F" }} />}
                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" }}>{item.cargo_type}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>SAR {(item.payment_amount ?? 0).toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                      <StatusChip status={item.status} />
                      <Chip label={item.payment_status?.toUpperCase()} size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: "0.6rem", borderColor: item.payment_status === "paid" ? "#10B981" : "#EF4444", color: item.payment_status === "paid" ? "#10B981" : "#EF4444" }} />
                      {isDup && (
                        <Chip label={getDuplicateLabel(dupCount)} size="small" sx={{ height: 18, fontSize: "0.6rem", fontWeight: 800, bgcolor: "#FDE68A", color: "#92400E" }} />
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
            {paginatedData.length === 0 && (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: "16px", color: "#94A3B8" }}>
                {initialLoading ? (
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} py={2}>
                    <CircularProgress size={20} sx={{ color: PRIMARY_TEAL }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748B" }}>Syncing pipeline...</Typography>
                  </Stack>
                ) : (
                  stage.emptyMessage
                )}
              </Paper>
            )}
          </Stack>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <Table size="medium" sx={{ minWidth: 1000 }}>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox size="small"
                      indeterminate={selected.length > 0 && selected.length < checkableData.length}
                      checked={checkableData.length > 0 && selected.length === checkableData.length}
                      onChange={e => setSelected(e.target.checked ? checkableData.map(d => d._id) : [])}
                    />
                  </TableCell>
                  {["TRACKING", "SHIPPER", "CONSIGNEE", "CARGO", "PAYMENT", "STATUS", "DATE", "ACTIONS"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {paginatedDateGroups.map(group => (
                    <Fragment key={group.label}>
                      <TableRow>
                        <TableCell colSpan={9} sx={{ bgcolor: "#F8FAFC", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", py: 1.25 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 900, color: PRIMARY_TEAL, fontSize: "0.78rem" }}>
                              {group.label}
                            </Typography>
                            <Chip
                              label={`${group.items.length} package${group.items.length === 1 ? "" : "s"}`}
                              size="small"
                              sx={{ height: 20, fontWeight: 800, fontSize: "0.62rem", bgcolor: "#EEF2F6", color: "#475569" }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                      {group.items.map(item => {
                        const isDup = duplicateInfo.duplicateIds.has(item._id);
                        const dupCount = duplicateInfo.personCounts.get(personKey(item)) || 1;
                        return (
                        <TableRow key={item._id} hover component={motion.tr as any} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          sx={isDup ? { bgcolor: "#FFFBEB", "&:hover": { bgcolor: "#FEF3C7" } } : undefined}>
                          <TableCell padding="checkbox">
                            <Checkbox size="small" checked={selected.includes(item._id)}
                              disabled={PAGE_STATUS === "collect_item" && item.status !== "collect_item"}
                              onChange={() =>
                                setSelected(prev => prev.includes(item._id) ? prev.filter(i => i !== item._id) : [...prev, item._id])
                              } />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {item.qr_code && <QrCode2Outlined sx={{ color: ACCENT_GOLD, fontSize: 18 }} />}
                              <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem" }}>{item.tracking_number}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.sender_name}</Typography>
                            <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>{item.sender_mobile}</Typography>
                            <Typography variant="caption" sx={{ color: PRIMARY_TEAL, fontWeight: 700 }}>IQAMA: {item.sender_iqama}</Typography>
                            {isDup && (
                              <Chip label={getDuplicateLabel(dupCount)} size="small"
                                sx={{ mt: 0.5, height: 18, fontSize: "0.6rem", fontWeight: 800, bgcolor: "#FDE68A", color: "#92400E" }} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {item.cargo_type === "air" ? <FlightTakeoffOutlined sx={{ fontSize: 18, color: "#CC9D2F" }} /> : <DirectionsBoatOutlined sx={{ fontSize: 18, color: "#CC9D2F" }} />}
                              <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>{item.cargo_type}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>SAR {(item.payment_amount ?? 0).toFixed(2)}</TableCell>
                          <TableCell><StatusChip status={item.status} /></TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" onClick={() => { setSelectedItem(item); setView("view"); }} sx={{ color: PRIMARY_TEAL, bgcolor: "#F0F5F6" }}>
                                <VisibilityOutlined fontSize="small" />
                              </IconButton>
                              {stage.allowEdit && (
                                <IconButton size="small" onClick={() => { setSelectedItem(item); setView("edit"); }} sx={{ bgcolor: "#F1F5F9" }}>
                                  <EditOutlined fontSize="small" />
                                </IconButton>
                              )}
                              <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })} sx={{ color: "#EF4444", bgcolor: "#FEF2F2" }}>
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </Fragment>
                  ))}
                </AnimatePresence>
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontWeight: 600 }}>
                      {initialLoading ? (
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} py={2}>
                          <CircularProgress size={20} sx={{ color: PRIMARY_TEAL }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748B" }}>Syncing pipeline...</Typography>
                        </Stack>
                      ) : (
                        stage.emptyMessage
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748B" }}>TOTAL: {displayData.length}</Typography>
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                    {stage.nextStatus && stage.nextStatusLabel && (
                      <Button variant="contained" size="small" startIcon={<GroupOutlined />}
                        onClick={handleMoveToNext}
                        sx={{ bgcolor: PRIMARY_TEAL, fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#002d35" } }}>
                        Create Move Group ({selected.length})
                      </Button>
                    )}
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Manual Status (no group)</InputLabel>
                      <Select value={bulkStatus} label="Manual Status (no group)" onChange={handleBulkStatusUpdate} sx={{ borderRadius: "8px", fontSize: "0.75rem" }}>
                        <MenuItem value="" disabled><em>Select status</em></MenuItem>
                        {ALL_STATUS_OPTIONS.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button size="small" variant="contained" color="error" onClick={handleBulkDelete} startIcon={<DeleteOutline />}>
                      Delete ({selected.length})
                    </Button>
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
          <Pagination count={Math.max(1, Math.ceil(displayData.length / rowsPerPage))} page={page} onChange={(_, v) => setPage(v)} />
        </Paper>
        </>
        )}

        {tabIndex === 1 && (
          <MoveGroupsHistory
            outgoing={moveGroups}
            incoming={incomingGroups}
            loading={groupsLoading}
            nextStatus={stage.nextStatus}
            nextStatusLabel={stage.nextStatusLabel}
            onViewGroup={(g) => { setActiveGroup(g); setGroupDialogOpen(true); }}
            onBulkMoveGroups={handleBulkMoveGroups}
            onBulkStatusUpdateGroups={handleBulkStatusUpdateGroups}
            onBulkDeleteGroups={handleBulkDeleteGroups}
          />
        )}

        {history.length > 0 && tabIndex === 0 && (
          <Paper elevation={0} sx={{ mt: 3, p: 2.5, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <HistoryToggleOffOutlined sx={{ color: PRIMARY_TEAL }} />
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: PRIMARY_TEAL }}>RECENT ACTIVITY</Typography>
            </Stack>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4,1fr)" }, gap: 2 }}>
              {history.map((log, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutline sx={{ fontSize: 16, color: "#10B981" }} />
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 600 }}>{log}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        )}

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "16px", maxWidth: 380 } }}>
          <Box textAlign="center" p={3}>
            <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 48, mb: 2 }} />
            <Typography sx={{ fontWeight: 800, mb: 3 }}>Delete this booking permanently?</Typography>
            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="outlined" onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
              <Button fullWidth variant="contained" color="error" onClick={handleDelete}>Delete</Button>
            </Stack>
          </Box>
        </Dialog>

        <Dialog open={moveDialogOpen} onClose={() => !moving && setMoveDialogOpen(false)} PaperProps={{ sx: { borderRadius: "16px", maxWidth: 520 } }}>
          <Box p={3}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <GroupOutlined sx={{ color: PRIMARY_TEAL, fontSize: 32 }} />
              <Box>
                <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "1.1rem" }}>Create Move Group</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>
                  Confirm each package by tracking number before moving
                </Typography>
              </Box>
            </Stack>
            {selectedHasDuplicates && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8rem" }}>
                Selected list includes clients with similar names. Verify tracking numbers below.
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: "10px", bgcolor: "#F8FAFC", maxHeight: 220, overflow: "auto" }}>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748B", mb: 1 }}>PACKAGES IN THIS GROUP</Typography>
              {selectedBookings.map(b => (
                <Stack key={b._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75, borderBottom: "1px solid #E2E8F0" }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.8rem", color: PRIMARY_TEAL }}>{b.tracking_number}</Typography>
                    <Typography sx={{ fontSize: "0.72rem" }}>{b.sender_name} · IQAMA {b.sender_iqama}</Typography>
                  </Box>
                  <Tooltip title="Copy tracking">
                    <IconButton size="small" onClick={() => { navigator.clipboard.writeText(b.tracking_number); notify("Copied", "success"); }}>
                      <ContentCopyOutlined sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: "10px", bgcolor: "#F8FAFC" }}>
              <Typography sx={{ fontSize: "0.8rem", mb: 0.5 }}><strong>From:</strong> {stage.title}</Typography>
              <Typography sx={{ fontSize: "0.8rem", mb: 0.5 }}><strong>To:</strong> {stage.nextStatusLabel}</Typography>
              <Typography sx={{ fontSize: "0.8rem" }}><strong>Count:</strong> {selected.length} package(s)</Typography>
            </Paper>
            <TextField
              fullWidth
              size="small"
              label="Notes (optional)"
              placeholder="e.g. Morning collection batch, Container #12..."
              value={moveNotes}
              onChange={e => setMoveNotes(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="outlined" disabled={moving} onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
              <Button fullWidth variant="contained" disabled={moving} onClick={confirmMoveGroup}
                startIcon={moving ? undefined : <ArrowForwardOutlined />}
                sx={{ bgcolor: PRIMARY_TEAL, fontWeight: 700, "&:hover": { bgcolor: "#002d35" } }}>
                {moving ? "Creating Group..." : "Create Group & Move"}
              </Button>
            </Stack>
          </Box>
        </Dialog>

        <MoveGroupDetailDialog
          open={groupDialogOpen}
          group={activeGroup}
          onClose={() => setGroupDialogOpen(false)}
        />

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
