import React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

export default function EditSupplierPaymentModal({ supplierPayment, onSupplierPaymentUpdated }) {
  const [open, setOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    supplierId: "",
    paymentDate: "",
    totalPaidAmount: "",
    paymentMethod: "",
    bankAccountId: "",
  });
  const [suppliers, setSuppliers] = React.useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);
  const [supplierError, setSupplierError] = React.useState(null);
  const [bankAccounts, setBankAccounts] = React.useState([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = React.useState(false);
  const [bankAccountError, setBankAccountError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const fetchSuppliers = React.useCallback(async () => {
    try {
      setLoadingSuppliers(true);
      setSupplierError(null);

      const response = await fetch(`${BASE_URL}/Supplier/GetAllSupplier`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load suppliers");
      }

      const data = await response.json();
      setSuppliers(data?.result || []);
    } catch (error) {
      setSupplierError(error.message || "Unable to load suppliers");
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  const fetchBankAccounts = React.useCallback(async () => {
    try {
      setLoadingBankAccounts(true);
      setBankAccountError(null);

      const response = await fetch(`${BASE_URL}/Bank/GetAllBanks`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load bank accounts");
      }

      const data = await response.json();
      setBankAccounts(data?.result || []);
    } catch (error) {
      setBankAccountError(error.message || "Unable to load bank accounts");
      setBankAccounts([]);
    } finally {
      setLoadingBankAccounts(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      if (suppliers.length === 0 && !loadingSuppliers && !supplierError) {
        fetchSuppliers();
      }
      // Fetch bank accounts when modal opens (retry even if there was a previous error)
      if (!loadingBankAccounts) {
        setBankAccountError(null);
      }
    }
  }, [open, fetchSuppliers, suppliers.length, loadingSuppliers, supplierError, loadingBankAccounts]);

  React.useEffect(() => {
    if (open && supplierPayment) {
      const paymentDate = supplierPayment.paymentDate
        ? new Date(supplierPayment.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormValues({
        supplierId: supplierPayment.supplierId ? String(supplierPayment.supplierId) : "",
        paymentDate: paymentDate,
        totalPaidAmount: supplierPayment.totalPaidAmount ? String(supplierPayment.totalPaidAmount) : "",
        paymentMethod: supplierPayment.paymentMethod ? String(supplierPayment.paymentMethod) : "",
        bankAccountId: supplierPayment.bankAccountId ? String(supplierPayment.bankAccountId) : "",
      });
    }
  }, [supplierPayment, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear bank account if payment method is Cash (1)
    if (field === "paymentMethod" && value === "1") {
      setFormValues((prev) => ({
        ...prev,
        bankAccountId: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.supplierId) {
      toast.error("Supplier is required.");
      return;
    }
    if (!formValues.paymentDate) {
      toast.error("Payment date is required.");
      return;
    }
    if (!formValues.totalPaidAmount || parseFloat(formValues.totalPaidAmount) <= 0) {
      toast.error("Total paid amount must be greater than 0.");
      return;
    }
    if (!formValues.paymentMethod) {
      toast.error("Payment method is required.");
      return;
    }
    if (!supplierPayment?.id) {
      toast.error("Missing supplier payment identifier.");
      return;
    }

    const payload = {
      Id: supplierPayment.id,
      SupplierId: Number(formValues.supplierId),
      PaymentDate: formValues.paymentDate,
      TotalPaidAmount: parseFloat(formValues.totalPaidAmount),
      PaymentMethod: Number(formValues.paymentMethod),
      BankAccountId: formValues.bankAccountId ? Number(formValues.bankAccountId) : null,
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/SupplierPayment/UpdateSupplierPayment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update supplier payment");
      }

      const data = await response.json();
      toast.success(data?.message || "Supplier payment updated successfully.");
      setOpen(false);
      if (typeof onSupplierPaymentUpdated === "function") {
        onSupplierPaymentUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to update supplier payment");
    } finally {
      setSubmitting(false);
    }
  };

  const shouldShowBankAccount = formValues.paymentMethod && formValues.paymentMethod !== "1";

  const handleOpen = () => {
    fetchBankAccounts();
    setOpen(true);
  }

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="edit supplier payment" onClick={() => handleOpen()}>
          <EditOutlinedIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Supplier Payment</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id={`edit-supplier-payment-form-${supplierPayment?.id}`} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Payment Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={formValues.supplierId}
                    label="Supplier"
                    onChange={handleChange("supplierId")}
                    disabled={loadingSuppliers || suppliers.length === 0}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {loadingSuppliers && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading suppliers...
                    </Typography>
                  </Box>
                )}
                {supplierError && (
                  <Typography variant="body2" color="error" mt={1}>
                    {supplierError}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Payment Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formValues.paymentDate}
                  onChange={handleChange("paymentDate")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Total Paid Amount"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  value={formValues.totalPaidAmount}
                  onChange={handleChange("totalPaidAmount")}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formValues.paymentMethod}
                    label="Payment Method"
                    onChange={handleChange("paymentMethod")}
                  >
                    <MenuItem value={1}>Cash</MenuItem>
                    <MenuItem value={2}>Card</MenuItem>
                    <MenuItem value={3}>Cash & Card</MenuItem>
                    <MenuItem value={4}>Bank Transfer</MenuItem>
                    <MenuItem value={5}>Cheque</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {shouldShowBankAccount && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Bank Account</InputLabel>
                    <Select
                      value={formValues.bankAccountId}
                      label="Bank Account"
                      disabled={loadingBankAccounts || bankAccounts.length === 0}
                      onChange={handleChange("bankAccountId")}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {bankAccounts.map((bank) => (
                        <MenuItem key={bank.id} value={bank.id}>
                          {bank.name} - {bank.accountUsername} ({bank.accountNo})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {loadingBankAccounts && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Loading bank accounts...
                      </Typography>
                    </Box>
                  )}
                  {bankAccountError && (
                    <Typography variant="body2" color="error" mt={1}>
                      {bankAccountError}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end", px: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={`edit-supplier-payment-form-${supplierPayment?.id}`}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

