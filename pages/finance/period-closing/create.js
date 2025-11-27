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
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

export default function CreatePeriodClosing({ onPeriodCreated }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    periodName: "",
    startDate: "",
    endDate: "",
    isClosed: false,
  });

  const resetForm = () => {
    setFormValues({
      periodName: "",
      startDate: "",
      endDate: "",
      isClosed: false,
    });
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleChange = (field) => (event) => {
    const value = field === "isClosed" ? event.target.checked : event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { periodName, startDate, isClosed } = formValues;

    if (!periodName.trim()) {
      toast.error("Period name is required.");
      return;
    }
    if (periodName.trim().length > 150) {
      toast.error("Period name must not exceed 150 characters.");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required.");
      return;
    }

    const payload = {
      PeriodName: formValues.periodName.trim(),
      StartDate: formValues.startDate ? new Date(formValues.startDate).toISOString() : null,
      EndDate: formValues.endDate ? new Date(formValues.endDate).toISOString() : null,
      IsClosed: formValues.isClosed,
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/PeriodClosing/CreatePeriod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create period");
      }

      const data = await response.json();
      toast.success(data?.message || "Period created successfully.");
      setOpen(false);
      resetForm();
      if (typeof onPeriodCreated === "function") {
        onPeriodCreated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to create period");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        + Add Period
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Create Period Closing</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="create-period-form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Period Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Period Name"
                  fullWidth
                  size="small"
                  required
                  value={formValues.periodName}
                  onChange={handleChange("periodName")}
                  inputProps={{ maxLength: 150 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formValues.startDate}
                  onChange={handleChange("startDate")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={formValues.endDate}
                  onChange={handleChange("endDate")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: formValues.startDate || undefined,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formValues.isClosed}
                      onChange={handleChange("isClosed")}
                      color="primary"
                    />
                  }
                  label="Is Closed"
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
            <Button type="submit" form="create-period-form" variant="contained" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

