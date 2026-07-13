import { apiFetch } from "@/services/apiFetch";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Grid, Paper, Stack, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  ToggleButton, ToggleButtonGroup, TextField, Button, Tooltip, LinearProgress,
  Avatar, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import {
  TrendingUpOutlined, PointOfSaleOutlined, AttachMoneyOutlined,
  RefreshOutlined, CalendarMonthOutlined, PersonOutline,
  BusinessOutlined, EmojiEventsOutlined, PercentOutlined,
} from "@mui/icons-material";

const TEAL = "#004652";
const GOLD = "#CC9D2F";
const FONT = "'Montserrat', sans-serif";
const NEU_BG = "#F8FAFC";
const NEU_RAISED = "0 4px 12px rgba(0, 0, 0, 0.05)";
const NEU_RAISED_SM = "0 2px 8px rgba(0, 0, 0, 0.04)";
const NEU_INSET = "none";
const NEU_INSET_SM = "none";

type DatePreset = "today" | "7d" | "30d" | "90d" | "all" | "custom";

interface Booking {
  _id: string;
  tracking_number: string;
  sender_name: string;
  branch?: string;
  sales_person_id?: string;
  payment_status: string;
  payment_amount?: number;
  status: string;
  cargo_type: string;
  createdAt: string;
}

const BRANCH_COLORS = ["#004652", "#2563EB", "#7C3AED", "#059669", "#EA580C", "#64748B"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function getRange(preset: DatePreset, customFrom: string, customTo: string) {
  const now = new Date();
  if (preset === "custom" && customFrom) {
    return { from: startOfDay(new Date(customFrom)), to: customTo ? endOfDay(new Date(customTo)) : endOfDay(now) };
  }
  if (preset === "today") return { from: startOfDay(now), to: endOfDay(now) };
  if (preset === "7d") {
    const from = new Date(now); from.setDate(from.getDate() - 6);
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  if (preset === "30d") {
    const from = new Date(now); from.setDate(from.getDate() - 29);
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  if (preset === "90d") {
    const from = new Date(now); from.setDate(from.getDate() - 89);
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  return { from: null, to: null };
}

function inRange(dateStr: string, from: Date | null, to: Date | null) {
  const d = new Date(dateStr);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function fmtShort(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function buildDailySeries(items: { createdAt: string }[], from: Date | null, to: Date | null) {
  const end = to ? startOfDay(to) : startOfDay(new Date());
  const start = from ? startOfDay(from) : (() => {
    const s = new Date(end); s.setDate(s.getDate() - 13); return s;
  })();
  const buckets: { label: string; date: Date; count: number }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    buckets.push({ label: fmtShort(cur), date: new Date(cur), count: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  for (const item of items) {
    const d = startOfDay(new Date(item.createdAt));
    const bucket = buckets.find(b => b.date.getTime() === d.getTime());
    if (bucket) bucket.count++;
  }
  return buckets.slice(-30).map(b => ({ label: b.label, value: b.count }));
}

function BarChart({ data, color = TEAL, height = 160 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <Stack direction="row" alignItems="flex-end" spacing={0.75} sx={{ height, pt: 1 }}>
      {data.map((d, i) => (
        <Tooltip key={i} title={`${d.label}: ${d.value}`} arrow>
          <Stack alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: TEAL, mb: 0.5 }}>{d.value > 0 ? d.value : ""}</Typography>
            <Box sx={{
              width: "100%", maxWidth: 36, borderRadius: "6px 6px 2px 2px",
              height: `${Math.max(4, (d.value / max) * (height - 40))}px`,
              bgcolor: d.value > 0 ? color : "#E2E8F0",
            }} />
            <Typography sx={{ fontSize: "0.55rem", color: "#94A3B8", mt: 0.75, fontWeight: 600, textAlign: "center" }}>{d.label}</Typography>
          </Stack>
        </Tooltip>
      ))}
    </Stack>
  );
}

function HorizontalBars({ items }: { items: { label: string; value: number; sub?: string; color: string }[] }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <Stack spacing={1.5}>
      {items.map(item => (
        <Box key={item.label}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }} noWrap>{item.label}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {item.sub && <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>{item.sub}</Typography>}
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: TEAL }}>{item.value}</Typography>
            </Stack>
          </Stack>
          <LinearProgress variant="determinate" value={(item.value / max) * 100}
            sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 4 } }} />
        </Box>
      ))}
    </Stack>
  );
}

interface SalesPersonStats {
  name: string;
  bookings: number;
  revenue: number;
  paid: number;
  unpaid: number;
}

