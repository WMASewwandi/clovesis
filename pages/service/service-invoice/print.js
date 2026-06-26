import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BuildIcon from "@mui/icons-material/Build";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PaymentsIcon from "@mui/icons-material/Payments";
import GavelIcon from "@mui/icons-material/Gavel";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import useLoggedUserCompanyLetterhead from "@/hooks/useLoggedUserCompanyLetterhead";

const PAYMENT_NAMES = {
  1: "Cash",
  2: "Card",
  3: "Cash + Card",
  4: "Bank Transfer",
  5: "Cheque",
  6: "No Advance",
  7: "Credit",
};

const STATUS_TONE = {
  Pending: { bg: "#e0ecff", color: "#1d4ed8" },
  Paid: { bg: "#d1fae5", color: "#047857" },
  Cancelled: { bg: "#fee2e2", color: "#b91c1c" },
};

const authHeaders = () => ({
  Authorization: `Bearer ${
    typeof window !== "undefined" ? localStorage.getItem("token") : ""
  }`,
  "Content-Type": "application/json",
});

function SectionHeader({ icon, title, color = "#2563eb" }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      {React.cloneElement(icon, { sx: { fontSize: 18, color } })}
      <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 1, color }}>
        {title}
      </Typography>
    </Stack>
  );
}

function LabelValueRow({ label, value, bold }) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
      <Typography sx={{ minWidth: 110, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ color: "text.secondary" }}>:</Typography>
      <Typography sx={{ fontWeight: bold ? 700 : 500 }}>{value || "-"}</Typography>
    </Stack>
  );
}

