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
import CircularProgress from "@mui/material/CircularProgress";
import useRelatedEntityTypes from "../../../hooks/useRelatedEntityTypes";
import useChartTypes from "../../../hooks/useChartTypes";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

const INITIAL_FORM = {
  name: "",
  reportType: "",
  chartType: "",
};

export default function AddReportModal({ onReportCreated }) {
  const [open, setOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState(INITIAL_FORM);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    entities: reportTypeOptions,
    isLoading: reportTypesLoading,
  } = useRelatedEntityTypes();
  const {
    chartTypes,
    isLoading: chartTypesLoading,
  } = useChartTypes();

  React.useEffect(() => {
    if (open) {
      setFormValues((prev) => ({
        ...INITIAL_FORM,
        name: prev.name || "",
        reportType:
          prev.reportType ||
          (reportTypeOptions.length > 0 ? String(reportTypeOptions[0].value) : ""),
        chartType:
          prev.chartType || (chartTypes.length > 0 ? String(chartTypes[0].value) : ""),
      }));
    }
  }, [open, reportTypeOptions, chartTypes]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = [];

    if (!formValues.name.trim()) {
      errors.push("Report name is required.");
    }

    if (!formValues.reportType) {
      errors.push("Report type is required.");
    }

    if (!formValues.chartType) {
      errors.push("Chart type is required.");
    }

    if (errors.length > 0) {
      errors.forEach((message) => toast.error(message));
      return;
    }

    const payload = {
      ReportName: formValues.name.trim(),
      ReportType: Number(formValues.reportType),
      ChartType: Number(formValues.chartType),
      IsActive: true,
    };

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const submitReport = async () => {
      try {
        setSubmitting(true);

        const response = await fetch(`${BASE_URL}/CRMReports/CreateCRMReport`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Failed to create report");
        }

        toast.success(data?.message || "Report created successfully.");
        setOpen(false);
        setFormValues(INITIAL_FORM);

        if (typeof onReportCreated === "function") {
          onReportCreated();
        }
      } catch (error) {
        toast.error(error.message || "Unable to create report");
      } finally {
        setSubmitting(false);
      }
    };

    submitReport();
  };

  const handleOpenModal = () => {
    setFormValues(INITIAL_FORM);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderOptions = (options) =>
    options.map((option) => (
      <MenuItem key={option.value} value={String(option.value)}>
        {option.label}
      </MenuItem>
    ));

  return (
    <>
      <Button variant="contained" onClick={handleOpenModal}>
        + Add Report
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Create Report</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="create-report-form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Report Details
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Report Name"
                  fullWidth
                  size="small"
                  required
                  value={formValues.name}
                  onChange={handleChange("name")}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small" disabled={reportTypesLoading || submitting}>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={formValues.reportType}
                    label="Report Type"
                    onChange={handleChange("reportType")}
                    displayEmpty
                  >
                    {renderOptions(reportTypeOptions)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small" disabled={chartTypesLoading || submitting}>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={formValues.chartType}
                    label="Chart Type"
                    onChange={handleChange("chartType")}
                    displayEmpty
                  >
                    {renderOptions(chartTypes)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={2} sx={{ width: "100%", justifyContent: "flex-end", px: 1 }}>
            <Button variant="outlined" color="inherit" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="create-report-form" variant="contained" disabled={submitting}>
              {submitting ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress color="inherit" size={18} />
                  Saving...
                </Stack>
              ) : (
                "Save"
              )}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

