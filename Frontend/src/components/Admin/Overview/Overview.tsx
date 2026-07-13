import { API_BASE_URL as API } from "@/config/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Box, Typography, Stack, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, LinearProgress, Alert,
  Tooltip, Chip,
} from "@mui/material";
import {
  AddCircleOutline, AnalyticsOutlined, AssignmentOutlined, AttachMoneyOutlined,
  ContentPasteSearchOutlined, DashboardCustomizeOutlined,
  DeliveryDiningOutlined, DescriptionOutlined,
  GroupsOutlined, Inventory2Outlined, LocalShippingOutlined, ManageAccountsOutlined,
  PaymentsOutlined, PointOfSaleOutlined, QrCodeScannerOutlined, RefreshOutlined,
  ReportOutlined, SettingsOutlined, TrendingUpOutlined, WarehouseOutlined,
  FlightTakeoffOutlined, DirectionsBoatOutlined, ArrowForwardOutlined,
} from "@mui/icons-material";
import { ALL_STATUS_OPTIONS, type BookingStatus } from "../shared/bookingWorkflow";
import '../Dashboard/DashboardNeumorphism.css';

const TEAL = "#004652";
const GOLD = "#CC9D2F";
const FONT = "'Montserrat', sans-serif";
const NEU_BG = "#F8FAFC";
const NEU_RAISED_SM = "0 2px 8px rgba(0, 0, 0, 0.04)";
const NEU_INSET_SM = "none";

interface OverviewProps {
  onNavigate?: (tab: string) => void;
}

interface BookingRow {
  _id: string;
  tracking_number: string;
  status: BookingStatus;
  sender_name: string;
  receiver_name: string;
  delivery_city: string;
  cargo_type: "air" | "sea";
  payment_status: "unpaid" | "paid" | "partial" | "pending";
  payment_amount?: number;
  branch?: string;
  sales_person_id?: string;
  createdAt: string;
}

interface MoveGroupRow {
  _id: string;
  group_code: string;
  from_label: string;
  to_label: string;
  package_count: number;
  createdAt: string;
}

interface SalesPersonRow {
  _id: string;
  name: string;
  status: string;
}

const stageTabs: {
  status: BookingStatus;
  tab: string;
  label: string;
  hint: string;
  icon: ReactNode;
  color: string;
}[] = [
  { status: "collect_item", tab: "Booking Customer", label: "Booking Customer", hint: "Collect Item", icon: <ContentPasteSearchOutlined />, color: "#D97706" },
  { status: "move_to_warehouse_sa", tab: "Warehouse SA", label: "Warehouse SA", hint: "Saudi warehouse", icon: <WarehouseOutlined />, color: "#2563EB" },
  { status: "loading_box", tab: "Loading List", label: "Loading List", hint: "Ready to load", icon: <AssignmentOutlined />, color: "#475569" },
  { status: "shipment_manifest", tab: "Shipment Manifest", label: "Shipment Manifest", hint: "Documentation", icon: <DescriptionOutlined />, color: "#7C3AED" },
  { status: "arrived_warehouse_sl", tab: "Warehouse SL", label: "Warehouse SL", hint: "Arrived in Sri Lanka", icon: <WarehouseOutlined />, color: "#059669" },
  { status: "ready_for_delivery", tab: "Delivery", label: "Delivery", hint: "Last-mile queue", icon: <DeliveryDiningOutlined />, color: "#EA580C" },
];

const toolCards = [
  { tab: "New Booking", label: "New Booking", hint: "Create customer cargo records", icon: <AddCircleOutline />, color: TEAL },
  { tab: "Analytics", label: "Analytics", hint: "Charts for bookings and movement", icon: <AnalyticsOutlined />, color: "#7C3AED" },
  { tab: "QR Scanner", label: "QR Scanner", hint: "Find a booking quickly", icon: <QrCodeScannerOutlined />, color: "#0EA5E9" },
  { tab: "Sales Dashboard", label: "Sales Dashboard", hint: "Sales and branch performance", icon: <PointOfSaleOutlined />, color: "#2563EB" },
  { tab: "Sales Persons", label: "Sales Persons", hint: "Manage sales team", icon: <GroupsOutlined />, color: "#059669" },
  { tab: "Payments", label: "Payments", hint: "Payment follow-up list", icon: <PaymentsOutlined />, color: "#DC2626" },
  { tab: "Staff Roles", label: "Staff Roles", hint: "Admin access controls", icon: <ManageAccountsOutlined />, color: "#64748B" },
  { tab: "Reports", label: "Reports", hint: "Export and print reports", icon: <ReportOutlined />, color: GOLD },
  { tab: "Settings", label: "Settings", hint: "System admin settings", icon: <SettingsOutlined />, color: "#334155" },
];