export default function SalesDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [personFilter, setPersonFilter] = useState("");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setSyncError(false);
    try {
      const r = await apiFetch("/api/bookings");
      if (!r.ok) throw new Error();
      const j = await r.json();
      setBookings(j.data || []);
      setLastUpdated(new Date());
    } catch {
      setSyncError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  const { from, to } = useMemo(() => getRange(preset, customFrom, customTo), [preset, customFrom, customTo]);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (!inRange(b.createdAt, from, to)) return false;
      if (branchFilter && (b.branch || "Unassigned") !== branchFilter) return false;
      if (personFilter && (b.sales_person_id || "Unassigned") !== personFilter) return false;
      return true;
    });
  }, [bookings, from, to, branchFilter, personFilter]);

  const branches = useMemo(() =>
    [...new Set(bookings.map(b => b.branch || "Unassigned"))].sort(),
    [bookings]
  );

  const salesPersons = useMemo(() =>
    [...new Set(bookings.map(b => b.sales_person_id || "Unassigned"))].sort(),
    [bookings]
  );

  const stats = useMemo(() => {
    const revenue = filtered.reduce((s, b) => s + (b.payment_amount || 0), 0);
    const paid = filtered.filter(b => b.payment_status === "paid").length;
    const paidRevenue = filtered.filter(b => b.payment_status === "paid").reduce((s, b) => s + (b.payment_amount || 0), 0);
    const todayStr = new Date().toDateString();
    const todayCount = filtered.filter(b => new Date(b.createdAt).toDateString() === todayStr).length;
    const conversion = filtered.length ? Math.round((paid / filtered.length) * 100) : 0;
    return { total: filtered.length, revenue, paidRevenue, paid, todayCount, conversion };
  }, [filtered]);

  const byBranch = useMemo(() => {
    const m = new Map<string, { count: number; revenue: number }>();
    for (const b of filtered) {
      const k = b.branch || "Unassigned";
      const cur = m.get(k) || { count: 0, revenue: 0 };
      cur.count++; cur.revenue += b.payment_amount || 0;
      m.set(k, cur);
    }
    return [...m.entries()]
      .map(([label, v], i) => ({ label, value: v.count, sub: `SAR ${v.revenue.toLocaleString()}`, color: BRANCH_COLORS[i % BRANCH_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const salesLeaderboard = useMemo((): SalesPersonStats[] => {
    const m = new Map<string, SalesPersonStats>();
    for (const b of filtered) {
      const name = b.sales_person_id || "Unassigned";
      if (!m.has(name)) m.set(name, { name, bookings: 0, revenue: 0, paid: 0, unpaid: 0 });
      const s = m.get(name)!;
      s.bookings++;
      s.revenue += b.payment_amount || 0;
      if (b.payment_status === "paid") s.paid++; else s.unpaid++;
    }
    return [...m.values()].sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);
  }, [filtered]);

  const dailySales = useMemo(() => buildDailySeries(filtered, from, to), [filtered, from, to]);

  const topPerformer = salesLeaderboard[0];

  const rangeLabel = useMemo(() => {
    if (preset === "all") return "All time";
    if (preset === "today") return "Today";
    if (preset === "custom" && customFrom) return `${customFrom}${customTo ? ` → ${customTo}` : ""}`;
    return preset === "7d" ? "Last 7 days" : preset === "30d" ? "Last 30 days" : "Last 90 days";
  }, [preset, customFrom, customTo]);

  const paymentChip = (status: string) => {
    const map: Record<string, "success" | "warning" | "error" | "default"> = {
      paid: "success", unpaid: "error", partial: "warning", pending: "default",
    };
    return <Chip label={status} size="small" color={map[status] || "default"} sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize" }} />;
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 12 }}>
        <CircularProgress sx={{ color: TEAL }} />
        <Typography sx={{ fontFamily: FONT, color: "#64748B", mt: 2, fontWeight: 600 }}>Loading sales data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: FONT }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={3} spacing={2}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.45rem", color: TEAL }}>Sales Dashboard</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem", fontWeight: 500, mt: 0.5 }}>
            Team performance, branches, and revenue — filtered by date
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncError ? "#EF4444" : "#10B981", boxShadow: `0 0 8px ${syncError ? "#EF4444" : "#10B981"}` }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.02em" }}>
              {syncError ? "Sync error" : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "—"}
            </Typography>
            {refreshing && <CircularProgress size={12} sx={{ color: TEAL }} />}
          </Stack>
        </Box>
        <Button variant="contained" startIcon={<RefreshOutlined />} onClick={() => fetchData(true)}
          sx={{ bgcolor: NEU_BG, color: TEAL, fontWeight: 800, borderRadius: "16px", px: 3, py: 1.2, boxShadow: NEU_RAISED_SM, "&:hover": { bgcolor: NEU_BG, boxShadow: NEU_INSET_SM } }}>
          Refresh
        </Button>
      </Stack>

      {/* Date + filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_RAISED, border: "1px solid rgba(255,255,255,0.6)" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <CalendarMonthOutlined sx={{ color: TEAL }} />
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</Typography>
          <Chip label={rangeLabel} size="small" sx={{ fontWeight: 700, bgcolor: TEAL, color: "#FFF", borderRadius: "8px" }} />
        </Stack>
        <Stack spacing={3}>
          <Box sx={{ display: 'inline-block', p: 0.5, borderRadius: '18px', bgcolor: NEU_BG, boxShadow: NEU_INSET }}>
            <ToggleButtonGroup exclusive size="small" value={preset} onChange={(_, v) => v && setPreset(v)}
              sx={{ flexWrap: "wrap", gap: 1 }}>
              {(["today", "7d", "30d", "90d", "all", "custom"] as DatePreset[]).map(p => (
                <ToggleButton key={p} value={p} sx={{ fontFamily: FONT, fontWeight: 700, textTransform: "none", borderRadius: "14px !important", border: "none !important", px: 3, py: 1, color: preset === p ? TEAL : "#64748B", bgcolor: preset === p ? NEU_BG : "transparent", boxShadow: preset === p ? NEU_RAISED_SM : "none", "&.Mui-selected": { color: TEAL, bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM }, "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}>
                  {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : p === "all" ? "All Time" : p === "custom" ? "Custom" : "Today"}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {preset === "custom" && (
            <Stack direction="row" spacing={2} sx={{ p: 2, borderRadius: "16px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
              <TextField type="date" size="small" label="From" value={customFrom} onChange={e => setCustomFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM, "& fieldset": { border: "none" } } }} />
              <TextField type="date" size="small" label="To" value={customTo} onChange={e => setCustomTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM, "& fieldset": { border: "none" } } }} />
            </Stack>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: "14px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM, "& fieldset": { border: "none" } } }}>
              <InputLabel sx={{ fontWeight: 600 }}>Branch</InputLabel>
              <Select value={branchFilter} label="Branch" onChange={e => setBranchFilter(e.target.value)}>
                <MenuItem value=""><em>All branches</em></MenuItem>
                {branches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: "14px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM, "& fieldset": { border: "none" } } }}>
              <InputLabel sx={{ fontWeight: 600 }}>Sales Person</InputLabel>
              <Select value={personFilter} label="Sales Person" onChange={e => setPersonFilter(e.target.value)}>
                <MenuItem value=""><em>All sales persons</em></MenuItem>
                {salesPersons.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {/* Top performer banner */}
      {topPerformer && topPerformer.name !== "Unassigned" && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "24px", bgcolor: "#FFFBEB", border: `1px solid ${GOLD}`, boxShadow: "0 10px 25px rgba(204, 157, 47, 0.15)" }}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box sx={{ p: 1.5, borderRadius: "50%", bgcolor: "rgba(204, 157, 47, 0.15)", display: "flex", alignItems: "center" }}>
              <EmojiEventsOutlined sx={{ color: GOLD, fontSize: 36 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 800, color: GOLD, letterSpacing: 1 }}>TOP PERFORMER</Typography>
              <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.3rem" }}>{topPerformer.name}</Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600, mt: 0.5 }}>
                {topPerformer.bookings} bookings · SAR {topPerformer.revenue.toLocaleString()} revenue · {topPerformer.paid} paid
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* KPIs */}
      <Grid container spacing={3} mb={3}>
        {[
          { label: "Total Bookings", value: stats.total, sub: rangeLabel, icon: <PointOfSaleOutlined />, color: TEAL },
          { label: "Revenue (SAR)", value: stats.revenue.toLocaleString(), sub: `${stats.paidRevenue.toLocaleString()} collected`, icon: <AttachMoneyOutlined />, color: "#059669" },
          { label: "Today's Bookings", value: stats.todayCount, sub: new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }), icon: <TrendingUpOutlined />, color: "#2563EB" },
          { label: "Paid Rate", value: `${stats.conversion}%`, sub: `${stats.paid} of ${stats.total} paid`, icon: <PercentOutlined />, color: "#7C3AED" },
        ].map(c => (
          <Grid key={c.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_RAISED, border: "1px solid rgba(255,255,255,0.6)", height: "100%", display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography sx={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</Typography>
                <Box sx={{ p: 1, borderRadius: "12px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM, color: c.color, display: "flex", alignItems: "center" }}>{c.icon}</Box>
              </Stack>
              <Typography sx={{ fontWeight: 900, fontSize: "1.8rem", color: c.color, mt: 'auto' }}>{c.value}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, mt: 0.5 }}>{c.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_INSET }}>
          <PointOfSaleOutlined sx={{ fontSize: 56, color: "#94A3B8", mb: 2 }} />
          <Typography sx={{ fontWeight: 800, color: TEAL, fontSize: "1.2rem" }}>No sales data for this filter</Typography>
          <Typography sx={{ color: "#64748B", mt: 1, fontWeight: 500 }}>Try <strong>All Time</strong> or clear branch/person filters.</Typography>
        </Paper>
      ) : (
        <>
          {/* Sales trend */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_RAISED, border: "1px solid rgba(255,255,255,0.6)" }}>
            <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem" }}>Sales Trend</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mb: 3, fontWeight: 500 }}>New bookings per day</Typography>
            <Box sx={{ p: 2, borderRadius: "20px", bgcolor: NEU_BG, boxShadow: NEU_INSET }}>
              <BarChart data={dailySales} color="#2563EB" height={190} />
            </Box>
          </Paper>

          <Grid container spacing={3} mb={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_RAISED, border: "1px solid rgba(255,255,255,0.6)", height: "100%" }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                  <BusinessOutlined sx={{ color: TEAL }} />
                  <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem" }}>By Branch</Typography>
                </Stack>
                <Box sx={{ p: 2, borderRadius: "20px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
                  <HorizontalBars items={byBranch.length ? byBranch : [{ label: "No data", value: 0, color: "#E2E8F0" }]} />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_RAISED, border: "1px solid rgba(255,255,255,0.6)", height: "100%" }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                  <PersonOutline sx={{ color: TEAL }} />
                  <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem" }}>Sales Leaderboard</Typography>
                </Stack>
                <Box sx={{ p: 2, borderRadius: "20px", bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
                  <HorizontalBars items={salesLeaderboard.slice(0, 8).map((s, i) => ({
                    label: s.name,
                    value: s.bookings,
                    sub: `SAR ${s.revenue.toLocaleString()}`,
                    color: i === 0 ? GOLD : BRANCH_COLORS[(i + 1) % BRANCH_COLORS.length],
                  }))} />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Leaderboard table */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_RAISED, border: "1px solid rgba(255,255,255,0.6)" }}>
            <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.2rem", mb: 3 }}>Sales Team Performance</Typography>
            <TableContainer sx={{ borderRadius: "20px", overflow: "hidden", bgcolor: NEU_BG, boxShadow: NEU_INSET }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Rank", "Sales Person", "Bookings", "Revenue (SAR)", "Paid", "Unpaid", "Paid %"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748B", py: 2, borderBottomColor: "rgba(0,0,0,0.05)" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesLeaderboard.map((s, i) => (
                    <TableRow key={s.name} sx={{ bgcolor: i === 0 ? "#FFFBEB" : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.3)', '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontWeight: 900, color: i === 0 ? GOLD : TEAL, py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>#{i + 1}</TableCell>
                      <TableCell sx={{ py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: i === 0 ? GOLD : TEAL, fontSize: "0.85rem", fontWeight: 800, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>{s.name.charAt(0)}</Avatar>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{s.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: "0.9rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>{s.bookings}</TableCell>
                      <TableCell sx={{ fontWeight: 900, color: "#059669", fontSize: "0.9rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>{s.revenue.toLocaleString()}</TableCell>
                      <TableCell sx={{ py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}><Chip label={s.paid} size="small" color="success" sx={{ fontWeight: 700, minWidth: 32, borderRadius: "8px" }} /></TableCell>
                      <TableCell sx={{ py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}><Chip label={s.unpaid} size="small" color="error" sx={{ fontWeight: 700, minWidth: 32, borderRadius: "8px" }} /></TableCell>
                      <TableCell sx={{ fontWeight: 800, color: TEAL, fontSize: "0.9rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>{s.bookings ? Math.round((s.paid / s.bookings) * 100) : 0}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Recent bookings */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_RAISED, border: "1px solid rgba(255,255,255,0.6)" }}>
            <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.2rem", mb: 3 }}>Recent Bookings ({filtered.length})</Typography>
            <TableContainer sx={{ borderRadius: "20px", overflow: "hidden", bgcolor: NEU_BG, boxShadow: NEU_INSET }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Date", "Tracking", "Shipper", "Branch", "Sales Person", "Amount (SAR)", "Payment", "Cargo"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748B", py: 2, borderBottomColor: "rgba(0,0,0,0.05)" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.slice(0, 15).map((b, i) => (
                    <TableRow key={b._id} sx={{ bgcolor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.3)', '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#64748B", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)", fontWeight: 600 }}>
                        {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 900, color: TEAL, fontSize: "0.85rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>{b.tracking_number}</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)", fontWeight: 500 }}>{b.sender_name}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>{b.branch || "—"}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>{b.sales_person_id || "—"}</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: "0.85rem", py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)", color: TEAL }}>{(b.payment_amount || 0).toLocaleString()}</TableCell>
                      <TableCell sx={{ py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)" }}>{paymentChip(b.payment_status)}</TableCell>
                      <TableCell sx={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, py: 1.5, borderBottomColor: "rgba(0,0,0,0.05)", color: "#64748B" }}>{b.cargo_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
