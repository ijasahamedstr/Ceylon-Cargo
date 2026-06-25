import React, { useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Chip
} from "@mui/material";
import {
  ArrowBackIosNewOutlined,
  PrintOutlined,
  FlightTakeoffOutlined,
  DirectionsBoatOutlined,
  PersonOutlineOutlined,
  LocationOnOutlined,
  Inventory2Outlined,
  AdminPanelSettingsOutlined,
  QrCode2Outlined,
  DownloadOutlined
} from "@mui/icons-material";
import jsPDF from "jspdf"; 
import html2canvas from "html2canvas";

const primaryTeal = "#004652";
const accentGold = "#CC9D2F";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";
const softBg = "#F8FAFC";

export interface BookingData {
  _id?: string;
  tracking_number: string;
  status: string;
  sender_name: string;
  sender_mobile: string;
  sender_email?: string;
  sender_iqama: string;
  sender_passport?: string;
  pickup_city: string;
  pickup_address: string;
  collection_date?: string;
  receiver_name: string;
  receiver_mobile: string;
  receiver_email?: string;
  delivery_city: string;
  receiver_address: string;
  cargo_type: "air" | "sea";
  delivery_service: string;
  packaging_type?: string;
  special_instructions?: string;
  package_description: string;
  insurance: boolean;
  payment_status: string;
  payment_amount?: number; 
  branch?: string;
  sales_person_id?: string;
  qr_code?: string;
  createdAt?: string;
}

interface Props {
  booking: BookingData;
  onBack: () => void;
}

