import { apiFetch } from "@/services/apiFetch";
import { useState, useEffect } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField, MenuItem,
  InputLabel, CircularProgress, Snackbar, Alert, IconButton,
  FormControl, Select, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, FormControlLabel, Grid, InputAdornment
} from "@mui/material";
import { AddOutlined, DeleteOutline,
  FlightTakeoffOutlined, DirectionsBoatOutlined,
  PersonOutline, LocalShippingOutlined,
  PhoneOutlined, MailOutline, BadgeOutlined, HomeOutlined,
  CalendarMonthOutlined, AssignmentOutlined, GavelOutlined,
  PaymentsOutlined, BusinessOutlined, AdminPanelSettingsOutlined,
  InfoOutlined, CheckCircleOutline, CloseOutlined
} from "@mui/icons-material";

const PRIMARY_FONT = "'Montserrat', sans-serif";

const colors = {
  primary: "#004652",
  primaryLight: "#0D9488",
  accent: "#0EA5E9",
  background: "#F8FAFC",
  border: "#E2E8F0",
  textMain: "#0F172A",
  textMuted: "#64748B",
  error: "#F43F5E",
  success: "#10B981"
};

const gradientPrimary = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`;
const gradientHover = `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accent} 100%)`;
const glassShadow = "0 4px 20px 0 rgba(0, 70, 82, 0.03)";
const hoverShadow = "0 20px 30px -10px rgba(13, 148, 136, 0.08)";

const SAUDI_CITIES = ["Abha", "Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Tabuk", "Khobar", "Taif", "Buraidah", "Najran", "Hail"];
const LK_CITIES = ["Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura", "Negombo", "Matara", "Trincomalee", "Batticaloa", "Ratnapura"];
const BRANCHES = ["Jeddah Office", "Riyadh Office", "Dammam Office", "Colombo Warehouse", "Kandy Branch"];
const SALES_PERSONS = ["Ahmed Al-Rashid", "Mohammed Hassan", "Fatima Ali", "System Administrator"];

// 🚀 Status Dropdown Options 🚀
const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "collect_item", label: "Collect Item" },
  { value: "move_to_warehouse_sa", label: "Move to Warehouse SA" },
  { value: "loading_box", label: "Loading Box" },
  { value: "shipment_manifest", label: "Shipment Manifest" },
  { value: "arrived_warehouse_sl", label: "Arrived Warehouse SL" },
  { value: "delivery", label: "Delivery" },
  { value: "cancelled", label: "Cancelled" }
];

interface PackageItem {
  name: string;
  unit: string;
}

interface FormState {
  sender_name: string;
  sender_mobile: string;
  sender_email: string;
  sender_iqama: string;
  sender_passport: string;
  pickup_city: string;
  pickup_address: string;
  collection_date: string;
  receiver_name: string;
  receiver_mobile: string;
  receiver_email: string;
  delivery_city: string;
  receiver_address: string;
  cargo_type: "air" | "sea";
  delivery_service: "door_to_door" | "self_clearance";
  packaging_type: string;
  special_instructions: string;
  package_description: string;
  insurance: boolean;
  payment_status: string;
  payment_amount: string;
  branch: string;
  sales_person_id: string;
  status: string;
}

// --- NEW PROPS INTERFACE ADDED HERE ---
interface UpdateBookingCustomerProps {
  booking: any;
  onBack: () => void;
  onSuccess: () => void;
}

const customInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: PRIMARY_FONT,
    fontSize: "0.85rem",
    backgroundColor: "#fff",
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: colors.border, borderWidth: "1px" },
    "&:hover fieldset": { borderColor: colors.primaryLight },
    "&.Mui-focused fieldset": { borderColor: colors.primaryLight, borderWidth: "1.5px" },
    "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(13, 148, 136, 0.08)" }
  },
  "& .MuiInputBase-input": { padding: "10px 14px", fontFamily: PRIMARY_FONT }
};

const customSelectSx = {
  ...customInputSx,
  "& .MuiSelect-select": { padding: "10px 14px", fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }
};

const labelSx = { 
  fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: "0.72rem", color: colors.primary, 
  mb: 0.75, letterSpacing: 0.8, display: "inline-flex", alignItems: "center", gap: "6px", textTransform: "uppercase"
};

const sectionPaperSx = {
  p: { xs: 2.5, md: 4 }, mb: 4, borderRadius: "16px", border: `1px solid ${colors.border}`,
  bgcolor: "#fff", boxShadow: glassShadow, transition: "all 0.25s ease-in-out",
  "&:hover": { transform: "translateY(-1px)", boxShadow: hoverShadow, borderColor: "rgba(13, 148, 136, 0.15)" }
};

const toggleGroupSx = {
  gap: 2, display: "flex", width: "100%",
  "& .MuiToggleButtonGroup-grouped": { border: "inherit !important", borderRadius: "inherit !important" }
};

const toggleBtnSx = {
  fontFamily: PRIMARY_FONT, textTransform: "none", py: 2, px: 2,
  borderRadius: "12px !important", border: `1px solid ${colors.border} !important`,
  transition: "all 0.2s ease-in-out", backgroundColor: "#fff", color: colors.textMuted,
  overflow: "hidden", position: "relative", flex: 1,
  "&:hover": { borderColor: colors.primaryLight, color: colors.primary, boxShadow: "0 4px 12px rgba(13, 148, 136, 0.05)" },
  "&.Mui-selected": {
    borderColor: `${colors.primaryLight} !important`, color: `${colors.primary} !important`,
    backgroundColor: "rgba(13, 148, 136, 0.04) !important", borderWidth: "1.5px !important",
    boxShadow: "0 6px 16px rgba(13, 148, 136, 0.08)",
    "& .icon-wrapper": { background: gradientPrimary, color: "#fff", boxShadow: "0 4px 10px rgba(0, 70, 82, 0.15)" }
  },
  "&.Mui-disabled": { opacity: 0.4, backgroundColor: "#F8FAFC", borderColor: `${colors.border} !important` }
};

const iosSwitchSx = {
  width: 42, height: 26, padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0, margin: 2, transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)", color: "#fff",
      "& + .MuiSwitch-track": { backgroundColor: colors.primaryLight, opacity: 1, border: 0 },
    },
  },
  "& .MuiSwitch-thumb": { boxSizing: "border-box", width: 22, height: 22 },
  "& .MuiSwitch-track": { borderRadius: 26 / 2, backgroundColor: "#E2E8F0", opacity: 1, transition: "background-color 500ms" },
};

function SectionHeader({ num, title, subtitle }: { num: number; title: string; subtitle?: string }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: "8px", background: gradientPrimary, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800,
        fontSize: "0.85rem", fontFamily: PRIMARY_FONT, boxShadow: "0 4px 10px rgba(0, 70, 82, 0.15)"
      }}>{num}</Box>
      <Box>
        <Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 800, color: colors.primary, fontSize: "1.05rem", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: PRIMARY_FONT, color: colors.textMuted, fontSize: "0.78rem", mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

const parsePackageDescription = (desc: string): PackageItem[] => {
  if (!desc) return [{ name: "", unit: "" }];
  return desc.split(", ").map(item => {
    const match = item.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    return {
      name: match?.[1]?.trim() || item.trim(),
      unit: match?.[2]?.trim() || ""
    };
  });
};

export default function UpdateBookingCustomer({ booking, onBack, onSuccess }: UpdateBookingCustomerProps) {
  
  const [form, setForm] = useState<FormState>({
    sender_name: booking?.sender_name || "",
    sender_mobile: booking?.sender_mobile || "",
    sender_email: booking?.sender_email || "",
    sender_iqama: booking?.sender_iqama || "",
    sender_passport: booking?.sender_passport || "",
    pickup_city: booking?.pickup_city || "",
    pickup_address: booking?.pickup_address || "",
    collection_date: booking?.collection_date ? booking.collection_date.slice(0, 10) : "",
    receiver_name: booking?.receiver_name || "",
    receiver_mobile: booking?.receiver_mobile || "",
    receiver_email: booking?.receiver_email || "",
    delivery_city: booking?.delivery_city || "",
    receiver_address: booking?.receiver_address || "",
    cargo_type: booking?.cargo_type || "air",
    delivery_service: booking?.delivery_service || "door_to_door",
    packaging_type: booking?.packaging_type || "carton_box",
    special_instructions: booking?.special_instructions || "",
    package_description: booking?.package_description || "",
    insurance: booking?.insurance || false,
    payment_status: booking?.payment_status || "unpaid",
    payment_amount: booking?.payment_amount?.toString() || "",
    branch: booking?.branch || "",
    sales_person_id: booking?.sales_person_id || "",
    status: booking?.status || "draft"
  });

  const [packageItems, setPackageItems] = useState<PackageItem[]>(() => 
    parsePackageDescription(booking?.package_description || "")
  );

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });

  const notify = (msg: string, sev: "success" | "error") => setSnack({ open: true, msg, sev });
  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    setForm((p) => {
      const updates: Partial<FormState> = {
        packaging_type: p.cargo_type === "air" ? "carton_box" : "wooden_box",
      };
      if (p.cargo_type === "air") updates.delivery_service = "door_to_door";
      return { ...p, ...updates };
    });
  }, [form.cargo_type]);

  const addPackageItem = () => setPackageItems((prev) => [...prev, { name: "", unit: "" }]);
  
  const updatePackageItem = (idx: number, key: keyof PackageItem, val: string) => {
    setPackageItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: val };
      return next;
    });
  };

  const removePackageItem = (idx: number) => {
    if (packageItems.length > 1) {
      setPackageItems((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const getPackageDescription = () => {
    return packageItems
      .filter((i) => i.name.trim() !== "")
      .map((i) => (i.unit.trim() ? `${i.name} (${i.unit})` : i.name))
      .join(", ");
  };

  const updateBooking = async () => {
    if (!form.sender_name || !form.sender_mobile || !form.sender_iqama) {
      notify("Shipper name, mobile, and IQAMA are required", "error"); return;
    }
    if (!form.receiver_name || !form.receiver_mobile) {
      notify("Consignee name and mobile are required", "error"); return;
    }
    if (!form.pickup_city || !form.pickup_address || !form.delivery_city || !form.receiver_address) {
      notify("Pickup and delivery cities/addresses are required", "error"); return;
    }
    
    const validItems = packageItems.filter((i) => i.name.trim() !== "");
    if (validItems.length === 0) {
      notify("At least one product is required", "error"); return;
    }

    setSaving(true);
    const payload = {
      ...form,
      collection_date: form.collection_date || null,
      package_description: getPackageDescription(),
    };

    try {
      const r = await apiFetch(`/api/bookings/${booking._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok) {
        onSuccess();
        onBack();
      } else {
        notify(j.message || "Failed to update booking", "error");
      }
    } catch {
      notify("Network error — is the backend running?", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "transparent", pb: 4 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap');
        .MuiButton-root, .MuiPaper-root, .MuiOutlinedInput-root, .MuiToggleButton-root {
          transition: all 0.2s ease-in-out !important;
        }
      `}</style>

      <Box sx={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Typography variant="h4" sx={{ fontFamily: PRIMARY_FONT, fontWeight: 800, color: colors.primary }}>
             Edit Booking
           </Typography>
           <Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 600, color: colors.textMuted }}>
             ID: {booking.tracking_number || booking._id}
           </Typography>
        </Box>

        {/* Section 1 — Shipper */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <SectionHeader num={1} title="Shipper Info" subtitle="Sender contact details and pick-up arrangements" />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <PersonOutline sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Shipper Name <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField fullWidth size="small" value={form.sender_name} onChange={set("sender_name")} placeholder="e.g. John Doe" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <PhoneOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Shipper Mobile <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField fullWidth size="small" value={form.sender_mobile} onChange={set("sender_mobile")} placeholder="+966501234567" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <MailOutline sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Shipper Email
              </InputLabel>
              <TextField fullWidth size="small" value={form.sender_email} onChange={set("sender_email")} placeholder="sender@example.com" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <BadgeOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Iqama Number <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField fullWidth size="small" value={form.sender_iqama} onChange={set("sender_iqama")} placeholder="1234567890" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <AssignmentOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Passport Number
              </InputLabel>
              <TextField fullWidth size="small" value={form.sender_passport} onChange={set("sender_passport")} placeholder="N1234567" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <HomeOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Pickup City <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <FormControl fullWidth size="small">
                <Select value={form.pickup_city} onChange={(e) => setForm((p) => ({ ...p, pickup_city: e.target.value }))} displayEmpty sx={customSelectSx}>
                  <MenuItem value="" disabled><em>Select pickup city</em></MenuItem>
                  {SAUDI_CITIES.map((c) => <MenuItem key={c} value={c} sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <CalendarMonthOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Collection Date (Optional)
              </InputLabel>
              <TextField fullWidth size="small" type="date" value={form.collection_date} onChange={set("collection_date")} InputLabelProps={{ shrink: true }} sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <InputLabel sx={labelSx}>
                <HomeOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Pickup Address (Saudi Arabia) <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField fullWidth size="small" multiline rows={2} value={form.pickup_address} onChange={set("pickup_address")}
                placeholder="Enter full street address, building number, district..." inputProps={{ maxLength: 500 }} sx={customInputSx} />
            </Grid>
          </Grid>
        </Paper>

        {/* Section 2 — Consignee */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <SectionHeader num={2} title="Consignee Information" subtitle="Receiver contact details and destination address" />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <PersonOutline sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Consignee Name <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField fullWidth size="small" value={form.receiver_name} onChange={set("receiver_name")} placeholder="e.g. Jane Smith" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <PhoneOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Consignee Mobile <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField fullWidth size="small" value={form.receiver_mobile} onChange={set("receiver_mobile")} placeholder="+94771234567" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <MailOutline sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Consignee Email
              </InputLabel>
              <TextField fullWidth size="small" value={form.receiver_email} onChange={set("receiver_email")} placeholder="receiver@example.com" sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <InputLabel sx={labelSx}>
                <HomeOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Delivery City <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <FormControl fullWidth size="small">
                <Select value={form.delivery_city} onChange={(e) => setForm((p) => ({ ...p, delivery_city: e.target.value }))} displayEmpty sx={customSelectSx}>
                  <MenuItem value="" disabled><em>Select delivery city</em></MenuItem>
                  {LK_CITIES.map((c) => <MenuItem key={c} value={c} sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <InputLabel sx={labelSx}>
                <HomeOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Consignee Address (Sri Lanka) <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField fullWidth size="small" multiline rows={2} value={form.receiver_address} onChange={set("receiver_address")}
                placeholder="Enter full destination address..." inputProps={{ maxLength: 500 }} sx={customInputSx} />
            </Grid>
          </Grid>
        </Paper>

        {/* Section 3 — Cargo Type */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <SectionHeader num={3} title="Cargo Type & Delivery Service" subtitle="Select shipping transit mode and dispatch type" />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel sx={labelSx}>Cargo Type <Box component="span" sx={{ color: colors.error }}>*</Box></InputLabel>
              <ToggleButtonGroup exclusive value={form.cargo_type} onChange={(_, v) => v && setForm((p) => ({ ...p, cargo_type: v }))} fullWidth sx={toggleGroupSx}>
                <ToggleButton value="air" sx={toggleBtnSx}>
                  <Stack alignItems="center" spacing={1.5}>
                    <Box className="icon-wrapper" sx={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F1F5F9", color: colors.primary, transition: "all 0.2s" }}>
                      <FlightTakeoffOutlined sx={{ fontSize: "1.3rem" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", fontFamily: PRIMARY_FONT, color: "inherit" }}>Air Cargo</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="sea" sx={toggleBtnSx}>
                  <Stack alignItems="center" spacing={1.5}>
                    <Box className="icon-wrapper" sx={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F1F5F9", color: colors.primary, transition: "all 0.2s" }}>
                      <DirectionsBoatOutlined sx={{ fontSize: "1.3rem" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", fontFamily: PRIMARY_FONT, color: "inherit" }}>Sea Cargo</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel sx={labelSx}>Delivery Service <Box component="span" sx={{ color: colors.error }}>*</Box></InputLabel>
              <ToggleButtonGroup exclusive value={form.delivery_service} onChange={(_, v) => v && setForm((p) => ({ ...p, delivery_service: v }))} fullWidth sx={toggleGroupSx}>
                <ToggleButton value="door_to_door" sx={toggleBtnSx}>
                  <Stack alignItems="center" spacing={1.5}>
                    <Box className="icon-wrapper" sx={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F1F5F9", color: colors.primary, transition: "all 0.2s" }}>
                      <LocalShippingOutlined sx={{ fontSize: "1.3rem" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", fontFamily: PRIMARY_FONT, color: "inherit" }}>Door to Door</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="self_clearance" disabled={form.cargo_type === "air"} sx={toggleBtnSx}>
                  <Stack alignItems="center" spacing={1.5}>
                    <Box className="icon-wrapper" sx={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: form.cargo_type === "air" ? "#E2E8F0" : "#F1F5F9", color: colors.primary, transition: "all 0.2s" }}>
                      <GavelOutlined sx={{ fontSize: "1.3rem" }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", fontFamily: PRIMARY_FONT, color: "inherit" }}>Self Clearance</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Paper>

        {/* Section 4 — Package Info */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <SectionHeader num={4} title="Package Information" subtitle="Itemized product catalog for cargo list declarations" />
            <Button variant="outlined" startIcon={<AddOutlined />} onClick={addPackageItem} sx={{ borderRadius: "10px", fontFamily: PRIMARY_FONT, textTransform: "none", borderColor: colors.primaryLight, color: colors.primaryLight, fontWeight: 700, fontSize: "0.78rem", px: 2.2, py: 0.75 }}>
              Add Product
            </Button>
          </Stack>
          
          <Box sx={{ display: { xs: "none", md: "block" }, mb: 3 }}>
            <TableContainer sx={{ border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: "0.72rem", color: colors.primary, py: 1.5, letterSpacing: 0.5 }}>PRODUCT NAME *</TableCell>
                    <TableCell sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: "0.72rem", color: colors.primary, py: 1.5, width: "35%", letterSpacing: 0.5 }}>UNIT / WEIGHT *</TableCell>
                    <TableCell sx={{ width: 60, py: 1.5 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {packageItems.map((item, idx) => (
                    <TableRow key={idx} sx={{ "&:hover": { bgcolor: "#F8FAFC" } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField fullWidth size="small" placeholder="e.g. Dry Food, Electronics" value={item.name} onChange={(e) => updatePackageItem(idx, "name", e.target.value)} sx={customInputSx} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField fullWidth size="small" placeholder="e.g. 5 kg, 2 pcs" value={item.unit} onChange={(e) => updatePackageItem(idx, "unit", e.target.value)} sx={customInputSx} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5, textAlign: "center" }}>
                        <IconButton size="small" onClick={() => removePackageItem(idx)} color="error" disabled={packageItems.length === 1} sx={{ bgcolor: "rgba(244, 63, 94, 0.04)" }}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
            {packageItems.map((item, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: "12px", borderColor: colors.border, bgcolor: "#F8FAFC" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: "0.72rem", color: colors.primary }}>PRODUCT #{idx + 1}</Typography>
                  <IconButton size="small" onClick={() => removePackageItem(idx)} color="error" disabled={packageItems.length === 1} sx={{ bgcolor: "rgba(244, 63, 94, 0.04)" }}>
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack spacing={2}>
                  <Box><InputLabel sx={labelSx}>Product Name *</InputLabel><TextField fullWidth size="small" value={item.name} onChange={(e) => updatePackageItem(idx, "name", e.target.value)} sx={customInputSx} /></Box>
                  <Box><InputLabel sx={labelSx}>Unit / Weight *</InputLabel><TextField fullWidth size="small" value={item.unit} onChange={(e) => updatePackageItem(idx, "unit", e.target.value)} sx={customInputSx} /></Box>
                </Stack>
              </Paper>
            ))}
          </Box>

          <InputLabel sx={labelSx}><InfoOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />Special Instructions</InputLabel>
          <TextField fullWidth size="small" multiline rows={2} value={form.special_instructions} onChange={set("special_instructions")} placeholder="e.g. Fragile, Handle with care..." inputProps={{ maxLength: 500 }} sx={customInputSx} />
        </Paper>

        {/* Section 5 — Insurance */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <SectionHeader num={5} title="Insurance & Coverage" subtitle="Protect your cargo shipments against unforeseen events" />
          <Box sx={{ p: 2.5, borderRadius: "12px", border: `1px solid ${colors.border}`, bgcolor: form.insurance ? "rgba(16, 185, 129, 0.02)" : "rgba(248, 250, 252, 0.6)", borderColor: form.insurance ? colors.success : colors.border }}>
            <FormControlLabel control={<Switch checked={form.insurance} onChange={(e) => setForm((p) => ({ ...p, insurance: e.target.checked }))} sx={iosSwitchSx} />}
              label={<Box sx={{ ml: 1.5 }}><Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 700, color: colors.textMain, fontSize: "0.88rem" }}>Add Cargo Insurance Protection</Typography></Box>} sx={{ m: 0, width: "100%" }} />
          </Box>
        </Paper>

        {/* Section 6 — Payment & Admin */}
        <Paper elevation={0} sx={{ ...sectionPaperSx, mb: { xs: 16, sm: 14 } }}>
          <SectionHeader num={6} title="Payment & Administrative Details" subtitle="Revenue tracking, branch assignment and agent info" />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InputLabel sx={labelSx}><PaymentsOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />Payment Status *</InputLabel>
              <FormControl fullWidth size="small">
                <Select value={form.payment_status} onChange={(e) => setForm((p) => ({ ...p, payment_status: e.target.value }))} sx={customSelectSx}>
                  {["unpaid", "paid", "partial", "pending"].map((s) => <MenuItem key={s} value={s} sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InputLabel sx={labelSx}><PaymentsOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />Payment Amount</InputLabel>
              <TextField fullWidth size="small" type="number" value={form.payment_amount} onChange={set("payment_amount")} placeholder="0.00" InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem", color: colors.textMuted, fontWeight: 600 }}>SAR</Typography></InputAdornment> }} sx={customInputSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InputLabel sx={labelSx}><BusinessOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />Branch</InputLabel>
              <FormControl fullWidth size="small">
                <Select value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} displayEmpty sx={customSelectSx}>
                  <MenuItem value="" disabled><em>Select branch</em></MenuItem>
                  {BRANCHES.map((b) => <MenuItem key={b} value={b} sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }}>{b}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InputLabel sx={labelSx}><AdminPanelSettingsOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />Sales Person</InputLabel>
              <FormControl fullWidth size="small">
                <Select value={form.sales_person_id} onChange={(e) => setForm((p) => ({ ...p, sales_person_id: e.target.value }))} displayEmpty sx={customSelectSx}>
                  <MenuItem value="" disabled><em>Select agent</em></MenuItem>
                  {SALES_PERSONS.map((s) => <MenuItem key={s} value={s} sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InputLabel sx={labelSx}><InfoOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />Booking Status</InputLabel>
              <FormControl fullWidth size="small">
                <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} displayEmpty sx={customSelectSx}>
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value} sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Fixed Bottom Action Bar */}
      <Paper elevation={0} sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000, borderRadius: "16px 16px 0 0", borderTop: `1px solid ${colors.border}`, bgcolor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(20px)", boxShadow: "0 -8px 30px rgba(0, 70, 82, 0.05)", px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 } }}>
        <Box sx={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Grid container spacing={1.5} justifyContent="flex-end">
            <Grid size={{ xs: 6, sm: "auto" }}>
              <Button fullWidth variant="outlined" startIcon={<CloseOutlined />} onClick={onBack} disabled={saving} sx={{ borderRadius: "10px", fontFamily: PRIMARY_FONT, fontWeight: 750, textTransform: "none", py: 1.25, px: 3.5, borderColor: colors.textMuted, color: colors.textMuted, "&:hover": { bgcolor: "rgba(100, 116, 139, 0.04)", borderColor: colors.textMain, color: colors.textMain } }}>
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Button fullWidth variant="contained" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />} onClick={updateBooking} disabled={saving} sx={{ borderRadius: "10px", fontFamily: PRIMARY_FONT, fontWeight: 750, textTransform: "none", py: 1.25, px: 4.5, background: gradientPrimary, color: "#fff", boxShadow: "0 4px 14px rgba(0, 70, 82, 0.2)", "&:hover": { background: gradientHover, boxShadow: "0 6px 20px rgba(13, 148, 136, 0.3)" } }}>
                Update Booking
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((p) => ({ ...p, open: false }))} severity={snack.sev} sx={{ width: "100%", borderRadius: "10px", fontFamily: PRIMARY_FONT, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
