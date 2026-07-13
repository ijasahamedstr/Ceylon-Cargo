import { Box, Container, Typography, Grid, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function AboutPage() {
  const font = "'Montserrat', sans-serif";
  const BLUE = "#0B5FFF";
  const DARK = "#0F172A";

  const milestones = [
    { year: "2010", event: "Company founded to provide core logistics solutions." },
    { year: "2014", event: "Expanded international reach and air/sea freight operations." },
    { year: "2018", event: "Integrated e-commerce capabilities to support global trade." },
    { year: "2022", event: "Enhanced our UAE-India-Sri Lanka shipping corridors." },
    { year: "2026", event: "Launched premium, enterprise-grade shipping services." },
  ];

  const checks = [
    "Premium global logistics",
    "Seamless e-commerce integration",
    "Secure air and sea freight",
    "Dedicated customer support"
  ];

  return (
    <>
      {/* Hero */}
      <Box sx={{ bgcolor: "#F7FAFF", py: { xs: 8, md: 12 }, borderBottom: "1px solid #E2E8F0" }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.7rem", color: BLUE, letterSpacing: 3, textTransform: "uppercase", mb: 2 }}>
                About Us
              </Typography>
              <Typography variant="h2" sx={{ fontFamily: font, fontWeight: 900, fontSize: { xs: "2rem", md: "2.8rem" }, color: DARK, letterSpacing: "-0.03em", lineHeight: 1.15, mb: 3 }}>
                Delivering Excellence Across Borders
              </Typography>
              <Typography sx={{ fontFamily: font, color: "#64748B", fontSize: "0.95rem", lineHeight: 1.8, mb: 4 }}>
                We are dedicated to providing premium shipping, logistics, and e-commerce solutions. With a focus on efficiency, secure transport, and modern integration, we ensure your cargo reaches its destination reliably.
              </Typography>
              <Stack spacing={1.5}>
                {checks.map(p => (
                  <Stack key={p} direction="row" spacing={1.5} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: BLUE, fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: font, fontSize: "0.9rem", color: "#475569", fontWeight: 600, textAlign: "left" }}>
                      {p}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ bgcolor: "#fff", borderRadius: "24px", p: 4, border: "1px solid #E2E8F0", boxShadow: "0 20px 60px rgba(11,95,255,0.08)" }}>
                <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.75rem", color: BLUE, letterSpacing: 2, mb: 3, textAlign: "left" }}>
                  OUR JOURNEY
                </Typography>
                <Stack spacing={0}>
                  {milestones.map((m, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 3, pb: i < milestones.length - 1 ? 3 : 0, flexDirection: "row" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: BLUE, flexShrink: 0, mt: 0.6 }} />
                        {i < milestones.length - 1 && <Box sx={{ width: 2, flexGrow: 1, bgcolor: "#E2E8F0", mt: 0.5 }} />}
                      </Box>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography sx={{ fontFamily: font, fontWeight: 900, fontSize: "0.8rem", color: BLUE }}>{m.year}</Typography>
                        <Typography sx={{ fontFamily: font, fontSize: "0.82rem", color: "#64748B", lineHeight: 1.6, mt: 0.3 }}>{m.event}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}