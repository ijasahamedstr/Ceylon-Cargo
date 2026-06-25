import { useState } from "react";
import {
  Box, Container, Typography, Grid, TextField, MenuItem,
  Button, Paper, Stack, InputLabel, CircularProgress, Snackbar, Alert
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const FONT = "'Montserrat', sans-serif";
const BLUE = "#1a539b";
const border = "#E2E8F0";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px", fontFamily: FONT, fontSize: "0.88rem",
    bgcolor: "#fff",
    "& fieldset": { borderColor: border },
    "&:hover fieldset": { borderColor: BLUE },
    "&.Mui-focused fieldset": { borderColor: BLUE },
  },
  "& .MuiInputLabel-root": { fontFamily: FONT },
};

const labelSx = { fontFamily: FONT, fontWeight: 700, fontSize: "0.7rem", color: "#1E293B", mb: 1, letterSpacing: 0.5, display: "block" };

const cargoTypes = ["Household Items", "Electronics", "Clothing & Textiles", "Food & Groceries", "Machinery / Equipment", "Building Materials", "Personal Effects", "Other"];
const origins = ["Dammam", "Riyadh", "Jeddah", "Mecca", "Medina", "Other"];

export default function BookingPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", origin: "", destination: "", cargoType: "", weight: "", cbm: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.origin || !form.cargoType) {
      setSnack({ open: true, message: "Please fill in all required fields.", severity: "error" });
      return;
    }
    setLoading(true);
    // Simulate submission — replace with real API call
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSnack({ open: true, message: "Quote request sent! Our team will contact you within 24 hours.", severity: "success" });
    setForm({ name: "", phone: "", email: "", origin: "", destination: "", cargoType: "", weight: "", cbm: "", notes: "" });
  };

  return (
    <>
      {/* Hero */}
      <Box sx={{ bgcolor: "#F7FAFF", py: { xs: 7, md: 10 }, textAlign: "center", borderBottom: "1px solid #E2E8F0" }}>
        <Container maxWidth="md">
          <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.7rem", color: BLUE, letterSpacing: 3, textTransform: "uppercase", mb: 2 }}>
            Free Quote
          </Typography>
          <Typography variant="h2" sx={{ fontFamily: FONT, fontWeight: 900, fontSize: { xs: "2rem", md: "2.8rem" }, color: "#0F172A", letterSpacing: "-0.03em", mb: 2 }}>
            Book Your Shipment
          </Typography>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "1rem", lineHeight: 1.7, maxWidth: 500, mx: "auto" }}>
            Fill in your cargo details and we'll send you a free quote within 24 hours.
          </Typography>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "#F7FAFF", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            {/* Form */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={0} component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 5 }, borderRadius: "24px", border: "1px solid #E2E8F0" }}>
                <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: BLUE, fontSize: "1.1rem", mb: 4 }}>Cargo Details</Typography>
                <Stack spacing={3}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>FULL NAME *</InputLabel>
                      <TextField fullWidth value={form.name} onChange={set("name")} placeholder="Your full name" sx={inputSx} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>PHONE / WHATSAPP *</InputLabel>
                      <TextField fullWidth value={form.phone} onChange={set("phone")} placeholder="+966 / +94..." sx={inputSx} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>EMAIL</InputLabel>
                      <TextField fullWidth value={form.email} onChange={set("email")} placeholder="your@email.com" sx={inputSx} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>CARGO TYPE *</InputLabel>
                      <TextField fullWidth select value={form.cargoType} onChange={set("cargoType")} sx={inputSx} size="small">
                        {cargoTypes.map(t => <MenuItem key={t} value={t} sx={{ fontFamily: FONT }}>{t}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>ORIGIN CITY *</InputLabel>
                      <TextField fullWidth select value={form.origin} onChange={set("origin")} sx={inputSx} size="small">
                        {origins.map(o => <MenuItem key={o} value={o} sx={{ fontFamily: FONT }}>{o}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>DESTINATION (SRI LANKA)</InputLabel>
                      <TextField fullWidth value={form.destination} onChange={set("destination")} placeholder="e.g. Colombo, Kandy, Jaffna..." sx={inputSx} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>APPROX. WEIGHT (KG)</InputLabel>
                      <TextField fullWidth type="number" value={form.weight} onChange={set("weight")} placeholder="0" sx={inputSx} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InputLabel sx={labelSx}>APPROX. VOLUME (CBM)</InputLabel>
                      <TextField fullWidth type="number" value={form.cbm} onChange={set("cbm")} placeholder="0.00" sx={inputSx} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <InputLabel sx={labelSx}>ADDITIONAL NOTES</InputLabel>
                      <TextField fullWidth multiline rows={3} value={form.notes} onChange={set("notes")} placeholder="Any special handling, fragile items, or specific delivery requirements..." sx={inputSx} />
                    </Grid>
                  </Grid>

                  <Button type="submit" variant="contained" disabled={loading} endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    sx={{ fontFamily: FONT, fontWeight: 800, textTransform: "none", bgcolor: BLUE, borderRadius: "12px", py: 1.8, fontSize: "0.95rem", "&:hover": { bgcolor: "#0a3f7a" } }}>
                    {loading ? "Sending..." : "Send Quote Request"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#fff" }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: BLUE, fontSize: "0.85rem", mb: 2 }}>QUICK CONTACT</Typography>
                  <Button fullWidth variant="contained" startIcon={<WhatsAppIcon />} component="a" href="https://wa.me/94760959385" target="_blank"
                    sx={{ fontFamily: FONT, fontWeight: 800, textTransform: "none", bgcolor: "#25D366", borderRadius: "12px", py: 1.5, mb: 2, "&:hover": { bgcolor: "#1ebe5c" } }}>
                    WhatsApp Us Now
                  </Button>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: "#64748B", textAlign: "center" }}>Response within 1 hour</Typography>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#fff" }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: BLUE, fontSize: "0.85rem", mb: 2 }}>TRANSIT TIMES</Typography>
                  {[
                    { route: "Dammam → Colombo", time: "18–22 days (Sea)" },
                    { route: "Any KSA → Sri Lanka", time: "3–5 days (Air)" },
                    { route: "Colombo → Island-wide", time: "1–3 days" },
                  ].map(r => (
                    <Box key={r.route} sx={{ mb: 2, pb: 2, borderBottom: "1px solid #F1F5F9", "&:last-child": { mb: 0, pb: 0, border: 0 } }}>
                      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.82rem", color: "#0F172A" }}>{r.route}</Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: "#64748B" }}>{r.time}</Typography>
                    </Box>
                  ))}
                </Paper>

                <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", bgcolor: BLUE, color: "#fff" }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.85rem", mb: 1 }}>📞 CALL US</Typography>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.9rem" }}>+94 76 095 93 85</Typography>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.9rem" }}>+94 67 22 60 200</Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", mt: 1 }}>Available 24 hours, 7 days</Typography>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: "10px", fontFamily: FONT, fontWeight: 700 }}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
}
