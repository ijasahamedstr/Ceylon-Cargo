import { Box, Typography, Button, Container, Stack, Chip, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#0B5FFF",
  color: "#fff",
  padding: "14px 28px",
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "1rem",
  fontFamily: "'Montserrat', sans-serif",
  boxShadow: "0px 10px 26px rgba(11, 95, 255, 0.25)",
  transition: "all 0.3s ease",
  width: "auto",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
  "&:hover": {
    backgroundColor: "#094FD6",
    transform: "translateY(-2px)",
    boxShadow: "0px 12px 30px rgba(11, 95, 255, 0.35)",
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "#0B5FFF",
  padding: "14px 28px",
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "1rem",
  fontFamily: "'Montserrat', sans-serif",
  border: "2px solid rgba(11, 95, 255, 0.35)",
  transition: "all 0.3s ease",
  width: "auto",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
  "&:hover": {
    borderColor: "rgba(11, 95, 255, 0.7)",
    backgroundColor: "rgba(11, 95, 255, 0.06)",
  },
}));

export default function HeroSlider() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Montserrat', sans-serif",
        background: "#F7FAFF",
        pb: { xs: 6, md: 6 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          backgroundColor: { xs: "#FAFAFA", md: "transparent" },
          backgroundImage: {
            xs: "none",
            md: "url('https://i.ibb.co/7xw6y6Rr/Gemini-Generated-Image-5s7r1d5s7r1d5s7r.webp')",
          },
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          minHeight: "auto", 
        }}
      >
        {/* Dynamic Background */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 15% 15%, rgba(11,95,255,0.08) 0, transparent 30%), radial-gradient(circle at 85% 85%, rgba(40,199,111,0.08) 0, transparent 30%)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Grid container spacing={{ xs: 6, md: 4 }} alignItems="center">
            
            {/* LEFT CONTENT BLOCK */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={{ xs: 3, md: 4 }}>
                
                {/* Badge Area */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ 
                    gap: 1.5, 
                    pt: { xs: 3, md: 5 } // Added padding top here
                  }}
                >
                  <Chip
                    icon={<VerifiedOutlinedIcon sx={{ fontSize: "1.2rem !important" }} />}
                    label="Trusted Logistics Partner"
                    sx={{
                      fontWeight: 700,
                      bgcolor: "rgba(11,95,255,0.08)",
                      color: "#0B5FFF",
                      fontFamily: "'Montserrat', sans-serif",
                      p: 0.5,
                    }}
                  />
                  <Chip
                    icon={<LocalShippingOutlinedIcon sx={{ fontSize: "1.2rem !important" }} />}
                    label="Islandwide Delivery"
                    sx={{
                      fontWeight: 700,
                      bgcolor: "rgba(40,199,111,0.08)",
                      color: "#1F8A4C",
                      fontFamily: "'Montserrat', sans-serif",
                      p: 0.5,
                    }}
                  />
                </Stack>

                {/* HEADING */}
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: { xs: 1.25, md: 1.3 },
                    fontSize: { xs: "2rem", sm: "2.25rem", md: "2.5rem" },
                    letterSpacing: "-0.03em",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Air & Sea Cargo <br />
                  Deliveries Across{" "}
                  <Box component="span" sx={{ color: "#0B5FFF" }}>
                    Sri Lanka
                  </Box>
                </Typography>

                {/* BODY TEXT */}
                <Typography
                  sx={{
                    color: "#475569",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    maxWidth: 580,
                    lineHeight: 1.7,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Experience seamless logistics with real-time tracking and
                  unmatched security. From door-to-door delivery to global freight
                  solutions, we move your business forward.
                </Typography>

                {/* FEATURE STATS */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 3, sm: 6 }}
                  sx={{ py: 1 }}
                >
                  {[
                    {
                      label: "24/7 Support",
                      sub: "Always available",
                      code: "24/7",
                      color: "#0B5FFF",
                      bg: "rgba(11,95,255,0.12)",
                    },
                    {
                      label: "Real-time Tracking",
                      sub: "Global monitoring",
                      code: "RT",
                      color: "#1F8A4C",
                      bg: "rgba(40,199,111,0.12)",
                    },
                  ].map((stat, index) => (
                    <Stack key={index} direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: "14px",
                          background: stat.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          color: stat.color,
                          fontSize: "0.9rem",
                        }}
                      >
                        {stat.code}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "#0F172A",
                            fontFamily: "'Montserrat', sans-serif",
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            color: "#64748B",
                            fontFamily: "'Montserrat', sans-serif",
                          }}
                        >
                          {stat.sub}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>

                {/* ACTION BUTTONS */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ 
                    pt: 2,
                    pb: { xs: 4, md: 6 } // Added padding bottom here
                  }}
                >
                  <PrimaryButton variant="contained" disableElevation>
                    Request a Quote
                  </PrimaryButton>
                  <SecondaryButton variant="outlined">
                    Track Shipment
                  </SecondaryButton>
                </Stack>
              </Stack>
            </Grid>

            {/* RIGHT IMAGE CARD BLOCK */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", justifyContent: "center" }}>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}