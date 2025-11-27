import React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import useChartOfAccountParents from "hooks/useChartOfAccountParents";

export default function CreateOpeningBalance({ onOpeningBalanceCreated }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { parentAccounts, isLoading: accountsLoading } = useChartOfAccountParents();
  const [formValues, setFormValues] = React.useState({
    accountId: "",
    openingDebit: "",
    openingCredit: "",
    financialYear: new Date().getFullYear(),
  });

  const resetForm = () => {
    setFormValues({
      accountId: "",
      openingDebit: "",
      openingCredit: "",
      financialYear: new Date().getFullYear(),
    });
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { accountId, openingDebit, openingCredit, financialYear } = formValues;

    if (!accountId) {
      toast.error("Account is required.");
      return;
    }
    if (!financialYear) {
      toast.error("Financial year is required.");
      return;
    }

    const debitValue = parseFloat(openingDebit) || 0;
    const creditValue = parseFloat(openingCredit) || 0;

    if (debitValue < 0) {
      toast.error("Opening debit must be 0 or greater.");
      return;
    }
    if (creditValue < 0) {
      toast.error("Opening credit must be 0 or greater.");
      return;
    }

    const payload = {
      AccountId: parseInt(accountId),
      OpeningDebit: debitValue,
      OpeningCredit: creditValue,
      FinancialYear: parseInt(financialYear),
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/OpeningBalances/CreateOpeningBalance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create opening balance");
      }

      const data = await response.json();
      toast.success(data?.message || "Opening balance created successfully.");
      setOpen(false);
      resetForm();
      if (typeof onOpeningBalanceCreated === "function") {
        onOpeningBalanceCreated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to create opening balance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        + Add Opening Balance
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Create Opening Balance</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="create-opening-balance-form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Opening Balance Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Account</InputLabel>
                  <Select
                    value={formValues.accountId}
                    label="Account"
                    onChange={handleChange("accountId")}
                    disabled={accountsLoading || parentAccounts.length === 0}
                  >
                    {parentAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {accountsLoading && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Loading accounts...
                      </Typography>
                    </Box>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Financial Year"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  value={formValues.financialYear}
                  onChange={handleChange("financialYear")}
                  inputProps={{ min: 2000, max: 2100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Opening Debit"
                  type="number"
                  fullWidth
                  size="small"
                  value={formValues.openingDebit}
                  onChange={handleChange("openingDebit")}
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Opening Credit"
                  type="number"
                  fullWidth
                  size="small"
                  value={formValues.openingCredit}
                  onChange={handleChange("openingCredit")}
                  inputProps={{ min: 0, step: "0.01" }}
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
            <Button type="submit" form="create-opening-balance-form" variant="contained" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

