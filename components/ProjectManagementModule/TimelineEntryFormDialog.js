import { Formik } from "formik";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as Yup from "yup";

const sdlcPhases = [
  "Planning",
  "Analysis",
  "Design",
  "Development",
  "Testing",
  "Deployment",
  "Maintenance",
];

const validationSchema = Yup.object().shape({
  phaseName: Yup.string().required("Phase name is required"),
  phaseType: Yup.string().required("Select the SDLC stage"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .required("End date is required")
    .min(Yup.ref("startDate"), "End date cannot be before start date"),
});

const TimelineEntryFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = "Add Timeline Entry",
  teamMembers = [],
}) => {
  const defaults = {
    phaseName: "",
    phaseType: initialValues?.phaseType ?? sdlcPhases[0],
    startDate: dayjs(),
    endDate: dayjs().add(3, "day"),
    assignedToMemberId: "",
    notes: "",
    ...(initialValues || {}),
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
      <Formik
        initialValues={defaults}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values, helpers) => {
          try {
            await onSubmit({
              ...values,
              startDate: dayjs(values.startDate).toISOString(),
              endDate: dayjs(values.endDate).toISOString(),
            });
            helpers.setSubmitting(false);
          } catch (error) {
            helpers.setSubmitting(false);
            helpers.setStatus({ success: false, message: error.message });
          }
        }}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          setFieldValue,
          errors,
          touched,
          isSubmitting,
          status,
        }) => (
          <>
            <DialogContent dividers>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="phaseName"
                      label="Phase Name"
                      fullWidth
                      value={values.phaseName}
                      onChange={handleChange}
                      error={touched.phaseName && Boolean(errors.phaseName)}
                      helperText={touched.phaseName && errors.phaseName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      name="phaseType"
                      label="SDLC Stage"
                      fullWidth
                      value={values.phaseType}
                      onChange={handleChange}
                      error={touched.phaseType && Boolean(errors.phaseType)}
                      helperText={touched.phaseType && errors.phaseType}
                    >
                      {sdlcPhases.map((phase) => (
                        <MenuItem key={phase} value={phase}>
                          {phase}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={teamMembers}
                      value={
                        teamMembers.find(
                          (member) =>
                            member.memberId ===
                            (values.assignedToMemberId === ""
                              ? null
                              : values.assignedToMemberId)
                        ) ?? null
                      }
                      getOptionLabel={(option) => option.name}
                      onChange={(_, newValue) =>
                        setFieldValue(
                          "assignedToMemberId",
                          newValue ? newValue.memberId : ""
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned To (optional)"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={values.startDate ? dayjs(values.startDate) : null}
                      onChange={(date) => setFieldValue("startDate", date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={touched.startDate && Boolean(errors.startDate)}
                          helperText={touched.startDate && errors.startDate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date"
                      value={values.endDate ? dayjs(values.endDate) : null}
                      onChange={(date) => setFieldValue("endDate", date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={touched.endDate && Boolean(errors.endDate)}
                          helperText={touched.endDate && errors.endDate}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="notes"
                      label="Notes"
                      fullWidth
                      multiline
                      minRows={3}
                      value={values.notes}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
              {status?.message ? (
                <Box sx={{ mt: 2, color: "error.main", fontSize: 13 }}>
                  {status.message}
                </Box>
              ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Entry"}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default TimelineEntryFormDialog;

