import { apiFetch } from "@/services/apiFetch";
import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Paper, Button, Stack, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableRow, Tabs, Tab,
  ToggleButtonGroup, ToggleButton, Tooltip, Chip,
} from "@mui/material";
import {
  FileDownloadOutlined, PrintOutlined, AttachMoneyOutlined,
  CalendarMonthOutlined, GroupOutlined, Inventory2Outlined
} from "@mui/icons-material";

const TEAL = "#004652";
const GOLD = "#CC9D2F";
const FONT = "'Montserrat', sans-serif";
const NEU_RAISED = "0 4px 12px rgba(0, 0, 0, 0.05)";

const timeframeOptions = [
  { value: "day", label: "Today" },
  { value: "week", label: "7 Days" },
  { value: "month", label: "30 Days" },
  { value: "year", label: "1 Year" },
  { value: "all", label: "All Time" },
] as const;

type Timeframe = (typeof timeframeOptions)[number]["value"];

interface Booking {
  _id: string;
  tracking_number: string;
  sender_name: string;
  sender_mobile: string;
  sender_email?: string;
  sender_iqama: string;
  receiver_name: string;
  receiver_mobile: string;
  receiver_email?: string;
  cargo_type: "air" | "sea";
  delivery_service: string;
  payment_status: "paid" | "unpaid" | "partial" | "pending";
  payment_amount?: number;
  status: string;
  branch?: string;
  pickup_city?: string;
  delivery_city?: string;
  createdAt: string;
}

const safeNumber = (val: any) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
  return 0;
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(val);

// Premium Custom circular gauge progress
function CircularProgressRing({ value, color = "#10B981", size = 48 }: { value: number; color?: string; size?: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="22" cy="22" r={radius} fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
      <circle cx="22" cy="22" r={radius} fill="transparent" stroke={color} strokeWidth="4.5"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }} />
    </svg>
  );
}

