import { useState, useEffect } from "react";
import { Box, Typography, Container, Paper, useTheme, useMediaQuery } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InventoryIcon from "@mui/icons-material/Inventory";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const NEO_BG = "#F8FAFC";

const BrandColors = { 
  primary: "#0052FF", 
  secondary: "#00D1FF", 
  success: "#10B981", 
  neutral: "#94A3B8" 
};

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(0,82,255,0.2); }
  70% { box-shadow: 0 0 0 12px rgba(0,82,255,0); }
  100% { box-shadow: 0 0 0 0px rgba(0,82,255,0); }
`;

const StepNode = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "completed" && prop !== "isMobile",
})<{ active?: boolean; completed?: boolean; isMobile?: boolean }>(({ active, completed, isMobile }) => ({
  width: isMobile ? 44 : 58, 
  height: isMobile ? 44 : 58,
  borderRadius: isMobile ? "14px" : "18px", 
  display: "flex", 
  alignItems: "center",
  justifyContent: "center", 
  position: "relative", 
  zIndex: 3, 
  cursor: "pointer",
  background: completed 
    ? BrandColors.success 
    : active 
      ? `linear-gradient(135deg, ${BrandColors.primary} 0%, ${BrandColors.secondary} 100%)` 
      : "#ffffff",
  border: active || completed ? "none" : "1px solid #E2E8F0", 
  color: completed || active ? "#fff" : BrandColors.neutral,
  animation: active ? `${pulseGlow} 2s infinite` : "none",
  boxShadow: completed || active
    ? "0px 6px 12px rgba(0,82,255,0.15)"
    : "none",
  transition: "all 0.3s ease",
}));

export default function SystemWorkFlow() {
  const font = "'Montserrat', sans-serif";
  const [activeStep, setActiveStep] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const workflowSteps = [
    { id: 1, title: "Booking", icon: CalendarMonthIcon, desc: "Schedule Pickup", details: "Book your shipment online and schedule a convenient pickup time with our logistics team." },
    { id: 2, title: "Packaging", icon: InventoryIcon, desc: "Secure Packing", details: "Your items are carefully packed, weighed, and labeled in our facility to ensure maximum protection." },
    { id: 3, title: "Transit", icon: FlightTakeoffIcon, desc: "Global Freight", details: "Your cargo is dispatched globally via our fast, reliable air or sea freight channels." },
    { id: 4, title: "Customs", icon: WarehouseIcon, desc: "Clearance & Storage", details: "We handle all complex customs documentation and safely store your goods upon arrival." },
    { id: 5, title: "Delivery", icon: LocalShippingIcon, desc: "Last-Mile Delivery", details: "The shipment is securely delivered straight to the recipient's doorstep exactly on time." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev >= workflowSteps.length ? 1 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [workflowSteps.length]);

  const progressValue = ((activeStep - 1) / (workflowSteps.length - 1)) * 100;

  return (
    <Box sx={{ width: "100%", bgcolor: NEO_BG, pt: 6, pb: 8, fontFamily: font }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="overline" sx={{ fontFamily: font, color: BrandColors.primary, fontWeight: 800, letterSpacing: 3, fontSize: "0.7rem" }}>
            HOW IT WORKS
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: font, fontWeight: 900, mt: 1, letterSpacing: -1, fontSize: "2rem", color: "#0F172A" }}>
            Our Shipping Process
          </Typography>
        </Box>

        <Box sx={{ position: "relative", mb: isMobile ? 4 : 8, px: isMobile ? 1 : 2, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between" }}>
          
          {/* DESKTOP: Global Horizontal Progress Line */}
          {!isMobile && (
            <Box 
              sx={{ 
                position: "absolute", 
                bgcolor: "#E2E8F0", 
                borderRadius: "10px", 
                zIndex: 1, 
                top: "29px", 
                left: "60px", 
                right: "60px", 
                height: "6px" 
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                style={{ background: `linear-gradient(90deg, ${BrandColors.primary}, ${BrandColors.secondary}, ${BrandColors.success})`, borderRadius: "10px", width: "100%", height: "100%" }}
              />
            </Box>
          )}

          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            const isCompleted = step.id < activeStep;
            const isLast = index === workflowSteps.length - 1;

            return (
              <Box key={step.id} sx={{ display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: isMobile ? "flex-start" : "center", zIndex: 3, gap: isMobile ? 2.5 : 0, pb: isMobile && !isLast ? 3 : 0, position: "relative" }}>
                
                {/* MOBILE: Segmented Vertical Line (App Style) */}
                {isMobile && !isLast && (
                   <Box sx={{ position: 'absolute', top: '44px', bottom: 0, left: '20px', width: '4px', bgcolor: "#E2E8F0", zIndex: 1, overflow: 'hidden' }}>
                     <motion.div
                       initial={{ height: 0 }}
                       animate={{ height: isCompleted ? '100%' : '0%' }}
                       transition={{ duration: 0.5 }}
                       style={{ background: BrandColors.success, width: '100%' }}
                     />
                   </Box>
                )}

                <StepNode active={isActive} completed={isCompleted} isMobile={isMobile} whileHover={{ scale: 1.1 }} onClick={() => setActiveStep(step.id)} style={{ zIndex: 2 }}>
                  <AnimatePresence mode="wait">
                    {isCompleted
                      ? <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircleIcon sx={{ fontSize: isMobile ? 22 : 26 }} /></motion.div>
                      : <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Icon sx={{ fontSize: isMobile ? 20 : 24 }} /></motion.div>
                    }
                  </AnimatePresence>
                </StepNode>

                {isMobile ? (
                  // MOBILE: Text and Inline Expanding Details Card
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, pt: 1.2 }}>
                    <Typography sx={{ fontFamily: font, fontWeight: 800, color: isActive || isCompleted ? "#1A202C" : BrandColors.neutral, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1 }}>
                      {step.title}
                    </Typography>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                           initial={{ opacity: 0, height: 0, marginTop: 0 }}
                           animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                           exit={{ opacity: 0, height: 0, marginTop: 0 }}
                           style={{ overflow: 'hidden' }}
                        >
                           <Paper 
                             elevation={0} 
                             sx={{ 
                               p: 2.5, 
                               bgcolor: "#ffffff", 
                               borderRadius: "16px", 
                               border: "1px solid #E2E8F0",
                               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                               position: "relative", 
                               overflow: "hidden" 
                             }}
                           >
                              <Box sx={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: `linear-gradient(180deg, ${BrandColors.primary}, ${BrandColors.secondary})` }} />
                              <Typography variant="subtitle2" sx={{ fontFamily: font, fontWeight: 850, color: BrandColors.primary, mb: 0.5, ml: 1 }}>
                                {step.desc}
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: font, color: "#475569", lineHeight: 1.5, fontSize: "0.8rem", ml: 1 }}>
                                {step.details}
                              </Typography>
                           </Paper>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                ) : (
                  // DESKTOP: Standard Center-Aligned Title
                  <Typography sx={{ fontFamily: font, mt: 2.5, fontWeight: 700, color: isActive || isCompleted ? "#1A202C" : BrandColors.neutral, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 1, textAlign: "center" }}>
                    {step.title}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* DESKTOP: Large Bottom Details Card */}
        {!isMobile && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeStep} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: "600px" }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    bgcolor: "#ffffff", 
                    borderRadius: "24px", 
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.05)", 
                    textAlign: "center", 
                    position: "relative", 
                    overflow: "hidden" 
                  }}
                >
                  <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${BrandColors.primary}, ${BrandColors.secondary})` }} />
                  <Typography variant="h6" sx={{ fontFamily: font, fontWeight: 900, color: BrandColors.primary, mb: 1, fontSize: "1.05rem" }}>
                    {workflowSteps[activeStep - 1].desc}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: font, color: "#475569", lineHeight: 1.7, fontWeight: 600, fontSize: "0.85rem" }}>
                    {workflowSteps[activeStep - 1].details}
                  </Typography>
                </Paper>
              </motion.div>
            </AnimatePresence>
          </Box>
        )}
      </Container>
    </Box>
  );
}