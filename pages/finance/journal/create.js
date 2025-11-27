import React, { useEffect, useRef } from "react";
import { Grid, Typography, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik, FieldArray } from "formik";
import * as Yup from "yup";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useChartOfAccountParents from "hooks/useChartOfAccountParents";
import useJournalEntryStatuses from "hooks/useJournalEntryStatuses";
import useUsers from "hooks/useUsers";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 900, xs: "95%" },
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  overflow: "auto",
};

const lineValidationSchema = Yup.object().shape({
  AccountId: Yup.number().required("Account is required"),
  Debit: Yup.number()
    .min(0, "Debit must be 0 or greater")
    .max(999999999999.99, "Debit exceeds maximum value"),
  Credit: Yup.number()
    .min(0, "Credit must be 0 or greater")
    .max(999999999999.99, "Credit exceeds maximum value"),
  Description: Yup.string().max(1000, "Description must be 1000 characters or less"),
});

const validationSchema = Yup.object().shape({
  JournalDate: Yup.date().required("Journal Date is required"),
  ReferenceNo: Yup.string().max(100, "Reference No must be 100 characters or less"),
  Narration: Yup.string().max(1000, "Narration must be 1000 characters or less"),
  ApprovedBy: Yup.number()
    .nullable()
    .when("Status", {
      is: 2, // Approved
      then: (schema) => schema.required("Approved By is required when status is Approved"),
      otherwise: (schema) => schema.nullable(),
    }),
  Status: Yup.number().required("Status is required"),
  JournalEntryLines: Yup.array()
    .of(lineValidationSchema)
    .min(1, "At least one journal entry line is required"),
});

