import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Stack, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, TextField,
  Pagination, Tooltip, Checkbox, Snackbar, Alert, Breadcrumbs,
  ThemeProvider, createTheme, Dialog, InputLabel, CircularProgress,
  Divider
} from "@mui/material";
import {
  DeleteOutline, EditOutlined, SearchOutlined, FlightTakeoffOutlined,
  FileDownloadOutlined, NavigateNext, HistoryToggleOffOutlined,
  CheckCircleOutline, WarningAmberRounded, AddOutlined, FolderOpenOutlined,
  ArrowBackIosNewOutlined
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001";
const CACHE = "AIR_MANIFEST_VAULT";
const TEAL  = "#004652";
const GOLD  = "#CC9D2F";
const FONT  = "'Montserrat', sans-serif";
const BORDER = "#E2E8F0";

const theme = createTheme({
  typography: { fontFamily: FONT, allVariants: { fontFamily: FONT } },
  components: {
    MuiButton:        { styleOverrides: { root: { fontFamily: FONT, textTransform: "none" } } },
    MuiTableCell:     { styleOverrides: { root: { fontFamily: FONT } } },
    MuiInputBase:     { styleOverrides: { root: { fontFamily: FONT } } },
    MuiChip:          { styleOverrides: { root: { fontFamily: FONT } } },
    MuiAlert:         { styleOverrides: { root: { fontFamily: FONT } } },
    MuiPaginationItem:{ styleOverrides: { root: { fontFamily: FONT } } },
  }
});

interface AirManifest { _id: string; containerNo: string; manifestNo: string; date: string; createdAt: string; }
interface AirItem {
  _id: string; serialNo: number; awbNo: string; hblNo: string; brn: string;
  shipper: string; consigneeName: string; pkgType: string;
  volumeCbm: number; noOfPkgs: number; weightKg: number; remarks: string;
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontFamily: FONT, fontSize: "0.85rem", bgcolor: "#fff",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: TEAL },
    "&.Mui-focused fieldset": { borderColor: TEAL },
  }
};
const lbl = (t: string) => <InputLabel sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.65rem", mb: 0.5, color: "#64748B" }}>{t}</InputLabel>;

