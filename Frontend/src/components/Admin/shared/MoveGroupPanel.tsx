import {
  Box, Typography, Stack, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Dialog, DialogTitle, DialogContent,
  IconButton, Button, Chip, Divider, Checkbox, FormControl, InputLabel,
  Select, MenuItem
} from "@mui/material";
import {
  CloseOutlined, QrCode2Outlined, PrintOutlined, DownloadOutlined,
  GroupOutlined, DeleteOutline
} from "@mui/icons-material";
import type { BookingData } from "./StageBookingBoard";
import { ALL_STATUS_OPTIONS } from "./bookingWorkflow";

const PRIMARY_TEAL = "#004652";
const ACCENT_GOLD = "#CC9D2F";

export interface MoveGroupData {
  _id: string;
  group_code: string;
  from_status: string;
  to_status: string;
  from_label: string;
  to_label: string;
  package_count: number;
  booking_ids: BookingData[];
  qr_code?: string;
  notes?: string;
  moved_by?: string;
  createdAt: string;
}

interface MoveGroupDetailDialogProps {
  open: boolean;
  group: MoveGroupData | null;
  onClose: () => void;
}

export function MoveGroupDetailDialog({ open, group, onClose }: MoveGroupDetailDialogProps) {
  if (!group) return null;

  const movedAt = new Date(group.createdAt);
  const bookings = group.booking_ids || [];

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>${group.group_code}</title>
      <style>
        body { font-family: Montserrat, sans-serif; padding: 24px; }
        h1 { color: #004652; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #f8fafc; }
        .qr { text-align: center; margin: 16px 0; }
      </style></head><body>
      <h1>Move Group: ${group.group_code}</h1>
      <p><strong>Date:</strong> ${movedAt.toLocaleString()}</p>
      <p><strong>Packages:</strong> ${group.package_count}</p>
      <p><strong>From:</strong> ${group.from_label} → <strong>To:</strong> ${group.to_label}</p>
      ${group.notes ? `<p><strong>Notes:</strong> ${group.notes}</p>` : ""}
      <div class="qr"><img src="${group.qr_code}" width="160" height="160" alt="QR"/></div>
      <table>
        <tr><th>Tracking</th><th>Shipper</th><th>Consignee</th><th>Cargo</th></tr>
        ${bookings.map(b => `<tr><td>${b.tracking_number}</td><td>${b.sender_name}</td><td>${b.receiver_name}</td><td>${b.cargo_type}</td></tr>`).join("")}
      </table>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const downloadQr = () => {
    if (!group.qr_code) return;
    const a = document.createElement("a");
    a.href = group.qr_code;
    a.download = `${group.group_code}-qr.png`;
    a.click();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: PRIMARY_TEAL, pr: 6 }}>
        Move Group — {group.group_code}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 12, top: 12 }}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={3}>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: "12px" }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", mb: 1 }}>MOVE DETAILS</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: PRIMARY_TEAL, mb: 1 }}>{group.group_code}</Typography>
            <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}><strong>Date & Time:</strong> {movedAt.toLocaleString()}</Typography>
            <Typography sx={{ fontSize: "0.85rem", mb: 0.5 }}><strong>Packages Moved:</strong> {group.package_count}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip label={group.from_label} size="small" sx={{ fontWeight: 700 }} />
              <Typography>→</Typography>
              <Chip label={group.to_label} size="small" color="primary" sx={{ fontWeight: 700 }} />
            </Stack>
            {group.notes && (
              <Typography sx={{ fontSize: "0.8rem", color: "#64748B", mt: 1.5, fontStyle: "italic" }}>Note: {group.notes}</Typography>
            )}
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: "12px", minWidth: 200 }}>
            <QrCode2Outlined sx={{ color: ACCENT_GOLD, fontSize: 28, mb: 1 }} />
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748B", mb: 1 }}>GROUP QR CODE</Typography>
            {group.qr_code ? (
              <Box component="img" src={group.qr_code} alt="Group QR" sx={{ width: 160, height: 160, borderRadius: "8px", border: "1px solid #E2E8F0" }} />
            ) : (
              <Typography sx={{ color: "#94A3B8" }}>No QR</Typography>
            )}
            <Stack direction="row" spacing={1} justifyContent="center" mt={1.5}>
              <Button size="small" startIcon={<DownloadOutlined />} onClick={downloadQr} sx={{ fontWeight: 700 }}>Download</Button>
              <Button size="small" startIcon={<PrintOutlined />} onClick={handlePrint} sx={{ fontWeight: 700 }}>Print</Button>
            </Stack>
          </Paper>
        </Stack>

        <Divider sx={{ mb: 2 }} />
        <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: PRIMARY_TEAL, mb: 1.5 }}>
          PACKAGES IN THIS GROUP ({bookings.length})
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "10px" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                {["TRACKING", "SHIPPER", "MOBILE", "CONSIGNEE", "DESTINATION", "CARGO"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.65rem", color: "#64748B" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map(b => (
                <TableRow key={b._id} hover>
                  <TableCell sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.8rem" }}>{b.tracking_number}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>{b.sender_name}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#64748B" }}>{b.sender_mobile}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem" }}>{b.receiver_name}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{b.delivery_city}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", textTransform: "uppercase" }}>{b.cargo_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";

interface MoveGroupsHistoryProps {
  outgoing: MoveGroupData[];
  incoming: MoveGroupData[];
  onViewGroup: (group: MoveGroupData) => void;
  loading?: boolean;
  nextStatus: string | null;
  nextStatusLabel: string | null;
  onBulkMoveGroups: (groupIds: string[]) => void;
  onBulkStatusUpdateGroups: (groupIds: string[], newStatus: string) => void;
  onBulkDeleteGroups: (groupIds: string[]) => void;
}

export function MoveGroupsHistory({
  outgoing,
  incoming,
  onViewGroup,
  loading,
  nextStatus,
  nextStatusLabel,
  onBulkMoveGroups,
  onBulkStatusUpdateGroups,
  onBulkDeleteGroups
}: MoveGroupsHistoryProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");

  const handleSelectAll = (checked: boolean, groups: MoveGroupData[]) => {
    const ids = groups.map(g => g._id);
    if (checked) {
      setSelected(prev => [...new Set([...prev, ...ids])]);
    } else {
      setSelected(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const renderTable = (groups: MoveGroupData[], emptyMsg: string) => {
    const isAllSelected = groups.length > 0 && groups.every(g => selected.includes(g._id));
    const isIndeterminate = groups.some(g => selected.includes(g._id)) && !isAllSelected;

    return groups.length === 0 ? (
      <Typography sx={{ color: "#94A3B8", py: 3, textAlign: "center", fontStyle: "italic", fontSize: "0.85rem" }}>{emptyMsg}</Typography>
    ) : (
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ py: 1 }}>
                <Checkbox size="small"
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked, groups)}
                />
              </TableCell>
              {["GROUP ID", "DATE & TIME", "PACKAGES", "FROM → TO", "QR", "ACTION"].map(h => (
                <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.65rem", color: "#64748B" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map(g => {
              const isSel = selected.includes(g._id);
              return (
                <TableRow key={g._id} hover sx={{ cursor: "pointer", bgcolor: isSel ? "rgba(0, 70, 82, 0.02)" : "transparent" }} onClick={() => onViewGroup(g)}>
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox size="small" checked={isSel} onChange={() => handleSelectOne(g._id)} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: PRIMARY_TEAL, fontSize: "0.85rem" }}>{g.group_code}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{new Date(g.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={g.package_count} size="small" sx={{ fontWeight: 800, bgcolor: "#EFF6FF", color: "#2563EB" }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{g.from_label} → {g.to_label}</TableCell>
                  <TableCell>
                    {g.qr_code ? (
                      <Box component="img" src={g.qr_code} alt="QR" sx={{ width: 36, height: 36, borderRadius: "4px" }} />
                    ) : (
                      <QrCode2Outlined sx={{ color: ACCENT_GOLD }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onViewGroup(g); }}
                      sx={{ fontWeight: 700, borderColor: PRIMARY_TEAL, color: PRIMARY_TEAL, fontSize: "0.7rem" }}>
                      View Group
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: PRIMARY_TEAL }}>Groups Moved Out</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Batches you created when moving packages to the next stage</Typography>
          </Box>
          <Chip label={`${outgoing.length} group(s)`} size="small" sx={{ fontWeight: 700 }} />
        </Stack>
        {loading ? (
          <Typography sx={{ color: "#94A3B8", py: 4, textAlign: "center" }}>Loading...</Typography>
        ) : renderTable(outgoing, "No groups moved out yet. Select packages and click Create Move Group.")}
      </Paper>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: "1px solid #E2E8F0" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: PRIMARY_TEAL }}>Groups Received</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Batches that arrived at this stage from the previous step</Typography>
          </Box>
          <Chip label={`${incoming.length} group(s)`} size="small" sx={{ fontWeight: 700, bgcolor: "#ECFDF5", color: "#059669" }} />
        </Stack>
        {loading ? (
          <Typography sx={{ color: "#94A3B8", py: 4, textAlign: "center" }}>Loading...</Typography>
        ) : renderTable(incoming, "No groups received at this stage yet.")}
      </Paper>

      {/* Group Bulk Action Controls Bar */}
      {selected.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, borderRadius: "12px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, position: "sticky", bottom: 16, zIndex: 10 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: "100%" }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", color: PRIMARY_TEAL }}>SELECTED GROUPS: {selected.length}</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              {nextStatus && nextStatusLabel && (
                <Button variant="contained" size="small" startIcon={<GroupOutlined />}
                  onClick={() => { onBulkMoveGroups(selected); setSelected([]); }}
                  sx={{ bgcolor: PRIMARY_TEAL, fontWeight: 700, borderRadius: "8px", "&:hover": { bgcolor: "#002d35" } }}>
                  Move Groups to Next Stage ({selected.length})
                </Button>
              )}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel sx={{ fontSize: "0.75rem" }}>Manual Status (no group)</InputLabel>
                <Select value={bulkStatus} label="Manual Status (no group)" 
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if (newStatus) {
                      onBulkStatusUpdateGroups(selected, newStatus);
                      setBulkStatus("");
                      setSelected([]);
                    }
                  }} 
                  sx={{ borderRadius: "8px", fontSize: "0.75rem" }}>
                  <MenuItem value="" disabled><em>Select status</em></MenuItem>
                  {ALL_STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button size="small" variant="contained" color="error" 
                onClick={() => { onBulkDeleteGroups(selected); setSelected([]); }}
                startIcon={<DeleteOutline />}>
                Delete Groups ({selected.length})
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
