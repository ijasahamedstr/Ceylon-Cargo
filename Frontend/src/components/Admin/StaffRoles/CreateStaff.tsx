import { useState } from "react";
import {
  Box, Typography, Stack, Paper, Button, TextField, MenuItem,
  InputLabel, CircularProgress, Snackbar, Alert,
  FormControl, Select, Grid,
} from "@mui/material";
import {
  PersonOutline, PhoneOutlined, BusinessOutlined, ClearAllOutlined, CheckCircleOutline,

} from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001";
const PRIMARY_FONT = "'Montserrat', sans-serif";

const colors = {
  primary: "#004652",
  primaryLight: "#0D9488",
  accent: "#0EA5E9",
  background: "#F8FAFC",
  border: "#E2E8F0",
  textMain: "#0F172A",
  textMuted: "#64748B",
  error: "#F43F5E",
  success: "#10B981"
};

const gradientPrimary = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`;
const gradientHover = `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accent} 100%)`;
const glassShadow = "0 4px 20px 0 rgba(0, 70, 82, 0.03)";
const hoverShadow = "0 20px 30px -10px rgba(13, 148, 136, 0.08)";

const BRANCHES = ["Jeddah Office", "Riyadh Office", "Dammam Office"];

// Input Styles matching your exact system
const customInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: PRIMARY_FONT,
    fontSize: "0.85rem",
    backgroundColor: "#fff",
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: colors.border, borderWidth: "1px" },
    "& :hover fieldset": { borderColor: colors.primaryLight },
    "&.Mui-focused fieldset": { borderColor: colors.primaryLight, borderWidth: "1.5px" },
    "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(13, 148, 136, 0.08)" }
  },
  "& .MuiInputBase-input": { padding: "10px 14px", fontFamily: PRIMARY_FONT }
};

const customSelectSx = {
  ...customInputSx,
  "& .MuiSelect-select": { padding: "10px 14px", fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }
};

const labelSx = { 
  fontFamily: PRIMARY_FONT, fontWeight: 700, fontSize: "0.72rem", 
  color: colors.primary, mb: 0.75, letterSpacing: 0.8, 
  display: "inline-flex", alignItems: "center", gap: "6px", textTransform: "uppercase"
};

const sectionPaperSx = {
  p: { xs: 2.5, md: 4 }, mb: 4, borderRadius: "16px", 
  border: `1px solid ${colors.border}`, bgcolor: "#fff",
  boxShadow: glassShadow, transition: "all 0.25s ease-in-out",
  "&:hover": { transform: "translateY(-1px)", boxShadow: hoverShadow, borderColor: "rgba(13, 148, 136, 0.15)" }
};

// Types & State
interface SalesPersonFormState {
  name: string;
  branch: string;
  phone: string;
}

const emptyForm = (): SalesPersonFormState => ({
  name: "", branch: "", phone: "+966"
});

function SectionHeader({ num, title, subtitle }: { num: number; title: string; subtitle?: string }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: "8px", background: gradientPrimary, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: "0.85rem", fontFamily: PRIMARY_FONT,
        boxShadow: "0 4px 10px rgba(0, 70, 82, 0.15)"
      }}>{num}</Box>
      <Box>
        <Typography sx={{ fontFamily: PRIMARY_FONT, fontWeight: 800, color: colors.primary, fontSize: "1.05rem", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontFamily: PRIMARY_FONT, color: colors.textMuted, fontSize: "0.78rem", mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function CreateSalesPersonForm() {
  const [form, setForm] = useState<SalesPersonFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" as "success" | "error" });

  const notify = (msg: string, sev: "success" | "error") => setSnack({ open: true, msg, sev });
  
  const set = (key: keyof SalesPersonFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const clearForm = (silent = false) => {
    setForm(emptyForm());
    if (!silent) notify("Form cleared", "success");
  };

  const createSalesPerson = async () => {
    if (!form.name.trim()) {
      notify("Sales Agent Name is required", "error"); return;
    }
    if (!form.branch) {
      notify("Please assign a branch", "error"); return;
    }

    setSaving(true);
    try {
      // Replace with your actual API endpoint
      const r = await fetch(`${API}/api/sales-persons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (r.ok) {
        notify(`Sales Agent ${form.name} created successfully!`, "success");
        clearForm(true);
      } else {
        const j = await r.json();
        notify(j.message || "Failed to create sales agent", "error");
      }
    } catch {
      notify("Network error — is the backend running?", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100vh", pt: { xs: 3, md: 6 }, pb: 4, px: { xs: 1.5, sm: 3 } }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&display=swap');
        .MuiButton-root, .MuiPaper-root, .MuiOutlinedInput-root {
          transition: all 0.2s ease-in-out !important;
        }
      `}</style>

      <Box sx={{ maxWidth: "800px", margin: "0 auto", mb: { xs: 16, sm: 14 } }}>
        
        {/* Main Form Section */}
        <Paper elevation={0} sx={sectionPaperSx}>
          <SectionHeader num={1} title="Add Sales Representative" subtitle="Create a new agent profile and assign them to a regional branch" />
          
          <Grid container spacing={3}>
            
            {/* Agent Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel sx={labelSx}>
                <PersonOutline sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Agent Full Name <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <TextField 
                fullWidth 
                size="small" 
                value={form.name} 
                onChange={set("name")} 
                placeholder="e.g. Ahmed Al-Rashid" 
                sx={customInputSx} 
              />
            </Grid>

            {/* Branch Assignment */}
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel sx={labelSx}>
                <BusinessOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Branch Assignment <Box component="span" sx={{ color: colors.error }}>*</Box>
              </InputLabel>
              <FormControl fullWidth size="small">
                <Select 
                  value={form.branch} 
                  onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} 
                  displayEmpty 
                  sx={customSelectSx}
                >
                  <MenuItem value="" disabled><em>Select assigned branch</em></MenuItem>
                  {BRANCHES.map((b) => (
                    <MenuItem key={b} value={b} sx={{ fontFamily: PRIMARY_FONT, fontSize: "0.85rem" }}>
                      {b}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Mobile / Phone */}
            <Grid size={{ xs: 12, md: 6 }}>
              <InputLabel sx={labelSx}>
                <PhoneOutlined sx={{ fontSize: "0.95rem", color: colors.primaryLight }} />
                Contact Number
              </InputLabel>
              <TextField 
                fullWidth 
                size="small" 
                value={form.phone} 
                onChange={set("phone")} 
                placeholder="+966501111111" 
                sx={customInputSx} 
              />
              <Typography sx={{ fontSize: "0.7rem", color: colors.textMuted, mt: 0.5, fontFamily: PRIMARY_FONT }}>
                Format: +966XXXXXXXXX (Optional for Admins)
              </Typography>
            </Grid>

          </Grid>
        </Paper>
      </Box>

      {/* Fixed Bottom Action Bar */}
      <Paper 
        elevation={0} 
        sx={{ 
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
          borderRadius: "16px 16px 0 0", borderTop: `1px solid ${colors.border}`,
          bgcolor: "#fff", boxShadow: "0 -8px 30px rgba(0, 70, 82, 0.05)",
          backdropFilter: "blur(20px)", backgroundColor: "rgba(255, 255, 255, 0.9)",
          px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
          <Grid container spacing={1.5} justifyContent="flex-end">
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Button 
                fullWidth
                variant="outlined" 
                startIcon={<ClearAllOutlined />} 
                onClick={() => clearForm()}
                sx={{ 
                  borderRadius: "10px", fontFamily: PRIMARY_FONT, fontWeight: 750, 
                  textTransform: "none", py: 1.25, px: 3.5,
                  borderColor: colors.error, color: colors.error,
                  "&:hover": { bgcolor: "rgba(244, 63, 94, 0.04)", borderColor: colors.error }
                }}
              >
                Clear
              </Button>
            </Grid>
            
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Button 
                fullWidth
                variant="contained" 
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />} 
                onClick={createSalesPerson}
                disabled={saving}
                sx={{ 
                  borderRadius: "10px", fontFamily: PRIMARY_FONT, fontWeight: 750, 
                  textTransform: "none", py: 1.25, px: 4.5,
                  background: gradientPrimary, color: "#fff",
                  boxShadow: "0 4px 14px rgba(0, 70, 82, 0.2)",
                  "&:hover": { background: gradientHover, boxShadow: "0 6px 20px rgba(13, 148, 136, 0.3)" }
                }}
              >
                Save Agent Profile
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Notifications */}
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnack((p) => ({ ...p, open: false }))} severity={snack.sev} sx={{ width: "100%", borderRadius: "10px", fontFamily: PRIMARY_FONT, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}