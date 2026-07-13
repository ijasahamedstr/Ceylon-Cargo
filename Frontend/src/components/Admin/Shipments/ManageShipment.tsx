import { API_BASE_URL } from "@/config/api";
import { apiFetch } from "@/services/apiFetch";
import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Snackbar, Alert
} from "@mui/material";
import {
  ArrowBackIosNewOutlined, AddOutlined, DeleteOutline, EditOutlined,
  FileDownloadOutlined, WarningAmberRounded
} from "@mui/icons-material";

const primaryTeal = "#004652";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";

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
}

interface ManifestItem {
  _id: string;
  serialNo: number;
  hblNo: string;
  remarks: string;
  shipperAddress: string;
  brn: string;
  consigneeName: string;
  consigneeAddress: string;
  pkgType: string;
  volumeCbm: number;
  noOfPkgs: number;
  weightKg: number;
}

interface Props { shipmentData: ShipmentData; onBack: () => void; }

const emptyForm = {
  hblNo: "", remarks: "", shipperAddress: "", brn: "",
  consigneeName: "", consigneeAddress: "", pkgType: "",
  volumeCbm: 0, noOfPkgs: 0, weightKg: 0
};

const ManageShipment = ({ shipmentData, onBack }: Props) => {
  const [items, setItems] = useState<ManifestItem[]>([]);
  const [totals, setTotals] = useState({ totalVolumeCbm: 0, totalWeightKg: 0, totalPkgs: 0 });
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ManifestItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const notify = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const fetchItems = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/shipments/${shipmentData._id}`);
      const json = await res.json();
      if (json.success) { setItems(json.data.items); setTotals(json.data.totals); }
    } catch {}
  }, [shipmentData._id]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAddItem = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/shipments/${shipmentData._id}/items`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) { setAddOpen(false); setForm(emptyForm); fetchItems(); notify("Item added", "success"); }
    } catch { notify("Failed to add item", "error"); }
    finally { setSaving(false); }
  };

  const handleEditItem = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/items/${editItem._id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (res.ok) { setEditItem(null); setForm(emptyForm); fetchItems(); notify("Item updated", "success"); }
    } catch { notify("Failed to update item", "error"); }
    finally { setSaving(false); }
  };

  const handleDeleteItem = async () => {
    if (!deleteId) return;
    setItems(prev => prev.filter(i => i._id !== deleteId));
    setDeleteId(null);
    try {
      await apiFetch(`/api/items/${deleteId}`, { method: "DELETE" });
      fetchItems(); notify("Item deleted", "success");
    } catch { notify("Delete failed", "error"); fetchItems(); }
  };

  const handleExportManifest = () => {
    window.open(`${API_BASE_URL}/api/shipments/${shipmentData._id}/manifest`, "_blank");
  };

  const openEdit = (item: ManifestItem) => {
    setEditItem(item);
    setForm({
      hblNo: item.hblNo, remarks: item.remarks, shipperAddress: item.shipperAddress,
      brn: item.brn, consigneeName: item.consigneeName, consigneeAddress: item.consigneeAddress,
      pkgType: item.pkgType, volumeCbm: item.volumeCbm, noOfPkgs: item.noOfPkgs, weightKg: item.weightKg
    });
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontFamily: primaryFont, fontSize: "0.8rem",
      bgcolor: "#FFF", "& fieldset": { borderColor },
      "&:hover fieldset": { borderColor: primaryTeal },
      "&.Mui-focused fieldset": { borderColor: primaryTeal },
    }
  };

  const lbl = (text: string) => (
    <InputLabel sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.65rem", mb: 0.5, color: "#64748B" }}>
      {text}
    </InputLabel>
  );

  const ItemForm = () => (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      <Stack direction="row" spacing={2}>
        <Box flex={1}>
          {lbl("HBL NO")}
          <TextField fullWidth size="small" value={form.hblNo}
            onChange={e => setForm(p => ({ ...p, hblNo: e.target.value }))} sx={inputStyle} />
        </Box>
        <Box flex={1}>
          {lbl("BRN")}
          <TextField fullWidth size="small" value={form.brn}
            onChange={e => setForm(p => ({ ...p, brn: e.target.value }))} placeholder="Business Reg. No." sx={inputStyle} />
        </Box>
      </Stack>
      <Box>
        {lbl("SHIPPER ADDRESS")}
        <TextField fullWidth size="small" multiline rows={2} value={form.shipperAddress}
          onChange={e => setForm(p => ({ ...p, shipperAddress: e.target.value }))} sx={inputStyle} />
      </Box>
      <Stack direction="row" spacing={2}>
        <Box flex={1}>
          {lbl("CONSIGNEE NAME")}
          <TextField fullWidth size="small" value={form.consigneeName}
            onChange={e => setForm(p => ({ ...p, consigneeName: e.target.value }))} sx={inputStyle} />
        </Box>
        <Box flex={1}>
          {lbl("TYPE OF PACKAGE")}
          <TextField fullWidth size="small" value={form.pkgType}
            onChange={e => setForm(p => ({ ...p, pkgType: e.target.value }))} placeholder="e.g. Carton" sx={inputStyle} />
        </Box>
      </Stack>
      <Box>
        {lbl("CONSIGNEE ADDRESS")}
        <TextField fullWidth size="small" multiline rows={2} value={form.consigneeAddress}
          onChange={e => setForm(p => ({ ...p, consigneeAddress: e.target.value }))} sx={inputStyle} />
      </Box>
      <Stack direction="row" spacing={2}>
        {[
          { label: "VOL (CBM)", key: "volumeCbm" },
          { label: "NO OF PKGS", key: "noOfPkgs" },
          { label: "WEIGHT (KG)", key: "weightKg" },
        ].map(f => (
          <Box key={f.key} flex={1}>
            {lbl(f.label)}
            <TextField fullWidth size="small" type="number" value={(form as any)[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))} sx={inputStyle} />
          </Box>
        ))}
      </Stack>
      <Box>
        {lbl("REMARKS")}
        <TextField fullWidth size="small" value={form.remarks}
          onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} sx={inputStyle} />
      </Box>
    </Stack>
  );

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button onClick={onBack} startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />}
          sx={{ fontFamily: primaryFont, color: "#64748B", textTransform: "none", fontWeight: 700 }}>
          Back to Shipments
        </Button>
        <Button variant="contained" startIcon={<FileDownloadOutlined />} onClick={handleExportManifest}
          sx={{ fontFamily: primaryFont, fontWeight: 700, textTransform: "none", bgcolor: primaryTeal, borderRadius: "8px", "&:hover": { bgcolor: "#002d35" } }}>
          Export Manifest Excel
        </Button>
      </Stack>

      {/* Shipment Info */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: `1px solid ${borderColor}`, mb: 3 }}>
        <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal, fontSize: "1.1rem", mb: 2 }}>
          Shipment Details
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 3 }}>
          {[
            { label: "CONTAINER NO", value: shipmentData.containerNo },
            { label: "TYPE", value: shipmentData.containerType },
            { label: "VESSEL", value: shipmentData.vessel },
            { label: "VOYAGE NO", value: shipmentData.voyageNo },
            { label: "SEAL NO", value: shipmentData.sealNo },
            { label: "PORT", value: shipmentData.portCode },
            { label: "ETA", value: fmtDate(shipmentData.eta) },
            { label: "ETD", value: fmtDate(shipmentData.etd) },
          ].map(f => (
            <Box key={f.label}>
              <Typography sx={{ fontFamily: primaryFont, fontSize: "0.6rem", fontWeight: 800, color: "#94A3B8", letterSpacing: 1 }}>{f.label}</Typography>
              <Typography sx={{ fontFamily: primaryFont, fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{f.value || "—"}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Manifest Items Table */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: `1px solid ${borderColor}`, overflow: "hidden", mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center"
          sx={{ px: 3, py: 2, borderBottom: `1px solid ${borderColor}` }}>
          <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal, fontSize: "0.9rem" }}>
            Manifest Items ({items.length})
          </Typography>
          <Button size="small" variant="contained" startIcon={<AddOutlined />} onClick={() => setAddOpen(true)}
            sx={{ bgcolor: primaryTeal, fontFamily: primaryFont, fontWeight: 700, textTransform: "none", borderRadius: "8px" }}>
            Add Item
          </Button>
        </Stack>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                {["S/N", "HBL NO", "SHIPPER ADDRESS", "BRN", "CONSIGNEE", "TYPE PKG", "CBM", "PKGS", "KG", "REMARKS", ""].map(h => (
                  <TableCell key={h} sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.6rem", color: "#64748B", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(item => (
                <TableRow key={item._id} hover>
                  <TableCell sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.75rem" }}>{item.serialNo}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontWeight: 700, color: primaryTeal, fontSize: "0.75rem", whiteSpace: "nowrap" }}>{item.hblNo}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.75rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.shipperAddress}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.75rem" }}>{item.brn}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.75rem", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.consigneeName}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.75rem" }}>{item.pkgType}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.75rem" }}>{item.volumeCbm}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.75rem" }}>{item.noOfPkgs}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.75rem" }}>{item.weightKg}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontSize: "0.7rem", color: "#64748B" }}>{item.remarks}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: "#475569", bgcolor: "#F1F5F9" }}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(item._id)} sx={{ color: "#EF4444", bgcolor: "#FEF2F2" }}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} sx={{ textAlign: "center", py: 6, fontFamily: primaryFont, color: "#94A3B8", fontWeight: 600 }}>
                    No items yet. Click "Add Item" to begin.
                  </TableCell>
                </TableRow>
              )}

              {items.length > 0 && (
                <TableRow sx={{ bgcolor: "#F0F5F6" }}>
                  <TableCell colSpan={6} sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.75rem", color: primaryTeal }}>TOTALS</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.8rem" }}>{totals.totalVolumeCbm.toFixed(3)}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.8rem" }}>{totals.totalPkgs}</TableCell>
                  <TableCell sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.8rem" }}>{totals.totalWeightKg.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setForm(emptyForm); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}>
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal }}>Add Manifest Item</DialogTitle>
        <DialogContent><ItemForm /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setAddOpen(false); setForm(emptyForm); }} sx={{ fontFamily: primaryFont, fontWeight: 700, color: "#94A3B8" }}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={saving}
            sx={{ bgcolor: primaryTeal, fontFamily: primaryFont, fontWeight: 700, borderRadius: "10px" }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Add Item"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={Boolean(editItem)} onClose={() => { setEditItem(null); setForm(emptyForm); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}>
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal }}>Edit Manifest Item</DialogTitle>
        <DialogContent><ItemForm /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setEditItem(null); setForm(emptyForm); }} sx={{ fontFamily: primaryFont, fontWeight: 700, color: "#94A3B8" }}>Cancel</Button>
          <Button onClick={handleEditItem} variant="contained" disabled={saving}
            sx={{ bgcolor: primaryTeal, fontFamily: primaryFont, fontWeight: 700, borderRadius: "10px" }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: 360 } }}>
        <Box textAlign="center" p={3}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 32 }} />
          </Box>
          <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, color: "#1E293B", mb: 1 }}>Delete Item?</Typography>
          <Typography sx={{ fontFamily: primaryFont, color: "#64748B", fontSize: "0.85rem", mb: 3 }}>This manifest line item will be permanently removed.</Typography>
          <Stack direction="row" spacing={2}>
            <Button fullWidth onClick={() => setDeleteId(null)} variant="outlined"
              sx={{ fontFamily: primaryFont, fontWeight: 700, color: "#64748B", borderColor: "#CBD5E1" }}>Cancel</Button>
            <Button fullWidth onClick={handleDeleteItem} variant="contained"
              sx={{ bgcolor: "#EF4444", fontFamily: primaryFont, fontWeight: 700 }}>Delete</Button>
          </Stack>
        </Box>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "8px", fontWeight: 700, fontFamily: primaryFont }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageShipment;
