import { apiFetch } from "@/services/apiFetch";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Typography, Grid, Paper, Stack, CircularProgress,
  ToggleButton, ToggleButtonGroup, TextField, Button, Chip, Tooltip, LinearProgress,
} from "@mui/material";
import {
  TrendingUpOutlined, LocalShippingOutlined, FlightTakeoffOutlined,
  AttachMoneyOutlined, RefreshOutlined, CheckCircleOutline,
  GroupOutlined, Inventory2Outlined, CalendarMonthOutlined,
} from "@mui/icons-material";
import { ALL_STATUS_OPTIONS, type BookingStatus } from "../shared/bookingWorkflow";

const TEAL = "#004652";
const GOLD = "#CC9D2F";
const FONT = "'Montserrat', sans-serif";
const NEU_BG = "#F8FAFC";
const NEU_RAISED = "0 4px 12px rgba(0, 0, 0, 0.05)";
const NEU_INSET = "none";
const NEU_INSET_SM = "none";

type DatePreset = "today" | "7d" | "30d" | "90d" | "all" | "custom";

interface BookingRow {
  _id: string;
  status: BookingStatus;
  payment_status: string;
  payment_amount?: number;
  cargo_type: "air" | "sea";
  branch?: string;
  createdAt: string;
}

interface MoveGroupRow {
  _id: string;
  group_code: string;
  package_count: number;
  from_label: string;
  to_label: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94A3B8",
  collect_item: "#D97706",
  move_to_warehouse_sa: "#2563EB",
  loading_box: "#475569",
  shipment_manifest: "#7C3AED",
  arrived_warehouse_sl: "#059669",
  ready_for_delivery: "#EA580C",
  delivered: "#16A34A",
  cancelled: "#DC2626",
};

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
    return {
      from: startOfDay(new Date(customFrom)),
      to: customTo ? endOfDay(new Date(customTo)) : endOfDay(now),
    };
  }
  if (preset === "today") return { from: startOfDay(now), to: endOfDay(now) };
  if (preset === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  if (preset === "30d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 29);
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  if (preset === "90d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 89);
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

function toDateKey(d: Date) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

function buildDailySeries(items: { createdAt: string }[], from: Date | null, to: Date | null, days = 14) {
  const end = to ? startOfDay(to) : startOfDay(new Date());
  const start = from ? startOfDay(from) : (() => {
    const s = new Date(end);
    s.setDate(s.getDate() - (days - 1));
    return s;
  })();

  const buckets: { label: string; date: Date; dateKey: string; count: number }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    buckets.push({ label: fmtShort(cur), date: new Date(cur), dateKey: toDateKey(cur), count: 0 });
    cur.setDate(cur.getDate() + 1);
    cur.setHours(0, 0, 0, 0); // prevent timezone/DST drifting
  }

  for (const item of items) {
    const itemKey = toDateKey(new Date(item.createdAt));
    const bucket = buckets.find(b => b.dateKey === itemKey);
    if (bucket) bucket.count++;
  }

  return buckets.slice(-Math.min(buckets.length, 30));
}

function BarChart({ data, color = TEAL, height = 160 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <Stack direction="row" alignItems="flex-end" spacing={0.75} sx={{ height, pt: 1 }}>
      {data.map((d, i) => (
        <Tooltip key={i} title={`${d.label}: ${d.value}`} arrow>
          <Stack alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: TEAL, mb: 0.5 }}>
              {d.value > 0 ? d.value : ""}
            </Typography>
            <Box sx={{
              width: "100%", maxWidth: 36, borderRadius: "6px 6px 2px 2px",
              height: `${Math.max(4, (d.value / max) * (height - 40))}px`,
              bgcolor: d.value > 0 ? color : "rgba(255,255,255,0.4)",
              transition: "height 0.4s ease", boxShadow: d.value > 0 ? "0 4px 10px rgba(0,70,82,0.15)" : "none",
            }} />
            <Typography sx={{ fontSize: "0.55rem", color: "#64748B", mt: 0.75, fontWeight: 700, textAlign: "center", lineHeight: 1.1 }}>
              {d.label}
            </Typography>
          </Stack>
        </Tooltip>
      ))}
    </Stack>
  );
}

