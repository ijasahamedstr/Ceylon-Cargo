import { Box, Container, Typography, Grid } from "@mui/material";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import FlightIcon from "@mui/icons-material/Flight";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import GavelIcon from "@mui/icons-material/Gavel";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useLang } from "../context/LanguageContext";

const BLUE = "#0B5FFF";
const DARK = "#0F172A";

export default function ServicesSection() {
  const { t, isRTL } = useLang();
  const font = isRTL ? '"Cairo", "Montserrat", sans-serif' : "'Montserrat', sans-serif";

  const services = [
    { icon: <DirectionsBoatIcon sx={{ fontSize: 32 }} />, title: t.seaCargo, desc: t.seaCargoDesc, color: "#0B5FFF", bg: "rgba(11,95,255,0.07)" },
    { icon: <FlightIcon sx={{ fontSize: 32 }} />, title: t.airCargo, desc: t.airCargoDesc, color: "#7C3AED", bg: "rgba(124,58,237,0.07)" },
    { icon: <LocalShippingIcon sx={{ fontSize: 32 }} />, title: t.delivery, desc: t.deliveryDesc, color: "#10B981", bg: "rgba(16,185,129,0.07)" },
    { icon: <InventoryIcon sx={{ fontSize: 32 }} />, title: t.warehousing, desc: t.warehousingDesc, color: "#F59E0B", bg: "rgba(245,158,11,0.07)" },
    { icon: <GavelIcon sx={{ fontSize: 32 }} />, title: t.customs, desc: t.customsDesc, color: "#EF4444", bg: "rgba(239,68,68,0.07)" },
    { icon: <SupportAgentIcon sx={{ fontSize: 32 }} />, title: t.support247, desc: t.supportDesc, color: "#06B6D4", bg: "rgba(6,182,212,0.07)" },
  ];

  return (
    <Box sx={{ bgcolor: "#F7FAFF", py: { xs: 8, md: 12 }, fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.7rem", color: BLUE, letterSpacing: isRTL ? 0 : 3, textTransform: "uppercase", mb: 1.5 }}>
            {t.whatWeOffer}
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: font, fontWeight: 900, color: DARK, fontSize: { xs: "1.8rem", md: "2.4rem" }, letterSpacing: "-0.03em" }}>
            {t.ourServices}
          </Typography>
          <Typography sx={{ fontFamily: font, color: "#64748B", fontSize: "1rem", maxWidth: 520, mx: "auto", mt: 2, lineHeight: 1.7 }}>
            {t.servicesSubtitle}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {services.map((s, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Box sx={{
                bgcolor: "#fff", borderRadius: "20px", p: 4, border: "1px solid #E2E8F0",
                height: "100%", transition: "all 0.3s ease", cursor: "default",
                textAlign: isRTL ? "right" : "left",
                "&:hover": { transform: "translateY(-6px)", boxShadow: `0 20px 40px ${s.color}18`, borderColor: s.color },
              }}>
                <Box sx={{ width: 58, height: 58, borderRadius: "16px", bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, mb: 2.5, ml: isRTL ? "auto" : 0, mr: isRTL ? 0 : "auto" }}>
                  {s.icon}
                </Box>
                <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "1rem", color: DARK, mb: 1.5 }}>{s.title}</Typography>
                <Typography sx={{ fontFamily: font, fontSize: "0.875rem", color: "#64748B", lineHeight: 1.7 }}>{s.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
