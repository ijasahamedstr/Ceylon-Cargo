import { Box, Container, Typography, Grid, Stack } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import GroupsIcon from "@mui/icons-material/Groups";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useLang } from "../context/LanguageContext";

const BLUE = "#0B5FFF";
const DARK = "#0F172A";

export default function WhyUs() {
  const { t, isRTL } = useLang();
  const font = isRTL ? '"Cairo", "Montserrat", sans-serif' : "'Montserrat', sans-serif";

  const reasons = [
    { icon: <VerifiedIcon sx={{ fontSize: 24 }} />, title: t.r1Title, desc: t.r1Desc, color: "#0B5FFF" },
    { icon: <TrackChangesIcon sx={{ fontSize: 24 }} />, title: t.r2Title, desc: t.r2Desc, color: "#10B981" },
    { icon: <PriceCheckIcon sx={{ fontSize: 24 }} />, title: t.r3Title, desc: t.r3Desc, color: "#F59E0B" },
    { icon: <SecurityIcon sx={{ fontSize: 24 }} />, title: t.r4Title, desc: t.r4Desc, color: "#EF4444" },
    { icon: <SpeedIcon sx={{ fontSize: 24 }} />, title: t.r5Title, desc: t.r5Desc, color: "#7C3AED" },
    { icon: <GroupsIcon sx={{ fontSize: 24 }} />, title: t.r6Title, desc: t.r6Desc, color: "#06B6D4" },
  ];

  return (
    <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 12 }, fontFamily: font, direction: isRTL ? "rtl" : "ltr" }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
          {/* LEFT */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box>
              <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.7rem", color: BLUE, letterSpacing: isRTL ? 0 : 3, textTransform: "uppercase", mb: 1.5 }}>
                {t.whyUs}
              </Typography>
              <Typography variant="h3" sx={{ fontFamily: font, fontWeight: 900, color: DARK, fontSize: { xs: "1.8rem", md: "2.4rem" }, letterSpacing: "-0.03em", lineHeight: 1.2, mb: 3 }}>
                {t.whyUsTitle}
              </Typography>
              <Typography sx={{ fontFamily: font, fontSize: "0.95rem", color: "#64748B", lineHeight: 1.8, mb: 4 }}>
                {t.whyUsDesc}
              </Typography>

              <Box sx={{ bgcolor: "#F0F6FF", borderRadius: "16px", p: 3, border: "1px solid rgba(11,95,255,0.15)" }}>
                <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.75rem", color: BLUE, letterSpacing: isRTL ? 0 : 1, mb: 2 }}>
                  {t.mainRoute}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap"
                  sx={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                  {["Dammam", "→", "Colombo Port", "→", "Island-wide"].map((item, i) => (
                    <Typography key={i} sx={{ fontFamily: font, fontWeight: i % 2 === 0 ? 700 : 400, fontSize: i % 2 === 0 ? "0.85rem" : "1.2rem", color: i % 2 === 0 ? DARK : "#94A3B8" }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* RIGHT */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
              {reasons.map((r, i) => (
                <Box key={i} sx={{
                  display: "flex", gap: 2, p: 2.5, borderRadius: "16px",
                  border: "1px solid #F1F5F9", transition: "0.3s",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  textAlign: isRTL ? "right" : "left",
                  "&:hover": { borderColor: r.color, boxShadow: `0 8px 24px ${r.color}18` }
                }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: `${r.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, flexShrink: 0 }}>
                    {r.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: font, fontWeight: 800, fontSize: "0.85rem", color: DARK, mb: 0.5 }}>{r.title}</Typography>
                    <Typography sx={{ fontFamily: font, fontSize: "0.78rem", color: "#64748B", lineHeight: 1.6 }}>{r.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
