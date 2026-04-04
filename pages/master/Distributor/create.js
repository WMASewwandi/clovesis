import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogTitle from "@mui/material/DialogTitle";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import BASE_URL from "Base/api";

const validationSchema = Yup.object().shape({
  Name: Yup.string().required("Distributor Name is required"),
  MobileNo: Yup.string().required("Mobile number is required"),
});

export default function AddDistributorDialog({
  fetchItems,
  externalOpen,
  onClose: externalOnClose,
  showButton = true,
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [scroll, setScroll] = React.useState("paper");
  const [formKey, setFormKey] = useState(0);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleClickOpen = (scrollType) => () => {
    if (externalOpen === undefined) {
      setInternalOpen(true);
    }
    setScroll(scrollType);
  };

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else if (externalOpen === undefined) {
      setInternalOpen(false);
    }
    setFormKey((prev) => prev + 1);
  };

  React.useEffect(() => {
    if (open && externalOpen !== undefined) {
    }
  }, [open, externalOpen]);

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const handleSubmit = (values) => {
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/Distributor/CreateDistributor`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 200) {
          toast.success(data.message);
          handleClose();
          if (fetchItems) {
            fetchItems();
          }
        } else {
          toast.error(data.message);
        }
      })
      .catch((error) => {
        toast.error(
          error.message || "Distributor Creation failed. Please try again."
        );
      });
  };

  return (
    <>
      {showButton && (
        <Button variant="outlined" onClick={handleClickOpen("paper")}>
          <AddIcon
            sx={{
              position: "relative",
              top: "-2px",
            }}
            className="mr-5px"
          />{" "}
          + ADD NEW
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        maxWidth="sm"
      >
        <div className="bg-black">
          <DialogTitle id="scroll-dialog-title">
            Create Distributor
          </DialogTitle>
          <DialogContent>
            <Formik
              key={formKey}
              initialValues={{
                Code: "",
                Name: "",
                MobileNo: "",
                IsActive: true,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, values, setFieldValue }) => (
                <Form>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        Code
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="Code"
                        placeholder="Auto-generated code"
                        disabled
                        value={values.Code}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        Distributor Name
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="Name"
                        placeholder="Enter distributor name"
                        error={touched.Name && Boolean(errors.Name)}
                        helperText={touched.Name && errors.Name}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        component="label"
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "10px",
                          display: "block",
                        }}
                      >
                        Mobile Number
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="MobileNo"
                        placeholder="Enter mobile number"
                        error={touched.MobileNo && Boolean(errors.MobileNo)}
                        helperText={touched.MobileNo && errors.MobileNo}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.IsActive}
                            onChange={(e) =>
                              setFieldValue("IsActive", e.target.checked)
                            }
                            name="IsActive"
                          />
                        }
                        label="Active"
                      />
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button onClick={handleClose} color="inherit">
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                          Create
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
}
