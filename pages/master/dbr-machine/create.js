import React, { useEffect, useRef, useState } from "react";
import { Checkbox, FormControlLabel, Grid, MenuItem, Select, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useApi from "@/components/utils/useApi";

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
  Name: Yup.string().required("Name is required"),
  SupplierId: Yup.string().required("Please Select Supplier"),
});

export default function AddDBRMachine({ fetchItems }) {
  const [open, setOpen] = React.useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const handleClose = () => setOpen(false);

  const { data: supplierList } = useApi("/Supplier/GetAllSupplier");

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

  const fetchSalesPerson = async (supplierId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/SalesPerson/GetSalesPersonsBySupplier?supplierId=${supplierId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Neck Body List");
      }
      const data = await response.json();
      setSalesPersons(data);
    } catch (error) {
      console.error("Error fetching Neck Body List:", error);
    }
  };

  useEffect(() => {
    if (supplierList) {
      setSuppliers(supplierList);
    }
  }, [supplierList]);

  const handleOpen = async () => {
    setOpen(true);
  };

  const handleSubmit = (values) => {
    fetch(`${BASE_URL}/DBRMachine/CreateMachine`, {
      method: "POST",
      body: JSON.stringify(values),
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
        toast.error(error.message || "");
      });
  };

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        + add new
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
              Name: "",
              SupplierId: null,
              SalesPersonId: null,
              IsActive: true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue, resetForm }) => (
              <Form>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "500",
                        mb: "5px",
                      }}
                    >
                      Add DBR Machine
                    </Typography>
                  </Grid>
                  <Box sx={{ maxHeight: '60vh', overflowY: 'scroll' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            mb: "5px",
                          }}
                        >
                          Name
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="Name"
                          inputRef={inputRef}
                          error={touched.Name && Boolean(errors.Name)}
                          helperText={touched.Name && errors.Name}
                        />
                      </Grid>
                      <Grid item xs={12} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            mb: "5px",
                          }}
                        >
                          Supplier
                        </Typography>
                        <Select
                          fullWidth
                          value={values.SupplierId}
                          onChange={(e) => {
                            setFieldValue("SupplierId", e.target.value);
                            fetchSalesPerson(e.target.value);
                            setFieldValue("SalesPersonId", null);
                          }}
                        >
                          {suppliers.length === 0 ? <MenuItem value="">No Suppliers Available</MenuItem>
                            : (suppliers.map((supplier) => (
                              <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                            )))}
                        </Select>
                        {touched.SupplierId && Boolean(errors.SupplierId) && (
                          <Typography variant="caption" color="error">
                            {errors.SupplierId}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            mb: "5px",
                          }}
                        >
                          Sales Person
                        </Typography>
                        <Select
                          fullWidth
                          value={values.SalesPersonId}
                          onChange={(e) => {
                            setFieldValue("SalesPersonId", e.target.value);
                          }}
                        >
                          {salesPersons.length === 0 ? <MenuItem value="">No Sales Persons Available</MenuItem>
                            : (salesPersons.map((persons) => (
                              <MenuItem key={persons.id} value={persons.id}>{persons.name}</MenuItem>
                            )))}
                        </Select>
                      </Grid>
                      <Grid item xs={12} mt={1} p={1}>
                        <FormControlLabel
                          control={
                            <Field
                              as={Checkbox}
                              name="IsActive"
                              checked={values.IsActive}
                              onChange={() =>
                                setFieldValue("IsActive", !values.IsActive)
                              }
                            />
                          }
                          label="Active"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Grid container>
                    <Grid
                      display="flex"
                      justifyContent="space-between"
                      item
                      xs={12}
                      p={1}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" size="small">
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}
