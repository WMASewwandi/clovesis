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
import Slider from "@mui/material/Slider";
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

export default function EditLeadModal({ lead, onLeadUpdated }) {
  const [open, setOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    leadSource: "",
    status: "",
    leadScore: 0,
    notes: "",
  });
  const [statusOptions, setStatusOptions] = React.useState([]);
  const [loadingStatuses, setLoadingStatuses] = React.useState(false);
  const [statusError, setStatusError] = React.useState(null);
  const [sourceOptions, setSourceOptions] = React.useState([]);
  const [loadingSources, setLoadingSources] = React.useState(false);
  const [sourceError, setSourceError] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const fetchStatuses = React.useCallback(async () => {
    try {
      setLoadingStatuses(true);
      setStatusError(null);

      const response = await fetch(`${BASE_URL}/EnumLookup/LeadStatuses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load lead statuses");
      }

      const data = await response.json();
      const statuses = data?.result
        ? Object.entries(data.result).map(([value, label]) => ({
            value,
            label,
          }))
        : [];

      setStatusOptions(statuses);
    } catch (error) {
      setStatusError(error.message || "Unable to load lead statuses");
      setStatusOptions([]);
    } finally {
      setLoadingStatuses(false);
    }
  }, []);

  const fetchSources = React.useCallback(async () => {
    try {
      setLoadingSources(true);
      setSourceError(null);

      const response = await fetch(`${BASE_URL}/EnumLookup/LeadSources`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load lead sources");
      }

      const data = await response.json();
      const sources = data?.result
        ? Object.entries(data.result).map(([value, label]) => ({
            value,
            label,
          }))
        : [];

      setSourceOptions(sources);
    } catch (error) {
      setSourceError(error.message || "Unable to load lead sources");
      setSourceOptions([]);
    } finally {
      setLoadingSources(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      if (statusOptions.length === 0 && !loadingStatuses && !statusError) {
        fetchStatuses();
      }
      if (sourceOptions.length === 0 && !loadingSources && !sourceError) {
        fetchSources();
      }
    }
  }, [
    open,
    fetchStatuses,
    fetchSources,
    statusOptions.length,
    loadingStatuses,
    statusError,
    sourceOptions.length,
    loadingSources,
    sourceError,
  ]);

  React.useEffect(() => {
    if (open && lead) {
      const normalizedStatus =
        lead.status !== undefined && lead.status !== null
          ? lead.status
          : lead.leadStatus !== undefined && lead.leadStatus !== null
          ? lead.leadStatus
          : "";

      setFormValues({
        fullName: lead.fullName || lead.leadName || "",
        company: lead.company || "",
        email: lead.email || "",
        phone: lead.phone || lead.mobileNo || "",
        leadSource: lead.leadSource !== undefined && lead.leadSource !== null ? String(lead.leadSource) : "",
        status: normalizedStatus !== "" ? String(normalizedStatus) : "",
        leadScore: typeof lead.leadScore === "number" ? lead.leadScore : 50,
        notes: lead.notes || lead.description || "",
      });
    }
  }, [lead, open]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.fullName.trim()) {
      toast.error("Lead name is required.");
      return;
    }
    if (!formValues.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!formValues.phone.trim()) {
      toast.error("Mobile number is required.");
      return;
    }
    if (!formValues.leadSource) {
      toast.error("Lead source is required.");
      return;
    }
    if (!formValues.status) {
      toast.error("Lead status is required.");
      return;
    }
    if (!lead?.id) {
      toast.error("Missing lead identifier.");
      return;
    }

    const payload = {
      Id: lead.id,
      LeadName: formValues.fullName.trim(),
      Company: formValues.company.trim(),
      Email: formValues.email.trim(),
      MobileNo: formValues.phone.trim(),
      LeadSource: Number(formValues.leadSource),
      LeadStatus: Number(formValues.status),
      LeadScore: Number(formValues.leadScore) || 0,
      Description: formValues.notes?.trim() || "",
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/Leads/UpdateLead`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update lead");
      }

      const data = await response.json();
      toast.success(data?.message || "Lead updated successfully.");
      setOpen(false);
      if (typeof onLeadUpdated === "function") {
        onLeadUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to update lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="edit lead" onClick={() => setOpen(true)}>
          <EditOutlinedIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Lead</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id={`edit-lead-form-${lead?.id}`} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Lead Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  fullWidth
                  size="small"
                  required
                  value={formValues.fullName}
                  onChange={handleChange("fullName")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Company Name"
                  fullWidth
                  size="small"
                  value={formValues.company}
                  onChange={handleChange("company")}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  size="small"
                  required
                  value={formValues.email}
                  onChange={handleChange("email")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  size="small"
                  value={formValues.phone}
                  onChange={handleChange("phone")}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lead Source</InputLabel>
                  <Select
                    value={formValues.leadSource}
                    label="Lead Source"
                    onChange={handleChange("leadSource")}
                    disabled={loadingSources || sourceOptions.length === 0}
                  >
                    {sourceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formValues.status}
                    label="Status"
                    onChange={handleChange("status")}
                    disabled={loadingStatuses || statusOptions.length === 0}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {loadingSources && (
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading lead sources...
                    </Typography>
                  </Box>
                )}
                {sourceError && (
                  <Typography variant="body2" color="error" mb={2}>
                    {sourceError}
                  </Typography>
                )}
                {loadingStatuses && (
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      Loading lead statuses...
                    </Typography>
                  </Box>
                )}
                {statusError && (
                  <Typography variant="body2" color="error" mb={2}>
                    {statusError}
                  </Typography>
                )}
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Lead Score
                </Typography>
                <Box px={{ xs: 0, md: 1 }}>
                  <Slider
                    value={formValues.leadScore}
                    onChange={(_, value) =>
                      setFormValues((prev) => ({
                        ...prev,
                        leadScore: Array.isArray(value) ? value[0] : value,
                      }))
                    }
                    valueLabelDisplay="on"
                    step={5}
                    marks
                    min={0}
                    max={100}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  minRows={4}
                  size="small"
                  value={formValues.notes}
                  onChange={handleChange("notes")}
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
              form={`edit-lead-form-${lead?.id}`}
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





