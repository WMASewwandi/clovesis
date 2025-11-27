import { Formik } from "formik";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Member name is required"),
  email: Yup.string().nullable().email("Enter a valid email"),
  mobileNumber: Yup.string()
    .nullable()
    .matches(/^[0-9+\-\s()]*$/, "Enter a valid phone number"),
});

const TeamMemberFormDialog = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  title = "Add Team Member",
}) => {
  const defaults = {
    name: "",
    position: "",
    email: "",
    mobileNumber: "",
    employeeId: "",
    isActive: true,
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
          errors,
          touched,
          handleChange,
          handleSubmit,
          isSubmitting,
          status,
        }) => (
          <>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Member Name"
                    fullWidth
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="position"
                    label="Role / Position"
                    fullWidth
                    value={values.position}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="email"
                    label="Email"
                    fullWidth
                    value={values.email}
                    onChange={handleChange}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="mobileNumber"
                    label="Mobile"
                    fullWidth
                    value={values.mobileNumber}
                    onChange={handleChange}
                    error={touched.mobileNumber && Boolean(errors.mobileNumber)}
                    helperText={touched.mobileNumber && errors.mobileNumber}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="employeeId"
                    label="Employee ID"
                    fullWidth
                    value={values.employeeId}
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
                {isSubmitting ? "Saving..." : "Save Member"}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default TeamMemberFormDialog;

