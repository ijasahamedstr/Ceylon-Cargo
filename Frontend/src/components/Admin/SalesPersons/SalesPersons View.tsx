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
  PersonOutlineOutlined,
  BusinessOutlined,
  PhoneOutlined,
  AdminPanelSettingsOutlined,
  QrCode2Outlined,
  DownloadOutlined,
  BadgeOutlined,
  VerifiedUserOutlined
} from "@mui/icons-material";
import jsPDF from "jspdf"; 
import html2canvas from "html2canvas";

const primaryTeal = "#004652";
const accentGold = "#CC9D2F";
const primaryFont = "'Montserrat', sans-serif";
const borderColor = "#E2E8F0";
const softBg = "#F8FAFC";

export interface SalesPersonData {
  _id: string;
  name: string;
  branch: "Jeddah Office" | "Riyadh Office" | "Dammam Office" | string;
  phone: string;
  createdAt?: string;
}

interface Props {
  agent: SalesPersonData;
  onBack: () => void;
}

const SalesPersonsView = ({ agent, onBack }: Props) => {
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
      pdf.save(`Agent_Profile_${agent.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  };

  const InfoRow = ({ label, value, highlight = false }: { label: string; value?: string | React.ReactNode, highlight?: boolean }) => (
    <Stack direction="row" sx={{ mb: 2, alignItems: "flex-start" }}>
      <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.75rem", color: "#64748B", width: "130px", flexShrink: 0, mt: 0.2, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ 
        fontFamily: primaryFont, 
        fontWeight: highlight ? 800 : 600, 
        fontSize: highlight ? "1rem" : "0.9rem", 
        color: highlight ? primaryTeal : "#0F172A",
        wordBreak: "break-word"
      }}>
        {value || "—"}
      </Typography>
    </Stack>
  );

  const SectionHeader = ({ title, icon, color = primaryTeal }: { title: string, icon: React.ReactNode, color?: string }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3, pb: 1.5, borderBottom: `2px solid ${softBg}` }}>
      <Box sx={{ color: color, display: "flex", bgcolor: `${color}15`, p: 1, borderRadius: "8px" }}>{icon}</Box>
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
          Back to List
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
            Print Record
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
            <VerifiedUserOutlined sx={{ fontSize: "400px" }} />
          </Box>

          <Box sx={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Top Brand Bar */}
            <Box sx={{ height: "12px", width: "100%", background: `linear-gradient(90deg, ${primaryTeal} 0%, ${primaryTeal} 70%, ${accentGold} 70%, ${accentGold} 100%)` }} />

            {/* Header Section */}
            <Box sx={{ p: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 3, borderBottom: `1px solid ${borderColor}` }}>
              
              {/* Logo and Brand Name */}
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box 
                  component="img" 
                  src="https://i.ibb.co/prMTS3qn/imageedit-1-7107164398.png" 
                  alt="Ceylon Cargo Logo" 
                  sx={{ 
                    height: { xs: 50, sm: 80 }, 
                    width: "auto", 
                    objectFit: "contain" 
                  }} 
                />
                <Box>
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 900, fontSize: { xs: "1.4rem", sm: "1.3rem" }, color: primaryTeal, letterSpacing: -1, lineHeight: 1 }}>
                    CEYLON CARGO SERVICE
                  </Typography>
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.9rem", color: accentGold, letterSpacing: 3, mt: 0.5 }}>
                    OFFICIAL AGENT RECORD
                  </Typography>
                  <Chip 
                    label="ACTIVE AGENT" 
                    size="small" 
                    icon={<VerifiedUserOutlined sx={{ fontSize: "14px !important", color: "#166534 !important" }} />}
                    sx={{ 
                      mt: 2, fontFamily: primaryFont, fontWeight: 800, fontSize: "0.7rem", letterSpacing: 1,
                      bgcolor: "#DCFCE7", color: "#166534", borderRadius: "6px", pl: 0.5
                    }} 
                  />
                </Box>
              </Stack>

              {/* Agent ID Area */}
              <Box sx={{ textAlign: "right", mt: { xs: 2, sm: 0 } }}>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 700, fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>
                  Agent ID Number
                </Typography>
                <Typography sx={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 900, fontSize: "1.5rem", color: "#0F172A", bgcolor: softBg, px: 2, py: 0.5, borderRadius: "6px", border: `1px solid ${borderColor}`, mt: 0.5, display: "inline-block" }}>
                  {agent._id.slice(-8).toUpperCase()}
                </Typography>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 600, fontSize: "0.8rem", color: "#64748B", mt: 1 }}>
                  Date Added: <span style={{ color: "#0F172A", fontWeight: 800 }}>{agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "N/A"}</span>
                </Typography>
              </Box>
            </Box>

            {/* Profile Content Body */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
              
              {/* Left Column: Personal Info */}
              <Box sx={{ flex: 1, p: 4, borderRight: { md: `1px solid ${borderColor}` }, borderBottom: { xs: `1px solid ${borderColor}`, md: "none" } }}>
                <SectionHeader title="AGENT DETAILS" icon={<PersonOutlineOutlined />} />
                
                {/* Visual Avatar Placeholder */}
                <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: softBg, border: `2px dashed ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PersonOutlineOutlined sx={{ fontSize: 40, color: "#94A3B8" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "1.2rem", color: "#0F172A" }}>
                      {agent.name}
                    </Typography>
                    <Typography sx={{ fontFamily: primaryFont, fontWeight: 600, fontSize: "0.85rem", color: "#64748B" }}>
                      Sales Representative
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ pl: 1 }}>
                  <InfoRow label="Full Name" value={agent.name} highlight />
                  <InfoRow label="Contact Number" value={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneOutlined sx={{ fontSize: 16, color: primaryTeal }} />
                      <span>{agent.phone || "Not Provided"}</span>
                    </Stack>
                  } />
                </Box>
              </Box>

              {/* Right Column: Assignment Info */}
              <Box sx={{ flex: 1, p: 4, bgcolor: "rgba(0, 70, 82, 0.02)" }}>
                <SectionHeader title="ASSIGNMENT INFO" icon={<BusinessOutlined />} color={primaryTeal} />
                <Box sx={{ pl: 1 }}>
                  <InfoRow label="Assigned Branch" value={
                    <Chip 
                      icon={<BusinessOutlined sx={{ fontSize: "14px !important" }}/>} 
                      label={agent.branch} 
                      size="small" 
                      sx={{ 
                        bgcolor: "#fff", color: primaryTeal, border: `1px solid ${primaryTeal}`, 
                        fontFamily: primaryFont, fontWeight: 700, borderRadius: "6px" 
                      }} 
                    />
                  } />
                  <InfoRow label="System Database ID" value={
                    <span style={{ fontFamily: "monospace", color: "#475569" }}>{agent._id}</span>
                  } />
                  <InfoRow label="Profile Status" value={<span style={{ color: "#166534", fontWeight: 800 }}>Active</span>} />
                  <InfoRow label="Creation Date" value={agent.createdAt ? new Date(agent.createdAt).toLocaleString() : "Unknown"} />
                </Box>
              </Box>

            </Box>

            {/* Footer / Admin Verification Section */}
            <Box sx={{ mt: "auto", borderTop: `2px solid ${primaryTeal}`, display: "flex", flexDirection: { xs: "column", sm: "row" }, p: 4, alignItems: "center", justifyContent: "space-between", bgcolor: softBg }}>
              <Box sx={{ flex: 1, pr: 4, width: "100%" }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AdminPanelSettingsOutlined sx={{ color: "#64748B", fontSize: 20 }} />
                  <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.9rem", color: "#64748B" }}>
                    ADMINISTRATIVE VERIFICATION
                  </Typography>
                </Stack>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 500, fontSize: "0.8rem", color: "#64748B", lineHeight: 1.6 }}>
                  This document serves as an official internal record of employment and branch assignment for Ceylon Cargo Service. The information contained herein is generated directly from the central database.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: { xs: 3, sm: 0 }, pl: { sm: 4 }, borderLeft: { sm: `1px solid ${borderColor}` } }}>
                {/* Visual QR Code placeholder for Profile Verification */}
                <Box sx={{ width: 90, height: 90, bgcolor: "#fff", border: `1px dashed ${borderColor}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode2Outlined sx={{ color: "#CBD5E1", fontSize: 40 }} />
                </Box>
                <Typography sx={{ fontFamily: primaryFont, fontWeight: 800, fontSize: "0.65rem", color: primaryTeal, mt: 1, letterSpacing: 1 }}>
                  SCAN TO VERIFY
                </Typography>
              </Box>
            </Box>

            {/* Bottom Edge */}
            <Box sx={{ bgcolor: primaryTeal, py: 1.5, px: 4, textAlign: "center" }}>
              <Typography sx={{ fontFamily: primaryFont, fontWeight: 500, fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 }}>
                Confidential Document • Ceylon Cargo Service Internal Use Only
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

export default SalesPersonsView;