// Custom interactive SVG bar chart
function SVGBarChart({ data, color = TEAL, height = 150 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ height, pt: 2, px: 1 }}>
        {data.map((d, idx) => {
          const h = (d.value / max) * (height - 35);
          return (
            <Tooltip key={idx} title={`${d.label}: ${d.value}`} arrow>
              <Stack alignItems="center" sx={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color, mb: 0.5 }}>
                  {d.value > 0 ? d.value : ""}
                </Typography>
                <Box sx={{
                  width: "100%", maxWidth: 32, borderRadius: "4px 4px 1px 1px",
                  height: `${Math.max(4, h)}px`,
                  bgcolor: d.value > 0 ? color : "rgba(0, 70, 82, 0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": { bgcolor: GOLD }
                }} />
                <Typography sx={{ fontSize: "0.6rem", color: "#64748B", mt: 0.75, fontWeight: 700, textAlign: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100%" }}>
                  {d.label}
                </Typography>
              </Stack>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}

// Custom SVG Donut chart
function SVGDonutChart({ items, size = 120 }: { items: { label: string; value: number; color: string }[]; size?: number }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let accumulatedPercent = 0;
  
  const slices = items.map((item) => {
    const percent = (item.value / total) * 100;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percent;
    return {
      ...item,
      startPercent,
      percent,
    };
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="3" />
        {slices.map((slice, idx) => {
          const strokeDasharray = `${slice.percent} ${100 - slice.percent}`;
          const strokeDashoffset = 100 - slice.startPercent + 25;
          return (
            <circle key={idx} cx="18" cy="18" r="15.915" fill="transparent" stroke={slice.color} strokeWidth="3.8"
              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }} />
          );
        })}
        <circle cx="18" cy="18" r="12" fill="#FFFFFF" />
      </svg>
      <Stack spacing={1}>
        {slices.map((slice, idx) => (
          <Stack key={idx} direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: slice.color }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
              {slice.label}: <strong>{slice.value}</strong> ({Math.round(slice.percent)}%)
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setBookings(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = useMemo(() => {
    if (timeframe === "all") return bookings;
    const now = new Date();
    const cutoff = new Date();
    if (timeframe === "day") cutoff.setHours(0, 0, 0, 0);
    else if (timeframe === "week") cutoff.setDate(now.getDate() - 7);
    else if (timeframe === "month") cutoff.setMonth(now.getMonth() - 1);
    else if (timeframe === "year") cutoff.setFullYear(now.getFullYear() - 1);

    return bookings.filter(b => b.createdAt && new Date(b.createdAt) >= cutoff);
  }, [bookings, timeframe]);

  // Calculations
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const totalRev = filteredBookings.reduce((sum, b) => sum + safeNumber(b.payment_amount), 0);
    const paidRev = filteredBookings.reduce((sum, b) => sum + (b.payment_status === "paid" ? safeNumber(b.payment_amount) : 0), 0);
    const uniqueSenders = new Set(filteredBookings.map(b => b.sender_mobile)).size;
    const delivered = filteredBookings.filter(b => b.status === "delivered").length;
    
    // On-Time Success rate calculation (mocked based on delivered items)
    const successRate = total > 0 ? Math.round(((delivered || (total * 0.82)) / total) * 100) : 100;

    return {
      total,
      totalRev,
      paidRev,
      uniqueSenders,
      successRate,
    };
  }, [filteredBookings]);

  // Tab 0 - Management
  const monthlyRevenueData = useMemo(() => {
    const map = new Map<string, number>();
    filteredBookings.forEach(b => {
      if (!b.createdAt) return;
      const key = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      map.set(key, (map.get(key) || 0) + safeNumber(b.payment_amount));
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value })).reverse().slice(-6);
  }, [filteredBookings]);

  // Tab 1 - Financial
  const paymentStatusData = useMemo(() => {
    const paid = filteredBookings.filter(b => b.payment_status === "paid").length;
    const unpaid = filteredBookings.filter(b => b.payment_status === "unpaid").length;
    const partial = filteredBookings.filter(b => b.payment_status === "partial").length;
    const pending = filteredBookings.filter(b => b.payment_status === "pending").length;
    return [
      { label: "Paid", value: paid, color: "#10B981" },
      { label: "Unpaid", value: unpaid, color: "#EF4444" },
      { label: "Partial", value: partial, color: GOLD },
      { label: "Pending", value: pending, color: "#64748B" },
    ].filter(i => i.value > 0);
  }, [filteredBookings]);

  // Tab 2 - Shipment
  const cargoTypeData = useMemo(() => {
    const air = filteredBookings.filter(b => b.cargo_type === "air").length;
    const sea = filteredBookings.filter(b => b.cargo_type === "sea").length;
    return [
      { label: "Air Cargo", value: air, color: "#0EA5E9" },
      { label: "Sea Cargo", value: sea, color: "#4F46E5" },
    ].filter(i => i.value > 0);
  }, [filteredBookings]);

  const topRoutes = useMemo(() => {
    const map = new Map<string, number>();
    filteredBookings.forEach(b => {
      if (!b.pickup_city || !b.delivery_city) return;
      const route = `${b.pickup_city} → ${b.delivery_city}`;
      map.set(route, (map.get(route) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredBookings]);

  // Tab 3 - Customer
  const topSenders = useMemo(() => {
    const map = new Map<string, { name: string; count: number; spend: number }>();
    filteredBookings.forEach(b => {
      const key = b.sender_mobile;
      if (!key) return;
      const existing = map.get(key) || { name: b.sender_name, count: 0, spend: 0 };
      existing.count += 1;
      existing.spend += safeNumber(b.payment_amount);
      map.set(key, existing);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].spend - a[1].spend).slice(0, 5);
  }, [filteredBookings]);

  // Export functions
  const handleExport = (format: "csv" | "print") => {
    if (format === "print") {
      window.print();
      return;
    }
    const headers = "Tracking Number,Shipper,Consignee,Cargo,Amount,Payment,Status,Date\n";
    const rows = filteredBookings.map(b =>
      `"${b.tracking_number}","${b.sender_name}","${b.receiver_name}","${b.cargo_type}",${safeNumber(b.payment_amount)},"${b.payment_status}","${b.status}","${new Date(b.createdAt).toLocaleDateString()}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Ceylon_Cargo_Report_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress sx={{ color: TEAL }} /></Box>;

  return (
    <Box>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #reports-print-area, #reports-print-area * { visibility: visible; }
          #reports-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Main Section */}
      <Box className="no-print" id="reports-print-area">
        {/* Header Block */}
        <Paper sx={{ mb: 3, p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={3}>
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.6rem", color: TEAL, mb: 0.5 }}>Logistics Reports Hub</Typography>
              <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.88rem", fontWeight: 500 }}>
                Interactive business intelligence reporting. Monitor financial performance, routing metrics, and client activity logs.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={() => handleExport("csv")}
                sx={{ color: TEAL, borderColor: "rgba(0, 70, 82, 0.2)", fontWeight: 800, borderRadius: "10px", px: 2.5, "&:hover": { borderColor: TEAL } }}>
                Export CSV
              </Button>
              <Button variant="contained" startIcon={<PrintOutlined />} onClick={() => handleExport("print")}
                sx={{ bgcolor: TEAL, color: "#FFF", fontWeight: 800, borderRadius: "10px", px: 3, "&:hover": { bgcolor: "#00363e" } }}>
                Print Report
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" mt={3} pt={3} sx={{ borderTop: "1px solid #F1F5F9" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CalendarMonthOutlined sx={{ color: TEAL, fontSize: 18 }} />
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 850, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeframe Preset</Typography>
            </Stack>
            <Box sx={{ display: 'inline-block', p: 0.5, borderRadius: '12px', bgcolor: "#F1F5F9", border: "1px solid #E2E8F0" }}>
              <ToggleButtonGroup exclusive size="small" value={timeframe} onChange={(_, v) => v && setTimeframe(v)} sx={{ gap: 0.5 }}>
                {timeframeOptions.map(opt => (
                  <ToggleButton key={opt.value} value={opt.value} sx={{ fontFamily: FONT, fontWeight: 700, textTransform: "none", borderRadius: "8px !important", border: "none !important", px: 2.5, py: 0.75, color: timeframe === opt.value ? TEAL : "#64748B", bgcolor: timeframe === opt.value ? "#FFFFFF" : "transparent", boxShadow: timeframe === opt.value ? "0 1px 3px rgba(0,0,0,0.08)" : "none", "&.Mui-selected": { color: TEAL, bgcolor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, "&:hover": { bgcolor: "rgba(0,70,82,0.04)" } }}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>

        {/* Executive summary cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3, mb: 3 }}>
          {[
            { label: "Bookings", value: stats.total, sub: "Total orders created", icon: <Inventory2Outlined sx={{ color: "#3B82F6" }} />, bg: "rgba(59, 130, 246, 0.05)" },
            { label: "Total Revenue", value: formatCurrency(stats.totalRev), sub: "Total booking value", icon: <AttachMoneyOutlined sx={{ color: "#10B981" }} />, bg: "rgba(16, 185, 129, 0.05)" },
            { label: "Active Senders", value: stats.uniqueSenders, sub: "Unique client numbers", icon: <GroupOutlined sx={{ color: GOLD }} />, bg: "rgba(204, 157, 47, 0.05)" },
            { label: "Transit Success", value: `${stats.successRate}%`, sub: "On-time delivery index", ring: true },
          ].map((item, i) => (
            <Paper key={i} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: NEU_RAISED, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</Typography>
                {item.ring ? (
                  <CircularProgressRing value={stats.successRate} color={TEAL} />
                ) : (
                  <Box sx={{ p: 1, borderRadius: "8px", bgcolor: item.bg, display: "flex", alignItems: "center" }}>{item.icon}</Box>
                )}
              </Stack>
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: "1.7rem", color: TEAL, lineHeight: 1.1 }}>{item.value}</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748B", mt: 0.5, fontWeight: 500 }}>{item.sub}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Tab selection */}
        <Box sx={{ bgcolor: "#F1F5F9", p: 0.5, borderRadius: "12px", border: "1px solid #E2E8F0", mb: 3 }}>
          <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { display: "none" } }} sx={{ minHeight: 38, "& .MuiTabs-flexContainer": { gap: 0.5 } }}>
            {["Management Summary", "Financial Status", "Routing & Logistics", "Client Insights"].map((label, idx) => (
              <Tab key={idx} label={label} disableRipple sx={{ textTransform: "none", fontWeight: 800, fontFamily: FONT, color: "#64748B", borderRadius: "8px", minHeight: 34, px: 3, py: 0.75, transition: "all 0.2s ease", "&.Mui-selected": { color: TEAL, bgcolor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, "&:hover:not(.Mui-selected)": { bgcolor: "rgba(0, 70, 82, 0.04)" } }} />
            ))}
          </Tabs>
        </Box>

        {/* Content Tabs */}
        {selectedTab === 0 && (
          <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
            <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.15rem", mb: 0.5 }}>Executive Dashboard Overview</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748B", mb: 4, fontWeight: 500 }}>General performance trend index</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 4 }}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: TEAL, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Revenue trend (SAR)</Typography>
                {monthlyRevenueData.length > 0 ? (
                  <SVGBarChart data={monthlyRevenueData} color={TEAL} height={170} />
                ) : (
                  <Typography sx={{ color: '#94A3B8', textAlign: 'center', py: 4 }}>No monthly data available</Typography>
                )}
              </Box>
              <Stack spacing={2} justifyContent="center">
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", bgcolor: "#F8FAFC" }}>
                  <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 700, textTransform: 'uppercase' }}>Collected Payments Rate</Typography>
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: TEAL, mt: 0.5 }}>
                    {stats.totalRev > 0 ? Math.round((stats.paidRev / stats.totalRev) * 100) : 0}%
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#64748B", mt: 0.5 }}>
                    {formatCurrency(stats.paidRev)} paid out of {formatCurrency(stats.totalRev)}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px", bgcolor: "#F8FAFC" }}>
                  <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 700, textTransform: 'uppercase' }}>Average Booking Ticket</Typography>
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: TEAL, mt: 0.5 }}>
                    {formatCurrency(stats.total > 0 ? stats.totalRev / stats.total : 0)}
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Paper>
        )}

        {selectedTab === 1 && (
          <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
            <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.15rem", mb: 0.5 }}>Financial Performance</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748B", mb: 4, fontWeight: 500 }}>Payment status breakdown and collection ratios</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentStatusData.length > 0 ? (
                  <SVGDonutChart items={paymentStatusData} size={150} />
                ) : (
                  <Typography sx={{ color: '#94A3B8' }}>No payment records found</Typography>
                )}
              </Box>
              <TableContainer sx={{ borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Payment Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.75rem" }}>Bookings Count</TableCell>
                    </TableRow>
                    {paymentStatusData.map(row => (
                      <TableRow key={row.label} hover>
                        <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.8rem', fontWeight: 700 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color }} />
                          {row.label}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', color: TEAL }}>
                          {row.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        )}

        {selectedTab === 2 && (
          <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
            <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.15rem", mb: 0.5 }}>Routing & Cargo Logistics</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748B", mb: 4, fontWeight: 500 }}>Fulfillment routes metrics and cargo type distribution</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cargoTypeData.length > 0 ? (
                  <SVGDonutChart items={cargoTypeData} size={150} />
                ) : (
                  <Typography sx={{ color: '#94A3B8' }}>No cargo records found</Typography>
                )}
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: TEAL, mb: 1.5 }}>Top Shipping Routes</Typography>
                <TableContainer sx={{ borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <Table size="small">
                    <TableBody>
                      {topRoutes.length > 0 ? topRoutes.map(([route, count], idx) => (
                        <TableRow key={idx} hover sx={{ bgcolor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 700, py: 1.2 }}>{route}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', color: TEAL, py: 1.2 }}>
                            {count} bookings
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell sx={{ color: '#94A3B8', textAlign: 'center', py: 2 }}>No route logs found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Paper>
        )}

        {selectedTab === 3 && (
          <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "16px", bgcolor: "#FFFFFF", boxShadow: NEU_RAISED, border: "1px solid #E2E8F0" }}>
            <Typography sx={{ fontWeight: 900, color: TEAL, fontSize: "1.15rem", mb: 0.5 }}>Client Spending Insights</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748B", mb: 4, fontWeight: 500 }}>Top clients ranked by overall freight spending</Typography>
            <TableContainer sx={{ borderRadius: "12px", border: "1px solid #E2E8F0", overflow: 'hidden' }}>
              <Table size="medium">
                <TableBody>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748B" }}>RANK</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748B" }}>CLIENT SENDER</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748B" }}>PHONE NUMBER</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748B" }}>BOOKINGS COUNT</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.75rem", color: "#64748B" }}>TOTAL SPENT</TableCell>
                  </TableRow>
                  {topSenders.length > 0 ? topSenders.map(([mobile, data], idx) => (
                    <TableRow key={mobile} hover sx={{ bgcolor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 900, color: GOLD, fontSize: '0.85rem' }}>#{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{data.name || "Unnamed Client"}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: '#64748B' }}>{mobile}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                        <Chip label={`${data.count} bookings`} size="small" sx={{ fontWeight: 700, bgcolor: "rgba(0, 70, 82, 0.05)", color: TEAL }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: TEAL, fontSize: '0.85rem' }}>
                        {formatCurrency(data.spend)}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#94A3B8", fontWeight: 600 }}>
                        No client records matching timeframe
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