function HorizontalBars({ items }: { items: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <Stack spacing={1.5}>
      {items.map(item => (
        <Box key={item.label}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569" }}>{item.label}</Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: TEAL }}>{item.value}</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={(item.value / max) * 100}
            sx={{
              height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.5)", boxShadow: NEU_INSET_SM,
              "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
            }}
          />
        </Box>
      ))}
    </Stack>
  );
}

function DonutLegend({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  let acc = 0;
  const gradient = items.map(i => {
    const start = (acc / total) * 100;
    acc += i.value;
    return `${i.color} ${start}% ${(acc / total) * 100}%`;
  }).join(", ");

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
      <Box sx={{
        width: 120, height: 120, borderRadius: "50%", flexShrink: 0,
        background: total > 0 ? `conic-gradient(${gradient})` : "rgba(255,255,255,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05), inset 0 2px 10px rgba(0,0,0,0.1)",
        position: "relative",
      }}>
        <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.3rem", color: TEAL }}>{total}</Typography>
        </Box>
      </Box>
      <Stack spacing={1} flex={1}>
        {items.map(i => (
          <Stack key={i.label} direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: i.color }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, flex: 1 }}>{i.label}</Typography>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: TEAL }}>{i.value}</Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>({Math.round((i.value / total) * 100)}%)</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState(false);
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [moveGroups, setMoveGroups] = useState<MoveGroupRow[]>([]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setSyncError(false);
    try {
      const [bRes, gRes] = await Promise.all([
        apiFetch("/api/bookings"),
        apiFetch("/api/move-groups"),
      ]);
      if (!bRes.ok) throw new Error("bookings failed");
      const bJson = await bRes.json();
      setBookings(bJson.data || []);
      if (gRes.ok) {
        const gJson = await gRes.json();
        setMoveGroups(gJson.data || []);
      }
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

  const filteredBookings = useMemo(
    () => bookings.filter(b => inRange(b.createdAt, from, to)),
    [bookings, from, to]
  );

  const filteredGroups = useMemo(
    () => moveGroups.filter(g => inRange(g.createdAt, from, to)),
    [moveGroups, from, to]
  );

  const stats = useMemo(() => {
    const totalRevenue = filteredBookings.reduce((s, b) => s + (b.payment_amount || 0), 0);
    const paid = filteredBookings.filter(b => b.payment_status === "paid").length;
    const delivered = filteredBookings.filter(b => b.status === "delivered").length;
    const inProgress = filteredBookings.filter(b => !["delivered", "cancelled", "draft"].includes(b.status)).length;
    const packagesMoved = filteredGroups.reduce((s, g) => s + g.package_count, 0);
    return { total: filteredBookings.length, totalRevenue, paid, delivered, inProgress, packagesMoved, groups: filteredGroups.length };
  }, [filteredBookings, filteredGroups]);

  const dailyBookings = useMemo(
    () => buildDailySeries(filteredBookings, from, to).map(b => ({ label: b.label, value: b.count })),
    [filteredBookings, from, to]
  );

  const dailyGroups = useMemo(
    () => buildDailySeries(filteredGroups, from, to).map(b => ({ label: b.label, value: b.count })),
    [filteredGroups, from, to]
  );

  const pipelineData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of filteredBookings) {
      counts.set(b.status, (counts.get(b.status) || 0) + 1);
    }
    return ALL_STATUS_OPTIONS
      .map(o => ({
        label: o.label,
        value: counts.get(o.value) || 0,
        color: STATUS_COLORS[o.value] || TEAL,
      }))
      .filter(i => i.value > 0);
  }, [filteredBookings]);

  const paymentData = useMemo(() => {
    const map = { paid: 0, unpaid: 0, partial: 0, pending: 0 };
    for (const b of filteredBookings) {
      const k = b.payment_status as keyof typeof map;
      if (k in map) map[k]++;
    }
    return [
      { label: "Paid", value: map.paid, color: "#10B981" },
      { label: "Unpaid", value: map.unpaid, color: "#EF4444" },
      { label: "Partial", value: map.partial, color: "#F59E0B" },
      { label: "Pending", value: map.pending, color: "#64748B" },
    ].filter(i => i.value > 0);
  }, [filteredBookings]);

  const cargoData = useMemo(() => {
    const air = filteredBookings.filter(b => b.cargo_type === "air").length;
    const sea = filteredBookings.filter(b => b.cargo_type === "sea").length;
    return [
      { label: "Air Cargo", value: air, color: "#0EA5E9" },
      { label: "Sea Cargo", value: sea, color: "#6366F1" },
    ].filter(i => i.value > 0);
  }, [filteredBookings]);

  const rangeLabel = useMemo(() => {
    if (preset === "all") return "All time";
    if (preset === "today") return "Today";
    if (preset === "custom" && customFrom) {
      return `${customFrom}${customTo ? ` → ${customTo}` : " → now"}`;
    }
    return preset === "7d" ? "Last 7 days" : preset === "30d" ? "Last 30 days" : "Last 90 days";
  }, [preset, customFrom, customTo]);

  const kpiCards = [
    { label: "Bookings", value: stats.total, sub: rangeLabel, icon: <Inventory2Outlined />, color: TEAL, bg: "rgba(0,70,82,0.08)" },
    { label: "Revenue (SAR)", value: stats.totalRevenue.toLocaleString(), sub: `${stats.paid} paid`, icon: <AttachMoneyOutlined />, color: "#059669", bg: "rgba(5,150,105,0.08)" },
    { label: "Delivered", value: stats.delivered, sub: `${stats.inProgress} in pipeline`, icon: <CheckCircleOutline />, color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
    { label: "Move Groups", value: stats.groups, sub: `${stats.packagesMoved} packages moved`, icon: <GroupOutlined />, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  ];

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 12 }}>
        <CircularProgress sx={{ color: TEAL }} />
        <Typography sx={{ fontFamily: FONT, color: "#64748B", mt: 2, fontWeight: 600 }}>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: FONT }}>
      {/* Header */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={3} spacing={2}>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: "1.5rem", color: TEAL }}>Analytics</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.9rem", fontWeight: 500, mt: 0.5 }}>
            Live cargo operations — charts update when you change the date range
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncError ? "#EF4444" : "#10B981", boxShadow: `0 0 8px ${syncError ? "#EF4444" : "#10B981"}` }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", letterSpacing: "0.02em" }}>
              {syncError ? "Sync error — check backend" : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "—"}
            </Typography>
            {refreshing && <CircularProgress size={12} sx={{ color: TEAL }} />}
          </Stack>
        </Box>
        <Button variant="contained" startIcon={<RefreshOutlined />} onClick={() => fetchData(true)}
          sx={{ bgcolor: "rgba(0, 70, 82, 0.05)", color: TEAL, border: "1px solid rgba(0, 70, 82, 0.12)", fontWeight: 800, borderRadius: "12px", px: 3, py: 1, "&:hover": { bgcolor: "rgba(0, 70, 82, 0.1)" } }}>
          Refresh
        </Button>
      </Stack>

      {/* Date filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <CalendarMonthOutlined sx={{ color: TEAL, fontSize: 20 }} />
          <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</Typography>
          <Chip label={rangeLabel} size="small" sx={{ fontWeight: 700, bgcolor: TEAL, color: "#FFF", borderRadius: "8px" }} />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "stretch", sm: "center" }} flexWrap="wrap" useFlexGap>
          <Box sx={{ display: 'inline-block', p: 0.5, borderRadius: '12px', bgcolor: "#F1F5F9", border: "1px solid #E2E8F0" }}>
            <ToggleButtonGroup exclusive size="small" value={preset} onChange={(_, v) => v && setPreset(v)}
              sx={{ flexWrap: "wrap", gap: 1 }}>
              {(["today", "7d", "30d", "90d", "all", "custom"] as DatePreset[]).map(p => (
                <ToggleButton key={p} value={p} sx={{ fontFamily: FONT, fontWeight: 700, textTransform: "none", borderRadius: "8px !important", border: "none !important", px: 3, py: 1, color: preset === p ? TEAL : "#64748B", bgcolor: preset === p ? "#FFFFFF" : "transparent", boxShadow: preset === p ? "0 1px 3px rgba(0,0,0,0.08)" : "none", "&.Mui-selected": { color: TEAL, bgcolor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, "&:hover": { bgcolor: "rgba(0,70,82,0.04)" } }}>
                  {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : p === "all" ? "All Time" : p === "custom" ? "Custom" : "Today"}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          {preset === "custom" && (
            <Stack direction="row" spacing={2} sx={{ p: 1.5, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <TextField type="date" size="small" label="From" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#FFFFFF", "& fieldset": { borderColor: "#E2E8F0" } } }} />
              <TextField type="date" size="small" label="To" value={customTo} onChange={e => setCustomTo(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: "#FFFFFF", "& fieldset": { borderColor: "#E2E8F0" } } }} />
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* KPI cards */}
      <Grid container spacing={3} mb={3}>
        {kpiCards.map(c => (
          <Grid key={c.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0", height: "100%", display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography sx={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</Typography>
                <Box sx={{ p: 1, borderRadius: "12px", bgcolor: c.bg, color: c.color, display: "flex", alignItems: "center" }}>{c.icon}</Box>
              </Stack>
              <Typography sx={{ fontWeight: 900, fontSize: "1.9rem", color: c.color, mt: 'auto', lineHeight: 1 }}>{c.value}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, mt: 1 }}>{c.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {filteredBookings.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: "24px", bgcolor: NEU_BG, boxShadow: NEU_INSET }}>
          <TrendingUpOutlined sx={{ fontSize: 56, color: "#94A3B8", mb: 2 }} />
          <Typography sx={{ fontWeight: 800, color: TEAL, fontSize: "1.2rem", mb: 1 }}>No data for this date range</Typography>
          <Typography sx={{ color: "#64748B", fontSize: "0.95rem", fontWeight: 500 }}>
            Try <strong>All Time</strong> or a wider range. Bookings appear here when created in New Booking.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Bookings trend */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem" }}>Bookings Over Time</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 500 }}>New bookings per day in selected range</Typography>
              </Box>
              <Chip label={`${stats.total} total`} size="small" sx={{ fontWeight: 800, bgcolor: TEAL, color: "#FFF", borderRadius: "8px" }} />
            </Stack>
            <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <BarChart data={dailyBookings} color={TEAL} height={190} />
            </Box>
          </Paper>

          <Grid container spacing={3} mb={3}>
            {/* Pipeline */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0", height: "100%" }}>
                <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem", mb: 0.5 }}>Workflow Pipeline</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mb: 3, fontWeight: 500 }}>Packages at each stage (in range)</Typography>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <HorizontalBars items={pipelineData.length ? pipelineData : [{ label: "No data", value: 0, color: "rgba(255,255,255,0.5)" }]} />
                </Box>
              </Paper>
            </Grid>

            {/* Payment */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0", height: "100%" }}>
                <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem", mb: 0.5 }}>Payment Status</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mb: 3, fontWeight: 500 }}>Breakdown of payment collection</Typography>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  {paymentData.length > 0 ? (
                    <DonutLegend items={paymentData} />
                  ) : (
                    <Typography sx={{ color: "#94A3B8", fontStyle: "italic", textAlign: 'center', py: 2 }}>No payment data</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Cargo type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
                  <FlightTakeoffOutlined sx={{ color: "#0EA5E9" }} />
                  <LocalShippingOutlined sx={{ color: "#6366F1" }} />
                  <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem" }}>Air vs Sea Cargo</Typography>
                </Stack>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  {cargoData.length > 0 ? (
                    <DonutLegend items={cargoData} />
                  ) : (
                    <Typography sx={{ color: "#94A3B8", textAlign: 'center', py: 2 }}>No cargo data</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Move groups trend */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.1rem", mb: 0.5 }}>Move Groups Activity</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mb: 3, fontWeight: 500 }}>
                  Groups created per day · {stats.packagesMoved} packages moved total
                </Typography>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  {filteredGroups.length > 0 ? (
                    <BarChart data={dailyGroups} color={GOLD} height={140} />
                  ) : (
                    <Typography sx={{ color: "#94A3B8", fontStyle: "italic", py: 4, textAlign: "center" }}>
                      No move groups in this range yet
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
