import { useState, useEffect } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField,
  InputLabel, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  MenuItem, Select, FormControl
} from "@mui/material";
import {
  ArrowBackIosNewOutlined, DirectionsBoatOutlined,
  TagOutlined, AnchorOutlined, CalendarTodayOutlined,
  LockOutlined, LocationOnOutlined
} from "@mui/icons-material";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const primaryTeal = "#004652";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";

interface Port { _id: string; code: string; name: string; }
interface Props { onBack: () => void; }

const CreateShipment = ({ onBack }: Props) => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [form, setForm] = useState({
    containerNo: "", containerType: "", vessel: "", voyageNo: "",
    sealNo: "", eta: "", etd: "", portCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ports`)
      .then(r => r.json())
      .then(j => j.success && setPorts(j.data))
      .catch(() => {});
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSaveClick = () => {
    if (!form.containerNo.trim()) { alert("Container No is required."); return; }
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) onBack();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px", fontFamily: primaryFont, fontSize: "0.85rem",
      fontWeight: 500, bgcolor: "#FFF",
      "& fieldset": { borderColor },
      "&:hover fieldset": { borderColor: primaryTeal },
      "&.Mui-focused fieldset": { borderColor: primaryTeal },
    }
  };

  const labelStyle = {
    fontFamily: primaryFont, fontWeight: 700, fontSize: "0.7rem",
    color: "#1E293B", mb: 1, letterSpacing: "0.5px"
  };

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 3 }}>
        <Button onClick={onBack} startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />}
          sx={{ fontFamily: primaryFont, color: "#64748B", textTransform: "none", fontWeight: 700 }}>
          Back to Shipments
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: "24px", border: `1px solid ${borderColor}` }}>
        <Typography variant="h5" sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal, mb: 4 }}>
          Create New Shipment
        </Typography>

        <Stack spacing={4}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>CONTAINER NO *</InputLabel>
              <TextField fullWidth value={form.containerNo} onChange={set("containerNo")}
                placeholder="e.g. TCKU1234567" sx={inputStyle}
                InputProps={{ startAdornment: <DirectionsBoatOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>CONTAINER TYPE</InputLabel>
              <TextField fullWidth value={form.containerType} onChange={set("containerType")}
                placeholder="e.g. 40' H/C" sx={inputStyle} />
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>VESSEL NAME</InputLabel>
              <TextField fullWidth value={form.vessel} onChange={set("vessel")}
                placeholder="e.g. MSC DIANA" sx={inputStyle}
                InputProps={{ startAdornment: <AnchorOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>VOYAGE NO</InputLabel>
              <TextField fullWidth value={form.voyageNo} onChange={set("voyageNo")}
                placeholder="e.g. 026W" sx={inputStyle}
                InputProps={{ startAdornment: <TagOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
          </Stack>

          <Box>
            <InputLabel sx={labelStyle}>SEAL NO</InputLabel>
            <TextField fullWidth value={form.sealNo} onChange={set("sealNo")}
              placeholder="e.g. SL-98765" sx={inputStyle}
              InputProps={{ startAdornment: <LockOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>ETA</InputLabel>
              <TextField fullWidth type="date" value={form.eta} onChange={set("eta")} sx={inputStyle}
                InputProps={{ startAdornment: <CalendarTodayOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>ETD</InputLabel>
              <TextField fullWidth type="date" value={form.etd} onChange={set("etd")} sx={inputStyle}
                InputProps={{ startAdornment: <CalendarTodayOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
          </Stack>

          <Box>
            <InputLabel sx={labelStyle}>DESTINATION PORT</InputLabel>
            <FormControl fullWidth>
              <Select
                value={form.portCode}
                onChange={e => setForm(prev => ({ ...prev, portCode: e.target.value }))}
                displayEmpty
                startAdornment={<LocationOnOutlined sx={{ mr: 1, color: "#94A3B8" }} />}
                sx={{ borderRadius: "12px", fontFamily: primaryFont, fontSize: "0.85rem",
                  bgcolor: "#FFF", "& fieldset": { borderColor },
                  "&:hover fieldset": { borderColor: primaryTeal },
                  "&.Mui-focused fieldset": { borderColor: primaryTeal } }}
              >
                <MenuItem value="" sx={{ fontFamily: primaryFont, color: "#94A3B8" }}>Select port...</MenuItem>
                {ports.map(p => (
                  <MenuItem key={p._id} value={p.code} sx={{ fontFamily: primaryFont }}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ pt: 3, borderTop: `1px solid ${borderColor}`, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={onBack} sx={{ fontFamily: primaryFont, fontWeight: 700, color: "#94A3B8" }}>Discard</Button>
            <Button variant="contained" onClick={handleSaveClick} disabled={loading}
              sx={{ fontFamily: primaryFont, bgcolor: primaryTeal, px: 5, borderRadius: "10px", fontWeight: 800 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create Shipment"}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: "20px" } }}>
        <DialogTitle sx={{ fontFamily: primaryFont, fontWeight: 800 }}>Confirm Shipment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: primaryFont }}>
            Create shipment for container <strong>{form.containerNo}</strong>
            {form.portCode && <> destined for <strong>{form.portCode}</strong></>}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ fontFamily: primaryFont }}>Cancel</Button>
          <Button onClick={confirmSave} variant="contained"
            sx={{ bgcolor: primaryTeal, borderRadius: "10px", fontFamily: primaryFont }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateShipment;
