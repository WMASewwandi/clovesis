import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, Button, Typography, Divider, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import BASE_URL from "Base/api";

// Customer-facing intake receipt printed at Step 7 of the job-card flow.
// Intentionally simple: A4-friendly layout, "Print" calls window.print().
// This is NOT an invoice — invoicing happens in the Service Invoice sub-module.

const authHeaders = () => ({
  Authorization: `Bearer ${
    typeof window !== "undefined" ? localStorage.getItem("token") : ""
  }`,
  "Content-Type": "application/json",
});

const serviceTypeLabel = (jc) => {
  if (jc?.serviceType === 1) {
    return jc.isWarrantyRepair ? "Warranty Repair (no charge)" : "Free Service (no charge)";
  }
  return jc?.serviceType === 2 ? "Paid Repair" : "—";
};
const PRIORITY_LABEL = { 1: "Normal", 2: "Urgent", 3: "Critical" };

export default function JobCardReceipt() {
  const router = useRouter();
  const { id } = router.query;
  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch(`${BASE_URL}/ServiceJobCard/GetById/${id}`, {
        headers: authHeaders(),
      });
      const j = await r.json();
      setJobCard(j?.result || null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  if (loading) return <Box sx={{ p: 4 }}>Loading…</Box>;
  if (!jobCard) return <Box sx={{ p: 4 }}>Receipt not found.</Box>;

  const accessoryList = (jobCard.accessoriesReceived || "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button onClick={() => router.back()}>Back</Button>
        <Button variant="contained" onClick={() => window.print()}>Print</Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box textAlign="center" mb={2}>
          <Typography variant="h5" fontWeight={700}>Service Intake Receipt</Typography>
          <Typography variant="body2" color="text.secondary">
            Please retain this slip — it is your proof of device handover.
          </Typography>
        </Box>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography><strong>Job No:</strong> {jobCard.documentNo}</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography>
              <strong>Received:</strong>{" "}
              {jobCard.receivedDate ? new Date(jobCard.receivedDate).toLocaleString() : "-"}
            </Typography>
          </Grid>
        </Grid>

        <Divider />

        <Grid container spacing={1} sx={{ mt: 1, mb: 1 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Customer</Typography>
            <Typography>{jobCard.customerName}</Typography>
            <Typography color="text.secondary">{jobCard.contactNo || "-"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Service Type</Typography>
            <Typography>{serviceTypeLabel(jobCard)}</Typography>
            <Typography color="text.secondary">
              Priority: {PRIORITY_LABEL[jobCard.priority] || "Normal"}
              {jobCard.expectedDeliveryDate && (
                <> · ETA: {new Date(jobCard.expectedDeliveryDate).toLocaleDateString()}</>
              )}
            </Typography>
          </Grid>
        </Grid>

        <Divider />

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2">Device</Typography>
          <Typography>
            {[jobCard.deviceType, jobCard.brand, jobCard.model].filter(Boolean).join(" · ") ||
              jobCard.productName}
          </Typography>
          <Typography color="text.secondary">
            {jobCard.productName}
            {jobCard.serialNumber ? ` · Serial: ${jobCard.serialNumber}` : ""}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2">Reported Fault</Typography>
          <Typography>{jobCard.faultReportedByCustomer || "-"}</Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2">Physical Condition at Intake</Typography>
          <Typography>{jobCard.physicalCondition || "-"}</Typography>
        </Box>

        {accessoryList.length > 0 && (
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2">Accessories Received</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={40}>#</TableCell>
                  <TableCell>Item</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessoryList.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{a}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Box sx={{ borderTop: "1px dashed #888", pt: 1, mt: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Customer signature
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ borderTop: "1px dashed #888", pt: 1, mt: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Received by
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </Box>
  );
}