export default function AddJournalEntry({ fetchItems }) {
  const [open, setOpen] = React.useState(false);
  const { parentAccounts, isLoading: isAccountsLoading } = useChartOfAccountParents();
  const { statuses, isLoading: isStatusesLoading } = useJournalEntryStatuses();
  const { users, isLoading: isUsersLoading } = useUsers();
  const handleClose = () => setOpen(false);
  const inputRef = useRef(null);

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleSubmit = (values) => {
    const payload = {
      JournalDate: values.JournalDate,
      ReferenceNo: values.ReferenceNo || null,
      Narration: values.Narration || null,
      ApprovedBy: values.ApprovedBy ? Number(values.ApprovedBy) : null,
      Status: Number(values.Status),
      JournalEntryLines: values.JournalEntryLines.map((line) => ({
        AccountId: Number(line.AccountId),
        Debit: parseFloat(line.Debit || 0),
        Credit: parseFloat(line.Credit || 0),
        Description: line.Description || null,
      })),
    };

    fetch(`${BASE_URL}/JournalEntry/CreateJournalEntry`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 200) {
          toast.success(data.message);
          setOpen(false);
          fetchItems();
        } else {
          toast.error(data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message || "Failed to create journal entry");
      });
  };

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        + New Journal Entry
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="bg-black">
          <Formik
            initialValues={{
              JournalDate: new Date().toISOString().split("T")[0],
              ReferenceNo: "",
              Narration: "",
              ApprovedBy: "",
              Status: statuses[0]?.value || "1",
              JournalEntryLines: [
                {
                  AccountId: "",
                  Debit: "",
                  Credit: "",
                  Description: "",
                },
              ],
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue }) => {
              const totalDebit = values.JournalEntryLines.reduce(
                (sum, line) => sum + (parseFloat(line.Debit || 0)),
                0
              );
              const totalCredit = values.JournalEntryLines.reduce(
                (sum, line) => sum + (parseFloat(line.Credit || 0)),
                0
              );

              return (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "500",
                          mb: "5px",
                        }}
                      >
                        Create Journal Entry
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Journal Date <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <Field
                        as={TextField}
                        type="date"
                        fullWidth
                        name="JournalDate"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        error={touched.JournalDate && Boolean(errors.JournalDate)}
                        helperText={touched.JournalDate && errors.JournalDate}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Status <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Field
                          as={TextField}
                          select
                          fullWidth
                          name="Status"
                          size="small"
                          onChange={(e) => {
                            setFieldValue("Status", e.target.value);
                          }}
                          disabled={isStatusesLoading || statuses.length === 0}
                          error={touched.Status && Boolean(errors.Status)}
                          helperText={touched.Status && errors.Status}
                        >
                          {statuses.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Reference No
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="ReferenceNo"
                        size="small"
                        inputRef={inputRef}
                        error={touched.ReferenceNo && Boolean(errors.ReferenceNo)}
                        helperText={touched.ReferenceNo && errors.ReferenceNo}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Approved By
                        {Number(values.Status) === 2 && <span style={{ color: "red" }}> *</span>}
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Field
                          as={TextField}
                          select
                          fullWidth
                          name="ApprovedBy"
                          size="small"
                          onChange={(e) => {
                            setFieldValue("ApprovedBy", e.target.value);
                          }}
                          disabled={isUsersLoading}
                          error={touched.ApprovedBy && Boolean(errors.ApprovedBy)}
                          helperText={touched.ApprovedBy && errors.ApprovedBy}
                        >
                          <MenuItem value="">None</MenuItem>
                          {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Narration
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        multiline
                        rows={3}
                        name="Narration"
                        size="small"
                        error={touched.Narration && Boolean(errors.Narration)}
                        helperText={touched.Narration && errors.Narration}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          Journal Entry Lines <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <FieldArray name="JournalEntryLines">
                          {({ push, remove }) => (
                            <Button
                              startIcon={<AddIcon />}
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                push({
                                  AccountId: "",
                                  Debit: "",
                                  Credit: "",
                                  Description: "",
                                })
                              }
                            >
                              Add Line
                            </Button>
                          )}
                        </FieldArray>
                      </Box>
                    </Grid>

                    <FieldArray name="JournalEntryLines">
                      {({ push, remove }) => (
                        <>
                          {values.JournalEntryLines.map((line, index) => (
                            <React.Fragment key={index}>
                              <Grid item xs={12} md={3}>
                                <Typography
                                  sx={{
                                    fontWeight: "500",
                                    fontSize: "12px",
                                    mb: "5px",
                                  }}
                                >
                                  Account <span style={{ color: "red" }}>*</span>
                                </Typography>
                                <FormControl fullWidth size="small">
                                  <Field
                                    as={TextField}
                                    select
                                    fullWidth
                                    name={`JournalEntryLines.${index}.AccountId`}
                                    size="small"
                                    onChange={(e) => {
                                      setFieldValue(`JournalEntryLines.${index}.AccountId`, e.target.value);
                                    }}
                                    disabled={isAccountsLoading}
                                    error={
                                      touched.JournalEntryLines?.[index]?.AccountId &&
                                      Boolean(errors.JournalEntryLines?.[index]?.AccountId)
                                    }
                                    helperText={
                                      touched.JournalEntryLines?.[index]?.AccountId &&
                                      errors.JournalEntryLines?.[index]?.AccountId
                                    }
                                  >
                                    {parentAccounts.map((option) => (
                                      <MenuItem key={option.id} value={option.id}>
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </Field>
                                </FormControl>
                              </Grid>

                              <Grid item xs={12} md={2}>
                                <Typography
                                  sx={{
                                    fontWeight: "500",
                                    fontSize: "12px",
                                    mb: "5px",
                                  }}
                                >
                                  Debit
                                </Typography>
                                <Field
                                  as={TextField}
                                  type="number"
                                  fullWidth
                                  name={`JournalEntryLines.${index}.Debit`}
                                  size="small"
                                  inputProps={{ step: "0.01", min: 0 }}
                                  error={
                                    touched.JournalEntryLines?.[index]?.Debit &&
                                    Boolean(errors.JournalEntryLines?.[index]?.Debit)
                                  }
                                  helperText={
                                    touched.JournalEntryLines?.[index]?.Debit &&
                                    errors.JournalEntryLines?.[index]?.Debit
                                  }
                                />
                              </Grid>

                              <Grid item xs={12} md={2}>
                                <Typography
                                  sx={{
                                    fontWeight: "500",
                                    fontSize: "12px",
                                    mb: "5px",
                                  }}
                                >
                                  Credit
                                </Typography>
                                <Field
                                  as={TextField}
                                  type="number"
                                  fullWidth
                                  name={`JournalEntryLines.${index}.Credit`}
                                  size="small"
                                  inputProps={{ step: "0.01", min: 0 }}
                                  error={
                                    touched.JournalEntryLines?.[index]?.Credit &&
                                    Boolean(errors.JournalEntryLines?.[index]?.Credit)
                                  }
                                  helperText={
                                    touched.JournalEntryLines?.[index]?.Credit &&
                                    errors.JournalEntryLines?.[index]?.Credit
                                  }
                                />
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <Typography
                                  sx={{
                                    fontWeight: "500",
                                    fontSize: "12px",
                                    mb: "5px",
                                  }}
                                >
                                  Description
                                </Typography>
                                <Field
                                  as={TextField}
                                  fullWidth
                                  name={`JournalEntryLines.${index}.Description`}
                                  size="small"
                                  error={
                                    touched.JournalEntryLines?.[index]?.Description &&
                                    Boolean(errors.JournalEntryLines?.[index]?.Description)
                                  }
                                  helperText={
                                    touched.JournalEntryLines?.[index]?.Description &&
                                    errors.JournalEntryLines?.[index]?.Description
                                  }
                                />
                              </Grid>

                              <Grid item xs={12} md={1}>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => {
                                    if (values.JournalEntryLines.length > 1) {
                                      remove(index);
                                    } else {
                                      toast.error("At least one line is required");
                                    }
                                  }}
                                  sx={{ mt: 3 }}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Grid>
                            </React.Fragment>
                          ))}
                        </>
                      )}
                    </FieldArray>

                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between" p={1} bgcolor="grey.100" borderRadius={1}>
                        <Typography sx={{ fontWeight: "600" }}>Total Debit: {totalDebit.toFixed(2)}</Typography>
                        <Typography sx={{ fontWeight: "600" }}>Total Credit: {totalCredit.toFixed(2)}</Typography>
                        <Typography
                          sx={{
                            fontWeight: "600",
                            color: totalDebit === totalCredit ? "success.main" : "error.main",
                          }}
                        >
                          Balance: {(totalDebit - totalCredit).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>

                    {touched.JournalEntryLines && errors.JournalEntryLines && typeof errors.JournalEntryLines === "string" && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="error">
                          {errors.JournalEntryLines}
                        </Typography>
                      </Grid>
                    )}

                    <Grid display="flex" justifyContent="space-between" item xs={12} p={1} mt={2}>
                      <Button variant="contained" size="small" color="error" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" size="small">
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}

