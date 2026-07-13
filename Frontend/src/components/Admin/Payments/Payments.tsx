import { apiFetch } from "@/services/apiFetch";
import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Tabs, Tab, Stack,
} from "@mui/material";
import { AttachMoneyOutlined } from "@mui/icons-material";

const TEAL = "#004652";
const GOLD = "#CC9D2F";
const FONT = "'Montserrat', sans-serif";
const NEU_RAISED = "0 4px 12px rgba(0, 0, 0, 0.05)";

interface Booking {
  _id: string;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  payment_status: string;
  payment_amount: number;
  branch: string;
  createdAt: string;
}

const STATUS_TABS = ["all", "unpaid", "paid", "partial", "pending"];

export default function Payments() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    apiFetch("/api/bookings")
      .then((r) => r.json())
      .then((j) => { if (j.data) setBookings(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filter = STATUS_TABS[tab];
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.payment_status === filter);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  if (loading) return <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress sx={{ color: TEAL }} /></Box>;

  return (
    <Box>
      <Paper sx={{ mb: 3, p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.6rem", color: TEAL, mb: 0.5 }}>Payments Dashboard</Typography>
        <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.95rem", mb: 3 }}>Track payment status for all bookings in SAR</Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
          {[
            { label: "Unpaid", count: bookings.filter((b) => b.payment_status === "unpaid").length, color: "#DC2626", bg: "rgba(220, 38, 38, 0.05)" },
            { label: "Paid", count: bookings.filter((b) => b.payment_status === "paid").length, color: "#10B981", bg: "rgba(16, 185, 129, 0.05)" },
            { label: "Partial", count: bookings.filter((b) => b.payment_status === "partial").length, color: GOLD, bg: "rgba(204, 157, 47, 0.05)" },
          ].map((s) => (
            <Box key={s.label} sx={{ p: 2.5, flex: 1, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AttachMoneyOutlined sx={{ color: s.color, fontSize: "2rem" }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#64748B", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label} Bookings</Typography>
                <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.8rem", color: s.color, lineHeight: 1.2 }}>{s.count}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Box sx={{ bgcolor: "#F1F5F9", p: 0.5, borderRadius: "12px", border: "1px solid #E2E8F0", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { display: "none" } }} sx={{ minHeight: 38, "& .MuiTabs-flexContainer": { gap: 0.5 } }}>
          {STATUS_TABS.map((s) => (
            <Tab key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} disableRipple sx={{ textTransform: "none", fontWeight: 800, fontFamily: FONT, color: "#64748B", borderRadius: "8px", minHeight: 34, px: 3, py: 0.75, transition: "all 0.2s ease", "&.Mui-selected": { color: TEAL, bgcolor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, "&:hover:not(.Mui-selected)": { bgcolor: "rgba(0, 70, 82, 0.04)" } }} />
          ))}
        </Tabs>
      </Box>

      <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
        <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "1.2rem", mb: 3 }}>Payment History</Typography>
        <TableContainer sx={{ borderRadius: "12px", overflow: "hidden", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                {["Tracking #", "Shipper", "Consignee", "Branch", "Payment", "Amount Paid", "Date"].map((h) => (
                  <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.75rem", color: "#64748B", py: 2, borderBottomColor: "#E2E8F0" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign: "center", py: 4, fontFamily: FONT, color: "#94A3B8", fontWeight: 600 }}>No payments found in this category</TableCell></TableRow>
              ) : filtered.map((b, i) => (
                <TableRow key={b._id} sx={{ bgcolor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.85rem", color: TEAL, py: 1.5, borderBottomColor: "#E2E8F0" }}>{b.tracking_number}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.85rem", py: 1.5, borderBottomColor: "#E2E8F0" }}>{b.sender_name}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.85rem", py: 1.5, borderBottomColor: "#E2E8F0" }}>{b.receiver_name}</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.85rem", py: 1.5, borderBottomColor: "#E2E8F0" }}>{b.branch || "—"}</TableCell>
                  <TableCell sx={{ py: 1.5, borderBottomColor: "#E2E8F0" }}>
                    <Chip label={b.payment_status} size="small"
                      color={b.payment_status === "paid" ? "success" : b.payment_status === "unpaid" ? "error" : "warning"}
                      sx={{ fontFamily: FONT, fontSize: "0.75rem", fontWeight: 700, textTransform: "capitalize", borderRadius: "8px" }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.9rem", fontWeight: 800, color: TEAL, py: 1.5, borderBottomColor: "#E2E8F0" }}>{b.payment_amount || 0} SAR</TableCell>
                  <TableCell sx={{ fontFamily: FONT, fontSize: "0.85rem", py: 1.5, borderBottomColor: "#E2E8F0", color: "#64748B", fontWeight: 600 }}>{fmt(b.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
