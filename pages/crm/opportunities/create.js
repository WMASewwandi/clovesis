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
import Slider from "@mui/material/Slider";
import useCRMAccounts from "../../../hooks/useCRMAccounts";
import useOpportunityStages from "../../../hooks/useOpportunityStages";
import useLeadSources from "../../../hooks/useLeadSources";
import useContactsByAccount from "../../../hooks/useContactsByAccount";
import useOpportunityStatuses from "../../../hooks/useOpportunityStatuses";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";

const initialFormValues = {
  opportunityName: "",
  accountId: "",
  contactId: "",
  stage: "",
  value: "",
  expectedCloseDate: "",
  source: "",
  status: "",
  description: "",
};

export default function AddOpportunityModal({ onOpportunityCreated }) {
  const [open, setOpen] = React.useState(false);
  const [probability, setProbability] = React.useState(50);
  const [submitting, setSubmitting] = React.useState(false);
  const [formValues, setFormValues] = React.useState(initialFormValues);
  const { accounts } = useCRMAccounts();
  const { stages } = useOpportunityStages();
  const { sources } = useLeadSources();
  const { statuses } = useOpportunityStatuses();
  const { contacts } = useContactsByAccount(formValues.accountId);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormValues(initialFormValues);
    setProbability(50);
    setSubmitting(false);
  };

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "accountId" ? { contactId: "" } : {}),
    }));
  };

  const parseDecimal = (value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  const validateForm = () => {
    if (!formValues.opportunityName.trim()) {
      toast.error("Opportunity name is required.");
      return false;
    }
    if (!formValues.accountId) {
      toast.error("Account is required.");
      return false;
    }
    if (!formValues.contactId) {
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

    if (!validateForm()) {
      return;
    }

    const payload = {
      OpportunityName: formValues.opportunityName.trim(),
      AccountId: Number(formValues.accountId),
      ContactId: Number(formValues.contactId),
      Stage: Number(formValues.stage),
      Value: parseDecimal(formValues.value),
      Probability: Math.round(probability),
      ExpectedCloseDate: formValues.expectedCloseDate || null,
      Source: Number(formValues.source),
      Description: formValues.description.trim() || null,
      Status: Number(formValues.status),
    };

    try {
      setSubmitting(true);
      const response = await fetch(`${BASE_URL}/CRMOpportunities/CreateCRMOpportunity`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create opportunity");
      }

      toast.success(data?.message || "Opportunity created successfully.");
      handleClose();
      if (typeof onOpportunityCreated === "function") {
        onOpportunityCreated();
      }
    } catch (error) {
      toast.error(error.message || "Unable to create opportunity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
        + Add Opportunity
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Opportunity</DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="create-opportunity-form" onSubmit={handleSubmit} noValidate>
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
                    value={formValues.opportunityName}
                    onChange={handleFieldChange("opportunityName")}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Account</InputLabel>
                    <Select
                      value={formValues.accountId}
                      label="Account"
                      onChange={handleFieldChange("accountId")}
                    >
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
                      value={formValues.contactId}
                      label="Contact"
                      onChange={handleFieldChange("contactId")}
                      disabled={!formValues.accountId}
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
                        <MenuItem key={stage.value} value={String(stage.value)}>
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
                        <MenuItem key={status.value} value={String(status.value)}>
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
                    placeholder="25,000"
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
                      value={probability}
                      onChange={(_, value) => setProbability(value)}
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
                    placeholder="Enter opportunity description..."
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
            <Button type="submit" form="create-opportunity-form" variant="contained" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

