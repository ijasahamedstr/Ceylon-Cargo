import { API_BASE_URL as API } from "@/config/api";
import { useState, useMemo, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
  useMediaQuery,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InventoryIcon from '@mui/icons-material/Inventory';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import CloseOutlined from '@mui/icons-material/CloseOutlined';

// --- BRAND COLOR CONFIGURATION ---
const BrandColors = {
  primary: "#0052FF",
  secondary: "#00D1FF",
  success: "#10B981",
  neutral: "#94A3B8",
  bgLight: "#F8FAFC"
};

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(0, 82, 255, 0.2); }
  70% { box-shadow: 0 0 0 12px rgba(0, 82, 255, 0); }
  100% { box-shadow: 0 0 0 0px rgba(0, 82, 255, 0); }
`;

// --- Styled Components ---
const StepNode = styled(motion.div)<{ active?: boolean; completed?: boolean }>(({ active, completed }) => ({
  width: 58,
  height: 58,
  borderRadius: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 3,
  cursor: 'pointer',
  background: completed 
    ? BrandColors.success 
    : active 
      ? `linear-gradient(135deg, ${BrandColors.primary} 0%, ${BrandColors.secondary} 100%)` 
      : '#FFFFFF',
  border: '1px solid',
  borderColor: active || completed ? 'transparent' : '#E2E8F0',
  color: completed || active ? '#fff' : BrandColors.neutral,
  animation: active ? `${pulseGlow} 2s infinite` : 'none',
  boxShadow: active 
    ? `0 10px 20px -5px rgba(0, 82, 255, 0.4)` 
    : '0 4px 6px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.3s ease',
}));

// --- CUSTOMER SHIPMENT STATUS STEPS ---
const workflowSteps = [
  { id: 1, title: "Order Placed", icon: ReceiptLongIcon, desc: "Shipment Created", details: "We have received your shipment request and tracking details have been securely generated." },
  { id: 2, title: "Processing", icon: InventoryIcon, desc: "At Sorting Facility", details: "Your cargo is being processed, weighed, and securely packed at our regional center." },
  { id: 3, title: "In Transit", icon: FlightTakeoffIcon, desc: "On the Move", details: "Your shipment is currently in transit to the destination country." },
  { id: 4, title: "Arrived Destination", icon: LocalShippingIcon, desc: "Destination Hub", details: "Your cargo has reached the local delivery hub and is ready for customs clearance." },
  { id: 5, title: "Out for Delivery", icon: LocalShippingIcon, desc: "Final Mile Dispatch", details: "A local courier is delivering your cargo today." },
  { id: 6, title: "Delivered", icon: HomeIcon, desc: "Successfully Delivered", details: "Your shipment has been successfully delivered and signed for at the destination address." },
];


type GroupStatusKey =
  | "collect_item"
  | "move_to_warehouse_sa"
  | "loading_box"
  | "shipment_manifest"
  | "arrived_warehouse_sl"
  | "ready_for_delivery"
  | "delivered";

const statusMap: Record<GroupStatusKey, { step: number; label: string; color: string }> = {
  collect_item: { step: 1, label: "Order Placed", color: "#3B82F6" },
  move_to_warehouse_sa: { step: 2, label: "Processing", color: "#0EA5E9" },
  loading_box: { step: 2, label: "Processing (Loading)", color: "#0EA5E9" },
  shipment_manifest: { step: 3, label: "In Transit", color: "#6366F1" },
  arrived_warehouse_sl: { step: 4, label: "Arrived at Destination", color: "#F59E0B" },
  ready_for_delivery: { step: 5, label: "Out for Delivery", color: "#10B981" },
  delivered: { step: 6, label: "Delivered", color: "#16A34A" },
};

export default function CustomerTracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [groupData, setGroupData] = useState<any | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const montserratStyle = { fontFamily: "'Montserrat', sans-serif" };

  const performSearch = async (inputCode: string) => {
    if (!inputCode.trim()) return;

    setIsSearching(true);
    setShowResults(false);
    setErrorMessage("");
    setGroupData(null);

    try {
      const normalizedInput = inputCode.trim();
      const groupRes = await fetch(
        `${API}/api/move-groups/code/${encodeURIComponent(normalizedInput.toUpperCase())}?t=${Date.now()}`,
        { cache: "no-store" }
      );
      const groupJson = await groupRes.json();

      if (groupRes.ok) {
        const group = groupJson.data;
        setGroupData(group);
        const status = (group.booking_ids?.[0]?.status as GroupStatusKey) || (group.to_status as GroupStatusKey) || "collect_item";
        const step = statusMap[status]?.step || 1;
        setActiveStep(step);
        setShowResults(true);
        return;
      }

      const bookingRes = await fetch(
        `${API}/api/bookings/tracking/${encodeURIComponent(normalizedInput)}?t=${Date.now()}`,
        { cache: "no-store" }
      );
      const bookingJson = await bookingRes.json();

      if (!bookingRes.ok) {
        setErrorMessage(groupJson.message || bookingJson.message || "Tracking ID not found. Please check your ID.");
        return;
      }

      const booking = bookingJson.data;
      setGroupData({
        group_code: booking.tracking_number,
        package_count: 1,
        from_status: booking.status,
        to_status: booking.status,
        from_label: booking.status,
        to_label: booking.status,
        notes: "Single booking lookup",
        booking_ids: [booking],
      });
      const status = (booking.status as GroupStatusKey) || "collect_item";
      const step = statusMap[status]?.step || 1;
      setActiveStep(step);
      setShowResults(true);
    } catch (err) {
      setErrorMessage("Unable to fetch group details. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(trackingNumber);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || params.get("tracking_number") || params.get("id");
    if (code) {
      setTrackingNumber(code);
      performSearch(code);
    }
  }, []);

  const progressValue = ((activeStep - 1) / (workflowSteps.length - 1)) * 100;
  const currentStatus = (groupData?.booking_ids?.[0]?.status as GroupStatusKey) || (groupData?.to_status as GroupStatusKey) || "collect_item";
  const statusInfo = statusMap[currentStatus] || statusMap.collect_item;
  const displayedBookings = useMemo(() => groupData?.booking_ids || [], [groupData]);

  return (
    <Box sx={{ 
      width: "100%", 
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${BrandColors.bgLight} 0%, #EDF2F7 100%)`, 
      pt: 6, 
      pb: 8,
      ...montserratStyle
    }}>
      <Container maxWidth="md">
        
        {/* BRANDED HEADER */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="overline" 
            sx={{ ...montserratStyle, color: BrandColors.primary, fontWeight: 800, letterSpacing: 3, fontSize: '0.7rem' }}
          >
            Tracking Dashboard
          </Typography>
          <Typography variant="h4" sx={{ 
            ...montserratStyle, fontWeight: 900, mt: 1, letterSpacing: -1, fontSize: '2.2rem',
            background: `linear-gradient(135deg, #1A202C 0%, ${BrandColors.primary} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Track Your Shipment
          </Typography>
        </Box>

        {/* TRACKING INPUT SECTION */}
        <Paper 
          component="form" 
          onSubmit={handleSearch}
          elevation={0} 
          sx={{ 
            p: 1, 
            mb: 4,
            display: 'flex', 
            alignItems: 'center', 
            borderRadius: '16px',
            border: `1px solid #E2E8F0`,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            bgcolor: '#FFFFFF',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}
        >
          <TextField
            fullWidth
            placeholder="Enter Group or Booking ID (e.g. GRP-260625-4167 or CCS-BC-005)"
            variant="outlined"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { border: 'none' },
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                color: '#1A202C'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: BrandColors.neutral }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            disabled={isSearching || !trackingNumber.trim()}
            variant="contained"
            sx={{ 
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              minWidth: isMobile ? '100%' : '140px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              background: `linear-gradient(135deg, ${BrandColors.primary} 0%, ${BrandColors.secondary} 100%)`,
              boxShadow: `0 4px 14px 0 rgba(0, 82, 255, 0.39)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${BrandColors.primary} 0%, #00B4FF 100%)`,
              }
            }}
          >
            {isSearching ? <CircularProgress size={24} color="inherit" /> : "Track"}
          </Button>
        </Paper>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Button variant="outlined" onClick={() => setHowOpen(true)} sx={{ textTransform: 'none', borderRadius: '14px', px: 3 }}>
            How it works
          </Button>
          <Button variant="outlined" onClick={() => setProcessOpen(true)} sx={{ textTransform: 'none', borderRadius: '14px', px: 3 }}>
            Our Shipping Process
          </Button>
        </Stack>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '18px', fontFamily: "'Montserrat', sans-serif" }}>
            {errorMessage}
          </Alert>
        )}

        {groupData && (
          <Paper elevation={0} sx={{ p: 4, mb: 6, borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.08)' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mb: 3 }}>
              <Box>
                <Typography sx={{ ...montserratStyle, fontWeight: 800, fontSize: '1.1rem', color: BrandColors.primary }}>Group ID</Typography>
                <Typography sx={{ ...montserratStyle, fontWeight: 700, color: '#111827', mt: 0.5 }}>{groupData.group_code}</Typography>
                <Chip label={`Packages: ${groupData.package_count}`} color="primary" variant="outlined" sx={{ mt: 2, fontWeight: 700, borderRadius: '14px' }} />
              </Box>

              <Box>
                <Typography sx={{ ...montserratStyle, fontWeight: 800, fontSize: '1.1rem', color: BrandColors.primary }}>Current Status</Typography>
                <Typography sx={{ ...montserratStyle, fontWeight: 700, color: statusInfo.color, mt: 0.5 }}>{statusInfo.label}</Typography>
                <Typography sx={{ ...montserratStyle, color: '#475569', mt: 1 }}>{groupData.notes || 'No additional notes available.'}</Typography>
              </Box>

              <Box>
                <Typography sx={{ ...montserratStyle, fontWeight: 800, fontSize: '1.1rem', color: BrandColors.primary }}>Route</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Render human-friendly labels when available, fall back to raw values */}
                  {(() => {
                    const isSingle = groupData.notes === "Single booking lookup";
                    const firstBooking = groupData.booking_ids?.[0];
                    const fromLabel = isSingle 
                      ? (firstBooking?.pickup_city || "Origin")
                      : (() => {
                          const fromKey = groupData.from_status || (firstBooking?.status) || groupData.from_label || groupData.from_status;
                          return (statusMap as any)[fromKey]?.label || groupData.from_label || String(fromKey || "");
                        })();
                    const toLabel = isSingle 
                      ? (firstBooking?.delivery_city || "Destination")
                      : (() => {
                          const toKey = groupData.to_status || (firstBooking?.status) || groupData.to_label || groupData.to_status;
                          return (statusMap as any)[toKey]?.label || groupData.to_label || String(toKey || "");
                        })();
                    return (
                      <>
                        <Chip label={fromLabel} sx={{ borderRadius: '14px', fontWeight: 700, bgcolor: '#F3F4F6' }} />
                        <Box sx={{ mx: 0.5, color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 17L13 11L7 5" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </Box>
                        <Chip label={toLabel} color="secondary" sx={{ borderRadius: '14px', fontWeight: 700 }} />
                      </>
                    );
                  })()}
                </Stack>
              </Box>
            </Stack>

            <Typography sx={{ ...montserratStyle, fontWeight: 800, fontSize: '1rem', color: '#111827', mb: 2 }}>Group Package Details</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E2E8F0' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>Tracking</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>Cargo Type</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>Package Type</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedBookings.map((booking: any) => (
                    <TableRow key={booking._id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{booking.tracking_number}</TableCell>
                      <TableCell>{booking.package_description || 'N/A'}</TableCell>
                      <TableCell>{booking.cargo_type || 'N/A'}</TableCell>
                      <TableCell>{booking.packaging_type || 'N/A'}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: statusMap[booking.status as GroupStatusKey]?.color || '#0F766E' }}>
                        {statusMap[booking.status as GroupStatusKey]?.label || booking.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* RESULTS SECTION (Animated Reveal) */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* ADAPTIVE PROGRESS PIPELINE */}
              <Box sx={{ 
                position: 'relative', 
                mb: 8, 
                px: 2,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                minHeight: isMobile ? '500px' : 'auto'
              }}>
                
                {/* Progress Bar Background */}
                <Box sx={{
                  position: 'absolute',
                  bgcolor: '#E2E8F0',
                  borderRadius: '10px',
                  zIndex: 1,
                  ...(isMobile ? {
                    left: '46px', 
                    top: '30px',
                    bottom: '30px',
                    width: '5px',
                  } : {
                    top: '29px',
                    left: '60px',
                    right: '60px',
                    height: '5px',
                  })
                }}>
                  {/* Progress Bar Fill */}
                  <motion.div 
                    initial={isMobile ? { height: 0 } : { width: 0 }}
                    animate={isMobile ? { height: `${progressValue}%` } : { width: `${progressValue}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    style={{
                      background: `linear-gradient(${isMobile ? '180deg' : '90deg'}, ${BrandColors.primary}, ${BrandColors.secondary}, ${BrandColors.success})`,
                      borderRadius: '10px',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </Box>

                {workflowSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.id === activeStep;
                  const isCompleted = step.id < activeStep;

                  return (
                    <Box key={step.id} sx={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'row' : 'column', 
                      alignItems: 'center', 
                      zIndex: 3,
                      gap: isMobile ? 3 : 0,
                      mb: isMobile ? 4 : 0
                    }}>
                      <StepNode 
                        active={isActive} 
                        completed={isCompleted}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setActiveStep(step.id)}
                      >
                        <AnimatePresence mode="wait">
                          {isCompleted ? (
                            <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircleIcon sx={{ fontSize: 26 }} />
                            </motion.div>
                          ) : (
                            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <Icon sx={{ fontSize: 24 }} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </StepNode>

                      <Typography sx={{ 
                        ...montserratStyle, 
                        mt: isMobile ? 0 : 2.5, 
                        fontWeight: 700, 
                        color: isActive || isCompleted ? "#1A202C" : BrandColors.neutral,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase', 
                        letterSpacing: 1,
                        textAlign: isMobile ? 'left' : 'center'
                      }}>
                        {step.title}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* DETAIL CARD */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ width: '100%', maxWidth: '600px' }}
                  >
                    <Paper elevation={0} sx={{ 
                      p: 4, 
                      bgcolor: '#FFFFFF', 
                      borderRadius: '28px',
                      border: `1px solid #E2E8F0`,
                      textAlign: 'center',
                      boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                        background: `linear-gradient(90deg, ${BrandColors.primary}, ${BrandColors.secondary})`
                      }} />

                      <Typography variant="h6" sx={{ 
                        ...montserratStyle, fontWeight: 800, color: BrandColors.primary, mb: 1, fontSize: '1rem' 
                      }}>
                        {workflowSteps[activeStep - 1].desc}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        ...montserratStyle, color: '#4A5568', lineHeight: 1.7, fontWeight: 500, fontSize: '0.85rem' 
                      }}>
                        {workflowSteps[activeStep - 1].details}
                      </Typography>
                    </Paper>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* How it works dialog */}
      <Dialog open={howOpen} onClose={() => setHowOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: montserratStyle.fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0' }}>
          How it works
          <IconButton size="small" onClick={() => setHowOpen(false)} sx={{ color: '#374151' }}><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #E2E8F0', borderRadius: '0 0 16px 16px' }}>
          <Typography sx={{ fontFamily: montserratStyle.fontFamily, mb: 1.5, fontWeight: 700, color: '#111827' }}>End-to-end shipment tracking and secure access</Typography>
          <Typography sx={{ fontFamily: montserratStyle.fontFamily, color: '#475569', lineHeight: 1.8 }}>
            Ceylon Cargo provides secure booking, warehousing, and delivery tracking. Customers can create bookings, view status updates, and track shipments in real time using the booking or move group IDs.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#F7F9FC', borderTop: '1px solid rgba(145, 158, 171, 0.12)' }}>
          <Button onClick={() => setHowOpen(false)} color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Shipping process dialog */}
      <Dialog open={processOpen} onClose={() => setProcessOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontFamily: montserratStyle.fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', borderRadius: '16px 16px 0 0' }}>
          Our Shipping Process
          <IconButton size="small" onClick={() => setProcessOpen(false)} sx={{ color: '#374151' }}><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #E2E8F0', borderRadius: '0 0 16px 16px' }}>
          <Typography sx={{ fontFamily: montserratStyle.fontFamily, mb: 1.5, fontWeight: 700, color: '#111827' }}>Overview</Typography>
          <Typography sx={{ fontFamily: montserratStyle.fontFamily, color: '#475569', mb: 1.5, lineHeight: 1.8 }}>
            1) Booking & confirmation — create a booking with required details.
          </Typography>
          <Typography sx={{ fontFamily: montserratStyle.fontFamily, color: '#475569', mb: 1.5, lineHeight: 1.8 }}>
            2) Warehouse intake — packages are received, inspected, and assigned to move groups.
          </Typography>
          <Typography sx={{ fontFamily: montserratStyle.fontFamily, color: '#475569', mb: 1.5, lineHeight: 1.8 }}>
            3) Transport & tracking — packages move according to the route and are updated in the tracking system.
          </Typography>
          <Typography sx={{ fontFamily: montserratStyle.fontFamily, color: '#475569', lineHeight: 1.8 }}>
            4) Delivery & confirmation — final delivery is completed and proof-of-delivery is recorded.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#F7F9FC', borderTop: '1px solid rgba(145, 158, 171, 0.12)' }}>
          <Button onClick={() => setProcessOpen(false)} color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
