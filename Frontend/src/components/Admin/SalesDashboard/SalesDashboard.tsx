import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Grid, Paper, Stack, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from "@mui/material";
import { TrendingUpOutlined, PointOfSaleOutlined, AttachMoneyOutlined } from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001";
const TEAL = "#004652";
const FONT = "'Montserrat', sans-serif";

interface Booking {
  _id: string;
  tracking_number: string;
  sender_name: string;
  branch: string;
  sales_person_id: string;
  payment_status: string;
  status: string;
  cargo_type: string;
  createdAt: string;
}

export default function SalesDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/bookings`)
      .then((r) => r.json())
      .then((j) => { if (j.data) setBookings(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byBranch = useMemo(() => {
    const m: Record<string, number> = {};
    bookings.forEach((b) => { const k = b.branch || "Unassigned"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  const bySalesPerson = useMemo(() => {
    const m: Record<string, number> = {};
    bookings.forEach((b) => { const k = b.sales_person_id || "Unassigned"; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  const paid = bookings.filter((b) => b.payment_status === "paid").length;
  const today = bookings.filter((b) => new Date(b.createdAt).toDateString() === new Date().toDateString()).length;

  if (loading) return <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress sx={{ color: TEAL }} /></Box>;

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.3rem", color: TEAL, mb: 0.5 }}>Sales Dashboard</Typography>
      <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.85rem", mb: 3 }}>Sales performance and booking metrics</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Bookings", value: bookings.length, icon: <PointOfSaleOutlined />, color: TEAL },
          { label: "Today's Bookings", value: today, icon: <TrendingUpOutlined />, color: "#0B5FFF" },
          { label: "Paid", value: paid, icon: <AttachMoneyOutlined />, color: "#10B981" },
        ].map((c) => (
          <Grid key={c.label} size={{ xs: 12, sm: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>{c.label}</Typography>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "2rem", color: c.color }}>{c.value}</Typography>
                </Box>
                <Box sx={{ color: c.color }}>{c.icon}</Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, mb: 2 }}>By Branch</Typography>
            {byBranch.map(([branch, count]) => (
              <Stack key={branch} direction="row" justifyContent="space-between" sx={{ py: 0.8, borderBottom: "1px solid #F1F5F9" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem" }}>{branch}</Typography>
                <Chip label={count} size="small" sx={{ fontFamily: FONT, fontWeight: 700 }} />
              </Stack>
            ))}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, mb: 2 }}>By Sales Person</Typography>
            {bySalesPerson.map(([person, count]) => (
              <Stack key={person} direction="row" justifyContent="space-between" sx={{ py: 0.8, borderBottom: "1px solid #F1F5F9" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem" }}>{person}</Typography>
                <Chip label={count} size="small" sx={{ fontFamily: FONT, fontWeight: 700 }} />
              </Stack>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL, mb: 2 }}>Recent Bookings</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {["Tracking", "Shipper", "Branch", "Sales Person", "Payment", "Type"].map((h) => (
                  <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.7rem", color: TEAL }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.slice(0, 10).map((b) => (
                <TableRow key={b._id}>
                  <TableCell sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.8rem" }}>{b.tracking_number}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.8rem" }}>{b.sender_name}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.8rem" }}>{b.branch || "—"}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.8rem" }}>{b.sales_person_id || "—"}</TableCell>
                  <TableCell><Chip label={b.payment_status} size="small" color={b.payment_status === "paid" ? "success" : "warning"} sx={{ fontFamily: FONT, fontSize: "0.7rem" }} /></TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.8rem", textTransform: "capitalize" }}>{b.cargo_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
