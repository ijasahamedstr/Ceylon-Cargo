import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, TextField,
  Tooltip, Snackbar, Alert, Dialog, CircularProgress, InputLabel, Chip
} from "@mui/material";
import { DeleteOutline, EditOutlined, AddOutlined, LocationOnOutlined, WarningAmberRounded, SaveOutlined, CloseOutlined } from "@mui/icons-material";

const API   = import.meta.env.VITE_API_URL || "http://localhost:8001";
const TEAL  = "#004652";
const FONT  = "'Montserrat', sans-serif";
const BORDER = "#E2E8F0";

interface Port { _id: string; code: string; name: string; }

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontFamily: FONT, fontSize: "0.85rem", bgcolor: "#fff",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: TEAL },
    "&.Mui-focused fieldset": { borderColor: TEAL },
  }
};

export default function PortManager() {
  const [ports,   setPorts]   = useState<Port[]>([]);
  const [editRow, setEditRow] = useState<Port | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [saving,  setSaving]  = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });

  const notify = (msg: string, sev: "success"|"error") => setSnack({ open: true, msg, sev });

  const fetchPorts = useCallback(async () => {
    const r = await fetch(`${API}/api/ports`);
    const j = await r.json();
    if (j.success) setPorts(j.data);
  }, []);

  useEffect(() => { fetchPorts(); }, [fetchPorts]);

  const handleAdd = async () => {
    if (!newCode.trim() || !newName.trim()) { notify("Code and name are required", "error"); return; }
    setSaving(true);
    const r = await fetch(`${API}/api/ports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: newCode.toUpperCase(), name: newName }) });
    if (r.ok) { setNewCode(""); setNewName(""); fetchPorts(); notify("Port added", "success"); }
    else { const j = await r.json(); notify(j.message || "Failed", "error"); }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editRow) return;
    setSaving(true);
    const r = await fetch(`${API}/api/ports/${editRow._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: editRow.code, name: editRow.name }) });
    if (r.ok) { setEditRow(null); fetchPorts(); notify("Port updated", "success"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setPorts(p => p.filter(x => x._id !== deleteId)); setDeleteId(null);
    await fetch(`${API}/api/ports/${deleteId}`, { method: "DELETE" });
    fetchPorts(); notify("Port deleted", "success");
  };

  return (
    <Box sx={{ width: "100%", fontFamily: FONT }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: TEAL, fontFamily: FONT }}>Port Manager</Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontFamily: FONT }}>Manage destination port codes used across all manifests</Typography>
        </Box>
      </Stack>

      {/* Add new port */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: `1px solid ${BORDER}`, mb: 4 }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: "0.9rem", mb: 2 }}>Add New Port</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-end">
          <Box flex={1}>
            <InputLabel sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.65rem", mb: 0.5, color: "#64748B" }}>PORT CODE</InputLabel>
            <TextField fullWidth size="small" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="e.g. CMB" sx={inputSx} inputProps={{ maxLength: 5 }} />
          </Box>
          <Box flex={3}>
            <InputLabel sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.65rem", mb: 0.5, color: "#64748B" }}>PORT NAME</InputLabel>
            <TextField fullWidth size="small" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Colombo" sx={inputSx} />
          </Box>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddOutlined />}
            onClick={handleAdd} disabled={saving}
            sx={{ fontFamily: FONT, fontWeight: 800, bgcolor: TEAL, borderRadius: "10px", px: 3, py: 1.2, whiteSpace: "nowrap", flexShrink: 0 }}>
            Add Port
          </Button>
        </Stack>
      </Paper>

      {/* Ports table */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL }}>
            All Ports ({ports.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B" }}>PORT CODE</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B" }}>PORT NAME</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.7rem", color: "#64748B" }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ports.map(port => (
                <TableRow key={port._id} hover>
                  <TableCell>
                    {editRow?._id === port._id
                      ? <TextField size="small" value={editRow.code} onChange={e => setEditRow({ ...editRow, code: e.target.value.toUpperCase() })} sx={{ ...inputSx, width: 100 }} inputProps={{ maxLength: 5 }} />
                      : <Chip label={port.code} size="small" sx={{ fontFamily: FONT, fontWeight: 800, bgcolor: "#EFF6FF", color: "#1D4ED8", fontSize: "0.78rem" }} icon={<LocationOnOutlined sx={{ fontSize: "14px !important" }} />} />
                    }
                  </TableCell>
                  <TableCell>
                    {editRow?._id === port._id
                      ? <TextField size="small" value={editRow.name} onChange={e => setEditRow({ ...editRow, name: e.target.value })} sx={inputSx} />
                      : <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.9rem" }}>{port.name}</Typography>
                    }
                  </TableCell>
                  <TableCell align="right">
                    {editRow?._id === port._id ? (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Save">
                          <IconButton size="small" onClick={handleUpdate} sx={{ color: "#10B981", bgcolor: "#D1FAE5" }}>
                            <SaveOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton size="small" onClick={() => setEditRow(null)} sx={{ color: "#64748B", bgcolor: "#F1F5F9" }}>
                            <CloseOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setEditRow(port)} sx={{ color: "#475569", bgcolor: "#F1F5F9" }}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(port._id)} sx={{ color: "#EF4444", bgcolor: "#FEF2F2" }}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {ports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: "center", py: 6, fontFamily: FONT, color: "#94A3B8", fontWeight: 600 }}>
                    No ports yet. Add one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: "16px", p: 1, maxWidth: 360 } } }}>
        <Box textAlign="center" p={3}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 32 }} />
          </Box>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, mb: 1 }}>Delete Port?</Typography>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.85rem", mb: 3 }}>
            This will remove the port code from the system. Existing manifests won't be affected.
          </Typography>
          <Stack direction="row" spacing={2}>
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
