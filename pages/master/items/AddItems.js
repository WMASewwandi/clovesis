import React, { useEffect, useRef, useState } from "react";
import { Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChartOfAccountType } from "@/components/types/types";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 700, xs: 350 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

const validationSchema = Yup.object().shape({
  Name: Yup.string().required("Item Name is required"),
  Code: Yup.string().required("Item Code is required"),
  CategoryId: Yup.number().required("Category is required"),
  SubCategoryId: Yup.number().required("Sub Category is required"),
  Supplier: Yup.number().required("Supplier is required"),
  UOM: Yup.number().required("Unit of Measure is required"),
});

export default function AddItems({ fetchItems, isPOSSystem, uoms, isGarmentSystem, chartOfAccounts, barcodeEnabled }) {
  const [itemCode, setItemCode] = useState(null);
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const [selectedCat, setSelectedCat] = useState();
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
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

  const handleOpen = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/DocumentSequence/GetNextDocumentNumber?documentType=13`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const result = await response.json();
      setItemCode(result.result);
    } catch (err) {
      //
    }
    setOpen(true);
  };


  const fetchSupplierList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Supplier/GetAllSupplier`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Supplier List");
      }

      const data = await response.json();
      setSupplierList(data.result);
    } catch (error) {
      console.error("Error fetching Supplier List:", error);
    }
  };
  const fetchCategoryList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Category/GetAllCategory`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setCategoryList(data.result);
    } catch (error) {
      console.error("Error", error);
    }
  };
  const fetchSubCategoryList = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/SubCategory/GetAllSubCategory`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      const filteredItems = data.result.filter(
        (item) => item.categoryId === id
      );
      setSubCategoryList(filteredItems);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchCategoryList();
    fetchSupplierList();
  }, []);

  const handleCategorySelect = (event) => {
    setSelectedCat(event.target.value);
    fetchSubCategoryList(event.target.value);
  };
  const handleSubmit = (values) => {
    fetch(`${BASE_URL}/Items/CreateItems`, {
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
        + new item
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
              Code: itemCode,
              AveragePrice: "",
              ShipmentTarget: null,
              ReorderLevel: null,
              CategoryId: "",
              SubCategoryId: "",
              Supplier: "",
              UOM: "",
              Barcode: "",
              CostAccount: null,
              AssetsAccount: null,
              IncomeAccount: null,
              IsActive: true,
              IsNonInventoryItem: false,
              HasSerialNumbers: false,
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
                      Add Item
                    </Typography>
                  </Grid>
                  <Box sx={{ height: "50vh", overflowY: "scroll" }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} lg={6}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            mb: "5px",
                          }}
                        >
                          Item Name
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="Name"
                          size="small"
                          inputRef={inputRef}
                          error={touched.Name && Boolean(errors.Name)}
                          helperText={touched.Name && errors.Name}
                        />
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Item Code
                        </Typography>
                        <Field
                          as={TextField}
                          size="small"
                          fullWidth
                          name="Code"
                          error={touched.Code && Boolean(errors.Code)}
                          helperText={touched.Code && errors.Code}
                        />
                      </Grid>
                      <Grid item xs={12} lg={6} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Category
                        </Typography>
                        <FormControl fullWidth>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="CategoryId"
                            size="small"
                            onChange={(e) => {
                              setFieldValue("CategoryId", e.target.value);
                              handleCategorySelect(e);
                            }}
                          >
                            {categoryList.length === 0 ? (
                              <MenuItem disabled color="error">
                                No Categories Available
                              </MenuItem>
                            ) : (
                              categoryList.map((category, index) => (
                                <MenuItem key={index} value={category.id}>
                                  {category.name}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                          {touched.CategoryId && Boolean(errors.CategoryId) && (
                            <Typography variant="caption" color="error">
                              {errors.CategoryId}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={6} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Sub Category
                        </Typography>
                        <FormControl fullWidth>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="SubCategoryId"
                            size="small"
                            onChange={(e) => {
                              setFieldValue("SubCategoryId", e.target.value);
                            }}
                          >
                            {!selectedCat ? (
                              <MenuItem disabled>
                                Please Select Category First
                              </MenuItem>
                            ) : subCategoryList.length === 0 ? (
                              <MenuItem disabled>
                                No Sub Categories Available
                              </MenuItem>
                            ) : (
                              subCategoryList.map((subcategory, index) => (
                                <MenuItem key={index} value={subcategory.id}>
                                  {subcategory.name}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                          {touched.SubCategoryId &&
                            Boolean(errors.SubCategoryId) && (
                              <Typography variant="caption" color="error">
                                {errors.SubCategoryId}
                              </Typography>
                            )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={6} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Supplier
                        </Typography>
                        <FormControl fullWidth>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="Supplier"
                            size="small"
                            onChange={(e) => {
                              setFieldValue("Supplier", e.target.value);
                            }}
                          >
                            {supplierList.length === 0 ? (
                              <MenuItem disabled>
                                No Suppliers Available
                              </MenuItem>
                            ) : (
                              supplierList.map((supplier, index) => (
                                <MenuItem key={index} value={supplier.id}>
                                  {supplier.name}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                          {touched.Supplier && Boolean(errors.Supplier) && (
                            <Typography variant="caption" color="error">
                              {errors.Supplier}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      {isPOSSystem && (
                        <>
                          <Grid item xs={12} mt={1} lg={6}>
                            <Typography
                              sx={{
                                fontWeight: "500",
                                fontSize: "14px",
                                mb: "5px",
                              }}
                            >
                              Average Price
                            </Typography>
                            <Field
                              as={TextField}
                              fullWidth
                              name="AveragePrice"
                              size="small"
                            />
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12} mt={1} lg={6}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Reorder Level
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="ReorderLevel"
                          size="small"
                          type="number"
                          onChange={(e) => {
                            const value = e.target.value;
                            setFieldValue("ReorderLevel", value === '' ? null : value);
                          }}
                        />
                      </Grid>
                      {isGarmentSystem && (
                        <>
                          <Grid item xs={12} mt={1} lg={6}>
                            <Typography
                              sx={{
                                fontWeight: "500",
                                fontSize: "14px",
                                mb: "5px",
                              }}
                            >
                              Shipment Target
                            </Typography>
                            <Field
                              as={TextField}
                              fullWidth
                              name="ShipmentTarget"
                              size="small"
                              type="number"
                              onChange={(e) => {
                                const value = e.target.value;
                                setFieldValue("ShipmentTarget", value === '' ? null : value);
                              }}
                            />
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12} lg={6} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Unit of Measure
                        </Typography>
                        <FormControl fullWidth>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="UOM"
                            size="small"
                          >
                            {uoms.length === 0 ? (
                              <MenuItem disabled>No UOM Available</MenuItem>
                            ) : (
                              uoms.map((uom, index) => (
                                <MenuItem key={index} value={uom.id}>
                                  {uom.name}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                          {touched.UOM && Boolean(errors.UOM) && (
                            <Typography variant="caption" color="error">
                              {errors.UOM}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={6} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Cost Account
                        </Typography>
                        <FormControl fullWidth>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="CostAccount"
                            size="small"
                            onChange={(e) => {
                              setFieldValue("CostAccount", e.target.value);
                            }}
                          >
                            {chartOfAccounts.length === 0 ? (
                              <MenuItem disabled>
                                No Accounts Available
                              </MenuItem>
                            ) : (
                              chartOfAccounts.map((acc, index) => (
                                <MenuItem key={index} value={acc.id}>
                                  {acc.code} - {acc.description}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={6} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Income Account
                        </Typography>
                        <FormControl fullWidth>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="IncomeAccount"
                            size="small"
                            onChange={(e) => {
                              setFieldValue("IncomeAccount", e.target.value);
                            }}
                          >
                            {chartOfAccounts.length === 0 ? (
                              <MenuItem disabled>
                                No Accounts Available
                              </MenuItem>
                            ) : (
                              chartOfAccounts.map((acc, index) => (
                                <MenuItem key={index} value={acc.id}>
                                  {acc.code} - {acc.description}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={6} mt={1}>
                        <Typography
                          sx={{
                            fontWeight: "500",
                            fontSize: "14px",
                            mb: "5px",
                          }}
                        >
                          Assets Account
                        </Typography>
                        <FormControl fullWidth>
                          <Field
                            as={TextField}
                            select
                            fullWidth
                            name="AssetsAccount"
                            size="small"
                            onChange={(e) => {
                              setFieldValue("AssetsAccount", e.target.value);
                            }}
                          >
                            {chartOfAccounts.length === 0 ? (
                              <MenuItem disabled>
                                No Accounts Available
                              </MenuItem>
                            ) : (
                              chartOfAccounts.map((acc, index) => (
                                <MenuItem key={index} value={acc.id}>
                                  {acc.code} - {acc.description}
                                </MenuItem>
                              ))
                            )}
                          </Field>
                        </FormControl>
                      </Grid>
                      {barcodeEnabled && (
                        <Grid item xs={12} lg={6} mt={1}>
                          <Typography
                            sx={{
                              fontWeight: "500",
                              mb: "5px",
                            }}
                          >
                            Barcode
                          </Typography>
                          <Field
                            as={TextField}
                            fullWidth
                            name="Barcode"
                            size="small"
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} p={1}>
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
                        <FormControlLabel
                          control={
                            <Field
                              as={Checkbox}
                              name="IsNonInventoryItem"
                              checked={values.IsNonInventoryItem}
                              onChange={() =>
                                setFieldValue("IsNonInventoryItem", !values.IsNonInventoryItem)
                              }
                            />
                          }
                          label="Inventory Item"
                        />
                        <FormControlLabel
                          control={
                            <Field
                              as={Checkbox}
                              name="HasSerialNumbers"
                              checked={values.HasSerialNumbers}
                              onChange={() =>
                                setFieldValue("HasSerialNumbers", !values.HasSerialNumbers)
                              }
                            />
                          }
                          label="Serial Numbers Available"
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
