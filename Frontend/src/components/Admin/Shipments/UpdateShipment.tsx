import { useState, useEffect } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField,
  InputLabel, CircularProgress, MenuItem, Select, FormControl
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

interface Port { _id: string; code: string; name: string; }
interface Props { itemData: ShipmentData; onBack: () => void; }

const UpdateShipment = ({ itemData, onBack }: Props) => {
  const fmt = (d: string) => (d ? new Date(d).toISOString().split("T")[0] : "");
  const [ports, setPorts] = useState<Port[]>([]);
  const [form, setForm] = useState({
    containerNo: itemData.containerNo || "",
    containerType: itemData.containerType || "",
    vessel: itemData.vessel || "",
    voyageNo: itemData.voyageNo || "",
    sealNo: itemData.sealNo || "",
    eta: fmt(itemData.eta),
    etd: fmt(itemData.etd),
    portCode: itemData.portCode || ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/ports`)
      .then(r => r.json())
      .then(j => j.success && setPorts(j.data))
      .catch(() => {});
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleUpdate = async () => {
    if (!form.containerNo.trim()) { alert("Container No is required."); return; }
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/shipments/${itemData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onBack();
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
        <Typography variant="h5" sx={{ fontFamily: primaryFont, fontWeight: 800, color: primaryTeal, mb: 1 }}>
          Edit Shipment
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: primaryFont, color: "#94A3B8", display: "block", mb: 4 }}>
          ID: {itemData._id}
        </Typography>

        <Stack spacing={4}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>CONTAINER NO *</InputLabel>
              <TextField fullWidth value={form.containerNo} onChange={set("containerNo")} sx={inputStyle}
                InputProps={{ startAdornment: <DirectionsBoatOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>CONTAINER TYPE</InputLabel>
              <TextField fullWidth value={form.containerType} onChange={set("containerType")} sx={inputStyle} />
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>VESSEL NAME</InputLabel>
              <TextField fullWidth value={form.vessel} onChange={set("vessel")} sx={inputStyle}
                InputProps={{ startAdornment: <AnchorOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
            <Box flex={1}>
              <InputLabel sx={labelStyle}>VOYAGE NO</InputLabel>
              <TextField fullWidth value={form.voyageNo} onChange={set("voyageNo")} sx={inputStyle}
                InputProps={{ startAdornment: <TagOutlined sx={{ mr: 1, color: "#94A3B8" }} /> }} />
            </Box>
          </Stack>

          <Box>
            <InputLabel sx={labelStyle}>SEAL NO</InputLabel>
            <TextField fullWidth value={form.sealNo} onChange={set("sealNo")} sx={inputStyle}
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
            <Button onClick={onBack} sx={{ fontFamily: primaryFont, fontWeight: 700, color: "#94A3B8" }}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate} disabled={loading}
              sx={{ fontFamily: primaryFont, bgcolor: primaryTeal, px: 5, borderRadius: "10px", fontWeight: 800 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UpdateShipment;
