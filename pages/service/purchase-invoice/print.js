import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { format } from "date-fns";
import BASE_URL from "Base/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./PurchaseInvoicePrint.module.css";

const formatLongDate = (value) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMMM yyyy");
  } catch {
    return "—";
  }
};

const formatAmount = (value) => {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return "0.00";
  return numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatQty = (value) => {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return "0";
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
};

const getLineTotal = (line) => {
  const lineTotal = Number(line?.lineTotal ?? 0);
  if (lineTotal > 0) return lineTotal;
  return Number(line?.unitPrice ?? 0) * Number(line?.qty ?? 0);
};

const buildBillToLines = (invoice) =>
  [invoice?.billToline1, invoice?.billToline2, invoice?.billToline3, invoice?.billToline4].filter(
    (line) => line && String(line).trim()
  );

export default function PurchaseInvoicePrintPage() {
  const router = useRouter();
  const invoiceId = router.query.id;
  const documentNumber = router.query.documentNumber;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !invoiceId) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}/PurchaseInvoice/GetPurchaseInvoiceById?id=${invoiceId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await response.json().catch(() => null);
        const result = data?.result?.result ?? data?.result;

        if (response.ok && result) {
          setInvoice(result);
        } else {
          toast.error(data?.message || "Failed to load purchase invoice.");
        }
      } catch (error) {
        console.error("Error fetching purchase invoice:", error);
        toast.error("Failed to load purchase invoice.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [router.isReady, invoiceId]);

  const lines = useMemo(() => {
    const raw = invoice?.purchaseInvoiceLines ?? [];
    return [...raw].sort((a, b) => (a.sequanceNo ?? 0) - (b.sequanceNo ?? 0));
  }, [invoice]);

  const billToLines = useMemo(() => buildBillToLines(invoice), [invoice]);
  const warranty = invoice?.warranty;
  const hasWarranty = Boolean(
    warranty?.warrantyType || warranty?.periodMonths || warranty?.startDate || warranty?.expiryDate || warranty?.terms
  );

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.close();
    }
  };

  const docNo = invoice?.documentNo || documentNumber || "—";
  const pageTitle = `Purchase Invoice – ${docNo}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --indigo: #4338CA;
            --indigo-mid: #4F46E5;
            --indigo-light: #EEF2FF;
            --indigo-pale: #F5F3FF;
            --gray-900: #111827;
            --gray-700: #374151;
            --gray-500: #6B7280;
            --gray-300: #D1D5DB;
            --gray-100: #F3F4F6;
            --gray-50: #F9FAFB;
            --gray-200: #E5E7EB;
            --white: #ffffff;
            --font-body: 'DM Sans', sans-serif;
            --font-mono: 'DM Mono', monospace;
          }
          @page { size: A4; margin: 0; }
        `}</style>
      </Head>

      <div className={styles.page}>
        <div className={styles.controls}>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePrint}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" rx="1" />
            </svg>
            Print Invoice
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={handleClose}>
            Close
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>Loading purchase invoice…</div>
        ) : !invoice ? (
          <div className={styles.loadingBox}>Purchase invoice not found.</div>
        ) : (
          <div className={styles.invoice} data-purchase-invoice-print="true">
            <div className={styles.invHeader}>
              <h1>Purchase Invoice</h1>
              <div className={styles.docBlock}>
                <div className={styles.docLabel}>Document Number</div>
                <div className={styles.docNo}>{docNo}</div>
              </div>
            </div>

            <div className={styles.invNotice}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Stock items post to Purchase schema; use Cash / Card / Bank only.
            </div>

            <div className={styles.invBody}>
              <div className={styles.metaGrid}>
                <div className={styles.metaCol}>
                  <div className={styles.metaSection}>
                    <div className={styles.metaLabel}>Customer</div>
                    <div className={`${styles.metaValue} ${styles.customerName}`}>
                      {invoice.customerName || "—"}
                    </div>
                  </div>
                  <div className={styles.metaSection}>
                    <div className={styles.metaLabel}>Bill To</div>
                    <div className={styles.metaValue}>
                      {billToLines.length > 0 ? (
                        billToLines.map((line, index) => (
                          <React.Fragment key={`${line}-${index}`}>
                            {line}
                            {index < billToLines.length - 1 ? <br /> : null}
                          </React.Fragment>
                        ))
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.metaCol}>
                  <div className={styles.metaRightGrid}>
                    <div className={styles.metaSection}>
                      <div className={styles.metaLabel}>Date</div>
                      <div className={styles.metaValue}>{formatLongDate(invoice.documentDate)}</div>
                    </div>
                    <div className={styles.metaSection}>
                      <div className={styles.metaLabel}>Salesperson</div>
                      <div className={styles.metaValue}>{invoice.salesPersonName || "—"}</div>
                    </div>
                    <div className={styles.metaSection} style={{ gridColumn: "1 / -1" }}>
                      <div className={styles.metaLabel}>Remark</div>
                      <div className={styles.metaValue}>{invoice.remark || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.productsWrap}>
                <div className={styles.sectionHeading}>Products &amp; Services</div>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Product Name</th>
                      <th style={{ width: 60 }}>Qty</th>
                      <th style={{ width: 120 }}>Selling Price</th>
                      <th style={{ width: 120 }}>Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "16px" }}>
                          No line items
                        </td>
                      </tr>
                    ) : (
                      lines.map((line, index) => (
                        <tr key={line.id ?? `${line.productCode}-${index}`}>
                          <td>{index + 1}</td>
                          <td>{line.productName || "—"}</td>
                          <td>{formatQty(line.qty)}</td>
                          <td>{formatAmount(line.unitPrice)}</td>
                          <td>{formatAmount(getLineTotal(line))}</td>
                        </tr>
                      ))
                    )}
                    <tr className={styles.totalRow}>
                      <td colSpan={3} />
                      <td className={styles.totalLabel}>Total</td>
                      <td className={styles.totalAmount}>{formatAmount(invoice.netTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {hasWarranty ? (
                <>
                  <div className={styles.sectionHeading}>Warranty</div>
                  <div className={styles.warrantyGrid}>
                    <div className={styles.warrantyCell}>
                      <div className={styles.metaLabel}>Warranty Type</div>
                      <div className={styles.metaValue} style={{ fontWeight: 500 }}>
                        {warranty?.warrantyType || "—"}
                      </div>
                    </div>
                    <div className={styles.warrantyCell}>
                      <div className={styles.metaLabel}>Period</div>
                      <div className={styles.metaValue} style={{ fontWeight: 500 }}>
                        {warranty?.periodMonths ? `${warranty.periodMonths} months` : "—"}
                      </div>
                    </div>
                    <div className={styles.warrantyCell}>
                      <div className={styles.metaLabel}>Start Date</div>
                      <div className={styles.metaValue}>{formatLongDate(warranty?.startDate)}</div>
                    </div>
                    <div className={styles.warrantyCell}>
                      <div className={styles.metaLabel}>Expiry Date</div>
                      <div className={styles.metaValue}>{formatLongDate(warranty?.expiryDate)}</div>
                    </div>
                  </div>
                  {warranty?.terms ? (
                    <div className={styles.warrantyTerms}>
                      <span className={styles.termsLabel}>Terms: </span>
                      {warranty.terms}
                    </div>
                  ) : null}
                </>
              ) : null}

              <div className={styles.sectionHeading}>Acknowledgement</div>
              <div className={styles.sigRow}>
                <div className={styles.sigCell}>
                  <div className={styles.sigLine} />
                  <div className={styles.sigLabel}>Authorised Signature</div>
                </div>
                <div className={styles.sigCell}>
                  <div className={styles.sigLine} />
                  <div className={styles.sigLabel}>Customer Signature</div>
                </div>
                <div className={styles.sigCell}>
                  <div className={styles.sigLine} />
                  <div className={styles.sigLabel}>Date</div>
                </div>
              </div>
            </div>

            <div className={styles.invFooter}>
              <div className={styles.footerNote}>
                Thank you for your business. Please retain this invoice for your records.
              </div>
              <div className={styles.footerBrand}>DOC: {docNo}</div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
