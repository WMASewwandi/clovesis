import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import BASE_URL from "Base/api";
import { toast, ToastContainer } from "react-toastify";
import useChartOfAccountParents from "hooks/useChartOfAccountParents";
import { formatDate } from "@/components/utils/formatHelper";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { useRouter } from "next/router";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";

const STATUS_META = {
  1: { label: "Pending", value: 1 },
  2: { label: "Paid", value: 2 },
};

export default function CreateVendorInvoice() {
  const router = useRouter();
  const cId = sessionStorage.getItem("category");
  const { navigate, create } = IsPermissionEnabled(cId);
  const [submitting, setSubmitting] = useState(false);
  const { parentAccounts, isLoading: accountsLoading } = useChartOfAccountParents();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    supplierId: "",
    invoiceDate: formatDate(new Date()),
    dueDate: "",
    totalAmount: 0,
    netAmount: 0,
    status: 1,
    vendorInvoiceLines: [
      {
        accountId: "",
        description: "",
        quantity: 0,
        rate: 0,
        amount: 0,
      },
    ],
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setSuppliersLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/Supplier/GetAllSupplier`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const data = await response.json();
      const items = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
      setSuppliers(items);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  };

  const navigateToBack = () => {
    router.push({
      pathname: "/finance/vendor-invoice",
    });
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSupplierChange = (event, newValue) => {
    setSelectedSupplier(newValue);
    if (newValue) {
      setFormValues((prev) => ({
        ...prev,
        supplierId: newValue.id ? String(newValue.id) : "",
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        supplierId: "",
      }));
    }
  };

  const handleLineChange = (index, field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => {
      const newLines = [...prev.vendorInvoiceLines];
      newLines[index] = {
        ...newLines[index],
        [field]: value,
      };

      // Calculate amount if quantity or rate changed
      if (field === "quantity" || field === "rate") {
        const quantity = parseFloat(field === "quantity" ? value : newLines[index].quantity) || 0;
        const rate = parseFloat(field === "rate" ? value : newLines[index].rate) || 0;
        newLines[index].amount = quantity * rate;
      }

      // Recalculate totals
      const totalAmount = newLines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
      const netAmount = totalAmount;

      return {
        ...prev,
        vendorInvoiceLines: newLines,
        totalAmount: totalAmount,
        netAmount: netAmount,
      };
    });
  };

  const handleAddLine = () => {
    setFormValues((prev) => ({
      ...prev,
      vendorInvoiceLines: [
        ...prev.vendorInvoiceLines,
        {
          accountId: "",
          description: "",
          quantity: 0,
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  const handleRemoveLine = (index) => {
    setFormValues((prev) => {
      const newLines = prev.vendorInvoiceLines.filter((_, i) => i !== index);
      const totalAmount = newLines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
      const netAmount = totalAmount;

      return {
        ...prev,
        vendorInvoiceLines: newLines,
        totalAmount: totalAmount,
        netAmount: netAmount,
      };
    });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    const { supplierId, invoiceDate, status, vendorInvoiceLines } = formValues;

    if (!supplierId) {
      toast.error("Supplier is required.");
      return;
    }
    if (!invoiceDate) {
      toast.error("Invoice date is required.");
      return;
    }
    if (!status) {
      toast.error("Status is required.");
      return;
    }
    if (vendorInvoiceLines.length === 0) {
      toast.error("At least one invoice line is required.");
      return;
    }

    // Validate all lines have account
    const invalidLines = vendorInvoiceLines.filter((line) => !line.accountId);
    if (invalidLines.length > 0) {
      toast.error("All invoice lines must have an account selected.");
      return;
    }

    const payload = {
      SupplierId: parseInt(supplierId),
      InvoiceDate: new Date(invoiceDate).toISOString(),
      DueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
      TotalAmount: parseFloat(formValues.totalAmount) || 0,
      TaxAmount: 0,
      NetAmount: parseFloat(formValues.netAmount) || 0,
      Status: parseInt(status),
      VendorInvoiceLines: vendorInvoiceLines.map((line) => ({
        AccountId: parseInt(line.accountId),
        Description: line.description?.trim() || null,
        Quantity: parseFloat(line.quantity) || 0,
        Rate: parseFloat(line.rate) || 0,
        Amount: parseFloat(line.amount) || 0,
      })),
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/VendorInvoice/CreateVendorInvoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create vendor invoice");
      }

      const data = await response.json();
      toast.success(data?.message || "Vendor invoice created successfully.");
      navigateToBack();
    } catch (error) {
      toast.error(error.message || "Unable to create vendor invoice");
    } finally {
      setSubmitting(false);
    }
  };

  if (!navigate || !create) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Create Vendor Invoice</h1>
        <ul>
          <li>
            <Link href="/finance/vendor-invoice/">Vendor Invoice</Link>
          </li>
          <li>Create</li>
        </ul>
      </div>

      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} sx={{ background: "#fff" }}>
          <Grid container p={1}>
            <Grid item xs={12} gap={2} display="flex" justifyContent="end">
              <Button variant="outlined" onClick={navigateToBack}>
                <Typography sx={{ fontWeight: "bold" }}>Go Back</Typography>
              </Button>
            </Grid>

            <Grid item xs={12} lg={6} display="flex" flexDirection="column">
              <Grid item xs={12} display="flex" justifyContent="space-between" mt={1}>
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
                  Supplier
                </Typography>
                <Autocomplete
                  sx={{ width: "60%" }}
                  options={suppliers || []}
                  getOptionLabel={(option) => option.name || ""}
                  value={selectedSupplier}
                  onChange={handleSupplierChange}
                  loading={suppliersLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      fullWidth
                      placeholder="Search Supplier"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="space-between" mt={1}>
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
                  Status
                </Typography>
                <FormControl sx={{ width: "60%" }} size="small" required>
                  <Select
                    value={formValues.status}
                    onChange={handleChange("status")}
                    size="small"
                  >
                    {Object.values(STATUS_META).map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={6} display="flex" flexDirection="column">
              <Grid container>
                <Grid item xs={12} display="flex" justifyContent="space-between" mt={1}>
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
                    Invoice Date
                  </Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    type="date"
                    fullWidth
                    value={formValues.invoiceDate}
                    onChange={handleChange("invoiceDate")}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} display="flex" justifyContent="space-between" mt={1}>
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
                    Due Date
                  </Typography>
                  <TextField
                    sx={{ width: "60%" }}
                    size="small"
                    type="date"
                    fullWidth
                    value={formValues.dueDate}
                    onChange={handleChange("dueDate")}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: formValues.invoiceDate || undefined,
                    }}
                  />
                </Grid>

              </Grid>
            </Grid>

            <Grid item xs={12} mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Invoice Lines
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddLine}
                size="small"
              >
                Add Line
              </Button>
            </Grid>

            <Grid item xs={12} mt={2}>
              <TableContainer component={Paper}>
                <Table
                  size="small"
                  aria-label="invoice lines table"
                  className="dark-table"
                >
                  <TableHead>
                    <TableRow sx={{ background: "#757fef" }}>
                      <TableCell sx={{ color: "#fff" }} align="center"></TableCell>
                      <TableCell sx={{ color: "#fff" }}>Account</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Description</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Quantity</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Rate</TableCell>
                      <TableCell align="right" sx={{ color: "#fff" }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formValues.vendorInvoiceLines.map((line, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell sx={{ p: 1 }} align="center">
                          <Tooltip title="Delete" placement="top">
                            <IconButton
                              onClick={() => handleRemoveLine(index)}
                              disabled={formValues.vendorInvoiceLines.length === 1}
                              aria-label="delete"
                              size="small"
                            >
                              <DeleteIcon color="error" fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <FormControl fullWidth size="small" required>
                            <Select
                              value={line.accountId}
                              onChange={handleLineChange(index, "accountId")}
                              disabled={accountsLoading || parentAccounts.length === 0}
                              size="small"
                            >
                              {parentAccounts.map((account) => (
                                <MenuItem key={account.id} value={account.id}>
                                  {account.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={line.description}
                            onChange={handleLineChange(index, "description")}
                            inputProps={{ maxLength: 1000 }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            sx={{ width: "100px" }}
                            value={line.quantity}
                            onChange={handleLineChange(index, "quantity")}
                            inputProps={{ min: 0, step: "0.01" }}
                          />
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            sx={{ width: "100px" }}
                            value={line.rate}
                            onChange={handleLineChange(index, "rate")}
                            inputProps={{ min: 0, step: "0.01" }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ p: 1 }}>
                          {(parseFloat(line.amount) || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={5} align="right" sx={{ p: 1 }}>
                        <Typography fontWeight="bold">Total Amount</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ p: 1 }}>
                        <Typography fontWeight="bold">
                          {(parseFloat(formValues.totalAmount) || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} align="right" sx={{ p: 1 }}>
                        <Typography fontWeight="bold">Net Amount</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ p: 1 }}>
                        <Typography fontWeight="bold">
                          {(parseFloat(formValues.netAmount) || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>


            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" onClick={navigateToBack} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
