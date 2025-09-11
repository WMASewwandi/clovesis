import React, { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";
import SearchQuotationByDocumentNo from "@/components/utils/SearchQuotationByDocumentNo";
import BASE_URL from "Base/api";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import { useRouter } from "next/router";

const InvoiceCreate = () => {
  const router = useRouter();
  const today = new Date();
  const [invoiceDate, setInvoiceDate] = useState(formatDate(today));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [totalAdvance, setTotalAdvance] = useState(0);
  const [quotations, setQuotations] = useState([]);
  const searchRef = useRef(null);

  const handleSubmit = async () => {
    if (selectedInquiry == null) {
      toast.warning("Please select a inquiry");
      return;
    }

    const invalidRow = quotations.find(
      (row) => parseFloat(row.advanceAmount) > parseFloat(row.totalAmount)
    );

    if (invalidRow) {
      toast.warning("Advance amount cannot be greater than total amount");
      return;
    }

    const x = quotations.reduce(
      (gross, row) => gross + (Number(row.totalAmount) || 0),
      0
    );
    const y = quotations.reduce(
      (gross, row) => gross + (Number(row.advanceAmount) || 0),
      0
    );

    const z = x - y;

    const data = {
      CustomerId: selectedInquiry.customerId,
      InvoiceDate: invoiceDate,
      InquiryCode: selectedInquiry.inquiryCode,
      StyleName: selectedInquiry.styleName,
      CustomerName: selectedInquiry.customerName,
      TotalPayment: x,
      BalancePayment: z < 0 ? 0 : z,
      AdvancePayment: y,
      InquiryId: selectedInquiry.inquiryId,
      Invoices: quotations.map((row) => ({
        InvoiceDate: invoiceDate,
        AdvancePayment: row.advanceAmount,
        BalancePayment: row.balanceAmount,
        QuotationId: row.id,
      })),
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${BASE_URL}/Inquiry/CreateProformaInvoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.message != "") {
          toast.success(jsonResponse.result.message);
        } else {
          toast.error(jsonResponse.result.message);
        }
        setSelectedInquiry(null);
        setQuotations([]);
      } else {
        toast.error("Please fill all required fields");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectInquiry = async (inquiry) => {
    setSelectedInquiry(inquiry);
    try {
      const response = await fetch(`${BASE_URL}/Inquiry/GetAllQuotationsByInquiryIdAndStatus?status=2&inquiryId=${inquiry.inquiryId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      const updatedResult = data.result.map(item => {
        const total = parseFloat(item.totalAmount) || 0;
        const percentage = parseFloat(item.advancePaymentPercentage) || 0;
        const advanceAmount = (total * percentage) / 100;
        const balanceAmount = total - advanceAmount;

        return {
          ...item,
          advanceAmount,
          balanceAmount: balanceAmount < 0 ? 0 : balanceAmount
        };
      });

      setQuotations(updatedResult);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAdvanceAmountChange = (index, value) => {
    const newValue = parseFloat(value) || 0;

    setQuotations((prev) => {
      const updated = [...prev];
      const bal = (parseFloat(updated[index].totalAmount) || 0) - newValue;
      updated[index] = {
        ...updated[index],
        advanceAmount: newValue,
        balanceAmount: bal < 0 ? 0 : bal,
      };
      return updated;
    });
  };


  const navigateToBack = () => {
    router.push({
      pathname: "/quotations/proforma-list/",
    });
  };

  useEffect(() => {
    const total = quotations.reduce(
      (gross, row) => gross + (Number(row.advanceAmount) || 0),
      0
    );
    setTotalAdvance(total);
  }, [quotations]);

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Proforma Invoice Create</h1>
        <ul>
          <li>
            <Link href="/quotations/invoice">Proforma Invoice</Link>
          </li>
          <li>Create</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} sx={{ background: "#fff" }}>
          <Grid container p={1}>
            <Grid item xs={12} gap={2} display="flex" justifyContent="end">
              <Grid container>
                <Grid item xs={8}>
                  <Grid container>
                    <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography component="label">Search Inquiry</Typography>
                    </Grid>
                    <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                      <SearchQuotationByDocumentNo
                        ref={searchRef}
                        label="Search"
                        placeholder="Search inquiry by code"
                        fetchUrl={`${BASE_URL}/Inquiry/GetAllInquiriesByDocumentNo`}
                        onSelect={(item) => {
                          handleSelectInquiry(item);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={4} display="flex" justifyContent="end" alignItems="center">
                  <Box>
                    <Button variant="outlined" onClick={() => navigateToBack()}>
                      <Typography sx={{ fontWeight: "bold" }}>Go Back</Typography>
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} mt={3}>
              <Grid container spacing={1}>
                <Grid item xs={12} mt={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" component="label">Invoice</Typography>
                </Grid>
                <Grid item xs={12} lg={6} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography component="label">Invoice Date</Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} lg={6} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography component="label">Customer Name</Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    disabled
                    value={selectedInquiry && selectedInquiry.customerName || ""}
                  />
                </Grid>
                <Grid item xs={12} lg={6} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography component="label">Inquiry Code</Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    disabled
                    value={selectedInquiry && selectedInquiry.inquiryCode || ""}
                  />
                </Grid>
                <Grid item xs={12} lg={6} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography component="label">Style Name</Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    disabled
                    value={selectedInquiry && selectedInquiry.styleName || ""}
                  />
                </Grid>
                <Grid item xs={12} mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" component="label">Confirmed Quotations</Typography>
                </Grid>
                <Grid item xs={12} lg={12} my={2}>
                  <TableContainer component={Paper}>
                    <Table aria-label="simple table" className="dark-table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Document No</TableCell>
                          <TableCell>Option</TableCell>
                          <TableCell>Units</TableCell>
                          <TableCell>Selling Price</TableCell>
                          <TableCell>Adv. Payment (%)</TableCell>
                          <TableCell>Total Amount</TableCell>
                          <TableCell>Adv. Payment</TableCell>
                          <TableCell>Balance Payment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {quotations.length === 0 ?
                          <>
                          </> : quotations.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.documentNo}</TableCell>
                              <TableCell>{item.optionName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.sellingPrice}</TableCell>
                              <TableCell>{item.advancePaymentPercentage}</TableCell>
                              <TableCell>{item.totalAmount}</TableCell>
                              <TableCell>
                                <TextField size="small" type="number" value={item.advanceAmount} onChange={(e) => handleAdvanceAmountChange(index, e.target.value)} />
                              </TableCell>
                              <TableCell>{item.balanceAmount}</TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell colSpan={6}>Total Advance Payment</TableCell>
                          <TableCell colSpan={2}>
                            <Typography>{formatCurrency(totalAdvance)}</Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} my={3}>
              <LoadingButton
                loading={isSubmitting}
                handleSubmit={() => handleSubmit()}
                disabled={false}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default InvoiceCreate;