const statusLabel = (status: string) =>
  ALL_STATUS_OPTIONS.find((x) => x.value === status)?.label || status.replace(/_/g, " ");

const getStatusChipStyles = (status: BookingStatus) => {
  switch (status) {
    case "draft":
      return { bgcolor: "#E2E8F0", color: "#475569", fontWeight: 700 };
    case "collect_item":
      return { bgcolor: "#FEF3C7", color: "#B45309", fontWeight: 700 };
    case "move_to_warehouse_sa":
      return { bgcolor: "#DBEAFE", color: "#1D4ED8", fontWeight: 700 };
    case "loading_box":
      return { bgcolor: "#F1F5F9", color: "#475569", fontWeight: 700 };
    case "shipment_manifest":
      return { bgcolor: "#EDE9FE", color: "#6D28D9", fontWeight: 700 };
    case "arrived_warehouse_sl":
      return { bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700 };
    case "ready_for_delivery":
      return { bgcolor: "#FFEDD5", color: "#C2410C", fontWeight: 700 };
    case "delivered":
      return { bgcolor: "#D1FAE5", color: "#047857", fontWeight: 700 };
    case "cancelled":
      return { bgcolor: "#FEE2E2", color: "#B91C1C", fontWeight: 700 };
    default:
      return { bgcolor: "#E2E8F0", color: "#475569", fontWeight: 700 };
  }
};