const BookingCustomerView = ({ booking, onBack }: Props) => {
  const componentRef = useRef<HTMLDivElement>(null); 

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = componentRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Waybill_${booking.tracking_number}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  };

  const InfoRow = ({ label, value, highlight = false }: { label: string; value?: string | React.ReactNode, highlight?: boolean }) => (
    <Stack direction="row" sx={{ mb: 1, alignItems: "flex-start" }}>
      <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.75rem", color: "#64748B", width: "110px", flexShrink: 0, mt: 0.2 }}>
        {label}
      </Typography>
      <Typography sx={{ 
        fontFamily: primaryFont, 
        fontWeight: highlight ? 700 : 500, 
        fontSize: "0.85rem", 
        color: highlight ? primaryTeal : "#0F172A",
        wordBreak: "break-word"
      }}>
        {value || "—"}
      </Typography>
    </Stack>
  );

  const SectionHeader = ({ title, icon, color = primaryTeal }: { title: string, icon: React.ReactNode, color?: string }) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, pb: 1, borderBottom: `1px dashed ${borderColor}` }}>
      <Box sx={{ color: color, display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "1.1rem", color: color, letterSpacing: 0.5 }}>
        {title}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#F1F5F9", minHeight: "100vh", position: "relative" }}>
      
      {/* 🚀 Action Bar 🚀 */}
      <Stack 
        className="no-print" 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 4, width: "100%", maxWidth: "850px", mx: "auto" }}
      >
        <Button 
          onClick={onBack} 
          startIcon={<ArrowBackIosNewOutlined sx={{ fontSize: 14 }} />}
          sx={{ fontFamily: primaryFont, color: "#475569", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#E2E8F0" } }}
        >
          Back
        </Button>

        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadOutlined />} 
            onClick={handleDownloadPdf}
            sx={{ 
              fontFamily: primaryFont, fontWeight: 700, textTransform: "none", py: 1, px: 3,
              borderColor: primaryTeal, color: primaryTeal, borderRadius: "8px",
              "&:hover": { bgcolor: "rgba(0,70,82,0.05)", borderColor: primaryTeal }
            }}
          >
            Download PDF
          </Button>

          <Button 
            variant="contained" 
            startIcon={<PrintOutlined />} 
            onClick={handlePrint}
            sx={{ 
              fontFamily: primaryFont, fontWeight: 700, textTransform: "none", py: 1, px: 3,
              bgcolor: primaryTeal, borderRadius: "8px", boxShadow: "0 8px 16px rgba(0,70,82,0.2)",
              "&:hover": { bgcolor: "#00333d" }
            }}
          >
            Print Waybill
          </Button>
        </Stack>
      </Stack>

      {/* 🚀 Flexible / Responsive Document 🚀 */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Paper 
          ref={componentRef} 
          className="print-paper"
          elevation={0} 
          sx={{ 
            width: "100%", 
            maxWidth: "850px",
            bgcolor: "#fff", 
            borderRadius: "16px",
            overflow: "hidden", 
            position: "relative",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Subtle Watermark */}
          <Box sx={{ 
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", 
            opacity: 0.03, pointerEvents: "none", zIndex: 0
          }}>
            <FlightTakeoffOutlined sx={{ fontSize: "400px" }} />
          </Box>

          <Box sx={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Top Brand Bar */}
            <Box sx={{ height: "12px", width: "100%", background: `linear-gradient(90deg, ${primaryTeal} 0%, ${primaryTeal} 70%, ${accentGold} 70%, ${accentGold} 100%)` }} />

            {/* Header Section */}
            <Box sx={{ p: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 3 }}>
              
              {/* Logo and Brand Name */}
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box 
                  component="img" 
                  src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png" 
                  alt="Ceylon Cargo Logo" 
                  sx={{ 
                    height: { xs: 50, sm: 110 }, 
                    width: "auto", 
                    objectFit: "contain" 
                  }} 
                />
                <Box>
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 900, fontSize: { xs: "1.4rem", sm: "1.3rem" }, color: primaryTeal, letterSpacing: -1, lineHeight: 1 }}>
                    CEYLON CARGO SERVICE
                  </Typography>
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.9rem", color: accentGold, letterSpacing: 3, mt: 0.5 }}>
                    OFFICIAL WAYBILL
                  </Typography>
                  <Chip 
                    label={booking.status.toUpperCase()} 
                    size="small" 
                    sx={{ 
                      mt: 2, fontFamily: primaryFont, fontWeight: 800, fontSize: "0.7rem", letterSpacing: 1,
                      bgcolor: booking.status === "confirmed" ? "#DCFCE7" : "#F1F5F9",
                      color: booking.status === "confirmed" ? "#166534" : "#475569",
                      borderRadius: "6px"
                    }} 
                  />
                </Box>
              </Stack>

              {/* Tracking Area */}
              <Box sx={{ textAlign: "right", mt: { xs: 2, sm: 0 } }}>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>
                  Tracking Number
                </Typography>
                <Typography sx={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, fontSize: "1.7rem", color: "#0F172A", bgcolor: softBg, px: 2, py: 0.5, borderRadius: "6px", border: `1px solid ${borderColor}`, mt: 0.5, display: "inline-block" }}>
                  {booking.tracking_number}
                </Typography>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 600, fontSize: "0.8rem", color: "#64748B", mt: 1 }}>
                  Date: <span style={{ color: "#0F172A", fontWeight: 800 }}>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </Typography>
              </Box>
            </Box>

            {/* Shipper & Consignee Row */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}>
              
              {/* Shipper */}
              <Box sx={{ flex: 1, p: 4, borderRight: { md: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, md: "none" } }}>
                <SectionHeader title="SHIPPER (SENDER)" icon={<PersonOutlineOutlined />} />
                <Box sx={{ pl: 1 }}>
                  <InfoRow label="Full Name" value={booking.sender_name} highlight />
                  <InfoRow label="Mobile" value={booking.sender_mobile} />
                  <InfoRow label="Email" value={booking.sender_email} />
                  <InfoRow label="ID/IQAMA" value={booking.sender_iqama} />
                  {booking.sender_passport && <InfoRow label="Passport" value={booking.sender_passport} />}
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${borderColor}` }}>
                    <InfoRow label="Pickup City" value={booking.pickup_city} />
                    <InfoRow label="Address" value={booking.pickup_address} />
                  </Box>
                </Box>
              </Box>

              {/* Consignee */}
              <Box sx={{ flex: 1, p: 4, bgcolor: "rgba(204, 157, 47, 0.03)" }}>
                <SectionHeader title="CONSIGNEE (RECEIVER)" icon={<LocationOnOutlined />} color={accentGold} />
                <Box sx={{ pl: 1 }}>
                  <InfoRow label="Full Name" value={booking.receiver_name} highlight />
                  <InfoRow label="Mobile" value={booking.receiver_mobile} />
                  <InfoRow label="Email" value={booking.receiver_email} />
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${borderColor}` }}>
                    <InfoRow label="Delivery City" value={booking.delivery_city} />
                    <InfoRow label="Address" value={booking.receiver_address} />
                  </Box>
                </Box>
              </Box>

            </Box>

            {/* Cargo Details */}
            <Box sx={{ p: 4, flex: 1 }}>
              <SectionHeader title="CARGO DETAILS" icon={<Inventory2Outlined />} />
              
              <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
                <Box sx={{ flex: "1 1 40%", minWidth: { md: "280px" } }}>
                  <Box sx={{ bgcolor: softBg, p: 2.5, borderRadius: "12px", border: `1px solid ${borderColor}` }}>
                    <InfoRow label="Transport Mode" value={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {booking.cargo_type === "air" ? <FlightTakeoffOutlined sx={{ fontSize: 18, color: primaryTeal }} /> : <DirectionsBoatOutlined sx={{ fontSize: 18, color: primaryTeal }} />}
                        <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase" }}>{booking.cargo_type}</Typography>
                      </Stack>
                    } />
                    <InfoRow label="Service Level" value={<span style={{ textTransform: "capitalize" }}>{booking.delivery_service.replace(/_/g, " ")}</span>} />
                    <InfoRow label="Packaging" value={booking.packaging_type || "Standard"} />
                    <InfoRow label="Insurance" value={booking.insurance ? "Active" : "Opted Out"} />
                  </Box>
                </Box>
                
                <Box sx={{ flex: "1 1 60%" }}>
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", mb: 1 }}>
                    Package Description
                  </Typography>
                  <Typography sx={{ fontFamily: primaryFont, fontSize: "0.9rem", color: "#0F172A", lineHeight: 1.6, mb: 3 }}>
                    {booking.package_description}
                  </Typography>

                  {booking.special_instructions && (
                    <Box sx={{ borderLeft: `4px solid ${accentGold}`, pl: 2, py: 0.5 }}>
                      <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", mb: 0.5 }}>
                        Special Instructions
                      </Typography>
                      <Typography sx={{ fontFamily: primaryFont, fontSize: "0.85rem", color: "#92400E", fontWeight: 600 }}>
                        {booking.special_instructions}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Footer / Admin */}
            <Box sx={{ mt: "auto", borderTop: `2px solid ${primaryTeal}`, display: "flex", flexDirection: { xs: "column", sm: "row" }, p: 4, alignItems: "center", justifyContent: "space-between", bgcolor: softBg }}>
              <Box sx={{ flex: 1, pr: 4, width: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AdminPanelSettingsOutlined sx={{ color: "#64748B", fontSize: 20 }} />
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.9rem", color: "#64748B" }}>
                    ADMINISTRATIVE USE
                  </Typography>
                </Stack>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 4 } }}>
                  <Box sx={{ flex: 1 }}>
                    <InfoRow label="Payment Status" value={
                      <Typography sx={{ textTransform: "uppercase", fontWeight: 900, fontSize: "0.8rem", color: booking.payment_status === "paid" ? "#16A34A" : "#D97706" }}>
                        {booking.payment_status}
                      </Typography>
                    } />
                    <InfoRow label="Payment Amount" value={
                      <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#0F172A" }}>
                        SAR {booking.payment_amount ? booking.payment_amount.toFixed(2) : "0.00"}
                      </Typography>
                    } />
                    {booking.collection_date && <InfoRow label="Collection Date" value={new Date(booking.collection_date).toLocaleDateString()} />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <InfoRow label="Branch" value={booking.branch} />
                    <InfoRow label="Sales Agent ID" value={booking.sales_person_id} />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: { xs: 3, sm: 0 }, pl: { sm: 4 }, borderLeft: { sm: `1px solid ${borderColor}` } }}>
                {booking.qr_code ? (
                  <Box component="img" src={booking.qr_code} sx={{ width: 100, height: 100, bgcolor: "#fff", border: `1px solid ${borderColor}`, borderRadius: "8px", p: 0.5 }} />
                ) : (
                  <Box sx={{ width: 100, height: 100, bgcolor: "#fff", border: `1px dashed ${borderColor}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode2Outlined sx={{ color: "#CBD5E1", fontSize: 40 }} />
                  </Box>
                )}
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.65rem", color: primaryTeal, mt: 1, letterSpacing: 1.5 }}>
                  SCAN TO TRACK
                </Typography>
              </Box>
            </Box>

            {/* Bottom Edge */}
            <Box sx={{ bgcolor: primaryTeal, py: 1.5, px: 4, textAlign: "center" }}>
              <Typography sx={{ fontFamily: primaryFont, fontWeight: 500, fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 }}>
                Thank you for choosing Ceylon Cargo Service. By accepting this waybill, you agree to our standard terms and conditions.
              </Typography>
            </Box>

          </Box>
        </Paper>
      </Box>

      {/* 🚀 Advanced Print-Specific CSS (Flexible & Natural Flow) 🚀 */}
      <style>
        {`
          @media print {
            @page { 
              size: auto; 
              margin: 5mm; 
            }

            body * { 
              visibility: hidden; 
            }

            body, html {
              background-color: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .print-paper, .print-paper * { 
              visibility: visible; 
            }

            .print-paper {
              position: relative !important; 
              left: auto !important;
              top: auto !important;
              width: 100% !important;        
              max-width: 100% !important;
              height: auto !important;       
              min-height: 0 !important;      
              margin: 0 auto !important;
              padding: 0 !important;
              box-shadow: none !important;   
              border: none !important;
              border-radius: 0 !important;   
              transform: none !important;
            }

            .no-print, .no-print * { 
              display: none !important; 
              visibility: hidden !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default BookingCustomerView;