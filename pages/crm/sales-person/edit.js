import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import BorderColorIcon from "@mui/icons-material/BorderColor";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 400, xs: 350 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

const validationSchema = Yup.object().shape({
  Code: Yup.string().required("Code is required"),
  Name: Yup.string().required("Name is required"),
  MobileNumber: Yup.string().required("Mobile Number is required"),
  SalesTarget: Yup.string().required("Sales Target is required"),
  Range: Yup.string().required("Time Period is required"),
});

export default function EditSalesPerson({ item, fetchItems }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const inputRef = useRef(null);

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
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/SalesPerson/UpdateSalesPerson`, {
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
          toast.success(data.result.message);
          setOpen(false);
          fetchItems();
        } else {
          toast.error(data.result.message);
        }
      })
      .catch((error) => {
        toast.error(error.message || "");
      });
  };

  return (
    <>
      <Tooltip title="Edit" placement="top">
        <IconButton onClick={handleOpen} aria-label="edit" size="small">
          <BorderColorIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="bg-black">
          <Formik
            initialValues={{
              Id: item.id,
              Code: item.code || "",
              Name: item.name || "",
              MobileNumber: item.mobileNumber || "",
              SupplierId: null,
              Remark: item.remark || "",
              SalesTarget: item.salesTarget || null,
              Range: item.range || null
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form>
                <Box>
                  <Grid spacing={1} container>
                    <Grid item xs={12}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "500",
                          mb: "12px",
                        }}
                      >
                        Edit Sales Person
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ maxHeight: '70vh', overflowY: 'scroll' }} pb={3}>
                  <Grid spacing={1} container>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Code
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        disabled
                        name="Code"
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Name
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="Name"
                        error={touched.Name && Boolean(errors.Name)}
                        helperText={touched.Name && errors.Name}
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Mobile Number
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="MobileNumber"
                        error={touched.MobileNumber && Boolean(errors.MobileNumber)}
                        helperText={touched.MobileNumber && errors.MobileNumber}
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Target Time Period
                      </Typography>
                      <Select fullWidth value={values.Range} onChange={(e) => setFieldValue("Range", e.target.value)}>
                        <MenuItem value={6}>Daily</MenuItem>
                        <MenuItem value={9}>Weekly</MenuItem>
                        <MenuItem value={7}>Monthly</MenuItem>
                        <MenuItem value={8}>Yearly</MenuItem>
                      </Select>
                      {touched.Range && Boolean(errors.Range) && (
                        <Typography variant="caption" color="error">
                          {errors.Range}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Sales Target
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="SalesTarget"
                        error={touched.SalesTarget && Boolean(errors.SalesTarget)}
                        helperText={touched.SalesTarget && errors.SalesTarget}
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Remark
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="Remark"
                      />
                    </Grid>
                  </Grid>
                </Box>
                <Box display="flex" mt={2} justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    Save
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}
