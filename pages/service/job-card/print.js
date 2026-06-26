import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import BASE_URL from "Base/api";
import { ProjectNo } from "Base/catelogue";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useLoggedUserCompanyLetterhead from "@/hooks/useLoggedUserCompanyLetterhead";

const STATUS_NAMES = [
  "Received", "Diagnosed", "AwaitingApproval", "Approved",
  "InProgress", "OnHold", "Ready", "Delivered", "Cancelled",
  "AwaitingPartsApproval", "Unrepairable",
];
const SERVICE_TYPE_LABEL = (jc) => {
  if (jc?.serviceType === 1) {
    return jc.isWarrantyRepair ? "Warranty Repair (no charge)" : "Free Service (no charge)";
  }
  return jc?.serviceType === 2 ? "Paid Repair" : "—";
};
const PRIORITY_LABEL = { 1: "Normal", 2: "Urgent", 3: "Critical" };

const formatDisplayDate = (value) => {
  if (!value) return "-";
  try { return format(new Date(value), "dd-MMM-yyyy"); } catch { return "-"; }
};

const formatDisplayDateTime = (value) => {
  if (!value) return "-";
  try { return format(new Date(value), "dd-MMM-yyyy hh:mm:ssa"); } catch { return "-"; }
};

const getUserLabel = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  user?.userName ||
  user?.email ||
  (user?.id != null ? `User #${user.id}` : "-");

function statusLabel(value) {
  if (typeof value === "string") return value;
  return STATUS_NAMES[(value || 1) - 1] ?? "Received";
}

const STATUS_LABEL_DISPLAY = {
  AwaitingApproval: "Awaiting Customer Approval",
  AwaitingPartsApproval: "Awaiting Parts Approval",
  Unrepairable: "Can't Repair",
};

function statusDisplay(value) {
  const name = statusLabel(value);
  return STATUS_LABEL_DISPLAY[name] || name;
}

function isUnrepairable(jobCard) {
  return statusLabel(jobCard?.status) === "Unrepairable";
}

const LINE_TYPE_LABEL = { 1: "Part", 2: "Labour", 3: "Diagnostic" };

