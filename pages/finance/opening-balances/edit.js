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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import useChartOfAccountParents from "hooks/useChartOfAccountParents";

export default function EditOpeningBalance({ openingBalance, onOpeningBalanceUpdated }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { parentAccounts, isLoading: accountsLoading } = useChartOfAccountParents();
  const [formValues, setFormValues] = React.useState({
    accountId: "",
    openingDebit: "",
    openingCredit: "",
    financialYear: new Date().getFullYear(),
  });

  React.useEffect(() => {
    if (open && openingBalance) {
      setFormValues({
        accountId: openingBalance.accountId ? String(openingBalance.accountId) : "",
        openingDebit: openingBalance.openingDebit || "",
        openingCredit: openingBalance.openingCredit || "",
        financialYear: openingBalance.financialYear || new Date().getFullYear(),
      });
    }
  }, [openingBalance, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.accountId) {
      toast.error("Account is required.");
      return;
    }
    if (!formValues.financialYear) {
      toast.error("Financial year is required.");
      return;
    }
    if (!openingBalance?.id) {
      toast.error("Missing opening balance identifier.");
      return;
    }

    const debitValue = parseFloat(formValues.openingDebit) || 0;
    const creditValue = parseFloat(formValues.openingCredit) || 0;

    if (debitValue < 0) {
      toast.error("Opening debit must be 0 or greater.");
      return;
    }
    if (creditValue < 0) {
      toast.error("Opening credit must be 0 or greater.");
      return;
    }

    const payload = {
      Id: openingBalance.id,
      AccountId: parseInt(formValues.accountId),
      OpeningDebit: debitValue,
      OpeningCredit: creditValue,
      FinancialYear: parseInt(formValues.financialYear),
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/OpeningBalances/UpdateOpeningBalance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update opening balance");
      }

      const data = await response.json();
      toast.success(data?.message || "Opening balance updated successfully.");
      setOpen(false);
      if (typeof onOpeningBalanceUpdated === "function") {
        onOpeningBalanceUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to update opening balance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="edit opening balance" onClick={() => setOpen(true)}>
          <EditOutlinedIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Opening Balance</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id={`edit-opening-balance-form-${openingBalance?.id}`} onSubmit={handleSubmit} noValidate>
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
            <Button variant="outlined" color="inherit" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={`edit-opening-balance-form-${openingBalance?.id}`}
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

