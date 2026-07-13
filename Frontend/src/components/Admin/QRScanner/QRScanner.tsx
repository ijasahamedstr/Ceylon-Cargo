import { apiFetch } from "@/services/apiFetch";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress,
} from "@mui/material";
import { QrCodeScannerOutlined, SearchOutlined, CameraAltOutlined, CancelOutlined } from "@mui/icons-material";
import { Html5Qrcode } from "html5-qrcode";
import '../Dashboard/DashboardNeumorphism.css';

const READER_ID = "qr-reader";
const TEAL = "#004652";
const FONT = "'Montserrat', sans-serif";
const NEU_BG = "#F8FAFC";
const NEU_RAISED_SM = "0 2px 8px rgba(0, 0, 0, 0.04)";
const NEU_INSET = "none";
const NEU_INSET_SM = "none";

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

interface MoveGroupResult {
  group_code: string;
  package_count: number;
  from_label?: string;
  to_label?: string;
  from_status?: string;
  to_status?: string;
  booking_ids?: BookingResult[];
}

interface ScanState {
  result: string | null;
  error: string;
  scanning: boolean;
}

export default function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [groupResult, setGroupResult] = useState<MoveGroupResult | null>(null);
  const [error, setError] = useState("");
  const [scannerStatus, setScannerStatus] = useState("Camera idle");
  const [scanState, setScanState] = useState<ScanState>({ result: null, error: "", scanning: false });

  const handleSearch = useCallback(async (searchValue = query) => {
    const value = searchValue.trim();
    if (!value) return;
    setLoading(true);
    setError("");
    setResult(null);
    setGroupResult(null);
    try {
      const normalizedValue = value.toUpperCase();

      if (normalizedValue.startsWith("GRP-")) {
        const groupRes = await apiFetch(`/api/move-groups/code/${encodeURIComponent(normalizedValue)}`);
        const groupJson = await groupRes.json();
        if (!groupRes.ok || !groupJson.data) {
          setError(groupJson.message || "No move group found for this QR code.");
          return;
        }
        setGroupResult(groupJson.data);
        return;
      }

      if (normalizedValue.startsWith("CCS-")) {
        const bookingRes = await apiFetch(`/api/bookings/tracking/${encodeURIComponent(value)}`);
        const bookingJson = await bookingRes.json();
        if (!bookingRes.ok || !bookingJson.data) {
          setError(bookingJson.message || "No booking found for this tracking number.");
          return;
        }
        setResult(bookingJson.data);
        return;
      }

      const r = await apiFetch(`/api/bookings/search?q=${encodeURIComponent(value)}`);
      const j = await r.json();
      if (r.ok && j.data) setResult(j.data);
      else setError(j.message || "No booking found for this IQAMA, mobile, or passport number.");
    } catch {
      setError("Search failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleScan = useCallback((data: string | null) => {
    const scannedValue = data?.trim();
    if (scannedValue) {
      setScanState({ result: scannedValue, error: "", scanning: false });
      setScannerStatus("Scanned. Searching booking record...");
      setQuery(scannedValue);
      handleSearch(scannedValue);
    }
  }, [handleSearch]);

  const stopScanning = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      setScanState((prev) => ({ ...prev, scanning: false }));
      setScannerStatus("Camera idle");
      return;
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      /* camera may already be stopped */
    }

    scannerRef.current = null;
    setScanState((prev) => ({ ...prev, scanning: false }));
    setScannerStatus("Camera idle");
  }, []);

  const startScanning = useCallback(async () => {
    if (scanState.scanning) return;

    setScanState({ result: null, error: "", scanning: false });
    setError("");
    setScannerStatus("Requesting camera access...");

    try {
      if (scannerRef.current && !scannerRef.current.isScanning) {
        try { scannerRef.current.clear(); } catch { /* ignore */ }
      }

      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanning();
          handleScan(decodedText);
        },
        () => {
          /* ignore per-frame no-QR-found errors */
        }
      );

      setScanState((prev) => ({ ...prev, scanning: true }));
      setScannerStatus("Scanning...");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      scannerRef.current = null;
      setScanState({
        result: null,
        scanning: false,
        error: `Camera error: ${message}. On phones, live camera needs HTTPS. You can use Scan QR Photo on HTTP.`,
      });
      setScannerStatus("Camera idle");
    }
  }, [handleScan, scanState.scanning, stopScanning]);

  const toggleScanner = () => {
    if (scanState.scanning) {
      stopScanning();
      return;
    }
    startScanning();
  };



  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (!scanner) return;
      if (scanner.isScanning) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      } else {
        try { scanner.clear(); } catch { /* ignore */ }
      }
    };
  }, []);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" mb={0.75}>
        <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
          <QrCodeScannerOutlined />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.3rem", color: TEAL }}>QR Scanner</Typography>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.82rem" }}>
            Scan or enter a group code, tracking number, IQAMA, mobile, or passport
          </Typography>
        </Box>
      </Stack>

      <Paper elevation={0} className="neu-card" sx={{ p: 3.5, textAlign: "center", mb: 3, mt: 3 }}>
        <Box sx={{ width: 120, height: 120, mx: "auto", mb: 2.5, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_INSET, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <QrCodeScannerOutlined sx={{ fontSize: 56, color: TEAL }} />
        </Box>
        <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.85rem", mb: 3, fontWeight: 600 }}>
          Scan a QR code to open the camera, or type/paste the number below.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center" sx={{ maxWidth: 520, mx: "auto", mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            className="neu-input"
            placeholder="Group / Tracking / Mobile / IQAMA / Passport"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          />
          <Button
            className="neu-btn"
            onClick={() => handleSearch()}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchOutlined />}
            sx={{ px: 3, py: 1, minWidth: 110, color: `${TEAL} !important` }}
          >
            Search
          </Button>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center" sx={{ maxWidth: 520, mx: "auto" }}>
          <Button
            className="neu-btn"
            onClick={toggleScanner}
            startIcon={scanState.scanning ? <CancelOutlined /> : <CameraAltOutlined />}
            sx={{
              px: 3, py: 1.2, minWidth: 180,
              ...(scanState.scanning
                ? { boxShadow: `${NEU_INSET_SM} !important`, color: '#EF4444 !important' }
                : { background: `linear-gradient(135deg, ${TEAL}, #0d9488) !important`, color: '#fff !important', boxShadow: '0 8px 20px rgba(0,70,82,0.3) !important' })
            }}
          >
            {scanState.scanning ? "Stop Camera" : "Scan QR Code"}
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} className="neu-card" sx={{ p: 3, mb: 3, textAlign: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" mb={2}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: scanState.scanning ? '#10B981' : '#94A3B8', boxShadow: scanState.scanning ? '0 0 8px #10B981' : 'none' }} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: '0.9rem' }}>
            {scanState.scanning ? "Camera scanning active" : "Scanner preview"}
          </Typography>
        </Stack>
        <Box sx={{ mx: "auto", width: { xs: "100%", sm: 480 }, minHeight: 260, overflow: "hidden", borderRadius: "20px", bgcolor: "#0F172A", boxShadow: NEU_INSET, position: "relative" }}>
          <Box
            id={READER_ID}
            sx={{
              width: "100%",
              minHeight: 260,
              color: "#FFFFFF",
              "& video": { objectFit: "cover" },
              "& img": { maxWidth: "100%" },
            }}
          />
        </Box>
        <Box sx={{ mt: 2, px: 3, py: 1, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM, display: 'inline-block' }}>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.82rem", fontWeight: 700 }}>
            {scanState.scanning
              ? "Point your camera at a QR code — it will be detected automatically."
              : 'Press "Scan QR Code" to activate your camera.'}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Box sx={{ display: 'inline-block', px: 2.5, py: 0.75, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.76rem", fontWeight: 700 }}>
            {scannerStatus}
          </Typography>
        </Box>
      </Box>

      {scanState.error && <Alert severity="error" sx={{ mb: 2, fontFamily: FONT, borderRadius: '14px', fontWeight: 700 }}>{scanState.error}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2, fontFamily: FONT, borderRadius: '14px', fontWeight: 700 }}>{error}</Alert>}
      {scanState.result && (
        <Alert severity="success" sx={{ mb: 2, fontFamily: FONT, borderRadius: '14px', fontWeight: 700 }}>
          Scanned: <strong>{scanState.result}</strong> — searching record...
        </Alert>
      )}

      {result && (
        <Paper elevation={0} className="neu-card" sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981' }} />
            </Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: '1rem' }}>Booking Found</Typography>
          </Stack>
          <Stack spacing={1.5}>
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
              <Stack key={k} direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: "#64748B", fontWeight: 700 }}>{k}</Typography>
                <Box sx={{ px: 1.5, py: 0.4, borderRadius: '8px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", fontWeight: 800, color: TEAL }}>{v}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {groupResult && (
        <Paper elevation={0} className="neu-card" sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#7C3AED' }} />
            </Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: '1rem' }}>Move Group Found</Typography>
          </Stack>
          <Stack spacing={1.5} mb={2}>
            {[
              ["Group #", groupResult.group_code],
              ["Packages", String(groupResult.package_count)],
              ["From", groupResult.from_label || groupResult.from_status || "N/A"],
              ["To", groupResult.to_label || groupResult.to_status || "N/A"],
            ].map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: "#64748B", fontWeight: 700 }}>{k}</Typography>
                <Box sx={{ px: 1.5, py: 0.4, borderRadius: '8px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", fontWeight: 800, color: TEAL }}>{v}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          {!!groupResult.booking_ids?.length && (
            <Stack spacing={1.25}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: "0.85rem", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Packages</Typography>
              {groupResult.booking_ids.map((booking) => (
                <Paper key={booking.tracking_number} elevation={0} className="neu-card-sm" sx={{ p: 1.5 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", fontWeight: 900, color: TEAL }}>{booking.tracking_number}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.82rem", color: "#64748B", fontWeight: 700 }}>
                      {booking.sender_name} → {booking.receiver_name}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}
