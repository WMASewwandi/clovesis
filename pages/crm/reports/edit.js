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
import CircularProgress from "@mui/material/CircularProgress";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import useRelatedEntityTypes from "../../../hooks/useRelatedEntityTypes";
import useChartTypes from "../../../hooks/useChartTypes";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

const INITIAL_FORM = {
  name: "",
  reportType: "",
  chartType: "",
};

const resolveValue = (value, options) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const stringValue = String(value);
  const byValue = options.find((option) => String(option.value) === stringValue);
  if (byValue) return String(byValue.value);
  const byLabel = options.find((option) => option.label === value);
  if (byLabel) return String(byLabel.value);
  return stringValue;
};

export default function EditReportModal({ report, onReportUpdated }) {
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
      setFormValues({
        name: report?.reportName || report?.name || "",
        reportType: resolveValue(report?.reportType, reportTypeOptions),
        chartType: resolveValue(report?.chartType, chartTypes),
      });
    }
  }, [open, report, reportTypeOptions, chartTypes]);

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
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

    if (!report?.id) {
      toast.error("Unable to determine report to update.");
      return;
    }

    const payload = {
      Id: Number(report.id),
      ReportName: formValues.name.trim(),
      ReportType: Number(formValues.reportType),
      ChartType: Number(formValues.chartType),
      IsActive: report.isActive ?? true,
    };

    try {
      setSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/CRMReports/UpdateCRMReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update report");
      }

      toast.success(data?.message || "Report updated successfully.");
      setOpen(false);

      if (typeof onReportUpdated === "function") {
        onReportUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to update report");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptions = (options) =>
    options.map((option) => (
      <MenuItem key={option.value} value={String(option.value)}>
        {option.label}
      </MenuItem>
    ));

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="edit report" onClick={() => setOpen(true)}>
          <EditOutlinedIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Report</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id={`edit-report-form-${report?.id}`} onSubmit={handleSubmit} noValidate>
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
                  onChange={handleFieldChange("name")}
                  disabled={submitting}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth size="small" disabled={reportTypesLoading || submitting}>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={formValues.reportType}
                    label="Report Type"
                    onChange={handleFieldChange("reportType")}
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
                    onChange={handleFieldChange("chartType")}
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
            <Button variant="outlined" color="inherit" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={`edit-report-form-${report?.id}`}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress color="inherit" size={18} />
                  Updating...
                </Stack>
              ) : (
                "Update"
              )}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