// ── Manage (items) view ────────────────────────────────────────────────────────
function ManageAirManifest({ manifest, onBack }: { manifest: AirManifest; onBack: () => void }) {
  const [items,  setItems]  = useState<AirItem[]>([]);
  const [totals, setTotals] = useState({ totalVolumeCbm: 0, totalWeightKg: 0, totalPkgs: 0 });
  const [addOpen,  setAddOpen]  = useState(false);
  const [editItem, setEditItem] = useState<AirItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);
  const empty = { awbNo: "", hblNo: "", brn: "", shipper: "", consigneeName: "", pkgType: "", volumeCbm: 0, noOfPkgs: 0, weightKg: 0, remarks: "" };
  const [form, setForm] = useState(empty);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });
  const notify = (msg: string, sev: "success" | "error") => setSnack({ open: true, msg, sev });

  const fetchItems = useCallback(async () => {
    const r = await fetch(`${API}/api/air-manifests/${manifest._id}`);
    const j = await r.json();
    if (j.success) { setItems(j.data.items); setTotals(j.data.totals); }
  }, [manifest._id]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    setSaving(true);
    const r = await fetch(`${API}/api/air-manifests/${manifest._id}/items`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setAddOpen(false); setForm(empty); fetchItems(); notify("Item added", "success"); }
    else notify("Failed", "error");
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    const r = await fetch(`${API}/api/air-manifest-items/${editItem._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setEditItem(null); setForm(empty); fetchItems(); notify("Updated", "success"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setItems(p => p.filter(i => i._id !== deleteId)); setDeleteId(null);
    await fetch(`${API}/api/air-manifest-items/${deleteId}`, { method: "DELETE" });
    fetchItems(); notify("Deleted", "success");
  };

  const openEdit = (item: AirItem) => {
    setEditItem(item);
    setForm({ awbNo: item.awbNo, hblNo: item.hblNo, brn: item.brn, shipper: item.shipper, consigneeName: item.consigneeName, pkgType: item.pkgType, volumeCbm: item.volumeCbm, noOfPkgs: item.noOfPkgs, weightKg: item.weightKg, remarks: item.remarks });
  };

  const ItemForm = () => (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Stack direction="row" spacing={2}>
        <Box flex={1}>{lbl("AWB NO")}<TextField fullWidth size="small" value={form.awbNo} onChange={e => setForm(p => ({ ...p, awbNo: e.target.value }))} sx={inputSx} /></Box>
        <Box flex={1}>{lbl("HBL NO")}<TextField fullWidth size="small" value={form.hblNo} onChange={e => setForm(p => ({ ...p, hblNo: e.target.value }))} sx={inputSx} /></Box>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Box flex={1}>{lbl("BRN")}<TextField fullWidth size="small" value={form.brn} onChange={e => setForm(p => ({ ...p, brn: e.target.value }))} sx={inputSx} /></Box>
        <Box flex={1}>{lbl("TYPE OF PKG")}<TextField fullWidth size="small" value={form.pkgType} onChange={e => setForm(p => ({ ...p, pkgType: e.target.value }))} sx={inputSx} /></Box>
      </Stack>
      <Box>{lbl("SHIPPER")}<TextField fullWidth size="small" value={form.shipper} onChange={e => setForm(p => ({ ...p, shipper: e.target.value }))} sx={inputSx} /></Box>
      <Box>{lbl("CONSIGNEE NAME")}<TextField fullWidth size="small" value={form.consigneeName} onChange={e => setForm(p => ({ ...p, consigneeName: e.target.value }))} sx={inputSx} /></Box>
      <Stack direction="row" spacing={2}>
        <Box flex={1}>{lbl("VOL (CBM)")}<TextField fullWidth size="small" type="number" value={form.volumeCbm} onChange={e => setForm(p => ({ ...p, volumeCbm: parseFloat(e.target.value) || 0 }))} sx={inputSx} /></Box>
        <Box flex={1}>{lbl("NO OF PKGS")}<TextField fullWidth size="small" type="number" value={form.noOfPkgs} onChange={e => setForm(p => ({ ...p, noOfPkgs: parseInt(e.target.value) || 0 }))} sx={inputSx} /></Box>
        <Box flex={1}>{lbl("WEIGHT (KG)")}<TextField fullWidth size="small" type="number" value={form.weightKg} onChange={e => setForm(p => ({ ...p, weightKg: parseFloat(e.target.value) || 0 }))} sx={inputSx} /></Box>
      </Stack>
      <Box>{lbl("REMARKS")}<TextField fullWidth size="small" value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} sx={inputSx} /></Box>
    </Stack>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Button onClick={onBack} startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />} sx={{ fontFamily: FONT, color: "#64748B", fontWeight: 700 }}>Back</Button>
        <Button variant="contained" startIcon={<FileDownloadOutlined />} onClick={() => window.open(`${API}/api/air-manifests/${manifest._id}/export`, "_blank")}
          sx={{ fontFamily: FONT, fontWeight: 700, bgcolor: TEAL, borderRadius: "8px" }}>Export Excel</Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: `1px solid ${BORDER}`, mb: 3 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, mb: 2 }}>Air Manifest Details</Typography>
        <Stack direction="row" spacing={5}>
          {[{ label: "CONTAINER NO", value: manifest.containerNo }, { label: "MANIFEST NO", value: manifest.manifestNo }, { label: "DATE", value: manifest.date ? new Date(manifest.date).toLocaleDateString() : "—" }].map(f => (
            <Box key={f.label}>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.6rem", fontWeight: 800, color: "#94A3B8", letterSpacing: 1 }}>{f.label}</Typography>
              <Typography sx={{ fontFamily: FONT, fontWeight: 700 }}>{f.value || "—"}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "16px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL }}>Items ({items.length})</Typography>
          <Button size="small" variant="contained" startIcon={<AddOutlined />} onClick={() => setAddOpen(true)}
            sx={{ bgcolor: TEAL, fontFamily: FONT, fontWeight: 700, borderRadius: "8px" }}>Add Item</Button>
        </Stack>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                {["S/N","AWB NO","HBL NO","BRN","SHIPPER","CONSIGNEE","TYPE PKG","CBM","PKGS","KG","REMARKS",""].map(h => (
                  <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.6rem", color: "#64748B", whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow key={item._id} hover>
                  <TableCell sx={{ fontFamily: FONT, fontWeight: 700 }}>{item.serialNo}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontWeight: 700, color: TEAL }}>{item.awbNo}</TableCell>
                  <TableCell sx={{ fontFamily: FONT }}>{item.hblNo}</TableCell>
                  <TableCell sx={{ fontFamily: FONT }}>{item.brn}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.shipper}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.consigneeName}</TableCell>
                  <TableCell sx={{ fontFamily: FONT }}>{item.pkgType}</TableCell>
                  <TableCell sx={{ fontFamily: FONT }}>{item.volumeCbm}</TableCell>
                  <TableCell sx={{ fontFamily: FONT }}>{item.noOfPkgs}</TableCell>
                  <TableCell sx={{ fontFamily: FONT }}>{item.weightKg}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, color: "#64748B" }}>{item.remarks}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(item)} sx={{ color: "#475569", bgcolor: "#F1F5F9" }}><EditOutlined fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteId(item._id)} sx={{ color: "#EF4444", bgcolor: "#FEF2F2" }}><DeleteOutline fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={12} sx={{ textAlign: "center", py: 6, fontFamily: FONT, color: "#94A3B8" }}>No items yet. Click "Add Item" to begin.</TableCell></TableRow>}
              {items.length > 0 && (
                <TableRow sx={{ bgcolor: "#F0F5F6" }}>
                  <TableCell colSpan={7} sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL }}>TOTALS</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontWeight: 800 }}>{totals.totalVolumeCbm.toFixed(3)}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontWeight: 800 }}>{totals.totalPkgs}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontWeight: 800 }}>{totals.totalWeightKg.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setForm(empty); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}>
        <Box sx={{ px: 3, pt: 3, pb: 1 }}><Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: "1rem" }}>Add Air Manifest Item</Typography></Box>
        <Box sx={{ px: 3, pb: 1 }}><ItemForm /></Box>
        <Stack direction="row" spacing={2} sx={{ px: 3, py: 2 }} justifyContent="flex-end">
          <Button onClick={() => { setAddOpen(false); setForm(empty); }} sx={{ fontFamily: FONT, color: "#94A3B8", fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={saving} sx={{ bgcolor: TEAL, fontFamily: FONT, fontWeight: 700, borderRadius: "10px" }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Add Item"}
          </Button>
        </Stack>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(editItem)} onClose={() => { setEditItem(null); setForm(empty); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}>
        <Box sx={{ px: 3, pt: 3, pb: 1 }}><Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: "1rem" }}>Edit Item</Typography></Box>
        <Box sx={{ px: 3, pb: 1 }}><ItemForm /></Box>
        <Stack direction="row" spacing={2} sx={{ px: 3, py: 2 }} justifyContent="flex-end">
          <Button onClick={() => { setEditItem(null); setForm(empty); }} sx={{ fontFamily: FONT, color: "#94A3B8", fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={saving} sx={{ bgcolor: TEAL, fontFamily: FONT, fontWeight: 700, borderRadius: "10px" }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
          </Button>
        </Stack>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: "16px", p: 1, maxWidth: 360 } } }}>
        <Box textAlign="center" p={3}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 32 }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, mb: 1 }}>Delete Item?</Typography>
          <Stack direction="row" spacing={2} mt={2}>
            <Button fullWidth onClick={() => setDeleteId(null)} variant="outlined" sx={{ fontFamily: FONT, fontWeight: 700, color: "#64748B", borderColor: "#CBD5E1" }}>Cancel</Button>
            <Button fullWidth onClick={handleDelete} variant="contained" sx={{ bgcolor: "#EF4444", fontFamily: FONT, fontWeight: 700 }}>Delete</Button>
          </Stack>
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "8px", fontWeight: 700, fontFamily: FONT }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

// ── Main list view ─────────────────────────────────────────────────────────────
type View = "list" | "create" | "edit" | "manage";

export default function AirManifestManager() {
  const [data, setData] = useState<AirManifest[]>(() => { try { return JSON.parse(localStorage.getItem(CACHE) || "[]"); } catch { return []; } });
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<AirManifest | null>(null);
  const [checked, setChecked]   = useState<string[]>([]);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [history, setHistory]   = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });
  const [sync, setSync] = useState<"online"|"offline">("online");
  const rowsPerPage = 8;

  // Create/Edit form state
  const emptyForm = { containerNo: "", manifestNo: "", date: new Date().toISOString().split("T")[0] };
  const [form, setForm]     = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const notify = (msg: string, sev: "success"|"error") => setSnack({ open: true, msg, sev });

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/air-manifests`);
      const j = await r.json();
      const str = JSON.stringify(j.data);
      if (localStorage.getItem(CACHE) !== str) { setData(j.data); localStorage.setItem(CACHE, str); }
      setSync("online");
    } catch { setSync("offline"); }
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 5000); return () => clearInterval(i); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const handleSave = async () => {
    if (!form.containerNo || !form.manifestNo) { notify("Container No and Manifest No are required", "error"); return; }
    setSaving(true);
    const url    = view === "edit" && selected ? `${API}/api/air-manifests/${selected._id}` : `${API}/api/air-manifests`;
    const method = view === "edit" ? "PUT" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setView("list"); fetchData(); notify(view === "edit" ? "Updated" : "Created", "success"); setHistory(p => [`${view === "edit" ? "Updated" : "Created"} ${form.manifestNo}`, ...p].slice(0, 8)); }
    else notify("Failed", "error");
    setSaving(false);
  };

  const handleDelete = async () => {
    const id = deleteDialog.id; if (!id) return;
    const updated = data.filter(d => d._id !== id);
    setData(updated); localStorage.setItem(CACHE, JSON.stringify(updated));
    setDeleteDialog({ open: false, id: null }); setChecked(p => p.filter(i => i !== id));
    await fetch(`${API}/api/air-manifests/${id}`, { method: "DELETE" });
    fetchData(); notify("Deleted", "success");
    setHistory(p => [`Deleted ${id.slice(-6).toUpperCase()}`, ...p].slice(0, 8));
  };

  const filtered = useMemo(() =>
    data.filter(d => d.containerNo?.toLowerCase().includes(search.toLowerCase()) || d.manifestNo?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data, search]
  );
  const paginated = useMemo(() => filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage), [filtered, page]);

  const goBack = () => { setView("list"); setSelected(null); setForm(emptyForm); fetchData(); };

  // Create / Edit form
  if (view === "create" || view === "edit") return (
    <ThemeProvider theme={theme}>
      <Box>
        <Button onClick={goBack} startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />} sx={{ fontFamily: FONT, color: "#64748B", fontWeight: 700, mb: 3 }}>Back</Button>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: "24px", border: `1px solid ${BORDER}` }}>
          <Typography variant="h5" sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, mb: 4 }}>{view === "edit" ? "Edit Air Manifest" : "New Air Manifest"}</Typography>
          <Stack spacing={3}>
            <Box>{lbl("CONTAINER NO *")}<TextField fullWidth value={form.containerNo} onChange={e => setForm(p => ({ ...p, containerNo: e.target.value }))} placeholder="e.g. TCKU1234567" sx={inputSx} /></Box>
            <Box>{lbl("MANIFEST NO *")}<TextField fullWidth value={form.manifestNo} onChange={e => setForm(p => ({ ...p, manifestNo: e.target.value }))} placeholder="e.g. AM-2026-001" sx={inputSx} /></Box>
            <Box>{lbl("DATE")}<TextField fullWidth type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} sx={inputSx} /></Box>
            <Divider />
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={goBack} sx={{ fontFamily: FONT, fontWeight: 700, color: "#94A3B8" }}>Cancel</Button>
              <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ fontFamily: FONT, bgcolor: TEAL, px: 5, borderRadius: "10px", fontWeight: 800 }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : view === "edit" ? "Save Changes" : "Create"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );

  if (view === "manage" && selected) return <ThemeProvider theme={theme}><ManageAirManifest manifest={selected} onBack={goBack} /></ThemeProvider>;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%", bgcolor: "#F4F7FA", p: { xs: 1.5, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-end" }} mb={3} spacing={2}>
          <Box>
            <Breadcrumbs separator={<NavigateNext sx={{ fontSize: "0.8rem" }} />} sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700 }}>DASHBOARD</Typography>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: TEAL }}>AIR MANIFESTS</Typography>
            </Breadcrumbs>
            <Typography variant="h5" sx={{ fontWeight: 800, color: TEAL, fontSize: "1.4rem" }}>Air Manifest Manager</Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: sync === "online" ? "#10B981" : "#EF4444" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#64748B" }}>{sync === "online" ? "LIVE SYNC" : "OFFLINE"}</Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<FileDownloadOutlined />}
              onClick={() => { const rows = filtered.map(d => `${d._id},"${d.containerNo}","${d.manifestNo}"`); const b = new Blob([`ID,ContainerNo,ManifestNo\n${rows.join("\n")}`], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "air-manifests.csv"; a.click(); }}
              sx={{ color: TEAL, borderColor: TEAL, borderRadius: "8px", fontWeight: 700 }}>Export CSV</Button>
            <Button variant="contained" startIcon={<AddOutlined />} onClick={() => { setForm(emptyForm); setView("create"); }}
              sx={{ bgcolor: TEAL, borderRadius: "8px", fontWeight: 700, "&:hover": { bgcolor: "#002d35" } }}>New Air Manifest</Button>
          </Stack>
        </Stack>

        <Paper elevation={0} sx={{ p: 1, px: 2, mb: 3, borderRadius: "8px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 2 }}>
          <TextField fullWidth size="small" variant="standard" placeholder="Search by container or manifest no..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ disableUnderline: true, startAdornment: <SearchOutlined sx={{ mr: 1, color: TEAL }} /> }} />
        </Paper>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell padding="checkbox"><Checkbox size="small" indeterminate={checked.length > 0 && checked.length < paginated.length} checked={paginated.length > 0 && checked.length === paginated.length} onChange={e => setChecked(e.target.checked ? paginated.map(d => d._id) : [])} /></TableCell>
                  {["CONTAINER NO","MANIFEST NO","DATE","CREATED","ACTIONS"].map(h => <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B" }}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {paginated.map(item => (
                    <TableRow key={item._id} hover component={motion.tr as any} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <TableCell padding="checkbox"><Checkbox size="small" checked={checked.includes(item._id)} onChange={() => setChecked(p => p.includes(item._id) ? p.filter(i => i !== item._id) : [...p, item._id])} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#F0F5F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FlightTakeoffOutlined sx={{ color: TEAL, fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: TEAL, fontSize: "0.85rem" }}>{item.containerNo}</Typography>
                            <Typography variant="caption" sx={{ color: "#94A3B8" }}>ID: {item._id.slice(-6).toUpperCase()}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{item.manifestNo}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#475569" }}>{item.date ? new Date(item.date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Manage Items"><IconButton size="small" onClick={() => { setSelected(item); setView("manage"); }} sx={{ color: TEAL, bgcolor: "#F0F5F6" }}><FolderOpenOutlined fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => { setSelected(item); setForm({ containerNo: item.containerNo, manifestNo: item.manifestNo, date: item.date ? new Date(item.date).toISOString().split("T")[0] : "" }); setView("edit"); }} sx={{ color: "#475569", bgcolor: "#F1F5F9" }}><EditOutlined fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog({ open: true, id: item._id })} sx={{ color: "#EF4444", bgcolor: "#FEF2F2" }}><DeleteOutline fontSize="small" /></IconButton></Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
                {paginated.length === 0 && <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontWeight: 600 }}>No air manifests found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        <Paper elevation={0} sx={{ mt: 3, p: 2, borderRadius: "12px", border: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748B" }}>TOTAL: {filtered.length}</Typography>
            <AnimatePresence>
              {checked.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button size="small" variant="contained" color="error" startIcon={<DeleteOutline />}
                    onClick={async () => { const updated = data.filter(d => !checked.includes(d._id)); setData(updated); localStorage.setItem(CACHE, JSON.stringify(updated)); const ids = [...checked]; setChecked([]); ids.forEach(async id => { await fetch(`${API}/api/air-manifests/${id}`, { method: "DELETE" }); }); fetchData(); }}
                    sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: "6px" }}>
                    DELETE ({checked.length})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
          <Pagination count={Math.ceil(filtered.length / rowsPerPage)} page={page} onChange={(_, v) => setPage(v)}
            sx={{ "& .Mui-selected": { bgcolor: `${TEAL} !important`, color: "#FFF", fontWeight: 800 } }} />
        </Paper>

        <Paper elevation={0} sx={{ mt: 3, p: 2.5, borderRadius: "12px", border: `1px solid ${BORDER}` }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <HistoryToggleOffOutlined sx={{ color: TEAL, fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: TEAL }}>RECENT ACTIVITY</Typography>
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

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })} slotProps={{ paper: { sx: { borderRadius: "16px", p: 1, maxWidth: 380 } } }}>
          <Box textAlign="center" p={3}>
            <Box sx={{ width: 70, height: 70, borderRadius: "50%", bgcolor: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
              <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 36 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", mb: 1 }}>Delete Air Manifest?</Typography>
            <Typography sx={{ color: "#64748B", mb: 4, fontSize: "0.85rem" }}>All line items will also be permanently deleted.</Typography>
            <Stack direction="row" spacing={2}>
              <Button fullWidth onClick={() => setDeleteDialog({ open: false, id: null })} variant="outlined" sx={{ fontWeight: 700, color: "#64748B", borderColor: "#CBD5E1" }}>Cancel</Button>
              <Button fullWidth onClick={handleDelete} variant="contained" sx={{ bgcolor: "#EF4444", fontWeight: 700 }}>Delete</Button>
            </Stack>
          </Box>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "8px", fontWeight: 700 }}>{snack.msg}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
