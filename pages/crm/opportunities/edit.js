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
import Slider from "@mui/material/Slider";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import useCRMAccounts from "../../../hooks/useCRMAccounts";
import useOpportunityStages from "../../../hooks/useOpportunityStages";
import useLeadSources from "../../../hooks/useLeadSources";
import useContactsByAccount from "../../../hooks/useContactsByAccount";
import useOpportunityStatuses from "../../../hooks/useOpportunityStatuses";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

const parseDecimal = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export default function EditOpportunityModal({ opportunity, onOpportunityUpdated }) {
  const [open, setOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    name: "",
    account: "",
    contact: "",
    stage: "",
    value: "",
    probability: 50,
    expectedCloseDate: "",
    source: "",
    status: "",
    description: "",
  });
  const [submitting, setSubmitting] = React.useState(false);

  const { accounts } = useCRMAccounts();
  const { stages } = useOpportunityStages();
  const { sources } = useLeadSources();
  const { statuses } = useOpportunityStatuses();
  const { contacts } = useContactsByAccount(formValues.account);

  const resolveAccountValue = React.useCallback(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return "";
      }
      const stringValue = String(value);
      const byId = accounts.find((account) => String(account.id) === stringValue);
      if (byId) return String(byId.id);
      const byName = accounts.find((account) => account.accountName === value);
      if (byName) return String(byName.id);
      return stringValue;
    },
    [accounts]
  );

  const resolveStageValue = React.useCallback(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return "";
      }
      const stringValue = String(value);
      const byValue = stages.find((stage) => String(stage.value) === stringValue);
      if (byValue) return String(byValue.value);
      const byLabel = stages.find((stage) => stage.label === value);
      if (byLabel) return String(byLabel.value);
      return stringValue;
    },
    [stages]
  );

  const resolveSourceValue = React.useCallback(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return "";
      }
      const stringValue = String(value);
      const byValue = sources.find((source) => String(source.value) === stringValue);
      if (byValue) return String(byValue.value);
      const byLabel = sources.find((source) => source.label === value);
      if (byLabel) return String(byLabel.value);
      return stringValue;
    },
    [sources]
  );

  const resolveStatusValue = React.useCallback(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return "";
      }
      const stringValue = String(value);
      const byValue = statuses.find((status) => String(status.value) === stringValue);
      if (byValue) return String(byValue.value);
      const byLabel = statuses.find((status) => status.label === value);
      if (byLabel) return String(byLabel.value);
      return stringValue;
    },
    [statuses]
  );

  const resolveContactValue = React.useCallback(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return "";
      }
      return String(value);
    },
    []
  );

  React.useEffect(() => {
    if (open && opportunity) {
      setFormValues({
        name: opportunity.opportunityName || opportunity.name || "",
        account: resolveAccountValue(opportunity.accountId ?? opportunity.account),
        contact: resolveContactValue(opportunity.contactId ?? opportunity.contact),
        stage: resolveStageValue(opportunity.stage),
        value: opportunity.value != null ? String(opportunity.value) : "",
        probability: parseInt(opportunity.probability, 10) || 50,
        expectedCloseDate: opportunity.expectedCloseDate ? opportunity.expectedCloseDate.substring(0, 10) : "",
        source: resolveSourceValue(opportunity.source),
        status: resolveStatusValue(opportunity.status),
        description:
          opportunity.description ||
          "",
      });
    }
  }, [open, opportunity, resolveAccountValue, resolveStageValue, resolveSourceValue, resolveStatusValue, resolveContactValue]);

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "account" ? { contact: "" } : {}),
    }));
  };

  const handleProbabilityChange = (_, value) => {
    setFormValues((prev) => ({
      ...prev,
      probability: value,
    }));
  };

  const validateForm = () => {
    if (!formValues.name.trim()) {
      toast.error("Opportunity name is required.");
      return false;
    }
    if (!formValues.account) {
      toast.error("Account is required.");
      return false;
    }
    if (!formValues.contact) {
      toast.error("Contact is required.");
      return false;
    }
    if (!formValues.stage) {
      toast.error("Stage is required.");
      return false;
    }
    if (formValues.value && parseDecimal(formValues.value) === null) {
      toast.error("Value must be a number.");
      return false;
    }
    if (!formValues.source) {
      toast.error("Source is required.");
      return false;
    }
    if (!formValues.status) {
      toast.error("Status is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!opportunity?.id) {
      toast.error("Unable to determine opportunity to update.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const payload = {
      Id: opportunity.id,
      OpportunityName: formValues.name.trim(),
      AccountId: Number(formValues.account),
      ContactId: Number(formValues.contact),
      Stage: Number(formValues.stage),
      Value: parseDecimal(formValues.value),
      Probability: Math.round(formValues.probability),
      ExpectedCloseDate: formValues.expectedCloseDate || null,
      Source: Number(formValues.source),
      Description: formValues.description.trim() || null,
      Status: Number(formValues.status),
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/CRMOpportunities/UpdateCRMOpportunity`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update opportunity");
      }

      toast.success(data?.message || "Opportunity updated successfully.");
      setOpen(false);
      setSubmitting(false);
      if (typeof onOpportunityUpdated === "function") {
        onOpportunityUpdated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to update opportunity");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSubmitting(false);
  };

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" aria-label="edit opportunity" onClick={() => setOpen(true)}>
          <EditOutlinedIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Opportunity</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id={`edit-opportunity-form-${opportunity?.id}`} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600}>
                  Opportunity Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Opportunity Name"
                  fullWidth
                  size="small"
                  required
                  value={formValues.name}
                  onChange={handleFieldChange("name")}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Account</InputLabel>
                  <Select value={formValues.account} label="Account" onChange={handleFieldChange("account")}>
                    {accounts.map((account) => (
                      <MenuItem key={account.id} value={String(account.id)}>
                        {account.accountName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Contact</InputLabel>
                  <Select
                    value={formValues.contact}
                    label="Contact"
                    onChange={handleFieldChange("contact")}
                    disabled={!formValues.account}
                  >
                    {contacts.map((contact) => (
                      <MenuItem key={contact.id} value={String(contact.id)}>
                        {[contact.firstName, contact.lastName].filter(Boolean).join(" ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Stage</InputLabel>
                  <Select value={formValues.stage} label="Stage" onChange={handleFieldChange("stage")}>
                    {stages.map((stage) => (
                      <MenuItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={formValues.status} label="Status" onChange={handleFieldChange("status")}>
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Value"
                  fullWidth
                  size="small"
                  value={formValues.value}
                  onChange={handleFieldChange("value")}
                />
              </Grid>
              

              <Grid item xs={12} md={6}>
                <TextField
                  label="Expected Close Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formValues.expectedCloseDate}
                  onChange={handleFieldChange("expectedCloseDate")}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Source</InputLabel>
                  <Select value={formValues.source} label="Source" onChange={handleFieldChange("source")}>
                    {sources.map((source) => (
                      <MenuItem key={source.value} value={String(source.value)}>
                        {source.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Probability (%)
                  </Typography>
                  <Slider
                    value={formValues.probability}
                    onChange={handleProbabilityChange}
                    valueLabelDisplay="on"
                    min={0}
                    max={100}
                    step={5}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  value={formValues.description}
                  onChange={handleFieldChange("description")}
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
            <Button
              type="submit"
              form={`edit-opportunity-form-${opportunity?.id}`}
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

