import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Paper, Stack, CircularProgress,
} from "@mui/material";
import {
  TrendingUpOutlined, LocalShippingOutlined, FlightTakeoffOutlined,
  AssignmentOutlined, PointOfSaleOutlined, AttachMoneyOutlined,
} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001";
const TEAL = "#004652";
const FONT = "'Montserrat', sans-serif";

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    shipments: 0, loadingLists: 0, airManifests: 0, ports: 0,
    bookings: 0, paid: 0, unpaid: 0, drafts: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/shipments`).then((r) => r.json()),
      fetch(`${API}/api/loading-lists`).then((r) => r.json()),
      fetch(`${API}/api/air-manifests`).then((r) => r.json()),
      fetch(`${API}/api/ports`).then((r) => r.json()),
      fetch(`${API}/api/bookings`).then((r) => r.json()),
    ]).then(([s, ll, am, p, b]) => {
      const bookings = b.data || [];
      setStats({
        shipments: s.data?.length || 0,
        loadingLists: ll.data?.length || 0,
        airManifests: am.data?.length || 0,
        ports: p.data?.length || 0,
        bookings: bookings.length,
        paid: bookings.filter((x: { payment_status: string }) => x.payment_status === "paid").length,
        unpaid: bookings.filter((x: { payment_status: string }) => x.payment_status === "unpaid").length,
        drafts: bookings.filter((x: { status: string }) => x.status === "draft").length,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards: StatCard[] = [
    { label: "Total Bookings", value: stats.bookings, icon: <PointOfSaleOutlined />, color: TEAL, bg: "rgba(0,70,82,0.08)" },
    { label: "Sea Shipments", value: stats.shipments, icon: <LocalShippingOutlined />, color: "#0B5FFF", bg: "rgba(11,95,255,0.08)" },
    { label: "Air Manifests", value: stats.airManifests, icon: <FlightTakeoffOutlined />, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
    { label: "Loading Lists", value: stats.loadingLists, icon: <AssignmentOutlined />, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
    { label: "Paid Bookings", value: stats.paid, icon: <AttachMoneyOutlined />, color: "#059669", bg: "rgba(5,150,105,0.08)" },
    { label: "Unpaid Bookings", value: stats.unpaid, icon: <TrendingUpOutlined />, color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
  ];

  if (loading) return <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress sx={{ color: TEAL }} /></Box>;

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.3rem", color: TEAL, mb: 0.5 }}>Analytics</Typography>
      <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.85rem", mb: 3 }}>Cargo operations overview and trends</Typography>
      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid key={c.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>{c.label}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "2rem", color: TEAL, mt: 0.5 }}>{c.value}</Typography>
                </Box>
                <Box sx={{ p: 1.2, borderRadius: "12px", bgcolor: c.bg, color: c.color }}>{c.icon}</Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC" }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, mb: 1 }}>Summary</Typography>
        <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.9rem" }}>
          {stats.ports} active ports · {stats.drafts} draft bookings · {stats.bookings - stats.paid - stats.unpaid} other payment statuses
        </Typography>
      </Paper>
    </Box>
  );
}