const getPaymentChipStyles = (payStatus: string) => {
  switch (payStatus) {
    case "paid":
      return { bgcolor: "#D1FAE5", color: "#047857", fontWeight: 800 };
    case "unpaid":
      return { bgcolor: "#FEE2E2", color: "#B91C1C", fontWeight: 800 };
    case "partial":
      return { bgcolor: "#FEF3C7", color: "#B45309", fontWeight: 800 };
    case "pending":
      return { bgcolor: "#F1F5F9", color: "#475569", fontWeight: 800 };
    default:
      return { bgcolor: "#F1F5F9", color: "#475569", fontWeight: 800 };
  }
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "-";

const fmtCurrency = (amount: number) =>
  `SAR ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function sameDay(a: string, b = new Date()) {
  return new Date(a).toDateString() === b.toDateString();
}

function MiniStat({
  label, value, sub, icon, color,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <Paper elevation={0} className="neu-stat-card" sx={{ p: 2.5, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.72rem", color: "#64748B", textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
          <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: { xs: "1.35rem", md: "1.65rem" }, color: TEAL, mt: 0.5, lineHeight: 1.1 }}>
            {value}
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontWeight: 600, fontSize: "0.68rem", color: "#94A3B8", mt: 0.75 }}>{sub}</Typography>
        </Box>
        <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Overview({ onNavigate }: OverviewProps) {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [moveGroups, setMoveGroups] = useState<MoveGroupRow[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setSyncError(false);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [bookingRes, groupRes, salesRes] = await Promise.all([
        fetch(`${API}/api/bookings`, { headers }),
        fetch(`${API}/api/move-groups`, { headers }),
        fetch(`${API}/api/sales-persons`, { headers }),
      ]);

      if (!bookingRes.ok) throw new Error("Bookings unavailable");

      const bookingJson = await bookingRes.json();
      const groupJson = groupRes.ok ? await groupRes.json() : { data: [] };
      const salesJson = salesRes.ok ? await salesRes.json() : { data: [] };

      setBookings(bookingJson.data || []);
      setMoveGroups(groupJson.data || []);
      setSalesPersons(salesJson.data || []);
      setLastUpdated(new Date());
    } catch {
      setSyncError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);


  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(timer);
  }, [fetchDashboard]);

  const summary = useMemo(() => {
    const today = bookings.filter((b) => sameDay(b.createdAt)).length;
    const delivered = bookings.filter((b) => b.status === "delivered").length;
    const active = bookings.filter((b) => !["draft", "delivered", "cancelled"].includes(b.status)).length;
    const paidRevenue = bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + (b.payment_amount || 0), 0);
    const pendingRevenue = bookings
      .filter((b) => b.payment_status !== "paid")
      .reduce((sum, b) => sum + (b.payment_amount || 0), 0);
    const unpaid = bookings.filter((b) => b.payment_status === "unpaid").length;
    const air = bookings.filter((b) => b.cargo_type === "air").length;
    const sea = bookings.filter((b) => b.cargo_type === "sea").length;
    const packagesMoved = moveGroups.reduce((sum, g) => sum + (g.package_count || 0), 0);

    return { total: bookings.length, today, delivered, active, paidRevenue, pendingRevenue, unpaid, air, sea, packagesMoved };
  }, [bookings, moveGroups]);

  const stageCounts = useMemo(() => {
    const map = new Map<BookingStatus, number>();
    for (const b of bookings) map.set(b.status, (map.get(b.status) || 0) + 1);
    return map;
  }, [bookings]);

  const paymentCounts = useMemo(() => {
    const counts = { paid: 0, unpaid: 0, partial: 0, pending: 0 };
    for (const b of bookings) counts[b.payment_status] = (counts[b.payment_status] || 0) + 1;
    return counts;
  }, [bookings]);

  const recentBookings = useMemo(() => bookings.slice(0, 7), [bookings]);
  const recentGroups = useMemo(() => moveGroups.slice(0, 5), [moveGroups]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "55vh" }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: TEAL }} size={44} />
          <Typography sx={{ fontFamily: FONT, fontWeight: 700, color: "#64748B" }}>Loading dashboard summary...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: FONT, width: "100%", pb: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} mb={3}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
              <DashboardCustomizeOutlined />
            </Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: { xs: "1.45rem", md: "1.75rem" } }}>
              Operations Dashboard
            </Typography>
          </Stack>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.88rem", fontWeight: 500, ml: 0.5 }}>
            One-page summary for bookings, warehouses, delivery, sales, payments, reports, and system controls.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1} ml={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: syncError ? "#EF4444" : "#10B981", boxShadow: `0 0 6px ${syncError ? '#EF4444' : '#10B981'}` }} />
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B" }}>
              {syncError ? "Sync issue - check backend" : lastUpdated ? `Live · Updated ${lastUpdated.toLocaleTimeString()}` : "Live summary"}
            </Typography>
            {refreshing && <CircularProgress size={12} sx={{ color: TEAL }} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button className="neu-btn" startIcon={<RefreshOutlined />} onClick={() => fetchDashboard(true)}
            sx={{ px: 2.5, py: 1 }}>
            Refresh
          </Button>
          <Button className="neu-btn" startIcon={<QrCodeScannerOutlined />} onClick={() => onNavigate?.("QR Scanner")}
            sx={{ px: 2.5, py: 1, color: '#0EA5E9 !important' }}>
            QR Scanner
          </Button>
          <Button className="neu-btn" startIcon={<AddCircleOutline />} onClick={() => onNavigate?.("New Booking")}
            sx={{ px: 2.5, py: 1, background: `linear-gradient(135deg, ${TEAL}, #0d9488) !important`, color: '#fff !important', boxShadow: `0 8px 20px rgba(0,70,82,0.3) !important` }}>
            New Booking
          </Button>
        </Stack>
      </Stack>

      {syncError && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: "12px", fontFamily: FONT }}>
          Dashboard could not fully sync. Existing tabs are unchanged; check the backend or set VITE_API_URL.
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2, mb: 3 }}>
        <MiniStat label="Total Bookings" value={summary.total} sub={`${summary.today} created today`} icon={<Inventory2Outlined />} color={TEAL} />
        <MiniStat label="Active Pipeline" value={summary.active} sub={`${summary.delivered} delivered`} icon={<LocalShippingOutlined />} color="#2563EB" />
        <MiniStat label="Collected Revenue" value={fmtCurrency(summary.paidRevenue)} sub={`${summary.unpaid} unpaid bookings`} icon={<AttachMoneyOutlined />} color="#059669" />
        <MiniStat label="Move Groups" value={moveGroups.length} sub={`${summary.packagesMoved} packages moved`} icon={<GroupsOutlined />} color="#7C3AED" />
      </Box>

      <Paper elevation={0} className="neu-card" sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "1rem" }}>Workflow Summary</Typography>
              <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.75rem" }}>Current package count in each operational tab</Typography>
            </Box>
            <Box sx={{ px: 2, py: 0.75, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: '0.72rem', color: '#2563EB' }}>{summary.active} active</Typography>
            </Box>
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
            {stageTabs.map((stage) => {
              const count = stageCounts.get(stage.status) || 0;
              const pct = summary.active ? Math.round((count / summary.active) * 100) : 0;
              return (
                <Paper
                  key={stage.status}
                  elevation={0}
                  onClick={() => onNavigate?.(stage.tab)}
                  className="neu-card-sm"
                  sx={{ p: 1.75, cursor: onNavigate ? "pointer" : "default" }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" mb={1.25}>
                    <Box sx={{ width: 38, height: 38, borderRadius: "11px", bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, color: stage.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {stage.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 850, color: TEAL, fontSize: "0.82rem" }} noWrap>{stage.label}</Typography>
                      <Typography sx={{ fontFamily: FONT, color: "#94A3B8", fontSize: "0.66rem", fontWeight: 700 }}>{stage.hint}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: stage.color, fontSize: "1.35rem", lineHeight: 1 }}>{count}</Typography>
                    <Box sx={{ px: 1.5, py: 0.4, borderRadius: '10px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
                      <Typography sx={{ fontFamily: FONT, color: "#64748B", fontWeight: 800, fontSize: "0.66rem" }}>{pct}%</Typography>
                    </Box>
                  </Stack>
                  <LinearProgress variant="determinate" value={pct}
                    sx={{ height: 7, borderRadius: 4, bgcolor: 'rgba(197,202,211,0.5)', boxShadow: NEU_INSET_SM, "& .MuiLinearProgress-bar": { bgcolor: stage.color, borderRadius: 4 } }} />
                </Paper>
              );
            })}
          </Box>
        </Paper>

        <Paper elevation={0} className="neu-card" sx={{ p: 2.5, mb: 3 }}>
          <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "1rem", mb: 0.5 }}>Money & Cargo</Typography>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.75rem", mb: 2 }}>Payment follow-up and cargo mix</Typography>
          <Stack spacing={2}>
            {[
              { label: "Paid", value: paymentCounts.paid, color: "#10B981" },
              { label: "Unpaid", value: paymentCounts.unpaid, color: "#EF4444" },
              { label: "Partial", value: paymentCounts.partial, color: GOLD },
              { label: "Pending", value: paymentCounts.pending, color: "#64748B" },
            ].map((item) => (
              <Box key={item.label}>
                <Stack direction="row" justifyContent="space-between" mb={0.75}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: "#475569", fontSize: "0.76rem" }}>{item.label}</Typography>
                  <Box sx={{ px: 1.5, py: 0.3, borderRadius: '8px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
                    <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: item.color, fontSize: "0.74rem" }}>{item.value}</Typography>
                  </Box>
                </Stack>
                <LinearProgress variant="determinate" value={summary.total ? (item.value / summary.total) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(197,202,211,0.5)', boxShadow: NEU_INSET_SM, "& .MuiLinearProgress-bar": { bgcolor: item.color, borderRadius: 4 } }} />
              </Box>
            ))}
            <Stack direction="row" spacing={1.25} pt={1}>
              <Box sx={{ px: 2, py: 0.75, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: '0.75rem', color: '#0369A1' }}>{summary.air} Air ✈</Typography>
              </Box>
              <Box sx={{ px: 2, py: 0.75, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: '0.75rem', color: '#4338CA' }}>{summary.sea} Sea 🚢</Typography>
              </Box>
            </Stack>
            <Paper elevation={0} className="neu-card-inset" sx={{ p: 1.75 }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: GOLD, fontSize: "0.75rem", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Amount</Typography>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "1.1rem", mt: 0.5 }}>{fmtCurrency(summary.pendingRevenue)}</Typography>
            </Paper>
          </Stack>
        </Paper>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, mb: 3 }}>
        {/* Recent Bookings Card */}
        <Paper elevation={0} className="neu-card" sx={{ overflow: "hidden" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(197,202,211,0.4)' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL }}>
                <Inventory2Outlined fontSize="small" />
              </Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "0.95rem" }}>Recent Bookings</Typography>
            </Stack>
            <Button className="neu-btn" size="small" onClick={() => onNavigate?.("Booking Customer")} sx={{ px: 2 }}>Open Workflow</Button>
          </Stack>
          <TableContainer className="neu-table-container" sx={{ borderRadius: 0 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Tracking", "Customer", "Status", "Payment", "Date"].map((h) => (
                    <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.72rem", color: "#64748B", pb: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow 
                    key={b._id}
                    sx={{ 
                      transition: "all 0.25s ease", 
                      "&:hover": { 
                        bgcolor: "rgba(0, 70, 82, 0.03)", 
                        transform: "translateY(-1px)",
                        boxShadow: "inset 0 -1px 0 rgba(0,70,82,0.1)"
                      } 
                    }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {b.cargo_type === "air" ? (
                          <FlightTakeoffOutlined sx={{ fontSize: 15, color: "#0EA5E9" }} />
                        ) : (
                          <DirectionsBoatOutlined sx={{ fontSize: 15, color: "#4F46E5" }} />
                        )}
                        <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "0.76rem" }}>
                          {b.tracking_number}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontFamily: FONT, fontSize: "0.76rem", color: '#475569', fontWeight: 700, py: 1.5 }}>
                      <Tooltip title={`${b.receiver_name} - ${b.delivery_city}`} arrow>
                        <span>{b.sender_name}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        size="small"
                        label={statusLabel(b.status)}
                        sx={{ ...getStatusChipStyles(b.status), fontSize: "0.62rem", height: 20, borderRadius: "6px", border: "none" }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        size="small"
                        label={b.payment_status}
                        sx={{ ...getPaymentChipStyles(b.payment_status), fontSize: "0.62rem", height: 20, borderRadius: "6px", textTransform: "capitalize", border: "none" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: FONT, color: "#94A3B8", fontWeight: 700, fontSize: "0.72rem", py: 1.5 }}>{fmtDate(b.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {recentBookings.length === 0 && (
                  <TableRow><TableCell colSpan={5} sx={{ py: 5, textAlign: "center", color: "#94A3B8", fontFamily: FONT, fontWeight: 700 }}>No bookings yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Move Groups Card */}
        <Paper elevation={0} className="neu-card" sx={{ overflow: "hidden" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(197,202,211,0.4)' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                <GroupsOutlined fontSize="small" />
              </Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "0.95rem" }}>Recent Move Groups</Typography>
            </Stack>
            <Box sx={{ px: 2, py: 0.6, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_INSET_SM }}>
              <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: '0.72rem', color: '#7C3AED' }}>{moveGroups.length} total</Typography>
            </Box>
          </Stack>
          <TableContainer className="neu-table-container" sx={{ borderRadius: 0 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Group", "Move Transition Path", "Packages", "Date"].map((h) => (
                    <TableCell key={h} sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.72rem", color: "#64748B", pb: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentGroups.map((g) => (
                  <TableRow 
                    key={g._id}
                    sx={{ 
                      transition: "all 0.25s ease", 
                      "&:hover": { 
                        bgcolor: "rgba(124, 58, 237, 0.03)", 
                        transform: "translateY(-1px)",
                        boxShadow: "inset 0 -1px 0 rgba(124,58,237,0.1)"
                      } 
                    }}
                  >
                    <TableCell sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "0.76rem", py: 1.5 }}>
                      {g.group_code}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", color: "#475569", fontWeight: 700 }}>{g.from_label}</Typography>
                        <ArrowForwardOutlined sx={{ fontSize: 11, color: "#94A3B8" }} />
                        <Typography sx={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 850, color: "#7C3AED" }}>{g.to_label}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        size="small"
                        label={`${g.package_count} Packages`}
                        sx={{ bgcolor: "#EDE9FE", color: "#7C3AED", fontWeight: 800, fontSize: "0.65rem", height: 20, borderRadius: "6px" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: FONT, color: "#94A3B8", fontWeight: 700, fontSize: "0.72rem", py: 1.5 }}>{fmtDate(g.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {recentGroups.length === 0 && (
                  <TableRow><TableCell colSpan={4} sx={{ py: 5, textAlign: "center", color: "#94A3B8", fontFamily: FONT, fontWeight: 700 }}>No move groups yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Paper elevation={0} className="neu-card" sx={{ p: 2.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1} mb={2.5}>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "1rem" }}>All Important Tabs</Typography>
            <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.75rem" }}>Friendly shortcuts with live context where available</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Box sx={{ px: 2, py: 0.75, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <GroupsOutlined sx={{ fontSize: 14, color: TEAL }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '0.72rem', color: TEAL }}>{salesPersons.filter((p) => p.status === "Active").length} active sales</Typography>
            </Box>
            <Box sx={{ px: 2, py: 0.75, borderRadius: '20px', bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <TrendingUpOutlined sx={{ fontSize: 14, color: GOLD }} />
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: '0.72rem', color: TEAL }}>{summary.today} today</Typography>
            </Box>
          </Stack>
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
          {toolCards.map((tool) => (
            <Paper
              key={tool.tab}
              elevation={0}
              onClick={() => onNavigate?.(tool.tab)}
              className="neu-card-sm"
              sx={{ p: 1.75, cursor: onNavigate ? "pointer" : "default" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: NEU_BG, boxShadow: NEU_RAISED_SM, color: tool.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {tool.icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 900, color: TEAL, fontSize: "0.84rem" }} noWrap>{tool.label}</Typography>
                  <Typography sx={{ fontFamily: FONT, color: "#64748B", fontWeight: 700, fontSize: "0.68rem" }} noWrap>{tool.hint}</Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
