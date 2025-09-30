import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import useApi from "@/components/utils/useApi";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency } from "@/components/utils/formatHelper";

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
  Name: Yup.string().required("Name is required"),
  SellingPrice: Yup.string().required("Price is required"),
});

export default function CreateComboMeal({ fetchItems }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [mealList, setMealList] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setImage(null);
    setFile(null);
    // setMenuItems([]);
  };
  const [image, setImage] = useState(null);
  const { data: menuList } = useApi("/MenuList/GetAll");

  useEffect(() => {
    if (menuList) {
      setMenuItems(menuList);
    }
  }, [menuList]);

  const handlePortionChange = (index, field, value) => {
    setMealList((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSetMealList = (item) => {
    console.log(item);

    var newItem = {
      menuListId: item.id,
      name: item.name,
      pricing: item.pricing,
      portionId: null,
      isOptional: false,
      isDefault: false
    };
    setMealList((prev) => {
      if (prev.some((p) => p.menuListId === newItem.menuListId)) {
        toast.warning("This Item is already added!");
        return prev;
      }
      return [...prev, newItem];
    });
  }

  const handleDelete = (index) => {
    setMealList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);

      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (values) => {

    if (!priceList.length) {
      toast.error("At least one price list item is required.");
      return;
    }

    const invalidItem = priceList.find(item => !item.sellingPrice || item.sellingPrice <= 0);
    if (invalidItem) {
      toast.error("All price list items must have a valid selling price.");
      return;
    }

    const data = {
      ...values,
      ProductImage: file ? file : null,
      MenuPricing: priceList.map((row) => ({
        PortionId: row.portionId,
        SellingPrice: row.sellingPrice,
        CostPrice: row.costPrice,
        Tax: row.tax
      }))
    };

    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          Object.keys(item).forEach((subKey) => {
            formData.append(`${key}[${index}].${subKey}`, item[subKey]);
          });
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    handleClose();
    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/MenuList/CreateMenuItem`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
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
              Description: "",
              From: null,
              To: null,
              ActualPrice: null,
              SellingPrice: null,
              IsActive: true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "500",
                      mb: "12px",
                    }}
                  >
                    Add Combo Meal
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: '70vh', overflowY: 'scroll' }}>
                  <Grid spacing={1} container>
                    <Grid item xs={12} mt={1}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} order={{ xs: 2, lg: 1 }} lg={8}>
                          <Grid container>
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
                                Description
                              </Typography>
                              <Field
                                as={TextField}
                                fullWidth
                                name="Description"
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          order={{ xs: 1, lg: 2 }}
                          lg={4}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: { xs: 200, lg: 'auto' },
                            position: 'relative'
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              border: '1px solid #e5e5e5',
                              borderRadius: 1,
                              p: 2,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer',
                              backgroundColor: '#fafafa',
                              overflow: 'hidden',
                              position: 'relative'
                            }}
                            onClick={() => document.getElementById('image-upload-input').click()}
                          >
                            {image ? (
                              <>
                                <img
                                  src={image}
                                  alt="uploaded"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '4px'
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImage(null);
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Click to upload image
                              </Typography>
                            )}
                          </Box>
                          <input
                            id="image-upload-input"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Selling Price
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="SellingPrice"
                        error={touched.SellingPrice && Boolean(errors.SellingPrice)}
                        helperText={touched.SellingPrice && errors.SellingPrice}
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
                        From
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="From"
                        type="date"
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
                        To
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="To"
                        type="date"
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography variant="h6">Add Menu Items</Typography>
                    </Grid>
                     <Grid item xs={12} mt={1}>
                      <Autocomplete
                        fullWidth
                        options={menuItems}
                        getOptionLabel={(option) => option.name || ""}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleSetMealList(newValue);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Select Items" variant="outlined" />
                        )}
                        clearOnBlur
                        clearOnEscape
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Portion</TableCell>
                              <TableCell>Is Default</TableCell>
                              <TableCell>Is Optional</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mealList.length === 0 ?
                              <Typography p={1} color="error">No Data Available</Typography> :
                              (mealList.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>
                                    <Select sx={{width: '150px'}} value={item.portionId} size="small" onChange={(e) => handlePortionChange(index, "portionId", e.target.value)}>
                                      {item.pricing.length === 0 ? 
                                      <MenuItem>No Data Available</MenuItem> : (
                                        item.pricing.map((price,i)=>(
                                          <MenuItem key={i} value={price.portionId}>
                                            {price.portionName} - {formatCurrency(price.sellingPrice)}
                                          </MenuItem>
                                        ))
                                      )}
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Checkbox/>
                                  </TableCell>
                                  <TableCell>
                                    <Checkbox/>
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDelete(index)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    {/*<Grid item xs={6} lg={4} mt={1}>
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
                    <Grid item xs={6} lg={4} mt={1}>
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="IsComboMeal"
                            checked={values.IsComboMeal}
                            onChange={() =>
                              setFieldValue("IsComboMeal", !values.IsComboMeal)
                            }
                          />
                        }
                        label="Combo Meal"
                      />
                    </Grid>
                    <Grid item xs={6} lg={4} mt={1}>
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="IsInventoryItem"
                            checked={values.IsInventoryItem}
                            onChange={() =>
                              setFieldValue("IsInventoryItem", !values.IsInventoryItem)
                            }
                          />
                        }
                        label="Inventory Item"
                      />
                    </Grid>
                    <Grid item xs={6} lg={4} mt={1}>
                      <FormControlLabel
                        control={
                          <Field
                            as={Checkbox}
                            name="IsWebView"
                            checked={values.IsWebView}
                            onChange={() =>
                              setFieldValue("IsWebView", !values.IsWebView)
                            }
                          />
                        }
                        label="Is WebView"
                      />
                    </Grid> */}
                  </Grid>
                </Box>
                <Box display="flex" mt={2} justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleClose}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" size="small">
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