export default function ServiceInvoicePrintPage() {
  const router = useRouter();
  const sheetRef = useRef(null);
  const autoPrintedRef = useRef(false);
  const id = router.query.id;
  const documentNumber = router.query.documentNumber;

  const [invoice, setInvoice] = useState(null);
  const [jobCard, setJobCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const { companyData } = useLoggedUserCompanyLetterhead();

  useEffect(() => {
    if (!router.isReady || !id) return;
    setLoading(true);
    fetch(`${BASE_URL}/ServiceInvoice/GetById/${id}`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setInvoice(j?.result || null))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [id, router.isReady]);

  useEffect(() => {
    if (!invoice?.serviceJobCardId) return;
    fetch(`${BASE_URL}/ServiceJobCard/GetById/${invoice.serviceJobCardId}`, {
      headers: authHeaders(),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setJobCard(j?.result || null))
      .catch(() => setJobCard(null));
  }, [invoice?.serviceJobCardId]);

  // Open the browser print dialog once the invoice (and letterhead) are ready —
  // matches the default-print popup flow used after Create Invoice and from the list.
  useEffect(() => {
    if (loading || !invoice || autoPrintedRef.current) return;
    autoPrintedRef.current = true;
    const runPrint = async () => {
      if (sheetRef.current) {
        const imgs = sheetRef.current.querySelectorAll("img");
        await Promise.all(
          Array.from(imgs).map(
            (img) =>
              new Promise((resolve) => {
                if (img.complete) resolve();
                else {
                  img.onload = resolve;
                  img.onerror = resolve;
                  setTimeout(resolve, 2000);
                }
              })
          )
        );
      }
      if (typeof window !== "undefined") window.print();
    };
    const timer = setTimeout(runPrint, 400);
    return () => clearTimeout(timer);
  }, [loading, invoice]);

  const lines = invoice?.lines || [];

  const warrantyWaiver = useMemo(
    () =>
      lines
        .filter((l) => l.isWarrantyCovered)
        .reduce((acc, l) => acc + Number(l.qty || 0) * Number(l.unitPrice || 0), 0),
    [lines]
  );

  const handlePrint = () => { if (typeof window !== "undefined") window.print(); };

  const handleDownloadPDF = async () => {
    if (!sheetRef.current) return;
    try {
      const imgs = sheetRef.current.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve; img.onerror = resolve; setTimeout(resolve, 2000);
        });
      }));
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(sheetRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = 210;
      const pageH = 297;
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(`ServiceInvoice_${invoice?.documentNo || documentNumber || "document"}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  if (loading && !invoice) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography color="text.secondary">Loading invoice…</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography color="error">Failed to load invoice.</Typography>
      </Box>
    );
  }

  const isCancelled = !!invoice.isDeleted || invoice.status === "Cancelled";
  const isPaid = Number(invoice.netTotal || 0) === 0;
  const statusLabel = isCancelled ? "Cancelled" : isPaid ? "Paid" : "Pending";
  const tone = STATUS_TONE[statusLabel];

  const companyName = companyData?.name || "Service Center";

  const warrantyMonths = jobCard?.diagnosis?.warrantyOnRepairMonths || 3;
  const repairWarrantyUntil = (() => {
    const d = new Date(invoice.documentDate || invoice.createdOn || Date.now());
    d.setMonth(d.getMonth() + warrantyMonths);
    return d;
  })();

  return (
    <Box sx={{ background: "#f5f5f5", minHeight: "100vh", py: 3,
      "@media print": { background: "#fff", py: 0 },
    }}>
      <ToastContainer />

      {/* Toolbar — hidden on print */}
      <Box className="no-print" sx={{ maxWidth: 900, mx: "auto", mb: 2, display: "flex", justifyContent: "center", gap: 1 }}>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ textTransform: "none" }}>
          Print
        </Button>
        <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPDF} sx={{ textTransform: "none" }}>
          Download PDF
        </Button>
      </Box>

      <Paper
        id="invoice-sheet"
        ref={sheetRef}
        sx={{ p: { xs: 3, md: 5 }, maxWidth: 900, mx: "auto", color: "#0f172a", background: "#fff" }}
      >
        {/* HEADER */}
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} textAlign={{ xs: "left", md: "right" }}>
            <Typography sx={{ fontWeight: 800, fontSize: 40, letterSpacing: 4, color: "#2563eb", lineHeight: 1 }}>
              INVOICE
            </Typography>
            <Box sx={{ mt: 2, display: "inline-block", minWidth: 280 }}>
              <Grid container spacing={0.5}>
                <Grid item xs={5}><Typography color="text.secondary">Invoice No.</Typography></Grid>
                <Grid item xs={1}>:</Grid>
                <Grid item xs={6}><Typography fontWeight={700}>{invoice.documentNo}</Typography></Grid>

                <Grid item xs={5}><Typography color="text.secondary">Issue Date</Typography></Grid>
                <Grid item xs={1}>:</Grid>
                <Grid item xs={6}>{formatDate(invoice.documentDate || invoice.createdOn)}</Grid>

                <Grid item xs={5}><Typography color="text.secondary">Job Card</Typography></Grid>
                <Grid item xs={1}>:</Grid>
                <Grid item xs={6}>{invoice.jobCardDocumentNo || "-"}</Grid>

                <Grid item xs={5}><Typography color="text.secondary">Status</Typography></Grid>
                <Grid item xs={1}>:</Grid>
                <Grid item xs={6}>
                  <Chip size="small" label={statusLabel}
                    sx={{ bgcolor: tone.bg, color: tone.color, fontWeight: 700 }} />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* BILL TO + DEVICE */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <SectionHeader icon={<PersonOutlineIcon />} title="BILL TO" />
              <Typography sx={{ fontWeight: 700 }}>{invoice.customerName}</Typography>
              {invoice.contactNo && (
                <Typography color="text.secondary">{invoice.contactNo}</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <SectionHeader icon={<PhoneIphoneIcon />} title="DEVICE / SERVICE INFORMATION" />
              <LabelValueRow label="Device" value={invoice.productName} />
              <LabelValueRow label="Serial Number" value={invoice.serialNumber} />
              <LabelValueRow label="Issue Reported" value={jobCard?.faultReportedByCustomer} />
              <LabelValueRow
                label="Service Type"
                value={
                  jobCard?.serviceType === 1
                    ? jobCard?.isWarrantyRepair ? "Warranty Repair" : "Free Service"
                    : "Paid Repair"
                }
              />
            </Paper>
          </Grid>
        </Grid>

        {/* REPAIR DETAILS */}
        <Box sx={{ mt: 3 }}>
          <SectionHeader icon={<BuildIcon />} title="REPAIR DETAILS" />
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#eff6ff" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#1e40af", letterSpacing: 1 }}>DESCRIPTION</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#1e40af", letterSpacing: 1 }}>QTY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#1e40af", letterSpacing: 1 }}>UNIT PRICE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#1e40af", letterSpacing: 1 }}>AMOUNT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">No lines.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((l) => {
                    const base = Number(l.qty || 0) * Number(l.unitPrice || 0);
                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <Typography>{l.productName || l.description}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {["", "Part", "Labour", "Diagnostic"][l.lineType] || ""}
                            {l.isWarrantyCovered && " · Warranty covered"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{l.qty}</TableCell>
                        <TableCell align="right">{formatCurrency(l.unitPrice)}</TableCell>
                        <TableCell align="right">
                          {l.isWarrantyCovered ? (
                            <Stack alignItems="flex-end" spacing={0.5}>
                              <Typography variant="caption" color="text.secondary"
                                sx={{ textDecoration: "line-through" }}>
                                {formatCurrency(base)}
                              </Typography>
                              <Typography color="success.main" fontWeight={700}>FREE</Typography>
                            </Stack>
                          ) : (
                            formatCurrency(l.lineTotal)
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* WARRANTY + PAYMENT */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <SectionHeader icon={<VerifiedUserIcon />} title="WARRANTY COVERAGE" />
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{
                  width: 64, height: 64, borderRadius: "50%",
                  bgcolor: "#eff6ff", color: "#1d4ed8",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  flexShrink: 0, border: "2px solid #bfdbfe",
                }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1 }}>
                    {warrantyMonths * 30}
                  </Typography>
                  <Typography sx={{ fontSize: 9, letterSpacing: 1 }}>DAYS</Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    This repair is covered by a {warrantyMonths * 30}-day warranty on parts and labour.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Warranty valid until:{" "}
                    <Box component="span" sx={{ color: "#2563eb", fontWeight: 700 }}>
                      {formatDate(repairWarrantyUntil)}
                    </Box>
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <SectionHeader icon={<PaymentsIcon />} title="PAYMENT SUMMARY" />
              <Grid container rowSpacing={0.5}>
                <Grid item xs={7}><Typography color="text.secondary">Subtotal</Typography></Grid>
                <Grid item xs={5} textAlign="right">{formatCurrency(invoice.grossTotal)}</Grid>

                {warrantyWaiver > 0 && (
                  <>
                    <Grid item xs={7}><Typography color="success.main">Warranty waiver</Typography></Grid>
                    <Grid item xs={5} textAlign="right" sx={{ color: "success.main" }}>
                      - {formatCurrency(warrantyWaiver)}
                    </Grid>
                  </>
                )}

                <Grid item xs={7}><Typography color="text.secondary">Discount</Typography></Grid>
                <Grid item xs={5} textAlign="right" sx={{ color: "success.main" }}>
                  - {formatCurrency(Math.max(0, Number(invoice.discountAmount || 0) - warrantyWaiver))}
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={7}>
                  <Typography sx={{ fontWeight: 700, fontSize: 18 }}>TOTAL</Typography>
                </Grid>
                <Grid item xs={5} textAlign="right">
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#2563eb" }}>
                    {formatCurrency(invoice.netTotal)}
                  </Typography>
                </Grid>

                <Grid item xs={7}><Typography color="text.secondary">Paid Amount</Typography></Grid>
                <Grid item xs={5} textAlign="right">
                  {isPaid ? formatCurrency(invoice.netTotal) : formatCurrency(0)}
                </Grid>

                <Grid item xs={12} sx={{ mt: 1, bgcolor: "#eff6ff", p: 1, borderRadius: 1 }}>
                  <Grid container>
                    <Grid item xs={7}>
                      <Typography sx={{ fontWeight: 700, color: "#1d4ed8" }}>BALANCE DUE</Typography>
                    </Grid>
                    <Grid item xs={5} textAlign="right">
                      <Typography sx={{ fontWeight: 800, color: "#1d4ed8" }}>
                        {formatCurrency(isPaid ? 0 : invoice.netTotal)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Payment method: {PAYMENT_NAMES[invoice.paymentType] || "N/A"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* SIGNATURES */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={6}>
            <Box sx={{ borderTop: "1px dashed #94a3b8", pt: 1, mt: 6 }}>
              <Typography variant="overline" color="text.secondary">Technician Signature</Typography>
              <Typography variant="body2">{jobCard?.assignedTechnicianName || ""}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ borderTop: "1px dashed #94a3b8", pt: 1, mt: 6 }}>
              <Typography variant="overline" color="text.secondary">Customer Signature</Typography>
              <Typography variant="body2">{invoice.customerName}</Typography>
              <Typography variant="caption" color="text.secondary">
                Date: __________________
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* TERMS */}
        <Box sx={{ mt: 4 }}>
          <SectionHeader icon={<GavelIcon />} title="TERMS & CONDITIONS" />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="ol" sx={{ pl: 2, m: 0 }}>
                <li>Payment is due within 14 days from the invoice date.</li>
                <li>Late payments may incur additional charges.</li>
                <li>This invoice is valid for the services and items listed only.</li>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="ol" start={4} sx={{ pl: 2, m: 0 }}>
                <li>{companyName} is not responsible for data loss. Please back up your data.</li>
                <li>By signing, you agree to the terms and conditions stated above.</li>
              </Typography>
            </Grid>
          </Grid>

          <Typography sx={{ mt: 3, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
            Thank you for choosing {companyName}!
          </Typography>
        </Box>

        {invoice.remark && (
          <Typography sx={{ mt: 2 }} color="text.secondary" variant="caption">
            Remark: {invoice.remark}
          </Typography>
        )}
      </Paper>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          #invoice-sheet {
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .MuiPaper-outlined { break-inside: avoid; }
        }
      `}</style>
    </Box>
  );
}
