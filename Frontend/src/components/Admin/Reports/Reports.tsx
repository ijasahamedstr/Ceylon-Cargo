import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, Button, Stack, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { FileDownloadOutlined, AssessmentOutlined } from "@mui/icons-material";

const API = import.meta.env.VITE_API_URL || "http://localhost:8001";
const TEAL = "#004652";
const FONT = "'Montserrat', sans-serif";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bookings: 0, shipments: 0, airManifests: 0, loadingLists: 0,
    paid: 0, unpaid: 0, airBookings: 0, seaBookings: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/bookings`).then((r) => r.json()),
      fetch(`${API}/api/shipments`).then((r) => r.json()),
      fetch(`${API}/api/air-manifests`).then((r) => r.json()),
      fetch(`${API}/api/loading-lists`).then((r) => r.json()),
    ]).then(([b, s, am, ll]) => {
      const bookings = b.data || [];
      setData({
        bookings: bookings.length,
        shipments: s.data?.length || 0,
        airManifests: am.data?.length || 0,
        loadingLists: ll.data?.length || 0,
        paid: bookings.filter((x: { payment_status: string }) => x.payment_status === "paid").length,
        unpaid: bookings.filter((x: { payment_status: string }) => x.payment_status === "unpaid").length,
        airBookings: bookings.filter((x: { cargo_type: string }) => x.cargo_type === "air").length,
        seaBookings: bookings.filter((x: { cargo_type: string }) => x.cargo_type === "sea").length,
      });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const reports = [
    { title: "Bookings Summary", rows: [["Total Bookings", data.bookings], ["Air Cargo", data.airBookings], ["Sea Cargo", data.seaBookings], ["Paid", data.paid], ["Unpaid", data.unpaid]] },
    { title: "Operations Summary", rows: [["Sea Shipments", data.shipments], ["Air Manifests", data.airManifests], ["Loading Lists", data.loadingLists]] },
  ];

  if (loading) return <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress sx={{ color: TEAL }} /></Box>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: FONT, fontWeight: 900, fontSize: "1.3rem", color: TEAL }}>Reports</Typography>
          <Typography sx={{ fontFamily: FONT, color: "#64748B", fontSize: "0.85rem" }}>Operational and financial summaries</Typography>
        </Box>
        <Button variant="outlined" startIcon={<FileDownloadOutlined />} disabled
          sx={{ borderRadius: "10px", fontFamily: FONT, fontWeight: 700, textTransform: "none", borderColor: TEAL, color: TEAL }}>
          Export PDF (soon)
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid key={report.title} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", border: "1px solid #E2E8F0" }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <AssessmentOutlined sx={{ color: TEAL }} />
                <Typography sx={{ fontFamily: FONT, fontWeight: 800, color: TEAL }}>{report.title}</Typography>
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {report.rows.map(([label, value]) => (
                      <TableRow key={label}>
                        <TableCell sx={{ fontFamily: FONT, fontSize: "0.85rem", color: "#64748B", border: 0 }}>{label}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "0.9rem", color: TEAL, border: 0 }}>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
