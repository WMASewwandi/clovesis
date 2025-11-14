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
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import useAccountTypes from "../../../hooks/useAccountTypes";

const initialFormValues = {
  accountName: "",
  industry: "",
  website: "",
  mobileNo: "",
  email: "",
  billingAddress: "",
  shippingAddress: "",
  annualRevenue: "",
  employeeCount: "",
  accountType: "",
  isActive: true,
};

export default function AddAccountModal({ onAccountCreated }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formValues, setFormValues] = React.useState(initialFormValues);
  const { accountTypes } = useAccountTypes();

  const handleOpen = () => {
    setOpen(true);
  };

  const resetForm = () => {
    setFormValues(initialFormValues);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleFieldChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCheckboxChange = (event) => {
    const { checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const parseDecimal = (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.accountName.trim()) {
      toast.error("Account name is required.");
      return;
    }

    if (!formValues.mobileNo.trim()) {
      toast.error("Mobile number is required.");
      return;
    }

    if (!formValues.accountType) {
      toast.error("Account type is required.");
      return;
    }

    const payload = {
      AccountName: formValues.accountName.trim(),
      Industry: formValues.industry.trim() || null,
      Website: formValues.website.trim() || null,
      MobileNo: formValues.mobileNo.trim(),
      Email: formValues.email.trim() || null,
      BillingAddress: formValues.billingAddress.trim(),
      ShippingAddress: formValues.shippingAddress.trim() || null,
      AnnualRevenue: parseDecimal(formValues.annualRevenue),
      EmployeeCount: parseDecimal(formValues.employeeCount),
      AccountType: Number(formValues.accountType),
      IsActive: formValues.isActive,
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/CRMAccounts/CreateCRMAccount`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create account");
      }

      toast.success(data?.message || "Account created successfully.");
      setOpen(false);
      resetForm();
      if (typeof onAccountCreated === "function") {
        onAccountCreated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        + Add Account
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Account</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="create-account-form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600}>
                Account Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Account Name"
                fullWidth
                size="small"
                required
                value={formValues.accountName}
                onChange={handleFieldChange("accountName")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Industry"
                fullWidth
                size="small"
                value={formValues.industry}
                onChange={handleFieldChange("industry")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Website"
                fullWidth
                size="small"
                placeholder="https://example.com"
                value={formValues.website}
                onChange={handleFieldChange("website")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                value={formValues.email}
                onChange={handleFieldChange("email")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Mobile Number"
                fullWidth
                size="small"
                required
                value={formValues.mobileNo}
                onChange={handleFieldChange("mobileNo")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Annual Revenue"
                fullWidth
                size="small"
                placeholder="250000"
                value={formValues.annualRevenue}
                onChange={handleFieldChange("annualRevenue")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Employee Count"
                fullWidth
                size="small"
                value={formValues.employeeCount}
                onChange={handleFieldChange("employeeCount")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formValues.accountType}
                  label="Account Type"
                  onChange={handleFieldChange("accountType")}
                  required
                >
                  {accountTypes.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Billing Address"
                fullWidth
                multiline
                minRows={3}
                size="small"
                placeholder="Street, City, State"
                value={formValues.billingAddress}
                onChange={handleFieldChange("billingAddress")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Shipping Address"
                fullWidth
                multiline
                minRows={3}
                size="small"
                placeholder="Street, City, State"
                value={formValues.shippingAddress}
                onChange={handleFieldChange("shippingAddress")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={formValues.isActive} onChange={handleCheckboxChange} />}
                label="Is Active"
              />
            </Grid>
          </Grid>

          </Box>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end", px: 1 }}>
            <Button variant="outlined" color="inherit" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="create-account-form" variant="contained" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

