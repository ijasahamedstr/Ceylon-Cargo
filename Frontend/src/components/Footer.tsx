import React from "react";
import { Box, Container, Typography, Link, IconButton, Divider, Stack } from "@mui/material";
import { Facebook, Instagram, Email, Phone, WhatsApp, AccessTimeFilled } from "@mui/icons-material";

const Footer: React.FC = () => {
  const font = '"Montserrat", sans-serif';
  const brandBlue = "#0a5397";

  const socialLinks = [
    { icon: <Phone fontSize="small" />, link: "tel:+94760959385", color: "#4caf50" },
    { icon: <WhatsApp fontSize="small" />, link: "https://wa.me/94760959385", color: "#25D366" },
    { icon: <Email fontSize="small" />, link: "mailto:info@ceyloncargo.lk", color: "#EA4335" },
    { icon: <Facebook fontSize="small" />, link: "https://facebook.com", color: "#1877F2" },
    { icon: <Instagram fontSize="small" />, link: "https://instagram.com", color: "#E4405F" },
  ];

  return (
    <Box component="footer" sx={{ fontFamily: font }}>
      <Box sx={{
        backgroundColor: "#e1eeff",
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(225,238,255,1) 100%)",
        color: "#000000", py: { xs: 6, md: 10 }, px: { xs: 2, sm: 4 }, position: "relative",
        "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, transparent, ${brandBlue}, transparent)` },
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "center", md: "flex-start" }, gap: { xs: 5, md: 6 }, textAlign: { xs: "center", md: "left" } }}>

            {/* Logo & Social */}
            <Box sx={{ flexBasis: { xs: "100%", md: "30%" }, display: "flex", flexDirection: "column", alignItems: { xs: "center", md: "flex-start" }, gap: 3, width: "100%" }}>
              <Box component="img" src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png" alt="Ceylon Cargo Logo"
                sx={{ width: { xs: 150, md: 180 }, height: "auto", mb: 1, filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.05))", transition: "transform 0.3s ease", "&:hover": { transform: "scale(1.02)" } }} />
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 2, fontFamily: font, color: brandBlue }}>
                Connect With Us
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" }, gap: { xs: 1, sm: 0 } }}>
                {socialLinks.map((item, index) => (
                  <IconButton key={index} href={item.link} target="_blank"
                    sx={{ color: "#333", backgroundColor: "rgba(255,255,255,0.6)", backdropFilter: "blur(4px)", borderRadius: "14px", width: 44, height: 44, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(255,255,255,0.8)", transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", "&:hover": { backgroundColor: item.color, color: "#fff", borderColor: item.color, transform: "translateY(-8px) rotate(8deg)", boxShadow: `0 15px 30px ${item.color}44` } }}>
                    {item.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, borderColor: "rgba(0,0,0,0.08)" }} />

            {/* Offices */}
            <Box sx={{ flexBasis: { xs: "100%", md: "35%" }, width: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: "0.9rem", fontWeight: 800, fontFamily: font, color: brandBlue, letterSpacing: 1 }}>
                Office Locations
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 2, color: "#444", fontFamily: font, fontSize: "0.9rem" }}>
                <strong>Sri Lanka Office</strong><br />
                No. 123, Galle Road, Colombo 03, Sri Lanka
                <Divider sx={{ my: 1.5, opacity: 0.5, display: { xs: "none", md: "block" } }} />
                <Box sx={{ my: 1.5, display: { xs: "block", md: "none" } }} />
                <strong>Saudi Arabia Office</strong><br />
                Riyadh, Jeddah, Dammam
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, borderColor: "rgba(0,0,0,0.08)" }} />

            {/* Contact */}
            <Box sx={{ flexBasis: { xs: "100%", md: "25%" }, width: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: "0.9rem", fontWeight: 800, fontFamily: font, color: brandBlue, letterSpacing: 1 }}>
                Get In Touch
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: { xs: "center", md: "flex-start" } }}>
                <Typography variant="body2" sx={{ fontFamily: font, color: "#444", fontWeight: 600 }}>
                  +94 76 095 93 85 <br /> +94 67 22 60 200
                </Typography>
                <Link href="mailto:info@ceyloncargo.lk" sx={{ color: brandBlue, fontSize: "0.9rem", textDecoration: "none", fontFamily: font, fontWeight: 700, transition: "all 0.3s ease", "&:hover": { paddingLeft: "5px" } }}>
                  info@ceyloncargo.lk
                </Link>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: 1, mt: 1, color: "#2e7d32", fontWeight: 800, fontSize: "0.85rem", fontFamily: font }}>
                  <AccessTimeFilled fontSize="small" />
                  Available 24/7
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
        

        

      </Box>

      {/* Bottom bar */}
      <Box sx={{ backgroundColor: "#000", py: 3, borderTop: "1px solid rgba(255,255,255,0.1)", position: "relative", overflow: "hidden" }}>
        <Container maxWidth="lg" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "center", alignItems: "center", gap: { xs: 1, md: 0 }, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", justifyContent: "center" }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)", fontSize: "0.95rem", fontFamily: font, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Box component="span">CEYLON CARGO © 2026 </Box>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span">Developed by:</Box>
                <Link href="https://www.cyberx7.com/" target="_blank" rel="noopener" sx={{ color: "rgba(255,255,255,0.95)", fontWeight: 700, textDecoration: 'underline' }}>CYBERX7 (PVT) LTD</Link>
              </Box>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;