import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Autocomplete,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import useApi from "@/components/utils/useApi";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 600, xs: 350 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

const validationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  phone: Yup.string().trim().required("Phone is required"),
  industry: Yup.string().trim().nullable(),
  website: Yup.string().trim().url("Invalid URL format").nullable(),
  billingAddress: Yup.string().trim().nullable(),
  shippingAddress: Yup.string().trim().nullable(),
  size: Yup.number().nullable().positive("Size must be a positive number").integer("Size must be an integer"),
  annualRevenue: Yup.number().nullable().min(0, "Annual revenue cannot be negative"),
  tags: Yup.array().min(1, "At least one tag is required").required("Tags are required"),
});

const getOptionsFromEnum = (enumObj) => {
  if (!enumObj) return [];
  return Object.entries(enumObj).map(([key, value]) => ({
    key: parseInt(key, 10),
    value,
  }));
};

const findOptionsByKeys = (options, itemTags) => {
  let tagIds = [];
  try {
    if (typeof itemTags === 'string') {
      tagIds = JSON.parse(itemTags);
    } else if (Array.isArray(itemTags)) {
      tagIds = itemTags;
    }
  } catch (e) {
    console.error("Failed to parse tags for edit modal:", itemTags, e);
  }
  
  if (!Array.isArray(tagIds)) return [];
  
  return tagIds
    .map(id => options.find(opt => opt.key === id))
    .filter(Boolean);
};

export default function EditAccount({ fetchItems, item }) {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const inputRef = useRef(null);

  const [tagOptions, setTagOptions] = useState([]);

  const { data: apiResponse, loading: enumsLoading } = useApi("/Enums/crm");

  useEffect(() => {
    if (apiResponse) {
      const tags = getOptionsFromEnum(apiResponse.leadTags);
      setTagOptions(tags);
    }
  }, [apiResponse]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      industry: values.industry || null,
      website: values.website || null,
      billingAddress: values.billingAddress || null,
      shippingAddress: values.shippingAddress || null,
      size: values.size ? parseInt(values.size, 10) : null,
      annualRevenue: values.annualRevenue ? parseFloat(values.annualRevenue) : null,
      tags: values.tags.map(t => t.key),
    };

    fetch(`${BASE_URL}/Account/UpdateAccount`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "Account updated successfully!");
          handleClose();
          
          if (typeof fetchItems === 'function') {
            fetchItems();
          } else {
            console.error("fetchItems prop is not a function!");
          }
        } else {
          if (response.status === 400 || response.status === 409 || data.errors) {
            const errorMessages = data.errors ? Object.values(data.errors).flat().join(" ") : data.message;
            toast.error(errorMessages || "An error occurred.");
          } else {
            toast.error(data.message || "An error occurred.");
          }
        }
      })
      .catch((error) => {
        toast.error(error.message || "An error occurred.");
      });
  };

  return (
    <>
      <Tooltip title="Edit Account" placement="top">
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
              id: item.id,
              name: item.name || "",
              industry: item.industry || "",
              website: item.website || "",
              phone: item.phone || "",
              billingAddress: item.billingAddress || "",
              shippingAddress: item.shippingAddress || "",
              size: item.size || "",
              annualRevenue: item.annualRevenue || "",
              tags: findOptionsByKeys(tagOptions, item.tags), 
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize 
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "500",
                        mb: "15px",
                      }}
                    >
                      Edit Account
                    </Typography>
                  </Grid>
                  <Box sx={{ maxHeight: "60vh", overflowY: "auto", width: "100%", paddingRight: "10px" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Name*
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="name"
                          inputRef={inputRef}
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Industry
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="industry"
                          error={touched.industry && Boolean(errors.industry)}
                          helperText={touched.industry && errors.industry}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Website
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="website"
                          error={touched.website && Boolean(errors.website)}
                          helperText={touched.website && errors.website}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Phone*
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="phone"
                          error={touched.phone && Boolean(errors.phone)}
                          helperText={touched.phone && errors.phone}
                        />
                      </Grid>

                       <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Billing Address
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="billingAddress"
                          error={touched.billingAddress && Boolean(errors.billingAddress)}
                          helperText={touched.billingAddress && errors.billingAddress}
                        />
                      </Grid>

                       <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Shipping Address
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="shippingAddress"
                          error={touched.shippingAddress && Boolean(errors.shippingAddress)}
                          helperText={touched.shippingAddress && errors.shippingAddress}
                        />
                      </Grid>

                       <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Size
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="size"
                          type="number"
                          error={touched.size && Boolean(errors.size)}
                          helperText={touched.size && errors.size}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Annual Revenue
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="annualRevenue"
                          type="number"
                          error={touched.annualRevenue && Boolean(errors.annualRevenue)}
                          helperText={touched.annualRevenue && errors.annualRevenue}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Tags*
                        </Typography>
                        <Autocomplete
                          multiple
                          options={tagOptions} 
                          loading={enumsLoading}
                          value={values.tags}
                          getOptionLabel={(option) => option.value || ""}
                          isOptionEqualToValue={(option, value) => option.key === value.key}
                          onChange={(event, newValue) => {
                            setFieldValue("tags", newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              placeholder="Select Tags"
                              error={touched.tags && Boolean(errors.tags)}
                              helperText={touched.tags && errors.tags}
                            />
                          )}
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
                      mt={2}
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