export default function JobCardPrintPage() {
  const router = useRouter();
  const contentRef = useRef(null);
  const jobCardId = router.query.id;
  const documentNumber = router.query.documentNumber;
  const printType = router.query.type === "customer-bill" ? "customer-bill" : "intake";
  const isCustomerBill = printType === "customer-bill";

  const [jobCard, setJobCard] = useState(null);
  const [warehouseData, setWarehouseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarLogo, setSidebarLogo] = useState("");
  const [userMap, setUserMap] = useState({});

  const { companyData } = useLoggedUserCompanyLetterhead();

  const authHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    if (!router.isReady || !jobCardId) return;
    const run = async () => {
      try {
        setLoading(true);
        const r = await fetch(`${BASE_URL}/ServiceJobCard/GetById/${jobCardId}`, {
          headers: authHeaders(),
        });
        const j = await r.json().catch(() => null);
        if (r.ok && j?.result) setJobCard(j.result);
        else toast.error(j?.message || "Failed to load job card.");
      } catch {
        toast.error("Failed to load job card.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [jobCardId, router.isReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const warehouseId = jobCard?.warehouseId || localStorage.getItem("warehouse");
    const token = localStorage.getItem("token");
    if (!warehouseId || !token) return;
    fetch(`${BASE_URL}/Warehouse/GetWarehouseById?Id=${warehouseId}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j?.statusCode === 200) setWarehouseData(j.result); })
      .catch(() => {});
  }, [jobCard?.warehouseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const warehouseId = jobCard?.warehouseId || localStorage.getItem("warehouse");
    const token = localStorage.getItem("token");
    if (!warehouseId || !token) return;
    fetch(`${BASE_URL}/Company/GetCompanyLogoByWarehouseId?warehouseId=${warehouseId}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setSidebarLogo(j?.logoUrl || ""))
      .catch(() => setSidebarLogo(""));
  }, [jobCard?.warehouseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BASE_URL}/User/GetAllUser`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const users = Array.isArray(j) ? j : Array.isArray(j?.result) ? j.result : [];
        const m = {}; users.forEach((u) => { m[u.id] = u; }); setUserMap(m);
      })
      .catch(() => {});
  }, []);

  const companyAddressLines = useMemo(
    () => [warehouseData?.addressLine1, warehouseData?.addressLine2, warehouseData?.addressLine3].filter(Boolean),
    [warehouseData]
  );
  const companyContactLines = useMemo(() => {
    const out = [];
    const phones = [
      warehouseData?.contactNumber, warehouseData?.contactNumber2,
      warehouseData?.contactNumber3, companyData?.contactNumber,
    ].filter((v, i, arr) => v && arr.indexOf(v) === i);
    if (phones.length) out.push(phones.join(" / "));
    if (warehouseData?.email1) out.push(warehouseData.email1);
    return out;
  }, [companyData?.contactNumber, warehouseData]);
  const companyLogoSrc =
    sidebarLogo || (ProjectNo === 1 ? "/images/cbass.png" : "/images/db-logo.png");

  const accessoryList = useMemo(
    () => (jobCard?.accessoriesReceived || "").split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
    [jobCard?.accessoriesReceived]
  );

  const handlePrint = () => { if (typeof window !== "undefined") window.print(); };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    try {
      const pageEls = contentRef.current.querySelectorAll('[data-pdf-page="true"]');
      if (!pageEls.length) { toast.error("No printable pages found."); return; }
      const imgs = contentRef.current.querySelectorAll("img");
      await Promise.all(Array.from(imgs).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; setTimeout(resolve, 2000); });
      }));
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      for (let i = 0; i < pageEls.length; i += 1) {
        const canvas = await html2canvas(pageEls[i], { scale: 2, useCORS: true, logging: false, allowTaint: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }
      const prefix = isCustomerBill ? "CustomerBill" : "JobCard";
      pdf.save(`${prefix}_${jobCard?.documentNo || documentNumber || "document"}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  const status = jobCard ? statusDisplay(jobCard.status) : "";

  const billLines = useMemo(() => {
    if (!jobCard?.lines) return [];
    return jobCard.lines.filter(
      (l) => !l.isDeleted && (!l.isTechnicianRequested || l.isApproved)
    );
  }, [jobCard?.lines]);

  const jobIsFreeOfCharge = jobCard?.serviceType === 1;

  const billComputed = useMemo(() => {
    return billLines.map((l) => {
      const covered = l.isWarrantyCovered || jobIsFreeOfCharge;
      const base = Number(l.qty || 0) * Number(l.unitPrice || 0);
      const discount = covered ? base : Number(l.discountAmount || 0);
      const total = Math.max(0, base - discount);
      return { ...l, _covered: covered, _base: base, _total: total };
    });
  }, [billLines, jobIsFreeOfCharge]);

  const billGross = billComputed.reduce((s, l) => s + l._base, 0);
  const billDiscount = billComputed.reduce(
    (s, l) => s + (l._covered ? l._base : Number(l.discountAmount || 0)),
    0
  );
  const billCustomerPays = billComputed.reduce((s, l) => s + l._total, 0);

  const approvedById =
    jobCard?.finalApprovedBy ?? jobCard?.partsApprovalDecisionBy ?? null;
  const approvedOn =
    jobCard?.finalApprovedOn || jobCard?.partsApprovalDecisionOn || null;
  const estimatedReady =
    jobCard?.diagnosis?.eta || jobCard?.expectedDeliveryDate || null;

  const renderLetterhead = () => (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row", gap: { xs: 1.5, sm: 3 }, mb: { xs: 2, sm: 3 }, pb: 2 }}>
        <Box sx={{ width: { xs: "135px", sm: "220px" }, flexShrink: 0 }}>
          <img src={companyLogoSrc} alt="Company logo" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
        </Box>
        <Box sx={{ flex: 1, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.25rem" }, lineHeight: 1.2 }}>
            {companyData?.name || warehouseData?.name || "Company"}
          </Typography>
          {companyAddressLines.map((l) => (
            <Typography key={l} sx={{ fontSize: { xs: "0.62rem", sm: "0.82rem" }, lineHeight: 1.3 }}>{l}</Typography>
          ))}
          {companyContactLines.map((l) => (
            <Typography key={l} sx={{ fontSize: { xs: "0.62rem", sm: "0.82rem" }, lineHeight: 1.3, fontWeight: 600 }}>{l}</Typography>
          ))}
        </Box>
      </Box>
      <Box sx={{ borderTop: "2px solid #333", borderBottom: "2px solid #333", py: 1, mb: 2 }}>
        <Typography sx={{ fontWeight: "bold", textAlign: "center", fontSize: { xs: "1rem", sm: "1.5rem" }, lineHeight: 1.2 }}>
          {isCustomerBill
            ? "SERVICE REPAIR ESTIMATE"
            : isUnrepairable(jobCard)
            ? "SERVICE JOB CARD — CAN'T REPAIR"
            : "SERVICE JOB CARD"}
        </Typography>
        {isCustomerBill && (
          <Typography sx={{ textAlign: "center", fontSize: { xs: "0.65rem", sm: "0.78rem" }, color: "#555", mt: 0.5 }}>
            Customer copy — approve before repair work begins
          </Typography>
        )}
      </Box>
    </>
  );

  const renderCustomerBillBody = () => (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
        <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.86rem" } }}>
          <strong>Job No:</strong> {jobCard?.documentNo || documentNumber || "-"}
        </Typography>
        <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.86rem" } }}>
          <strong>Date:</strong> {formatDisplayDateTime(approvedOn || jobCard?.receivedDate)}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {[
            ["Customer", jobCard?.customerName || "-"],
            ["Contact", jobCard?.contactNo || "-"],
            ["Service Type", SERVICE_TYPE_LABEL(jobCard)],
          ].map(([label, value]) => (
            <Box key={label} sx={{ display: "grid", gridTemplateColumns: { xs: "110px 12px 1fr", sm: "130px 16px 1fr" }, mb: 0.75, columnGap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>{label}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>:</Typography>
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>{value}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1 }}>
          {[
            ["Technician", getUserLabel(userMap[jobCard?.assignedTechnicianId])],
            ["Estimated ready", formatDisplayDate(estimatedReady)],
            ["Approved by", getUserLabel(userMap[approvedById])],
          ].map(([label, value]) => (
            <Box key={label} sx={{ display: "grid", gridTemplateColumns: { xs: "110px 12px 1fr", sm: "130px 16px 1fr" }, mb: 0.75, columnGap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>{label}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>:</Typography>
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {renderTextBlock("Device details", [
        jobCard?.deviceType && `Type: ${jobCard.deviceType}`,
        jobCard?.brand && `Brand: ${jobCard.brand}`,
        jobCard?.model && `Model: ${jobCard.model}`,
        jobCard?.productName && `Product: ${jobCard.productName}`,
        jobCard?.serialNumber && `Serial: ${jobCard.serialNumber}`,
        jobCard?.externalProductDescription && `Note: ${jobCard.externalProductDescription}`,
        jobCard?.physicalCondition && `Condition: ${jobCard.physicalCondition}`,
        jobCard?.accessoriesReceived && `Accessories: ${jobCard.accessoriesReceived}`,
      ].filter(Boolean).join("\n") || "-")}

      {renderTextBlock("Reported fault", jobCard?.faultReportedByCustomer)}
      {renderTextBlock("Diagnosis", jobCard?.diagnosis?.technicianFindings)}

      <Box sx={{ mb: 2, border: "1px solid #cfcfcf" }}>
        <Box sx={{ bgcolor: "#f3f4f6", borderBottom: "1px solid #cfcfcf", px: 1.2, py: 0.6 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>
            Parts &amp; labour cost
          </Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "0.7rem", fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontSize: "0.7rem", fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontSize: "0.7rem", fontWeight: 700 }}>Item</TableCell>
                <TableCell align="right" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>Qty</TableCell>
                <TableCell align="right" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>Unit</TableCell>
                <TableCell align="right" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billComputed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ fontSize: "0.72rem" }}>
                    No priced lines yet.
                  </TableCell>
                </TableRow>
              ) : (
                billComputed.map((l, i) => (
                  <TableRow key={l.id}>
                    <TableCell sx={{ fontSize: "0.72rem" }}>{i + 1}</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem" }}>{LINE_TYPE_LABEL[l.lineType] || "-"}</TableCell>
                    <TableCell sx={{ fontSize: "0.72rem" }}>{l.productName || l.description || "-"}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.72rem" }}>{l.qty}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.72rem" }}>{Number(l.unitPrice || 0).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.72rem" }}>
                      {l._covered ? <Chip size="small" color="success" label="FREE" sx={{ height: 18, fontSize: "0.65rem" }} /> : l._total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Box textAlign="right" mt={1}>
            {jobIsFreeOfCharge ? (
              <Typography sx={{ fontSize: { xs: "0.78rem", sm: "0.9rem" }, fontWeight: 700, color: "#15803d" }}>
                Estimated customer payable: 0.00 ({SERVICE_TYPE_LABEL(jobCard)})
              </Typography>
            ) : (
              <>
                <Typography sx={{ fontSize: "0.72rem" }}>Gross: {billGross.toFixed(2)}</Typography>
                {billDiscount > 0 && (
                  <Typography sx={{ fontSize: "0.72rem" }}>Discount: {billDiscount.toFixed(2)}</Typography>
                )}
                <Typography sx={{ fontSize: { xs: "0.82rem", sm: "0.95rem" }, fontWeight: 700 }}>
                  Estimated customer payable: {billCustomerPays.toFixed(2)}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Typography sx={{ fontSize: "0.65rem", color: "#555", mb: 2 }}>
        By signing below, the customer agrees to the repair estimate above. Work begins after approval.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, gap: 4 }}>
        <Box sx={{ flex: 1, borderTop: "1px dashed #555", pt: 0.5 }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>Customer signature</Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#555" }}>Date: __________________</Typography>
        </Box>
        <Box sx={{ flex: 1, borderTop: "1px dashed #555", pt: 0.5 }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>Approved by</Typography>
          <Typography sx={{ fontSize: "0.72rem" }}>{getUserLabel(userMap[approvedById])}</Typography>
          {approvedOn && (
            <Typography sx={{ fontSize: "0.65rem", color: "#555" }}>{formatDisplayDateTime(approvedOn)}</Typography>
          )}
        </Box>
      </Box>
    </>
  );

  const renderUnrepairableNotice = () => {
    if (!jobCard || !isUnrepairable(jobCard)) return null;
    const reason =
      jobCard.unrepairableReason ||
      jobCard.UnrepairableReason ||
      jobCard.diagnosis?.technicianFindings ||
      "-";
    const markedOn = jobCard.markedUnrepairableOn || jobCard.MarkedUnrepairableOn;
    const markedById = jobCard.markedUnrepairableBy ?? jobCard.MarkedUnrepairableBy;
    return (
      <Box
        sx={{
          mb: 2,
          border: "2px solid #b91c1c",
          bgcolor: "#fef2f2",
        }}
      >
        <Box sx={{ bgcolor: "#b91c1c", px: 1.2, py: 0.75 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: "#fff",
              fontSize: { xs: "0.72rem", sm: "0.9rem" },
              textAlign: "center",
            }}
          >
            {"CAN'T REPAIR"}
          </Typography>
        </Box>
        <Box sx={{ p: 1.5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "100px 12px 1fr", sm: "130px 16px 1fr" },
              alignItems: "start",
              mb: 1,
              columnGap: 1,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>
              Reason
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>
              :
            </Typography>
            <Typography
              sx={{
                whiteSpace: "pre-wrap",
                fontSize: { xs: "0.62rem", sm: "0.78rem" },
                fontWeight: 600,
              }}
            >
              {reason}
            </Typography>
          </Box>
          {markedOn && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "100px 12px 1fr", sm: "130px 16px 1fr" },
                alignItems: "start",
                columnGap: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>
                Marked On
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>
                :
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>
                {formatDisplayDateTime(markedOn)}
              </Typography>
            </Box>
          )}
          {markedById != null && (
            <Typography sx={{ mt: 1, fontSize: { xs: "0.6rem", sm: "0.72rem" }, color: "#555" }}>
              Marked by: {getUserLabel(userMap[markedById])}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderInfoTwoCol = () => (
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: { xs: 2, sm: 2.5 }, flexDirection: { xs: "column", sm: "row" }, gap: 4 }}>
      <Box sx={{ flex: 1 }}>
        {[
          ["Customer", jobCard?.customerName || "-"],
          ["Contact", jobCard?.contactNo || "-"],
          ["Job Card No", jobCard?.documentNo || documentNumber || "-"],
          ["Received Date", formatDisplayDate(jobCard?.receivedDate || jobCard?.createdOn)],
          ["Expected Delivery", formatDisplayDate(jobCard?.expectedDeliveryDate)],
          ["Status", status],
        ].map(([label, value]) => (
          <Box key={label} sx={{ display: "grid", gridTemplateColumns: { xs: "120px 12px 1fr", sm: "150px 16px 1fr" }, alignItems: "start", mb: 1, columnGap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.86rem" } }}>{label}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.86rem" } }}>:</Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.62rem", sm: "0.86rem" },
                ...(label === "Status" && isUnrepairable(jobCard)
                  ? { fontWeight: 700, color: "#b91c1c" }
                  : {}),
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ flex: 1 }}>
        {[
          ["Device Type", jobCard?.deviceType || "-"],
          ["Brand / Model", [jobCard?.brand, jobCard?.model].filter(Boolean).join(" / ") || "-"],
          ["Product", jobCard?.productName || "-"],
          ["Serial / IMEI", jobCard?.serialNumber || "-"],
          ["Service Type", SERVICE_TYPE_LABEL(jobCard)],
          ["Priority", PRIORITY_LABEL[jobCard?.priority] || "Normal"],
        ].map(([label, value]) => (
          <Box key={label} sx={{ display: "grid", gridTemplateColumns: { xs: "120px 12px 1fr", sm: "150px 16px 1fr" }, alignItems: "start", mb: 1, columnGap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.86rem" } }}>{label}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.86rem" } }}>:</Typography>
            <Typography sx={{ fontSize: { xs: "0.62rem", sm: "0.86rem" } }}>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderTextBlock = (title, text) => (
    <Box sx={{ mb: 2, border: "1px solid #cfcfcf" }}>
      <Box sx={{ bgcolor: "#f3f4f6", borderBottom: "1px solid #cfcfcf", px: 1.2, py: 0.6 }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 1.2, minHeight: 40 }}>
        <Typography sx={{ whiteSpace: "pre-wrap", fontSize: { xs: "0.6rem", sm: "0.78rem" } }}>{text || "-"}</Typography>
      </Box>
    </Box>
  );

  const renderAccessories = () => (
    <Box sx={{ mb: 2, border: "1px solid #cfcfcf" }}>
      <Box sx={{ bgcolor: "#f3f4f6", borderBottom: "1px solid #cfcfcf", px: 1.2, py: 0.6 }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>Accessories Received</Typography>
      </Box>
      <Box sx={{ p: 1.2 }}>
        {accessoryList.length === 0 ? (
          <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.78rem" } }}>-</Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {accessoryList.map((a, i) => (
              <Box key={i} sx={{ border: "1px solid #cfcfcf", borderRadius: 999, px: 1, py: 0.2, fontSize: "0.7rem" }}>{a}</Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderEstimate = () => {
    if (jobCard?.serviceType === 1) {
      return (
        <Box sx={{ mb: 2, border: "1px solid #cfcfcf", p: 1.2 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#15803d", fontWeight: 700 }}>
            {SERVICE_TYPE_LABEL(jobCard)} — no charge will be applied.
          </Typography>
        </Box>
      );
    }
    const total = Number(
      jobCard?.estimatedCost || jobCard?.estimatedLabourCost || 0
    );
    return (
      <Box sx={{ mb: 2, border: "1px solid #cfcfcf" }}>
        <Box sx={{ bgcolor: "#f3f4f6", borderBottom: "1px solid #cfcfcf", px: 1.2, py: 0.6 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.62rem", sm: "0.78rem" } }}>
            Estimate (subject to diagnosis)
          </Typography>
        </Box>
        <Box sx={{ p: 1.2 }}>
          <Typography sx={{ fontSize: "0.86rem", fontWeight: 700 }}>
            Total: {total.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderPageContent = () => (
    <Box>
      {renderLetterhead()}
      {isCustomerBill ? (
        renderCustomerBillBody()
      ) : (
        <>
      {renderInfoTwoCol()}
      {renderUnrepairableNotice()}
      {renderTextBlock("Reported Fault", jobCard?.faultReportedByCustomer)}
      {renderTextBlock("Physical Condition at Intake", jobCard?.physicalCondition)}
      {renderAccessories()}
      {jobCard?.serviceType === 1 && renderEstimate()}

      {/* Meta footer */}
      <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#555" }}>
        <Typography sx={{ fontSize: "0.72rem" }}>
          Received By: {getUserLabel(userMap[jobCard?.receivedBy])}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem" }}>
          Technician: {getUserLabel(userMap[jobCard?.assignedTechnicianId])}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem" }}>
          Printed: {formatDisplayDateTime(new Date())}
        </Typography>
      </Box>

      {/* Signatures */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6, gap: 4 }}>
        <Box sx={{ flex: 1, borderTop: "1px dashed #555", pt: 0.5 }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>Received By (Staff)</Typography>
        </Box>
        <Box sx={{ flex: 1, borderTop: "1px dashed #555", pt: 0.5 }}>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>Customer Signature</Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#555" }}>Date: __________________</Typography>
        </Box>
      </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: { xs: 2, sm: 3, md: 4 }, backgroundColor: "#f5f5f5",
      "@media print": { padding: 0, backgroundColor: "#fff" },
    }}>
      <Box sx={{
        width: "100%", maxWidth: "900px", backgroundColor: "white", borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)", paddingX: 2, display: "flex", flexDirection: "column",
        "@media print": { maxWidth: "100%", borderRadius: 0, boxShadow: "none", paddingX: 0 },
      }}>
        <Box mt={5} sx={{
          display: "flex", justifyContent: "center", alignItems: "center", width: "100%",
          marginBottom: 1, paddingBottom: 1, borderBottom: "2px solid #e0e0e0",
          flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 0 },
          "@media print": { display: "none" },
        }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "stretch", sm: "flex-end" }, gap: 1 }}>
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ textTransform: "none" }}>Print</Button>
              <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPDF} sx={{ textTransform: "none" }}>Download PDF</Button>
            </Box>
          </Box>
        </Box>

        <Box mb={5} ref={contentRef}>
          {loading ? (
            <Box sx={{ width: { xs: "100%", sm: "210mm" }, minHeight: { xs: "auto", sm: "297mm" }, margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
              <Typography variant="body2" color="text.secondary">Loading job card...</Typography>
            </Box>
          ) : jobCard ? (
            <Box data-pdf-page="true" sx={{
              width: { xs: "100%", sm: "210mm" }, minHeight: { xs: "auto", sm: "297mm" },
              maxWidth: "100%", margin: "0 auto", position: "relative", backgroundColor: "white",
              padding: "0.5in", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex", flexDirection: "column",
              "@media print": { margin: 0, marginBottom: 0, boxShadow: "none", padding: "0.5in", boxSizing: "border-box" },
            }}>
              <Box sx={{ position: "relative", width: "100%", mx: "auto", boxSizing: "border-box", backgroundColor: "transparent", flex: 1 }}>
                {renderPageContent()}
              </Box>
              <Typography sx={{ mt: 2, pt: 1, borderTop: "1px solid #d9d9d9", textAlign: "center", fontSize: { xs: "0.62rem", sm: "0.8rem" }, fontWeight: 600 }}>
                Powered By : CBASS-AI
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: { xs: "100%", sm: "210mm" }, minHeight: { xs: "auto", sm: "297mm" }, margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
              <Typography variant="body2" color="error">Failed to load job card</Typography>
            </Box>
          )}
        </Box>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </Box>
    </Box>
  );
}
