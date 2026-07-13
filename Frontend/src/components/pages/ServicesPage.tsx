import { Box, Container, Typography } from "@mui/material";

export default function ServicesPage() {
  const font = "'Montserrat', sans-serif";
  const BLUE = "#0B5FFF";

  return (
    <>
      <Box sx={{ bgcolor: "#F7FAFF", py: { xs: 8, md: 12 }, textAlign: "center", borderBottom: "1px solid #E2E8F0" }}>
        <Container maxWidth="md">
          <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.7rem", color: BLUE, letterSpacing: 3, textTransform: "uppercase", mb: 2 }}>
            Ceylon Gulf Cargo Service EST.
          </Typography>
          <Typography variant="h2" sx={{ fontFamily: font, fontWeight: 900, fontSize: { xs: "2rem", md: "3rem" }, color: "#0F172A", letterSpacing: "-0.03em", mb: 2 }}>
            Our Premium Services
          </Typography>
          <Typography sx={{ fontFamily: font, color: "#64748B", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 560, mx: "auto" }}>
            Discover our comprehensive range of logistics, shipping, and cargo solutions tailored to meet your global business needs with speed and reliability.
          </Typography>
        </Container>
      </Box>
    </>
  );
}