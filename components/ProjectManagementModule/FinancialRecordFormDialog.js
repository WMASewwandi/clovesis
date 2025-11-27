import { Formik } from "formik";
import {
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
import dayjs from "dayjs";
import * as Yup from "yup";

const recordTypes = [
  { label: "Income", value: 1 },
  { label: "Expense", value: 2 },
];

const expenseCategories = [
  { label: "General Expense", value: 1 },
  { label: "Salary", value: 2 },
  { label: "Server Cost", value: 3 },
  { label: "Database Cost", value: 4 },
  { label: "Infrastructure", value: 5 },
  { label: "Operational", value: 6 },
  { label: "Travel", value: 7 },
  { label: "Marketing", value: 8 },
  { label: "Other Expense", value: 9 },
];

const incomeCategories = [
  { label: "Project Billing", value: 10 },
  { label: "Change Request", value: 11 },
  { label: "Maintenance", value: 12 },
  { label: "Consulting", value: 13 },
  { label: "Product Sales", value: 14 },
  { label: "Other Income", value: 15 },
];

const validationSchema = Yup.object().shape({
  recordType: Yup.number().required("Select record type"),
  category: Yup.number().required("Select category"),
  amount: Yup.number().typeError("Enter numeric amount").min(0).required(),
  recordDate: Yup.date().required(),
});

const FinancialRecordFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = "New Financial Record",
  teamMembers = [],
}) => {
  const defaults = {
    recordType: 2,
    category: 1,
    amount: 0,
    recordDate: dayjs().toISOString(),
    reference: "",
    notes: "",
    relatedMemberId: "",
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
            await onSubmit(values);
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
          touched,
          errors,
          isSubmitting,
          status,
        }) => (
          <>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    name="recordType"
                    label="Type"
                    fullWidth
                    value={values.recordType}
                    onChange={handleChange}
                    error={touched.recordType && Boolean(errors.recordType)}
                    helperText={touched.recordType && errors.recordType}
                  >
                    {recordTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    name="category"
                    label="Category"
                    fullWidth
                    value={values.category}
                    onChange={handleChange}
                    error={touched.category && Boolean(errors.category)}
                    helperText={touched.category && errors.category}
                  >
                    {(values.recordType === 1 ? incomeCategories : expenseCategories).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="amount"
                    label="Amount"
                    type="number"
                    fullWidth
                    value={values.amount}
                    onChange={handleChange}
                    error={touched.amount && Boolean(errors.amount)}
                    helperText={touched.amount && errors.amount}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="recordDate"
                    label="Record Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={dayjs(values.recordDate).format("YYYY-MM-DD")}
                    onChange={(event) =>
                      setFieldValue("recordDate", event.target.value)
                    }
                    error={touched.recordDate && Boolean(errors.recordDate)}
                    helperText={touched.recordDate && errors.recordDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    name="relatedMemberId"
                    label="Related Member"
                    fullWidth
                    value={values.relatedMemberId ?? ""}
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {teamMembers.map((member) => (
                      <MenuItem key={member.memberId} value={member.memberId}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="reference"
                    label="Reference"
                    fullWidth
                    value={values.reference}
                    onChange={handleChange}
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
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default FinancialRecordFormDialog;

