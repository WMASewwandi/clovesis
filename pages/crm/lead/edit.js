import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
  Chip,
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
  firstName: Yup.string().trim().required("First Name is required"),
  lastName: Yup.string().trim().required("Last Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phone: Yup.string().trim(),
  company: Yup.string().trim(),
  stage: Yup.string().nullable().required("Stage is required"),
  source: Yup.string().trim().required("Source is required"),
  leadScore: Yup.number(), // <-- 1. Added validation
  tags: Yup.array().of(Yup.string()),
});

const LEAD_STAGE_MAP = {
  1: "New",
  2: "Contacted",
  3: "Qualified",
  4: "Unqualified",
};

const parseTags = (tags, map) => {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags
    .map(tagId => map[tagId])
    .filter(Boolean);
};

export default function EditLead({ fetchItems, item }) {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const inputRef = useRef(null);

  const [tagOptions, setTagOptions] = useState([]);
  const [stageOptions, setStageOptions] = useState([]);
  const [tagMap, setTagMap] = useState({});
  const { data: apiResponse, loading: enumsLoading } = useApi("/Enums/crm");

  useEffect(() => {
    if (apiResponse && apiResponse.leadStages) {
      const stages = Object.values(apiResponse.leadStages || {});
      const tags = Object.values(apiResponse.leadTags || {});
      
      setStageOptions(stages);
      setTagOptions(tags);
      setTagMap(apiResponse.leadTags || {});
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
    // 3. Ensure leadScore is a number, just like in CreateLead.js
    const payload = {
      ...values,
      leadScore: Number(values.leadScore) || 0,
    };

    fetch(`${BASE_URL}/Leads/UpdateLead`, {
      method: "POST",
      body: JSON.stringify(payload), // Send the modified payload
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "Lead updated successfully!");
          handleClose();
          
          if (typeof fetchItems === 'function') {
            fetchItems();
          } else {
            console.error("fetchItems prop is not a function!");
          }
        } else {
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(" ");
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
              id: item.id,
              firstName: item.firstName || "",
              lastName: item.lastName || "",
              company: item.company || "",
              email: item.email || "",
              phone: item.phone || "",
              stage: LEAD_STAGE_MAP[item.stage] || "New",
              source: item.source || "",
              leadScore: item.leadScore || 0, // <-- 2. Added initial value
              tags: parseTags(item.tags, tagMap),
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
                      Edit Lead
                    </Typography>
                  </Grid>
                  <Box sx={{ maxHeight: "60vh", overflowY: "auto", width: "100%", paddingRight: "10px" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          First Name
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="firstName"
                          inputRef={inputRef}
                          error={touched.firstName && Boolean(errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Last Name
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="lastName"
                          error={touched.lastName && Boolean(errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Email
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
                          Phone
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
                          Company
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="company"
                          error={touched.company && Boolean(errors.company)}
                          helperText={touched.company && errors.company}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Source
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="source"
                          error={touched.source && Boolean(errors.source)}
                          helperText={touched.source && errors.source}
                        />
                      </Grid>

                      {/* --- ADDED LEAD SCORE --- */}
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Lead Score
                        </Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="leadScore"
                          type="number"
                          error={touched.leadScore && Boolean(errors.leadScore)}
                          helperText={touched.leadScore && errors.leadScore}
                        />
                      </Grid>

                      {/* --- MODIFIED STAGE FIELD --- */}
                      <Grid item xs={12}>
                        <Typography sx={{ fontWeight: "500", mb: "5px" }}>
                          Stage
                        </Typography>
                        <Autocomplete
                          options={stageOptions}
                          loading={enumsLoading}
                          value={values.stage}
                          onChange={(event, newValue) => {
                            setFieldValue("stage", newValue);
                          }}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              placeholder="Select Stage" // Removed label
                              error={touched.stage && Boolean(errors.stage)}
                              helperText={touched.stage && errors.stage}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Autocomplete
                          multiple
                          freeSolo 
                          options={tagOptions} 
                          loading={enumsLoading}
                          value={values.tags}
                          onChange={(event, newValue) => {
                            setFieldValue("tags", newValue);
                          }}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                variant="outlined"
                                label={option}
                                {...getTagProps({ index })}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              label="Tags"
                              placeholder="Add or select tags"
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