import { useState } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress,
} from "@mui/material";
import { QrCodeScannerOutlined, SearchOutlined } from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001";
const TEAL = "#004652";
const FONT = "'Montserrat', sans-serif";

interface BookingResult {
  tracking_number: string;
  sender_name: string;
  sender_mobile: string;
  sender_iqama: string;
  receiver_name: string;
  delivery_city: string;
  status: string;
  payment_status: string;
}

export default function QRScanner() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch(`${API}/api/bookings/search?q=${encodeURIComponent(query.trim())}`);
      const j = await r.json();
      if (j.data) setResult(j.data);
      else setError("No booking found for this IQAMA, mobile, or passport number.");
    } catch {
      setError("Search failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.3rem", color: TEAL, mb: 0.5 }}>QR Scanner</Typography>
      <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.85rem", mb: 3 }}>
        Scan or enter IQAMA, mobile, or passport to look up a booking
      </Typography>

      <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", border: "1px solid #E2E8F0", textAlign: "center", mb: 3 }}>
        <Box sx={{ width: 120, height: 120, mx: "auto", mb: 2, borderRadius: "16px", border: `2px dashed ${TEAL}`, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F8FAFC" }}>
          <QrCodeScannerOutlined sx={{ fontSize: 56, color: TEAL }} />
        </Box>
        <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.85rem", mb: 3 }}>
          Camera scanning can be enabled later. For now, type or paste the number below.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="center" sx={{ maxWidth: 500, mx: "auto" }}>
          <TextField fullWidth size="small" placeholder="Mobile / IQAMA / Passport"
            value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontFamily: FONT } }} />
          <Button variant="contained" onClick={handleSearch} disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchOutlined />}
            sx={{ bgcolor: TEAL, fontFamily: FONT, fontWeight: 700, textTransform: "none", borderRadius: "10px", px: 3 }}>
            Search
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, fontFamily: FONT }}>{error}</Alert>}

      {result && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, mb: 2 }}>Booking Found</Typography>
          <Stack spacing={1}>
            {[
              ["Tracking #", result.tracking_number],
              ["Shipper", result.sender_name],
              ["Mobile", result.sender_mobile],
              ["IQAMA", result.sender_iqama],
              ["Consignee", result.receiver_name],
              ["Delivery City", result.delivery_city],
              ["Status", result.status],
              ["Payment", result.payment_status],
            ].map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between">
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>{k}</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 700 }}>{v}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
