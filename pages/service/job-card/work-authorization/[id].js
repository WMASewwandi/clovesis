import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Typography,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import BASE_URL from "Base/api";

// Customer-facing "Work Authorization Receipt" printed once the owner gives
// Final Approval. It summarises the whole job (device, fault, diagnosis, the
// approved parts & labour and what the customer will pay) so the customer has
// a record of the authorised work before the repair begins.
//
// This is NOT the final invoice — billing happens in the Service Invoice
// sub-module. Free Service / Warranty Repair jobs show every line as "FREE".

const authHeaders = () => ({
  Authorization: `Bearer ${
    typeof window !== "undefined" ? localStorage.getItem("token") : ""
  }`,
  "Content-Type": "application/json",
});

const LINE_TYPE_LABEL = { 1: "Part", 2: "Labour", 3: "Diagnostic" };

const serviceTypeLabel = (jc) => {
  if (jc?.serviceType === 1) {
    return jc.isWarrantyRepair ? "Warranty Repair (no charge)" : "Free Service (no charge)";
  }
  return jc?.serviceType === 2 ? "Paid Repair" : "—";
};

export default function WorkAuthorizationReceipt() {
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

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading) return <Box sx={{ p: 4 }}>Loading…</Box>;
  if (!jobCard) return <Box sx={{ p: 4 }}>Receipt not found.</Box>;

  // The receipt lists the FINAL, approved billable list — i.e. directly-added
  // lines plus technician-requested parts the owner has approved.
  const lines = (jobCard.lines || []).filter(
    (l) => !l.isDeleted && (!l.isTechnicianRequested || l.isApproved)
  );

  // A whole-job Free Service / Warranty Repair is free of charge to the
  // customer — every line is waived regardless of its own flag.
  const jobIsFreeOfCharge = jobCard.serviceType === 1;

  const computed = lines.map((l) => {
    const covered = l.isWarrantyCovered || jobIsFreeOfCharge;
    const base = Number(l.qty || 0) * Number(l.unitPrice || 0);
    const discount = covered ? base : Number(l.discountAmount || 0);
    const total = Math.max(0, base - discount);
    return { ...l, _covered: covered, _base: base, _total: total };
  });

  const gross = computed.reduce((s, l) => s + l._base, 0);
  const customerPays = computed.reduce((s, l) => s + l._total, 0);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button onClick={() => router.back()}>Back</Button>
        <Button variant="contained" onClick={() => window.print()}>
          Print
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box textAlign="center" mb={2}>
          <Typography variant="h5" fontWeight={700}>
            Work Authorization Receipt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approved work summary — please retain this slip.
          </Typography>
        </Box>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography>
              <strong>Job No:</strong> {jobCard.documentNo}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography>
              <strong>Approved:</strong>{" "}
              {jobCard.finalApprovedOn
                ? new Date(jobCard.finalApprovedOn).toLocaleString()
                : new Date().toLocaleString()}
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

        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2">Reported Fault</Typography>
          <Typography>{jobCard.faultReportedByCustomer || "-"}</Typography>
        </Box>

        {jobCard.diagnosis?.technicianFindings && (
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2">Diagnosis</Typography>
            <Typography>{jobCard.diagnosis.technicianFindings}</Typography>
            {jobCard.diagnosis.eta && (
              <Typography color="text.secondary">
                Estimated ready: {new Date(jobCard.diagnosis.eta).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Approved Parts &amp; Labour
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Item / Description</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Unit</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {computed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">No approved lines.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              computed.map((l, i) => (
                <TableRow key={l.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{LINE_TYPE_LABEL[l.lineType] || "-"}</TableCell>
                  <TableCell>{l.productName || l.description}</TableCell>
                  <TableCell align="right">{l.qty}</TableCell>
                  <TableCell align="right">{Number(l.unitPrice || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    {l._covered ? (
                      <Chip size="small" color="success" label="FREE" />
                    ) : (
                      l._total.toFixed(2)
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Box textAlign="right" mt={2}>
          {jobIsFreeOfCharge ? (
            <>
              <Typography color="text.secondary">
                Gross (covered): {gross.toFixed(2)}
              </Typography>
              <Typography variant="h6" color="success.main">
                Customer pays: 0.00 (No charge — {serviceTypeLabel(jobCard)})
              </Typography>
            </>
          ) : (
            <>
              <Typography>Gross: {gross.toFixed(2)}</Typography>
              <Typography variant="h6">
                Estimated customer payable: {customerPays.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Final amount is confirmed on the service invoice at delivery.
              </Typography>
            </>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="caption" color="text.secondary">
          By signing below the customer authorises the above parts &amp; labour to be
          carried out on the device.
        </Typography>

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
                Approved by
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
        }
      `}</style>
    </Box>
  );
}
