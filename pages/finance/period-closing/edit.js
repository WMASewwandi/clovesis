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
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

export default function EditPeriodClosing({ period, onPeriodUpdated }) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    periodName: "",
    startDate: "",
    endDate: "",
    isClosed: false,
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  };

  React.useEffect(() => {
    if (open && period) {
      setFormValues({
        periodName: period.periodName || "",
        startDate: formatDateForInput(period.startDate),
        endDate: formatDateForInput(period.endDate),
        isClosed: period.isClosed || false,
      });
    }
  }, [period, open]);

  const handleChange = (field) => (event) => {
    const value = field === "isClosed" ? event.target.checked : event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.periodName.trim()) {
      toast.error("Period name is required.");
      return;
    }
    if (formValues.periodName.trim().length > 150) {
      toast.error("Period name must not exceed 150 characters.");
      return;
    }
    if (!formValues.startDate) {
      toast.error("Start date is required.");
      return;
    }
    if (!period?.id) {
      toast.error("Missing period identifier.");
      return;
    }

    const payload = {
      Id: period.id,
      PeriodName: formValues.periodName.trim(),
      StartDate: formValues.startDate ? new Date(formValues.startDate).toISOString() : null,
      EndDate: formValues.endDate ? new Date(formValues.endDate).toISOString() : null,
      IsClosed: formValues.isClosed,
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/PeriodClosing/UpdatePeriod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update period");
      }

      const data = await response.json();
      toast.success(data?.message || "Period updated successfully.");
      setOpen(false);
      if (typeof onPeriodUpdated === "function") {
        onPeriodUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to update period");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="edit period" onClick={() => setOpen(true)}>
          <EditOutlinedIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Period Closing</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id={`edit-period-form-${period?.id}`} onSubmit={handleSubmit} noValidate>
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
            <Button variant="outlined" color="inherit" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={`edit-period-form-${period?.id}`}
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

