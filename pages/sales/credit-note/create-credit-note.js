import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Autocomplete, Button, TextField, Typography } from "@mui/material";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import { useRouter } from "next/router";
import useApi from "@/components/utils/useApi";
import getNext from "@/components/utils/getNext";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";
import useShiftCheck from "@/components/utils/useShiftCheck";

const CreateCreditNote = () => {
  const [issubmitting, setIssubmitting] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const today = new Date();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [stock, setStock] = useState([]);
  const [total, setTotal] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(formatDate(today));
  const [invNo, setInvNo] = useState("");
  const [selectedItem, setSelectedItem] = useState();
  const [remark, setRemark] = useState("");
  const [productId, setProductId] = useState();
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [address4, setAddress4] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [grossTotal, setGrossTotal] = useState(0);
  const [salesPerson, setSalesPerson] = useState("");
  const [outstandingAmounts, setOutstandingAmounts] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [invoice, setInvoice] = useState("");
  const { result: shiftResult, message: shiftMessage } = useShiftCheck();

  // const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [invoicesForCustomer, setInvoicesForCustomer] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [creditAmountError, setCreditAmountError] = useState("");
  const [invoiceFocused, setInvoiceFocused] = useState(false);

  // API Calls
  const {
    data: customerList,
    loading: customerLoading,
    error: customerError,
  } = useApi("/Customer/GetAllCustomer");
  const {
    data: itemList,
    loading: itemLoading,
    error: itemError,
  } = useApi("/Items/GetAllItems");
  const {
    data: stockBalance,
    loading: stockBalanceLoading,
    error: stockBalanceError,
  } = useApi(
    productId
      ? `/StockBalance/GetAllProductStockBalanceLine?warehouseId=1&productId=${productId}`
      : `/StockBalance/GetAllProductStockBalanceLine?warehouseId=1&productId=1`
  );

  const {
    data: salesPersonList,
    loading: salesPersonLoading,
    error: salesPersonError,
  } = useApi("/SalesPerson/GetAllSalesPerson");

  const {
    data: invoiceList,
    loading: invoiceLoading,
    error: invoiceError,
  } = useApi("/Invoice/GetAllInvoices");

  const { data: invoiceNo } = getNext(`5`);

  const navigateToBack = () => {
    router.push({
      pathname: "/sales/credit-note",
    });
  };

  const handleSubmit = async () => {
    if (shiftResult) {
      toast.warning(shiftMessage);
      return;
    }
    if (!customer) {
      toast.error("Please Select Customer.");
      return;
    }
    if (!selectedInvoice || !selectedInvoice.invoiceNumber) {
      toast.error("Please select an invoice.");
      return;
    }

    if (
      parseFloat(creditAmount) > (selectedInvoice?.totalInvoiceAmount || 0) ||
      parseFloat(creditAmount) < 0
    ) {
      toast.error(
        "Credit Amount must be less than the Invoice Outstanding Amount."
      );
      return;
    }
    const data = {
      customerId: customer?.id || 12345,
      customerName: customer?.firstName || "N/A",
      customerAddressLine1: address1 || "",
      customerAddressLine2: address2 || "",
      customerAddressLine3: address3 || "",
      date: invoiceDate,
      outstandingAmount: parseFloat(selectedInvoice.totalInvoiceAmount),
      creditAmount: parseFloat(creditAmount || 0),
      salesPersonId: salesPerson?.id || 456,
      salesPersonCode: salesPerson?.code || "789",
      salesPersonName: salesPerson?.name || "Jane Smith",
      invoiceId: selectedInvoice?.invoiceId || 12,
      invoiceNumber: selectedInvoice?.invoiceNumber || 1,
      remark: remark || "",
    };

    try {
      setIssubmitting(true);
      const response = await fetch(`${BASE_URL}/CreditNote/CreateCreditNote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.result.result !== "") {
          setIsDisable(true);
          toast.success(jsonResponse.result.message);
          setTimeout(() => {
            window.location.href = "/sales/credit-note";
          }, 1500);
        } else {
          toast.error(jsonResponse.result.message);
        }
      } else {
        const errorResponse = await response.json();
        toast.error(
          "Error: " +
          (errorResponse.message || "Please fill all required fields")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while submitting the data.");
    } finally {
      setIssubmitting(false);
    }
  };

  const fetchOutstandingAmount = async (customerId) => {
    if (!customerId) {
      toast.error("Customer ID is required.");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/Outstanding/GetCustomerWiseTotalOutstandingAmount?customerId=${customerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse && jsonResponse.result) {
          setOutstandingAmounts(jsonResponse.result || 0);
        } else {
          setOutstandingAmounts("");
        }
      } else {
        toast.error("Failed to fetch outstanding amount.");
        setOutstandingAmounts("");
      }
    } catch (error) {
      console.error("Error fetching outstanding amount:", error);
      toast.error("Error fetching outstanding amount.");
      setOutstandingAmounts("");
    }
  };

  const fetchInvoicesForCustomer = async (customerId) => {
    if (!customerId) {
      toast.error("Customer ID is required.");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/Outstanding/GetAllCustomerwiseOustandingsByIsSettled?customerId=${customerId}&isSettled=false`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.result && jsonResponse.result.length > 0) {
          setInvoicesForCustomer(
            jsonResponse.result.map((item) => ({
              invoiceId: item.invoiceId,
              invoiceNumber: item.invoiceNumber,
              totalInvoiceAmount: item.outstandingAmount,
              // outstandingAmount: item.outstandingAmount,
            }))
          );
        }
      } else {
        toast.error("Failed to fetch invoices.");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Error fetching invoices.");
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchInvoicesForCustomer(customerId);
    } else {
      setInvoicesForCustomer([]);
    }
  }, [customerId]);

  const handleCreditAmountChange = (e) => {
    const newCreditAmount = parseFloat(e.target.value);

    if (
      newCreditAmount > (selectedInvoice?.totalInvoiceAmount || 0) ||
      newCreditAmount < 0
    ) {
      setCreditAmountError(
        "Credit Amount must be less than the Invoice Outstanding Amount."
      );
    } else {
      setCreditAmountError("");
    }

    setCreditAmount(e.target.value);
  };

  useEffect(() => {
    if (customerId && invoiceFocused) {
      fetchInvoicesForCustomer(customerId);
    }
  }, [invoiceFocused, customerId]);

  const handleInvoiceFocus = () => {
    setInvoiceFocused(true);
  };

  const handleInvoiceBlur = () => {
    setInvoiceFocused(false);
  };

  useEffect(() => {
    if (customerList) {
      setCustomers(customerList);
    }
    if (itemList) {
      setItems(itemList);
    }
    if (invoiceNo) {
      setInvNo(invoiceNo);
    }
    if (stockBalance) {
      setStock(stockBalance);
      setSelectedItem(stockBalance[0]);
    }
  }, [itemList, itemList, invoiceNo, invoiceList, stockBalance]);

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Customer Credit Note Create</h1>
        <ul>
          <li>
            <Link href="/sales/credit-note">Customer Credit Notes</Link>
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
              <Button variant="outlined" onClick={() => navigateToBack()}>
                <Typography sx={{ fontWeight: "bold" }}>Go Back</Typography>
              </Button>
            </Grid>

            <Grid item xs={12} lg={6} display="flex" flexDirection="column">
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent="space-between"
                mt={1}
              >
                <Typography
                  component="label"
                  sx={{
                    fontWeight: "500",
                    p: 1,
                    fontSize: "14px",
                    display: "block",
                    width: "35%",
                  }}
                >
                  Customer
                </Typography>
                <Autocomplete
                  sx={{ width: "60%" }}
                  options={customers}
                  getOptionLabel={(option) => option.firstName || ""}
                  value={customer}
                  onChange={(event, newValue) => {
                    setCustomer(newValue);
                    setCustomerId(newValue?.id || null);
                    setInvoice("");
                    if (newValue) {
                      setAddress1(newValue.addressLine1 || "");
                      setAddress2(newValue.addressLine2 || "");
                      setAddress3(newValue.addressLine3 || "");

                      fetchOutstandingAmount(newValue.id);
                    } else {
                      setAddress1("");
                      setAddress2("");
                      setAddress3("");

                      setOutstandingAmounts(""); // Clear if no customer
                      setInvoicesForCustomer([]); // Clear invoices
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      fullWidth
                      placeholder="Search Customer"
                    />
                  )}
                />
              </Grid>
              <Grid
                item
                xs={12}
                display="flex"
                flexDirection="column"
                mt={1}
                mb={1}
              >
                <Grid
                  item
                  xs={12}
                  display="flex"
                  justifyContent="space-between"
                >
                  <Typography
                    component="label"
                    sx={{
                      fontWeight: "500",
                      p: 1,
                      fontSize: "14px",
                      display: "block",
                      width: "35%",
                    }}
                  >
                    Address
                  </Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    placeholder="Address Line 1"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="end" mt={1}>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    placeholder="Address Line 2"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="end" mt={1}>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    placeholder="Address Line 3"
                    value={address3}
                    onChange={(e) => setAddress3(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="end" mt={1}>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    placeholder="Address Line 4"
                    value={address4}
                    onChange={(e) => setAddress4(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent="space-between"
                mt={0}
                mb={10}
              >
                <Typography
                  component="label"
                  sx={{
                    fontWeight: "500",
                    p: 1,
                    fontSize: "14px",
                    display: "block",
                    width: "35%",
                  }}
                >
                  Remark
                </Typography>
                <TextField
                  sx={{ width: "60%" }}
                  size="small"
                  fullWidth
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} lg={6} display="flex" flexDirection="column">
              <Grid container>
                <Grid
                  item
                  xs={12}
                  display="flex"
                  justifyContent="space-between"
                  mt={1}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontWeight: "500",
                      p: 1,
                      fontSize: "14px",
                      display: "block",
                      width: "35%",
                    }}
                  >
                    Date
                  </Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    type="date"
                    fullWidth
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={1}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontWeight: "500",
                      p: 1,
                      fontSize: "14px",
                      display: "block",
                      width: "35%",
                    }}
                  >
                    Salesperson
                  </Typography>
                  <Autocomplete
                    sx={{ width: "60%" }}
                    options={salesPersonList || []}
                    getOptionLabel={(option) => option.name || ""}
                    value={salesPerson}
                    onChange={(event, newValue) => {
                      setSalesPerson(newValue);
                      //   setCode(newValue?.code || "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        fullWidth
                        placeholder="Select Salesperson"
                        error={salesPersonError}
                      />
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={1}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontWeight: "500",
                      p: 1,
                      fontSize: "14px",
                      display: "block",
                      width: "35%",
                    }}
                  >
                    Outstanding Total Amount
                  </Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    placeholder="Outstanding Amount"
                    value={outstandingAmounts}
                    InputProps={{
                      readOnly: true, // Make the field read-only
                    }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={1}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontWeight: "500",
                      p: 1,
                      fontSize: "14px",
                      display: "block",
                      width: "35%",
                    }}
                  >
                    Invoice
                  </Typography>
                  <Autocomplete
                    sx={{ width: "60%" }}
                    options={invoicesForCustomer}
                    getOptionLabel={(option) => `${option.invoiceNumber} `}
                    value={
                      selectedInvoice
                        ? { invoiceNumber: selectedInvoice.invoiceNumber }
                        : null
                    }
                    onChange={(event, newValue) => {
                      setSelectedInvoice(newValue);
                    }}
                    onFocus={handleInvoiceFocus}
                    onBlur={handleInvoiceBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        fullWidth
                        placeholder="Search Invoice"
                        value={
                          selectedInvoice ? selectedInvoice.invoiceNumber : ""
                        }
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Typography variant="body2">
                          {`${option.invoiceNumber} - ${formatCurrency(
                            option.totalInvoiceAmount
                          )}`}
                        </Typography>
                      </li>
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={1}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontWeight: "500",
                      p: 1,
                      fontSize: "14px",
                      display: "block",
                      width: "35%",
                    }}
                  >
                    Invoice Outstanding Amount
                  </Typography>

                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    value={
                      selectedInvoice
                        ? `${selectedInvoice.totalInvoiceAmount}`
                        : ""
                    }
                    placeholder="Invoice Amount"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={1}
                >
                  <Typography
                    component="label"
                    sx={{
                      fontWeight: "500",
                      p: 1,
                      fontSize: "14px",
                      display: "block",
                      width: "35%",
                    }}
                  >
                    Credit Amount
                  </Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    fullWidth
                    placeholder="Credit Amount"
                    value={creditAmount}
                    onChange={handleCreditAmountChange}
                    error={!!creditAmountError} // Show error styling if there's an error
                    helperText={creditAmountError} // Display error message
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <LoadingButton
                loading={issubmitting}
                handleSubmit={() => handleSubmit()}
                disabled={isDisable}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateCreditNote;
