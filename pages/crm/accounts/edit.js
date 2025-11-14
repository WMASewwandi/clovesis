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
import useAccountTypes from "../../../hooks/useAccountTypes";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

const initialFormValues = {
  name: "",
  industry: "",
  website: "",
  email: "",
  mobileNo: "",
  billingAddress: "",
  shippingAddress: "",
  annualRevenue: "",
  employeeCount: "",
  accountType: "",
  isActive: true,
};

export default function EditAccountModal({ account, onAccountUpdated }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { accountTypes } = useAccountTypes();
  const [formValues, setFormValues] = React.useState(initialFormValues);

  React.useEffect(() => {
    if (open && account) {
      setFormValues({
        name: account.accountName || "",
        industry: account.industry || "",
        website: account.website || "",
        email: account.email || "",
        mobileNo: account.mobileNo || "",
        billingAddress: account.billingAddress || "",
        shippingAddress: account.shippingAddress || "",
        annualRevenue: account.annualRevenue != null ? String(account.annualRevenue) : "",
        employeeCount: account.employeeCount != null ? String(account.employeeCount) : "",
        accountType:
          account.accountType != null ? String(account.accountType) : "",
        isActive:
          typeof account.isActive === "boolean" ? account.isActive : account.status === "Active",
      });
    } else if (!open) {
      setFormValues(initialFormValues);
    }
  }, [account, open]);

  const handleFieldChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCheckboxChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.checked,
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

    if (!account?.id) {
      toast.error("Unable to determine account to update.");
      return;
    }

    if (!formValues.name.trim()) {
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
      Id: account?.id,
      AccountName: formValues.name.trim(),
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
      const response = await fetch(`${BASE_URL}/CRMAccounts/UpdateCRMAccount`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update account");
      }

      toast.success(data?.message || "Account updated successfully.");
      setOpen(false);
      if (typeof onAccountUpdated === "function") {
        onAccountUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to update account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="edit account" onClick={() => setOpen(true)}>
          <EditOutlinedIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id={`edit-account-form-${account?.id}`} onSubmit={handleSubmit} noValidate>
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
                value={formValues.name}
                onChange={handleFieldChange("name")}
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
                <Select value={formValues.accountType} label="Account Type" onChange={handleFieldChange("accountType")}>
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
                value={formValues.shippingAddress}
                onChange={handleFieldChange("shippingAddress")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={formValues.isActive} onChange={handleCheckboxChange("isActive")} />}
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
            <Button type="submit" form={`edit-account-form-${account?.id}`} variant="contained" disabled={submitting}>
              {submitting ? "Updating..." : "Update"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

