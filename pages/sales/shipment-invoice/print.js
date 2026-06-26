import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";

export default function ShipmentInvoicePrintPage() {
  const router = useRouter();
  const invoiceId = router.query.id;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !invoiceId) return;

    const load = async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(
          `${BASE_URL}/ShipmentInvoice/GetById/${invoiceId}`,
          {
            method: "GET",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "Content-Type": "application/json",
            },
          }
        );
        const json = await res.json().catch(() => null);
        const header =
          json?.result?.result ?? json?.result ?? json?.data ?? json;
        if (!res.ok || header == null) {
          toast.error(json?.message || "Failed to load shipment invoice.");
          setInvoice(null);
        } else {
          setInvoice(header);
        }
      } catch (e) {
        console.error("[ShipmentInvoicePrint] load failed", e);
        toast.error("Failed to load shipment invoice.");
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router.isReady, invoiceId]);

  const lines =
    invoice?.shipmentInvoiceLineDetails ??
    invoice?.ShipmentInvoiceLineDetails ??
    [];
  const costs =
    invoice?.shipmentInvoiceAdditionalCosts ??
    invoice?.ShipmentInvoiceAdditionalCosts ??
    [];

  const lineSubtotal = Array.isArray(lines)
    ? lines.reduce((s, l) => s + (parseFloat(l.lineTotal) || 0), 0)
    : 0;
  const additionalTotal = Array.isArray(costs)
    ? costs.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
    : 0;
  const grandTotal =
    invoice?.grandTotal != null
      ? parseFloat(invoice.grandTotal)
      : lineSubtotal + additionalTotal;

  const supplierName =
    invoice?.supplierName ?? invoice?.SupplierName ?? null;
  const supplierDisplay =
    supplierName != null && supplierName !== ""
      ? supplierName
      : invoice?.supplierId != null
        ? String(invoice.supplierId)
        : "—";

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleGoBack = () => {
    if (typeof window === "undefined") return;
    if (window.opener) {
      window.close();
      return;
    }
    router.push("/sales/shipment-invoice/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        p: { xs: 2, sm: 3 },
        bgcolor: "#f5f5f5",
        "@media print": {
          p: 0,
          bgcolor: "#fff",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 900,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          p: 2,
          "@media print": {
            maxWidth: "100%",
            borderRadius: 0,
            boxShadow: "none",
            p: 2,
          },
        }}
      >
        <Box
          className="shipment-invoice-print-toolbar"
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            flexWrap: "wrap",
            mb: 2,
            pb: 2,
            borderBottom: "1px solid #e0e0e0",
            "@media print": {
              display: "none",
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ textTransform: "none" }}
          >
            Go Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ textTransform: "none" }}
          >
            Print
          </Button>
        </Box>

        {loading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : !invoice ? (
          <Typography color="error">Invoice not found.</Typography>
        ) : (
          <Box
            sx={{
              color: "#111",
              "@media print": {
                color: "#000",
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
            >
              Shipment Invoice
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
            >
              {invoice.documentNo || "—"}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <Box>
                {[
                  ["Document No", invoice.documentNo || "—"],
                  ["Invoice Date", formatDate(invoice.invoiceDate) || "—"],
                  ["Supplier", supplierDisplay],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "140px 12px 1fr",
                      gap: 0.5,
                      mb: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <Typography fontWeight={700}>{label}</Typography>
                    <Typography fontWeight={700}>:</Typography>
                    <Typography>{value}</Typography>
                  </Box>
                ))}
              </Box>
              <Box>
                {[
                  ["Reference No", invoice.referenceNo || "—"],
                  ["Remark", invoice.remark || "—"],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "140px 12px 1fr",
                      gap: 0.5,
                      mb: 1,
                      fontSize: "0.9rem",
                    }}
                  >
                    <Typography fontWeight={700}>{label}</Typography>
                    <Typography fontWeight={700}>:</Typography>
                    <Typography>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Typography fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
              Line Items
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ mb: 2, "@media print": { boxShadow: "none" } }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f0f0f0" }}>
                    <TableCell width={48}>#</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Line Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No line items
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((row, idx) => (
                      <TableRow key={row.id ?? row.internalId ?? idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.itemName ?? "—"}</TableCell>
                        <TableCell>{row.description || "—"}</TableCell>
                        <TableCell align="right">{row.quantity ?? "—"}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.unitPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      <Typography fontWeight="bold">Line Subtotal</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {formatCurrency(
                          invoice.totalLineAmount ?? lineSubtotal
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
              Additional Costs
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ mb: 2, "@media print": { boxShadow: "none" } }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f0f0f0" }}>
                    <TableCell width={48}>#</TableCell>
                    <TableCell>Cost Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No additional costs
                      </TableCell>
                    </TableRow>
                  ) : (
                    costs.map((row, idx) => (
                      <TableRow key={row.id ?? row.internalId ?? idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.costType ?? "—"}</TableCell>
                        <TableCell>{row.description || "—"}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography fontWeight="bold">
                        Additional Costs Total
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {formatCurrency(
                          invoice.totalAdditionalCost ?? additionalTotal
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Grand Total: {formatCurrency(grandTotal)}
              </Typography>
            </Box>
          </Box>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </Box>
    </Box>
  );
}
