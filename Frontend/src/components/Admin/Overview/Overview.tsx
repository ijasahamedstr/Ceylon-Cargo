import { useState, useEffect } from "react";
import {
  Box, Typography, Stack, Paper, Button,
  Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Fade, Grow
} from "@mui/material";
import { keyframes } from "@mui/system";
import {
  AssignmentOutlined, FlightTakeoffOutlined,
   TrendingUpOutlined, FileDownloadOutlined, 
  DirectionsBoatOutlined, CheckCircleOutlined, 
  HourglassEmptyOutlined, 
  PaymentsOutlined, MoneyOffOutlined
} from "@mui/icons-material";

const API  = import.meta.env.VITE_API_URL || "http://localhost:8001";
const TEAL = "#004652";
const FONT = "'Montserrat', sans-serif";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Shipment    { _id: string; containerNo: string; portCode: string; vessel: string; createdAt: string; }
interface LoadingList { _id: string; containerNo: string; listNo: string; promotedToShipmentId: string | null; createdAt: string; }
interface AirManifest { _id: string; containerNo: string; manifestNo: string; createdAt: string; }

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function Overview() {
  const [shipments,    setShipments]    = useState<Shipment[]>([]);
  const [loadingLists, setLoadingLists] = useState<LoadingList[]>([]);
  const [airManifests, setAirManifests] = useState<AirManifest[]>([]);
  
  // Financial State
  const [financials, setFinancials] = useState({ paid: 0, unpaid: 0 });
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/shipments`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${API}/api/loading-lists`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${API}/api/air-manifests`).then(r => r.json()).catch(() => ({ success: false })),
      // Mocking financial API call - Replace with your actual endpoint
      new Promise(resolve => setTimeout(() => resolve({ paid: 145000, unpaid: 32500 }), 800))
    ]).then(([s, ll, am, fin]: any) => {
      if (s?.success)  setShipments(s.data);
      if (ll?.success) setLoadingLists(ll.data);
      if (am?.success) setAirManifests(am.data);
      setFinancials(fin);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const promoted = loadingLists.filter(l => l.promotedToShipmentId).length;
  const pending  = loadingLists.length - promoted;

  const stats = [
    { label: "Sea Shipments", value: shipments.length, icon: <DirectionsBoatOutlined />, color: "#0B5FFF", bg: "rgba(11,95,255,0.08)", sub: "Total sea manifests" },
    { label: "Loading Lists", value: loadingLists.length, icon: <AssignmentOutlined />, color: "#10B981", bg: "rgba(16,185,129,0.08)", sub: `${promoted} promoted · ${pending} pending` },
    { label: "Air Manifests", value: airManifests.length, icon: <FlightTakeoffOutlined />, color: "#7C3AED", bg: "rgba(124,58,237,0.08)", sub: "Total air manifests" }
  ];

  const financialStats = [
    { label: "Total Received (Paid)", value: fmtCurrency(financials.paid), icon: <PaymentsOutlined />, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
    { label: "Pending Collection (Unpaid)", value: fmtCurrency(financials.unpaid), icon: <MoneyOffOutlined />, color: "#F43F5E", bg: "rgba(244,63,94,0.12)" }
  ];

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Fade in={true} timeout={800}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: TEAL }} size={48} disableShrink />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#64748B", animation: `${fadeInUp} 1s infinite alternate` }}>Syncing data...</Typography>
        </Stack>
      </Fade>
    </Box>
  );

  return (
    <Box sx={{ fontFamily: FONT, width: "100%", overflowX: "hidden", pb: 6 }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Fade in={true} timeout={600}>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography variant="h4" sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, letterSpacing: "-0.5px", fontSize: { xs: "1.8rem", md: "2.125rem" } }}>
              Dashboard
            </Typography>
            <Typography sx={{ color: "#64748B", fontWeight: 500, mt: 0.5 ,fontFamily: FONT,}}>
              Welcome back. Here is your logistics and financial overview.
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* ── Financial Overview (Compact & Enhanced) ────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2, mb: 4 }}>
        {financialStats.map((stat, i) => {
          // Calculate a simple percentage for the small indicator
          const total = financials.paid + financials.unpaid;
          const percentage = total > 0 ? ((parseFloat(stat.value.replace(/[^0-9.-]+/g,"")) / total) * 100).toFixed(1) : 0;

          return (
            <Grow in={true} timeout={600 + (i * 200)} key={stat.label}>
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: "16px", 
                border: "1px solid #E2E8F0", 
                bgcolor: "#fff", 
                display: "flex", 
                alignItems: "center", 
                gap: 2.5, 
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
                "&:hover": { boxShadow: `0 8px 24px ${stat.color}1A`, transform: "translateY(-2px)", borderColor: stat.color } 
              }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "14px", bgcolor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                  {stat.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.75rem", color: "#64748B", mb: 0.25, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "1.75rem", fontWeight: 900, color: TEAL, lineHeight: 1.2 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, color: stat.color, mt: 0.5 }}>
                    {percentage}% of total invoices
                  </Typography>
                </Box>
              </Paper>
            </Grow>
          );
        })}
      </Box>

      {/* ── Logistics Stat Cards ──────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
        {stats.map((s, i) => (
          <Grow in={true} timeout={800 + (i * 200)} key={s.label}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#fff", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "&:hover": { boxShadow: `0 12px 32px ${s.color}1A`, transform: "translateY(-4px)", borderColor: s.color } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  {s.icon}
                </Box>
                <TrendingUpOutlined sx={{ color: "#10B981", fontSize: 18 }} />
              </Stack>
              <Typography sx={{ fontFamily: FONT, fontSize: "2.2rem", fontWeight: 900, color: TEAL, lineHeight: 1 }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.75rem", color: "#1E293B", mt: 0.5 }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#94A3B8", mt: 0.5, fontWeight: 600 }}>
                {s.sub}
              </Typography>
            </Paper>
          </Grow>
        ))}
      </Box>

      {/* ── Recent Records (CSS Grid) ────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3, mb: 4 }}>
        
        {/* Recent Shipments */}
        <Grow in={true} timeout={1400}>
          <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #E2E8F0", overflow: "hidden", "&:hover": { borderColor: "#0B5FFF" }, transition: "0.3s" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <DirectionsBoatOutlined sx={{ color: "#0B5FFF", fontSize: 20 }} />
                <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: "0.9rem" }}>Recent Shipments</Typography>
              </Stack>
              <Chip label={`${shipments.length} total`} size="small" sx={{ fontFamily: FONT, fontWeight: 700, bgcolor: "#EFF6FF", color: "#1D4ED8", fontSize: "0.7rem" }} />
            </Stack>
            <TableContainer sx={{ "&::-webkit-scrollbar": { height: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 3 } }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    {["Container", "Port", "Vessel", "Date"].map(h => (
                      <TableCell key={h} sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 800, fontSize: "0.65rem", color: "#64748B" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipments.slice(0, 5).map((s, i) => (
                    <TableRow key={s._id} hover sx={{ opacity: 0, animation: `${fadeInUp} 0.4s ease-out forwards`, animationDelay: `${0.1 * i}s` }}>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 700, fontSize: "0.8rem", color: TEAL }}>{s.containerNo}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {s.portCode
                          ? <Chip label={s.portCode} size="small" sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.65rem", bgcolor: "#EFF6FF", color: "#1D4ED8" }} />
                          : <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#94A3B8" }}>—</Typography>
                        }
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontSize: "0.78rem", color: "#475569" }}>{s.vessel || "—"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontSize: "0.72rem", color: "#94A3B8" }}>{fmtDate(s.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {shipments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, fontFamily: FONT, color: "#94A3B8", fontWeight: 600 }}>No shipments yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grow>

        {/* Recent Loading Lists */}
        <Grow in={true} timeout={1600}>
          <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #E2E8F0", overflow: "hidden", "&:hover": { borderColor: "#10B981" }, transition: "0.3s" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AssignmentOutlined sx={{ color: "#10B981", fontSize: 20 }} />
                <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: "0.9rem" }}>Recent Loading Lists</Typography>
              </Stack>
              <Chip label={`${pending} pending`} size="small" sx={{ fontFamily: FONT, fontWeight: 700, bgcolor: "#FEF3C7", color: "#92400E", fontSize: "0.7rem" }} />
            </Stack>
            <TableContainer sx={{ "&::-webkit-scrollbar": { height: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 3 } }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    {["Container", "List No", "Status", "Date"].map(h => (
                      <TableCell key={h} sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 800, fontSize: "0.65rem", color: "#64748B" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingLists.slice(0, 5).map((l, i) => (
                    <TableRow key={l._id} hover sx={{ opacity: 0, animation: `${fadeInUp} 0.4s ease-out forwards`, animationDelay: `${0.1 * i}s` }}>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 700, fontSize: "0.8rem", color: TEAL }}>{l.containerNo}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontSize: "0.78rem" }}>{l.listNo}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {l.promotedToShipmentId
                          ? <Stack direction="row" spacing={0.5} alignItems="center"><CheckCircleOutlined sx={{ fontSize: 14, color: "#10B981" }} /><Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", fontWeight: 700, color: "#10B981" }}>Promoted</Typography></Stack>
                          : <Stack direction="row" spacing={0.5} alignItems="center"><HourglassEmptyOutlined sx={{ fontSize: 14, color: "#F59E0B" }} /><Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", fontWeight: 700, color: "#F59E0B" }}>Pending</Typography></Stack>
                        }
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontSize: "0.72rem", color: "#94A3B8" }}>{fmtDate(l.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {loadingLists.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, fontFamily: FONT, color: "#94A3B8", fontWeight: 600 }}>No loading lists yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grow>
      </Box>

      {/* ── Full Width Air Manifests ─────────────────────────────────────── */}
      <Grow in={true} timeout={1800}>
        <Box sx={{ mb: 4 }}>
          <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #E2E8F0", overflow: "hidden", "&:hover": { borderColor: "#7C3AED" }, transition: "0.3s" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <FlightTakeoffOutlined sx={{ color: "#7C3AED", fontSize: 20 }} />
                <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, fontSize: "0.9rem" }}>Recent Air Manifests</Typography>
              </Stack>
              <Chip label={`${airManifests.length} total`} size="small" sx={{ fontFamily: FONT, fontWeight: 700, bgcolor: "rgba(124,58,237,0.08)", color: "#7C3AED", fontSize: "0.7rem" }} />
            </Stack>
            <TableContainer sx={{ "&::-webkit-scrollbar": { height: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 3 } }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    {["Container", "Manifest No", "Date", "Action"].map(h => (
                      <TableCell key={h} sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 800, fontSize: "0.65rem", color: "#64748B" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {airManifests.slice(0, 5).map((a, i) => (
                    <TableRow key={a._id} hover sx={{ opacity: 0, animation: `${fadeInUp} 0.4s ease-out forwards`, animationDelay: `${0.1 * i}s` }}>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 700, fontSize: "0.8rem", color: TEAL }}>{a.containerNo}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontSize: "0.78rem" }}>{a.manifestNo}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: FONT, fontSize: "0.72rem", color: "#94A3B8" }}>{fmtDate(a.createdAt)}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Button size="small" startIcon={<FileDownloadOutlined sx={{ fontSize: "14px !important" }} />}
                          onClick={() => window.open(`${API}/api/air-manifests/${a._id}/export`, "_blank")}
                          sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem", color: "#7C3AED", textTransform: "none", py: 0.5, px: 1, bgcolor: "rgba(124,58,237,0.05)", borderRadius: "8px", "&:hover": { bgcolor: "rgba(124,58,237,0.15)" } }}>
                          Export Excel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {airManifests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, fontFamily: FONT, color: "#94A3B8", fontWeight: 600 }}>No air manifests yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Grow>

    </Box>
  );
}