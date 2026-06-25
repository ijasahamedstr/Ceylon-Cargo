import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

export default function CTASection() {
  const navigate = useNavigate();
  const font = "'Montserrat', sans-serif";

  const trustBadges = [
    { emoji: "🔒", text: "Fully Secure" },
    { emoji: "📦", text: "Door to Door" },
    { emoji: "⚡", text: "Fast Delivery" },
    { emoji: "🌍", text: "Global Reach" },
  ];

  return (
    <Box sx={{
      background: "linear-gradient(135deg, #0B5FFF 0%, #1a539b 60%, #0F172A 100%)",
      py: { xs: 8, md: 12 }, position: "relative", overflow: "hidden",
      fontFamily: font,
    }}>
      <Box sx={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)", top: -150, right: -100, pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)", bottom: -100, left: -80, pointerEvents: "none" }} />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", letterSpacing: 3, textTransform: "uppercase", mb: 2 }}>
          Ready to ship?
        </Typography>
        <Typography variant="h3" sx={{ fontFamily: font, fontWeight: 900, color: "#fff", fontSize: { xs: "1.9rem", md: "2.8rem" }, letterSpacing: "-0.03em", lineHeight: 1.15, mb: 3 }}>
          Ship Your Package Today
        </Typography>
        <Typography sx={{ fontFamily: font, color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 520, mx: "auto", mb: 5 }}>
          Experience fast, secure, and reliable global shipping.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button variant="contained" onClick={() => navigate("/tracking")}
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: "11px !important" }} />}
            sx={{ fontFamily: font, fontWeight: 800, textTransform: "none", fontSize: "0.95rem", px: 4, py: 1.8, bgcolor: "#fff", color: "#0B5FFF", borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", "&:hover": { bgcolor: "#F0F6FF", transform: "translateY(-2px)" }, transition: "0.3s" }}>
            Track Shipment
          </Button>
          <Button variant="outlined" component="a" href="https://wa.me/94760959385" target="_blank"
            startIcon={<WhatsAppIcon />}
            sx={{ fontFamily: font, fontWeight: 800, textTransform: "none", fontSize: "0.95rem", px: 4, py: 1.8, borderColor: "rgba(255,255,255,0.5)", color: "#fff", borderWidth: "2px", borderRadius: "14px", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)", borderWidth: "2px" }, transition: "0.3s" }}>
            WhatsApp Us
          </Button>
        </Stack>

        <Stack direction="row" spacing={{ xs: 3, md: 5 }} justifyContent="center" sx={{ mt: 6, flexWrap: "wrap", gap: 2 }}>
          {trustBadges.map((b) => (
            <Typography key={b.text} sx={{ fontFamily: font, fontWeight: 700, fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
              {b.emoji} {b.text}
            </Typography>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}