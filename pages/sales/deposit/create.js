import React, { useEffect, useState } from "react";
import styles from "@/styles/PageTitle.module.css";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Divider } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function CreateDailyDeposit() {
  const [banks, setBanks] = useState([]);
  const [isHaSBank, setIsHasBank] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedList, setSelectedList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSummary, setDepositSummary] = useState(null);
  const [selectedBank, setSelectedBank] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedItem, setSelectedItem] = useState({
    supplierId: "",
    supplierName: "",
    amount: "",
    paymentType: 0,
    bankId: null,
    bankName: "",
    bankAccNo: "",
    bankUsername: "",
    isHaSBank: false
  });


  const fetchDepositSummary = async (date) => {
    try {
      const token = localStorage.getItem("token");
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const query = `${BASE_URL}/Shift/GetTotalCostAndProfit?date=${formattedDate}`;

      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setDepositSummary(data.result);
    } catch (error) {
      console.error("Error:", error);
      setDepositSummary(null);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Bank/GetAllBanks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setBanks(data.result);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchDepositSummary(selectedDate);
    } else {
      setDepositSummary(null);
      setSelectedList([]);
    }
    fetchBanks();
  }, [selectedDate]);

  useEffect(() => {
    const summaryItems = [];
    if (depositSummary) {
      if (depositSummary.totalCash > 0) {
        summaryItems.push({
          supplierId: 'SUMMARY_CASH', supplierName: 'Daily Cash Summary', amount: depositSummary.totalCash,
          cashAmount: depositSummary.totalCash, cardAmount: 0, bankTransferAmount: 0, chequeAmount: 0,
          paymentType: -1, bank: 'N/A', accountNo: 'N/A', accountUsername: 'N/A', bankId: null,
        });
      }
      if (depositSummary.totalCard > 0) {
        summaryItems.push({
          supplierId: 'SUMMARY_CARD', supplierName: 'Daily Card Summary', amount: depositSummary.totalCard,
          cashAmount: 0, cardAmount: depositSummary.totalCard, bankTransferAmount: 0, chequeAmount: 0,
          paymentType: -2, bank: 'N/A', accountNo: 'N/A', accountUsername: 'N/A', bankId: null,
        });
      }
      if (depositSummary.totalBankTransfer > 0) {
        summaryItems.push({
          supplierId: 'SUMMARY_BANK', supplierName: 'Daily Bank Transfer Summary', amount: depositSummary.totalBankTransfer,
          cashAmount: 0, cardAmount: 0, bankTransferAmount: depositSummary.totalBankTransfer, chequeAmount: 0,
          paymentType: -3, bank: 'N/A', accountNo: 'N/A', accountUsername: 'N/A', bankId: null,
        });
      }
      if (depositSummary.totalCheque > 0) {
        summaryItems.push({
          supplierId: 'SUMMARY_CHEQUE', supplierName: 'Daily Cheque Summary', amount: depositSummary.totalCheque,
          cashAmount: 0, cardAmount: 0, bankTransferAmount: 0, chequeAmount: depositSummary.totalCheque,
          paymentType: -4, bank: 'N/A', accountNo: 'N/A', accountUsername: 'N/A', bankId: null,
        });
      }

    }
    setSelectedList(currentList => {
      const manuallyAddedItems = currentList.filter(item => !String(item.supplierId).startsWith('SUMMARY_'));
      return [...manuallyAddedItems, ...summaryItems];
    });
  }, [depositSummary]);

  const handleRowClick = (item) => {
    setIsHasBank(item.bankId !== 0);
    setSelectedItem({ ...item, amount: item.totalCost });
  };

  const handleAddSupplier = () => {
    const { supplierName, amount, paymentType } = selectedItem;
    if (!supplierName || !amount) {
      setMessage("Please select an item and ensure it has an amount."); return;
    }
    setMessage("");

    let paymentAmounts = {
      cashAmount: 0, cardAmount: 0, bankTransferAmount: 0, chequeAmount: 0
    };
    switch (paymentType) {
      case 1: paymentAmounts.cashAmount = parseFloat(amount); break;
      case 2: paymentAmounts.cardAmount = parseFloat(amount); break;
      case 4: paymentAmounts.bankTransferAmount = parseFloat(amount); break;
      case 5: paymentAmounts.chequeAmount = parseFloat(amount); break;
    }
    const newItem = {
      ...selectedItem, ...paymentAmounts,
      bank: selectedItem.isHaSBank ? selectedItem.bankName : selectedBank.name,
      // FIX: Use `null` if no bank is selected.
      bankId: selectedItem.isHaSBank ? selectedItem.bankId : (selectedBank.id || null),
      accountNo: selectedItem.isHaSBank ? selectedItem.bankAccNo : selectedBank.accountNo,
      accountUsername: selectedItem.isHaSBank ? selectedItem.bankUsername : selectedBank.accountUsername
    };
    setSelectedList(prev => [...prev, newItem]);
    setSelectedItem({ supplierName: "", amount: "", bank: "", supplierId: "", bankId: null, bankName: "", bankAccNo: "", bankUsername: "", isHaSBank: false, paymentType: 0 });
    setSelectedBank({});
    setIsHasBank(false);
  };

  const handleDelete = (indexToRemove) => {
    setSelectedList(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const totalAmount = selectedList.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const availableSuppliers = depositSummary?.supplierDetails?.filter(
    (supplier) => !selectedList.some(selected => selected.supplierId === supplier.supplierId && selected.paymentType === supplier.paymentType)
  ) || [];

  // REVERTED and FIXED handleSubmit LOGIC
  const handleSubmit = async () => {
    // This validation is now relevant again.
    if (availableSuppliers.length !== 0) {
      toast.error("Please add all available entries to the table before submitting.");
      return;
    }
    if (selectedList.length === 0) {
      toast.error("You must have at least one line item to submit.");
      return;
    }

    // REVERTED: The data payload now sends all line items from the table.
    const data = {
      DepositDate: selectedDate,
      TotalAmount: parseFloat(totalAmount),
      DailyDepositLineDetails: selectedList.map((row) => ({
        SupplierId: String(row.supplierId).startsWith('SUMMARY_') ? 0 : row.supplierId,
        Supplier: row.supplierName || "",
        Amount: row.amount || 0,
        // FIX: Ensure BankId is sent as null if it's missing, not 0.
        BankId: row.bankId || null,
        BankAccountNumber: row.accountNo || "",
        CashAmount: row.cashAmount || 0,
        CardAmount: row.cardAmount || 0,
        BankTransferAmount: row.bankTransferAmount || 0,
        ChequeAmount: row.chequeAmount || 0,
      })),
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(`${BASE_URL}/DailyDeposit/CreateDailyDeposit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(json.message);
        setSelectedList([]);
        setTimeout(() => { window.location.href = "/sales/deposit/"; }, 1000);
      } else {
        toast.error(json.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckDayEndDone = async (date) => {
    try {
      const response = await fetch(`${BASE_URL}/DayEnd/IsDayEndDoneForSelectedDate?date=${formatDate(date)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const result = await response.json();
      if (result) {
        setSelectedDate(date);
      } else {
        toast.info("Unable to proceed — day end not completed for " + formatDate(date));
        setSelectedDate(null);
        return;
      }
      return result;
    } catch (err) {
      console.error('Error fetching IsDayEndDone:', err);
    }

  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Create Daily Deposit</h1>
        <ul>
          <li><Link href="/sales/deposit/">Daily Deposit</Link></li>
          <li>Create</li>
        </ul>
      </div>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Deposit Date" value={selectedDate}
          onChange={(newDate) => {
            handleCheckDayEndDone(newDate);
          }}
          renderInput={(params) => <TextField {...params} sx={{ mb: 2 }} />}
        />
      </LocalizationProvider>

      <Grid container spacing={2} sx={{ height: "100%", maxHeight: { lg: "75vh", xs: "150vh" } }}>
        <Grid item xs={12} lg={8}>
          <TableContainer component={Paper} sx={{ maxHeight: "100%", overflowY: "auto", height: "70vh" }}>
            <Table stickyHeader aria-label="available deposits table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!selectedDate ? (
                  <TableRow><TableCell colSpan={3}><Typography>Please select a deposit date.</Typography></TableCell></TableRow>
                ) : !depositSummary ? (
                  <TableRow><TableCell colSpan={3}><Typography>Loading...</Typography></TableCell></TableRow>
                ) : availableSuppliers.length === 0 ? (
                  <TableRow><TableCell colSpan={3}><Typography>No more deposit items to add.</Typography></TableCell></TableRow>
                ) : (
                  availableSuppliers.map((item, index) => (
                    <TableRow key={`${item.supplierId}-${item.paymentType}`} onClick={() => handleRowClick(item)} hover sx={{ cursor: "pointer" }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.supplierName}</TableCell>
                      <TableCell>{formatCurrency(item.totalCost)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box component={Paper} p={3} sx={{ height: "70vh", overflowY: 'auto' }}>
            <Typography variant="h6">Daily Summary</Typography>
            <Box mt={2} display="flex" justifyContent="space-between">
              <Typography>Total Cash:</Typography>
              <Typography fontWeight="bold">{formatCurrency(depositSummary?.totalCash || 0)}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography>Total Card:</Typography>
              <Typography fontWeight="bold">{formatCurrency(depositSummary?.totalCard || 0)}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography>Total Bank Transfer:</Typography>
              <Typography fontWeight="bold">{formatCurrency(depositSummary?.totalBankTransfer || 0)}</Typography>
            </Box>
            <Box mt={1} display="flex" justifyContent="space-between">
              <Typography>Total Cheque:</Typography>
              <Typography fontWeight="bold">{formatCurrency(depositSummary?.totalCheque || 0)}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h6">Deposit Details</Typography>
                <Typography color="error">{message}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography my={1}>Supplier Name</Typography>
                <TextField size="small" fullWidth value={selectedItem.supplierName} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12}>
                <Typography my={1}>Amount</Typography>
                <TextField size="small" type="number" fullWidth value={selectedItem.amount} onChange={(e) => setSelectedItem({ ...selectedItem, amount: e.target.value })} />
              </Grid>
              {isHaSBank ? (
                <Grid item xs={12}><Box my={2}>
                  <Typography variant="h6">Bank Details</Typography>
                  <Typography>{selectedItem.bankAccNo}</Typography>
                  <Typography>{selectedItem.bankName}</Typography>
                  <Typography>{selectedItem.bankUsername}</Typography>
                </Box></Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Typography my={1}>Bank</Typography>
                    <Select size="small" fullWidth value={selectedBank.id || ''} onChange={(e) => {
                      const selected = banks.find((bank) => bank.id === e.target.value);
                      setSelectedBank(selected || {});
                    }}>
                      {banks.length === 0 ? (<MenuItem disabled>No Banks Available</MenuItem>) : (
                        banks.map((bank) => (<MenuItem key={bank.id} value={bank.id}>{bank.name}</MenuItem>))
                      )}
                    </Select>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography my={1}>Account Username</Typography>
                    <TextField size="small" fullWidth value={selectedBank?.accountUsername || ''} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography my={1}>Account Number</Typography>
                    <TextField size="small" fullWidth value={selectedBank?.accountNo || ''} InputProps={{ readOnly: true }} />
                  </Grid>
                </>
              )}
              <Grid item xs={12} my={2}><Button onClick={handleAddSupplier} variant="contained" size="small" fullWidth>Add to Deposit</Button></Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12} my={2}>
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="final deposit table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '50px' }}></TableCell>
                  <TableCell>#</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Account Number</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedList.map((item, index) => (
                  <TableRow key={`${item.supplierId}-${item.paymentType}-${index}`}>
                    <TableCell><IconButton onClick={() => handleDelete(index)}><DeleteIcon color="error" fontSize="inherit" /></IconButton></TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>{item.bank}</TableCell>
                    <TableCell>
                      <Typography variant="body1">{item.accountNo}</Typography>
                      <Typography variant="body2" color="textSecondary">{item.accountUsername}</Typography>
                    </TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={5} align="right"><strong>Total Amount</strong></TableCell>
                  <TableCell><strong>{formatCurrency(totalAmount)}</strong></TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} my={1}>
          <LoadingButton loading={isSubmitting} handleSubmit={handleSubmit} disabled={false} />
        </Grid>
      </Grid>
    </>
  );
}