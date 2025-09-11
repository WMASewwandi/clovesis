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
import { Box, Button, IconButton, MenuItem, Select, TableFooter, TextField, Typography } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatCurrency } from "@/components/utils/formatHelper";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";

export default function CreateDailyDeposit() {
  const [banks, setBanks] = useState([]);
  const [isHaSBank, setIsHasBank] = useState(false);
  const [message, setMessage] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profitList, setProfitList] = useState([]);
  const [selectedBank, setSelectedBank] = useState({});
  const [selectedItem, setSelectedItem] = useState({
    supplierName: "",
    amount: "",
    bank: "",
    supplierId: "",
    bankId: null,
    bankName: "",
    bankAccNo: "",
    bankUsername: "",
    isHaSBank: false
  });

  const fetchProfitList = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = `${BASE_URL}/Shift/GetTotalCostAndProfit`;

      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setProfitList(data.result);
    } catch (error) {
      console.error("Error:", error);
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

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setBanks(data.result);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchProfitList();
    fetchBanks();
  }, []);

  const handleRowClick = (item) => {
    if (item.bankId != 0) {
      setIsHasBank(true);
    } else {
      setIsHasBank(false);
    }
    setSelectedItem({
      supplierName: item.supplierName,
      amount: item.totalCost,
      supplierId: item.supplierId,
      bankId: item.bankId,
      bankName: item.bankName,
      bankUsername: item.bankAccountUsername,
      bankAccNo: item.bankAccountNo,
      isHaSBank: item.bankId != 0 ? true : false
    });
  };

  const handleAddSupplier = () => {
    const { supplierName, amount } = selectedItem;
    const bankName = selectedBank.name;
    const bankId = selectedBank.id;
    const bankAC = selectedBank.accountNo;

    if (!isHaSBank) {
      if (!supplierName || !amount || !bankName) {
        setMessage("Please select a supplier and a bank before adding!");
        return;
      }
    }
    setMessage("");

    setSelectedList(prev => [...prev, { ...selectedItem, bank: selectedBank.name, bankId: selectedItem.isHaSBank ? selectedItem.bankId : bankId, accountNo: selectedItem.isHaSBank ? selectedItem.bankAccNo : selectedBank.accountNo, accountUsername: selectedItem.isHaSBank ? selectedItem.bankUsername : selectedBank.accountUsername }]);
    setProfitList(prev => prev.filter(item => item.supplierName !== supplierName));
    setSelectedItem({ supplierName: "", amount: "", bank: selectedItem.bankName || bankName, bankId: selectedItem.bankId || bankId, bankAccountNumber: selectedItem.bankAccNo || bankAC });
    setIsHasBank(false);
  };


  const handleDelete = (indexToRemove) => {
    const removedItem = selectedList[indexToRemove];
    const updatedList = selectedList.filter((_, index) => index !== indexToRemove);
    setSelectedList(updatedList);
    setProfitList(prev => [
      ...prev,
      {
        supplierId: removedItem.supplierId,
        supplierName: removedItem.supplierName,
        totalCost: Number(removedItem.amount),
        isHaSBank: removedItem.isHaSBank,
        bankId: removedItem.isHaSBank ? removedItem.bankId : 0,
        bankName: removedItem.isHaSBank ? removedItem.bankName : "",
        bankAccountNo: removedItem.isHaSBank ? removedItem.bankAccNo : "",
        bankAccountUsername: removedItem.isHaSBank ? removedItem.bankUsername : "",
      },
    ]);
  };

  const totalAmount = selectedList.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handleSubmit = async () => {
    if (profitList.length != 0) {
      toast.error("Please add all profit entries to the table before submitting.");
      return;
    }
    if (selectedList.length === 0) {
      toast.error("You must have at least one line item to submit the table.");
      return;
    }


    const data = {
      TotalAmount: parseFloat(totalAmount),
      DailyDepositLineDetails: selectedList.map((row) => ({
        DepositHeaderId: 1,
        Supplier: row.supplierName || "",
        SupplierId: row.supplierId,
        BankId: row.bankId,
        Amount: row.amount || 0,
        BankAccountNumber: row.isHaSBank ? row.bankAccNo : row.accountNo,
      })),
    };


    try {
      setIsSubmitting(true);
      const res = await fetch(`${BASE_URL}/DailyDeposit/CreateDailyDeposit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.result !== "") {
        toast.success(json.message);
        setSelectedList([]);
        setTimeout(() => {
          window.location.href = "/sales/deposit/";
        }, 1000);
      } else {
        toast.error(json.message || "Please fill all required fields");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Create Daily Deposit</h1>
        <ul>
          <li>
            <Link href="/sales/deposit/">Daily Deposit</Link>
          </li>
          <li>Create</li>
        </ul>
      </div>

      <Grid container spacing={2} sx={{ height: "100%", maxHeight: { lg: "75vh", xs: "150vh" } }}>
        <Grid item xs={12} lg={8}>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: "100%", overflowY: "auto", height: "70vh" }}
          >
            <Table stickyHeader aria-label="profit table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profitList?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color="error">No Data Available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  profitList?.map((item, index) => (
                    <TableRow key={index} onClick={() => handleRowClick(item)} hover sx={{ cursor: "pointer" }}>
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
          <Box component={Paper} p={3} sx={{ height: "70vh" }}>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h6">Deposit</Typography>
                <Typography color="error">{message}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography my={1}>Supplier Name</Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={selectedItem.supplierName}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography my={1}>Amount</Typography>
                <TextField
                  size="small"
                  type="number"
                  fullWidth
                  value={selectedItem.amount}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, amount: e.target.value })
                  }
                />
              </Grid>
              {isHaSBank ?
                <Grid item xs={12}>
                  <Box my={2}>
                    <Typography variant="h6">Bank Details</Typography>
                    <Typography>{selectedItem.bankAccNo}</Typography>
                    <Typography>{selectedItem.bankName}</Typography>
                    <Typography>{selectedItem.bankUsername}</Typography>
                  </Box>
                </Grid> : <>
                  <Grid item xs={12}>
                    <Typography my={1}>Bank</Typography>
                    <Select
                      size="small"
                      fullWidth
                      onChange={(e) => {
                        const selected = banks.find((bank) => bank.id === e.target.value);
                        setSelectedBank(selected);
                        setSelectedItem((prev) => ({
                          ...prev,
                          bank: selected.name,
                          accountNo: selected.accountNo,
                          accountUsername: selected.accountUsername,
                          bankId: selected.id,
                        }));
                      }}

                    >
                      {banks.length === 0 ? (
                        <MenuItem disabled>No Data Available</MenuItem>
                      ) : (
                        banks.map((bank, index) => (
                          <MenuItem key={index} value={bank.id}>
                            {bank.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography my={1}>Account Username</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={selectedBank?.accountUsername}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography my={1}>Account Number</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={selectedBank?.accountNo}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </>}

              <Grid item xs={12} my={2} display="flex" gap={2}>
                <Button onClick={() => handleAddSupplier()} variant="contained" size="small">Add</Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>

      </Grid>
      <Grid container>
        <Grid item xs={12} my={2}>
          <TableContainer
            component={Paper}
          >
            <Table stickyHeader aria-label="profit table" className="dark-table">
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
                {selectedList?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <IconButton onClick={() => handleDelete(index)}>
                        <DeleteIcon color="error" fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>{item.isHaSBank ? item.bankName : item.bank}</TableCell>
                    <TableCell>
                      <Typography variant="body1">{item.isHaSBank ? item.bankAccNo : item.accountNo}</Typography>
                      <Typography variant="body2" color="textSecondary">{item.isHaSBank ? item.bankUsername : item.accountUsername}</Typography>
                    </TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))
                }

              </TableBody>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={5}>Total Amount</TableCell>
                  <TableCell>{formatCurrency(totalAmount)}</TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} my={1}>
          <LoadingButton
            loading={isSubmitting}
            handleSubmit={() => handleSubmit()}
            disabled={false}
          />
        </Grid>
      </Grid>
    </>
  );
}
