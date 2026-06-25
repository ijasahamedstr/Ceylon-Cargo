import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Stack, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, TextField,
  Pagination, Tooltip, Checkbox, Chip, Snackbar, Alert,
  Breadcrumbs, ThemeProvider, createTheme, Dialog, Select,
  MenuItem, FormControl
} from "@mui/material";
import {
  DeleteOutline, EditOutlined, SearchOutlined,
  DirectionsBoatOutlined, FileDownloadOutlined, NavigateNext,
  HistoryToggleOffOutlined, CheckCircleOutline, WarningAmberRounded,
  AddOutlined, FolderOpenOutlined
} from "@mui/icons-material";

import CreateShipment from "./CreateShipment";
import UpdateShipment from "./UpdateShipment";
import ManageShipment from "./ManageShipment";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const CACHE_KEY = "SHIPMENT_VAULT";
const PRIMARY_TEAL = "#004652";

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

interface ShipmentData {
  _id: string;
  containerNo: string;
  containerType: string;
  vessel: string;
  voyageNo: string;
  sealNo: string;
  eta: string;
  etd: string;
  portCode: string;
  createdAt: string;
}

type View = "list" | "create" | "edit" | "manage";

const ShipmentManager = () => {
  const [data, setData] = useState<ShipmentData[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });

  const [view, setView] = useState<View>("list");
  const [selectedItem, setSelectedItem] = useState<ShipmentData | null>(null);
  const [syncStatus, setSyncStatus] = useState<"online" | "offline">("online");
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [portFilter, setPortFilter] = useState("");
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const rowsPerPage = 8;

  const notify = (message: string, severity: "success" | "error") => setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    try {
      const url = portFilter
        ? `${API_BASE_URL}/api/shipments?port=${portFilter}`
        : `${API_BASE_URL}/api/shipments`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const newStr = JSON.stringify(json.data);
      if (localStorage.getItem(CACHE_KEY) !== newStr) {
        setData(json.data);
        localStorage.setItem(CACHE_KEY, newStr);
      }
      setSyncStatus("online");
    } catch { setSyncStatus("offline"); }
  }, [portFilter]);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 5000); return () => clearInterval(i); }, [fetchData]);
  useEffect(() => { setPage(1); }, [searchQuery, portFilter]);

  const handleDelete = async () => {
    const id = deleteDialog.id;
    if (!id) return;
    const updated = data.filter(d => d._id !== id);
    setData(updated); localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null });
    setSelected(prev => prev.filter(i => i !== id));
    try {
      await fetch(`${API_BASE_URL}/api/shipments/${id}`, { method: "DELETE" });
      notify("Shipment deleted", "success");
      setHistory(prev => [`Deleted shipment ${id.slice(-6).toUpperCase()}`, ...prev].slice(0, 8));
    } catch { fetchData(); notify("Delete failed", "error"); }
  };

  const handleBulkDelete = async () => {
    const updated = data.filter(d => !selected.includes(d._id));
    setData(updated); localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    const count = selected.length; const ids = [...selected]; setSelected([]);
    notify(`Deleting ${count} shipments...`, "success");
    setHistory(prev => [`Bulk deleted ${count} shipments`, ...prev].slice(0, 8));
    ids.forEach(async id => {
      try { await fetch(`${API_BASE_URL}/api/shipments/${id}`, { method: "DELETE" }); } catch {}
    });
  };

  const exportCSV = () => {
    const rows = filteredData.map(d =>
      `${d._id},"${d.containerNo}","${d.vessel}","${d.voyageNo}","${d.portCode}",${d.eta ? new Date(d.eta).toLocaleDateString() : ""},${d.etd ? new Date(d.etd).toLocaleDateString() : ""}`
    );
    const blob = new Blob([`ID,ContainerNo,Vessel,VoyageNo,Port,ETA,ETD\n${rows.join("\n")}`], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "shipments.csv"; a.click();
    notify("CSV exported", "success");
  };

  // Unique port codes for filter dropdown
  const portCodes = useMemo(() => [...new Set(data.map(d => d.portCode).filter(Boolean))], [data]);

  const filteredData = useMemo(() =>
    data.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchSearch = d.containerNo?.toLowerCase().includes(q) || d.vessel?.toLowerCase().includes(q) || d.voyageNo?.toLowerCase().includes(q);
      return matchSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data, searchQuery]
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(e.target.checked ? paginatedData.map(d => d._id) : []);
  const handleSelectOne = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const goBack = () => { setView("list"); setSelectedItem(null); fetchData(); };

  if (view === "create") return <ThemeProvider theme={montserratTheme}><CreateShipment onBack={goBack} /></ThemeProvider>;
  if (view === "edit" && selectedItem) return <ThemeProvider theme={montserratTheme}><UpdateShipment itemData={selectedItem} onBack={goBack} /></ThemeProvider>;
  if (view === "manage" && selectedItem) return <ThemeProvider theme={montserratTheme}><ManageShipment shipmentData={selectedItem} onBack={goBack} /></ThemeProvider>;

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <ThemeProvider theme={montserratTheme}>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }} mb={3} spacing={2}>
          <Box>
            <Breadcrumbs separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />} sx={{ mb: 0.5 }}>
              <Typography color="inherit" sx={{ fontSize: "0.65rem", fontWeight: 700 }}>DASHBOARD</Typography>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: PRIMARY_TEAL }}>SHIPMENTS</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "1.4rem" }}>Shipment Manager</Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncStatus === "online" ? "#10B981" : "#EF4444" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B" }}>
                {syncStatus === "online" ? "LIVE SYNC ACTIVE" : "OFFLINE MODE"}
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={exportCSV} startIcon={<FileDownloadOutlined fontSize="small" />}
              sx={{ color: PRIMARY_TEAL, borderColor: PRIMARY_TEAL, borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem" }}>
              Export CSV
            </Button>
            <Button variant="contained" onClick={() => setView("create")} startIcon={<AddOutlined fontSize="small" />}
              sx={{ bgcolor: PRIMARY_TEAL, borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", boxShadow: "0 4px 12px rgba(0,70,82,0.15)", "&:hover": { bgcolor: "#002d35" } }}>
              New Shipment
            </Button>
          </Stack>
        </Stack>

        {/* Search + Port Filter */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Paper elevation={0} sx={{ flex: 2, p: 1, px: 2, borderRadius: "8px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2 }}>
            <TextField fullWidth size="small" variant="standard" placeholder="Search by container, vessel or voyage no..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true, startAdornment: <SearchOutlined sx={{ mr: 1, color: PRIMARY_TEAL, fontSize: "1.2rem" }} />, sx: { fontWeight: 600, fontSize: "0.85rem" } }} />
          </Paper>
          <FormControl sx={{ flex: 1 }} size="small">
            <Select value={portFilter} onChange={e => setPortFilter(e.target.value)} displayEmpty
              sx={{ borderRadius: "8px", fontFamily: "'Montserrat', sans-serif", fontSize: "0.85rem", fontWeight: 600, bgcolor: "#FFF", border: "1px solid #E2E8F0" }}>
              <MenuItem value="" sx={{ fontFamily: "'Montserrat', sans-serif" }}>All Ports</MenuItem>
              {portCodes.map(code => (
                <MenuItem key={code} value={code} sx={{ fontFamily: "'Montserrat', sans-serif" }}>{code}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            <Table size="medium" sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                      checked={paginatedData.length > 0 && selected.length === paginatedData.length} onChange={handleSelectAll} />
                  </TableCell>
                  {["CONTAINER", "VESSEL / VOYAGE", "PORT", "ETA", "ETD", "CREATED", "ACTIONS"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B", letterSpacing: 0.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {paginatedData.map(item => (
                    <TableRow key={item._id} hover component={motion.tr as any} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={selected.includes(item._id)} onChange={() => handleSelectOne(item._id)} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#F0F5F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <DirectionsBoatOutlined sx={{ color: PRIMARY_TEAL, fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem" }}>{item.containerNo}</Typography>
                            <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>{item.containerType || "—"}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.vessel || "—"}</Typography>
                        <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>Voyage: {item.voyageNo || "—"}</Typography>
                      </TableCell>
                      <TableCell>
                        {item.portCode
                          ? <Chip label={item.portCode} size="small" sx={{ bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 800, fontSize: "0.7rem" }} />
                          : <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem" }}>—</Typography>
                        }
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#475569" }}>{fmtDate(item.eta)}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#475569" }}>{fmtDate(item.etd)}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{fmtDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Manage Manifest">
                            <IconButton size="small" onClick={() => { setSelectedItem(item); setView("manage"); }}
                              sx={{ color: PRIMARY_TEAL, bgcolor: "#F0F5F6", "&:hover": { bgcolor: "#E2EDF0" } }}>
                              <FolderOpenOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Shipment">
                            <IconButton size="small" onClick={() => { setSelectedItem(item); setView("edit"); }}
                              sx={{ color: "#475569", bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" } }}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })}
                              sx={{ color: "#EF4444", bgcolor: "#FEF2F2", "&:hover": { bgcolor: "#FEE2E2" } }}>
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontWeight: 600 }}>
                      No shipments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748B" }}>TOTAL: {filteredData.length}</Typography>
            <AnimatePresence>
              {selected.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <Button size="small" variant="contained" color="error" onClick={handleBulkDelete}
                    startIcon={<DeleteOutline sx={{ fontSize: "1rem" }} />}
                    sx={{ fontWeight: 700, fontSize: "0.7rem", px: 2, borderRadius: "6px" }}>
                    DELETE SELECTED ({selected.length})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
          <Pagination count={Math.ceil(filteredData.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)}
            sx={{ "& .Mui-selected": { bgcolor: `${PRIMARY_TEAL} !important`, color: "#FFF", fontWeight: 800 }, "& .MuiPaginationItem-root": { fontWeight: 600, fontSize: "0.8rem" } }} />
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <HistoryToggleOffOutlined sx={{ color: PRIMARY_TEAL, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: PRIMARY_TEAL }}>RECENT ACTIVITY</Typography>
            </Stack>
            {history.length === 0
              ? <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", fontStyle: "italic" }}>No changes in this session.</Typography>
              : <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 2 }}>
                  {history.map((log, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CheckCircleOutline sx={{ fontSize: 16, color: "#10B981" }} />
                      <Typography sx={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600 }}>{log}</Typography>
                    </Paper>
                  ))}
                </Box>
            }
          </Paper>
        </Box>

        {/* Delete Confirm */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: 380 } }}>
          <Box textAlign="center" p={3}>
            <Box sx={{ width: 70, height: 70, borderRadius: "50%", bgcolor: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
              <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 36 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: "#1E293B", fontSize: "1.1rem", mb: 1 }}>Delete Shipment?</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontWeight: 500, fontSize: "0.85rem", lineHeight: 1.5 }}>
              All manifest line items for this shipment will also be permanently deleted.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button size="large" onClick={() => setDeleteDialog({ open: false, id: null })} fullWidth variant="outlined"
                sx={{ fontWeight: 700, color: "#64748B", borderColor: "#CBD5E1" }}>Cancel</Button>
              <Button size="large" onClick={handleDelete} fullWidth variant="contained"
                sx={{ bgcolor: "#EF4444", fontWeight: 700, "&:hover": { bgcolor: "#DC2626" } }}>Delete</Button>
            </Stack>
          </Box>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "8px", fontWeight: 700 }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ShipmentManager;
