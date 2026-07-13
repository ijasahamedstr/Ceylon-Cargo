import { apiFetch } from "@/services/apiFetch";
import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Avatar, Stack,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Tooltip, Snackbar, Alert,
} from "@mui/material";
import {
  PersonOutline,
  AddOutlined,
  EditOutlined,
  DeleteOutline,
  SaveOutlined,
} from "@mui/icons-material";

const TEAL = "#004652";
const FONT = "'Montserrat', sans-serif";
const BORDER = "#E2E8F0";
const BRANCHES = ["Jeddah Office", "Riyadh Office", "Dammam Office"];
const STATUS_OPTIONS = ["Active", "Inactive"];

interface SalesPerson {
  _id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  status: string;
}

const emptyPerson = (): Omit<SalesPerson, "_id"> => ({
  name: "",
  email: "",
  phone: "",
  branch: BRANCHES[0],
  status: "Active",
});

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    fontFamily: FONT,
    fontSize: "0.85rem",
    backgroundColor: "#ffffff",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: TEAL },
    "&.Mui-focused fieldset": { borderColor: TEAL },
  },
};

const NEU_BG = "#F8FAFC";
const NEU_SHADOW = "0 4px 12px rgba(0,0,0,0.05)";

export default function SalesPersons() {
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [countsLoading, setCountsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<SalesPerson, "_id">>(emptyPerson());
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });

  const notify = (msg: string, sev: "success" | "error") => setSnack({ open: true, msg, sev });

  const fetchSalesPersons = async () => {
    const res = await apiFetch("/api/sales-persons");
    const data = await res.json();
    if (data.success) setSalesPersons(data.data || []);
  };

  const fetchBookingCounts = async () => {
    setCountsLoading(true);
    try {
      const res = await apiFetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        const counts: Record<string, number> = {};
        (data.data || []).forEach((booking: { sales_person_id?: string; sales_person_name?: string }) => {
          const owner = booking.sales_person_name || booking.sales_person_id || "Unassigned";
          counts[owner] = (counts[owner] || 0) + 1;
        });
        setBookingCounts(counts);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSalesPersons()
      .catch((error) => {
        console.error(error);
        notify("Unable to load sales persons", "error");
      })
      .finally(() => setLoading(false));
    fetchBookingCounts();
  }, []);

  const openAddForm = () => {
    setEditId(null);
    setFormState(emptyPerson());
    setFormOpen(true);
  };

  const openEditForm = (person: SalesPerson) => {
    setEditId(person._id);
    setFormState({
      name: person.name,
      email: person.email,
      phone: person.phone,
      branch: person.branch,
      status: person.status,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formState.name.trim() || !formState.email.trim()) {
      notify("Name and email are required", "error");
      return;
    }

    setSaving(true);
    try {
      const url = editId ? `/api/sales-persons/${editId}` : `/api/sales-persons`;
      const method = editId ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.message || "Save failed", "error");
        return;
      }
      notify(editId ? "Sales person updated" : "Sales person added", "success");
      setFormOpen(false);
      setEditId(null);
      await Promise.all([fetchSalesPersons(), fetchBookingCounts()]);
    } catch (error) {
      console.error(error);
      notify("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/sales-persons/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        notify(data.message || "Delete failed", "error");
        return;
      }
      notify("Sales person deleted", "success");
      setDeleteId(null);
      await Promise.all([fetchSalesPersons(), fetchBookingCounts()]);
    } catch (error) {
      console.error(error);
      notify("Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <CircularProgress sx={{ color: TEAL }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", fontFamily: FONT }}>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems="flex-start" justifyContent="space-between" mb={3} spacing={1.5}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.35rem", color: TEAL }}>Sales Persons</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.88rem" }}>Manage the sales team, branches, and booking assignments.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openAddForm}
          sx={{ bgcolor: TEAL, borderRadius: "14px", px: 2.25, py: 1, fontWeight: 800, textTransform: "none", boxShadow: NEU_SHADOW }}>
          Add Sales Person
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: "24px", bgcolor: NEU_BG, p: 1.5, boxShadow: NEU_SHADOW, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                {["Name", "Email", "Phone", "Branch", "Bookings", "Status", "Actions"].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#475569" }}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {salesPersons.map((person) => (
                <TableRow key={person._id} hover sx={{ '&:hover': { bgcolor: '#f2f8fb' } }}>
                  <TableCell sx={{ py: 1.1 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: TEAL, fontSize: "0.9rem", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}><PersonOutline fontSize="small" /></Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{person.name}</Typography>
                        <Typography sx={{ color: "#64748B", fontSize: "0.78rem" }}>{person.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", color: "#0f172a", py: 1.1 }}>{person.email}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", color: "#0f172a", py: 1.1 }}>{person.phone || "—"}</TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", color: "#0f172a", py: 1.1 }}>{person.branch}</TableCell>
                  <TableCell sx={{ py: 1.1 }}>
                    <Chip
                      label={countsLoading ? "…" : bookingCounts[person.name] || 0}
                      size="small"
                      sx={{ fontFamily: FONT, fontWeight: 700, bgcolor: `${TEAL}15`, color: TEAL, boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.08)" }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.1 }}>
                    <Chip label={person.status} size="small" color={person.status === "Active" ? "success" : "default"} sx={{ fontFamily: FONT, fontWeight: 700 }} />
                  </TableCell>
                  <TableCell sx={{ py: 1.1 }}>
                    <Stack direction="row" spacing={0.75} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditForm(person)} sx={{ color: "#475569", bgcolor: "#F8FAFC", boxShadow: "inset 1px 1px 4px rgba(0,0,0,0.06)" }}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(person._id)} sx={{ color: "#EF4444", bgcolor: "#FEF2F2", boxShadow: "inset 1px 1px 4px rgba(0,0,0,0.06)" }}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {salesPersons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 8, fontSize: "0.95rem", color: "#94A3B8" }}>
                    No sales persons found. Add a new team member to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "20px" } } }}>
        <DialogTitle sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, py: 1.25, px: 2 }}>
          {editId ? "Edit Sales Person" : "Add Sales Person"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2, px: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={formState.name}
            onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
            sx={{ ...inputSx, mb: 0 }}
            size="small"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formState.email}
            onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
            sx={{ ...inputSx, mb: 0 }}
            size="small"
          />
          <TextField
            fullWidth
            label="Phone"
            value={formState.phone}
            onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))}
            sx={{ ...inputSx, mb: 0 }}
            size="small"
          />
          <TextField
            select
            fullWidth
            label="Branch"
            value={formState.branch}
            onChange={(e) => setFormState((prev) => ({ ...prev, branch: e.target.value }))}
            sx={{ ...inputSx, mb: 0 }}
            size="small"
          >
            {BRANCHES.map((branch) => (
              <MenuItem key={branch} value={branch}>{branch}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Status"
            value={formState.status}
            onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
            sx={{ ...inputSx, mb: 0 }}
            size="small"
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1.25 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ borderRadius: "14px", fontWeight: 700, color: "#64748B", borderColor: BORDER, py: 1, px: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveOutlined />} sx={{ bgcolor: TEAL, color: "#fff", borderRadius: "14px", fontWeight: 700, py: 1, px: 2 }} disabled={saving}>
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: "16px", p: 1.5, maxWidth: 360 } } }}>
        <Box textAlign="center" p={1.5}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, mb: 1, fontSize: "1rem" }}>Delete Sales Person?</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.88rem", mb: 2.5 }}>
            This will permanently remove the sales person record from the system.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button fullWidth onClick={() => setDeleteId(null)} variant="outlined" sx={{ fontWeight: 700, color: "#64748B", borderColor: BORDER, borderRadius: "12px", py: 1 }}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleDelete} variant="contained" sx={{ bgcolor: "#EF4444", color: "#fff", fontWeight: 700, borderRadius: "12px", py: 1 }} disabled={saving}>
              Delete
            </Button>
          </Stack>
        </Box>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: "8px", fontWeight: 700, fontFamily: FONT }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
