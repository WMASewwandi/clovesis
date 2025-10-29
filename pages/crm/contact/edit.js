// FileName: edit.js (for ContactCRM)
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

// --- FIX 1: Updated Validation Schema ---
const validationSchema = Yup.object().shape({
  firstname: Yup.string().trim().required("First Name is required"),
  lastname: Yup.string().trim().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string().trim().required("Phone is required"),
  title: Yup.string().trim(),
  lifeCycleStage: Yup.object().nullable().required("Lifecycle Stage is required"),
  // Changed from 'tag' to 'tags' and validated as an array
  tags: Yup.array().min(1, "At least one tag is required").required("Tags are required"),
});
// ----------------------------------------

// Helper to convert enum object to array for Autocomplete
const getOptionsFromEnum = (enumObj) => {
  if (!enumObj) return [];
  return Object.entries(enumObj).map(([key, value]) => ({
    key: parseInt(key, 10),
    value,
  }));
};

// Helper to find the {key, value} object from the enum key
const findOptionByKey = (options, key) => {
  return options.find((opt) => opt.key === key) || null;
};

// --- FIX 2: Added Helper to find multiple options from an array of keys ---
// This handles parsing the string "[2]" or array [2] from item.tags
const findOptionsByKeys = (options, itemTags) => {
  let tagIds = [];
  try {
    if (typeof itemTags === 'string') {
      tagIds = JSON.parse(itemTags); // Converts "[2]" to [2]
    } else if (Array.isArray(itemTags)) {
      tagIds = itemTags; // Already [2]
    }
  } catch (e) {
    console.error("Failed to parse tags for edit modal:", itemTags, e);
  }
  
  if (!Array.isArray(tagIds)) return [];
  
  return tagIds
    .map(id => options.find(opt => opt.key === id))
    .filter(Boolean); // filter(Boolean) removes any nulls
};
// -------------------------------------------------------------------

export default function EditContactCRM({ fetchItems, item }) {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const inputRef = useRef(null);

  const [tagOptions, setTagOptions] = useState([]);
  const [lifeCycleStageOptions, setLifeCycleStageOptions] = useState([]);

  const { data: apiResponse, loading: enumsLoading } = useApi("/Enums/crm");

  useEffect(() => {
    if (apiResponse) {
      const tags = getOptionsFromEnum(apiResponse.leadTags);
      const stages = getOptionsFromEnum(apiResponse.lifeCycleStages);
      
      setTagOptions(tags);
      setLifeCycleStageOptions(stages);
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

  // --- FIX 3: Updated handleSubmit ---
  const handleSubmit = (values) => {
    // Flatten the object for the payload
    const payload = {
      ...values,
      lifeCycleStage: values.lifeCycleStage?.key || 0,
      // Convert array of objects back to array of keys
      tags: values.tags.map(t => t.key), 
    };

    fetch(`${BASE_URL}/ContactCRM/UpdateContactCRM`, {
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
          toast.success(data.message || "Contact updated successfully!");
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
  // ------------------------------------

  return (
    <>
      <Tooltip title="Edit Contact" placement="top">
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
            // --- FIX 4: Updated initialValues ---
            initialValues={{
              id: item.id,
              firstname: item.firstname || "",
              lastname: item.lastname || "",
              email: item.email || "",
              phone: item.phone || "",
              title: item.title || "",
              lifeCycleStage: findOptionByKey(lifeCycleStageOptions, item.lifeCycleStage),
              // Use the new helper function and 'item.tags' (plural)
              tags: findOptionsByKeys(tagOptions, item.tags), 
            }}
            // -------------------------------------
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize // Important to update form when enums load
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
                      Edit Contact
                    </Typography>
                  </Grid>
                  <Box sx={{ maxHeight: "60vh", overflowY: "auto", width: "100%", paddingRight: "10px" }}>
                    <Grid container spacing={2}>
                      {/* ... Other fields (firstname, lastname, email, etc.) ... */}
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          First Name*
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="firstname"
                          inputRef={inputRef}
                          error={touched.firstname && Boolean(errors.firstname)}
                          helperText={touched.firstname && errors.firstname}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Last Name*
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="lastname"
                          error={touched.lastname && Boolean(errors.lastname)}
                          helperText={touched.lastname && errors.lastname}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Email*
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="email"
                          type="email"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
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
                          Title
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="title"
                          error={touched.title && Boolean(errors.title)}
                          helperText={touched.title && errors.title}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Lifecycle Stage*
                        </Typography>
                        <Autocomplete
                          options={lifeCycleStageOptions}
                          loading={enumsLoading}
                          value={values.lifeCycleStage}
                          getOptionLabel={(option) => option.value || ""}
                          isOptionEqualToValue={(option, value) => option.key === value.key}
                          onChange={(event, newValue) => {
                            setFieldValue("lifeCycleStage", newValue);
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              placeholder="Select Lifecycle Stage"
                              error={touched.lifeCycleStage && Boolean(errors.lifeCycleStage)}
                              helperText={touched.lifeCycleStage && errors.lifeCycleStage}
                            />
                          )}
                        />
                      </Grid>

                      {/* --- FIX 5: Updated Tags Field --- */}
                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Tags*
                        </Typography>
                        <Autocomplete
                          multiple // Added this
                          options={tagOptions} 
                          loading={enumsLoading}
                          value={values.tags} // Changed to 'tags'
                          getOptionLabel={(option) => option.value || ""}
                          isOptionEqualToValue={(option, value) => option.key === value.key}
                          onChange={(event, newValue) => {
                            setFieldValue("tags", newValue); // Changed to 'tags'
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              placeholder="Select Tags" // Updated placeholder
                              error={touched.tags && Boolean(errors.tags)} // Changed to 'tags'
                              helperText={touched.tags && errors.tags} // Changed to 'tags'
                            />
                          )}
                        />
                      </Grid>
                      {/* ---------------------------------- */}

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