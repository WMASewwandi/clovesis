import React, { useState, useEffect } from "react";
import {
  Grid,
  IconButton,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";
import useApi from "@/components/utils/useApi";
import RichTextEditor from "@/components/help-desk/RichTextEditor";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 900, xs: "95%" },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  maxHeight: "90vh",
  overflowY: "auto",
};

const validationSchema = Yup.object().shape({
  subject: Yup.string().trim().required("Subject is required"),
  description: Yup.string().required("Description is required").test(
    "not-empty",
    "Description is required",
    (value) => {
      if (!value) return false;
      const textContent = value.replace(/<[^>]*>/g, "").trim();
      return textContent.length > 0;
    }
  ),
  priority: Yup.number().required("Priority is required"),
  categoryId: Yup.number().required("Category is required"),
  projectIds: Yup.array().of(Yup.number()).nullable(),
  startDate: Yup.string(),
  startTime: Yup.string(),
  dueDate: Yup.string(),
  dueTime: Yup.string(),
  customerName: Yup.string().trim(),
  customerId: Yup.number().nullable(),
});

export default function CreateTicketModal({ fetchItems, currentPage = 1, currentSearch = "", currentPageSize = 10 }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { data: categoriesData } = useApi("/HelpDesk/GetAllCategories?SkipCount=0&MaxResultCount=1000&Search=null");
  const { data: usersData } = useApi("/User/GetAllUser");
  const { data: projectsData } = useApi("/Project/GetAllProjects");
  const { data: prioritySettingsData } = useApi("/HelpDesk/GetPrioritySettings");

  const categories = categoriesData?.items || [];
  const users = Array.isArray(usersData)
    ? usersData
    : Array.isArray(usersData?.result)
    ? usersData.result
    : usersData && typeof usersData === "object"
    ? Object.values(usersData).find((value) => Array.isArray(value)) || []
    : [];

  const normalizeProjectSource = React.useMemo(() => {
    if (!projectsData) return [];
    if (Array.isArray(projectsData)) return projectsData;
    if (Array.isArray(projectsData?.result)) return projectsData.result;
    if (Array.isArray(projectsData?.items)) return projectsData.items;
    return [];
  }, [projectsData]);

  const toNumericId = (value) => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const deriveCustomerName = (project) => {
    const candidateNames = [
      project.customerName,
      project.customer?.displayName,
      project.customer?.name,
      project.customer?.customerName,
      project.customer?.company,
      project.customerDetails?.displayName,
      project.customerDetails?.name,
      project.customerInfo?.displayName,
      project.customerInfo?.name,
    ];

    const fromParts = [
      [project.customer?.firstName, project.customer?.lastName],
      [project.customerDetails?.firstName, project.customerDetails?.lastName],
      [project.customerInfo?.firstName, project.customerInfo?.lastName],
    ];

    const directName = candidateNames.find(
      (name) => typeof name === "string" && name.trim().length > 0
    );
    if (directName) return directName.trim();

    const composed = fromParts
      .map((parts) => parts.filter(Boolean).join(" ").trim())
      .find((name) => name.length > 0);

    if (composed) return composed;

    return "";
  };

  const normalizedProjects = React.useMemo(
    () =>
      normalizeProjectSource.map((project) => {
        const customerIdCandidates = [
          project.customerId,
          project.assignedToCustomerId,
          project.customer?.id,
          project.customer?.customerId,
          project.customerDetails?.id,
          project.customerDetails?.customerId,
          project.customerInfo?.id,
          project.customerInfo?.customerId,
        ];

        const customerId =
          customerIdCandidates
            .map((candidate) => toNumericId(candidate))
            .find((candidate) => candidate !== null && candidate !== undefined) ?? null;

        return {
          ...project,
          customerIdNormalized: customerId,
          customerNameNormalized: deriveCustomerName(project),
        };
      }),
    [normalizeProjectSource]
  );

  const prioritySettings = Array.isArray(prioritySettingsData?.result)
    ? prioritySettingsData.result
    : Array.isArray(prioritySettingsData)
    ? prioritySettingsData
    : [];
  const defaultPriorityValue = prioritySettings.find((p) => p.isDefault)?.priority ?? prioritySettings[0]?.priority ?? 2;

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const selectedProjectIds = Array.isArray(values.projectIds)
        ? values.projectIds.filter((id) => id !== null && id !== undefined)
        : [];
      const primaryProjectId = selectedProjectIds.length > 0 ? selectedProjectIds[0] : null;
      const primaryProject =
        primaryProjectId !== null
          ? normalizedProjects.find((proj) => proj?.id === primaryProjectId) || null
          : null;
      const primaryProjectName = primaryProject?.name || null;

      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/HelpDesk/CreateTicket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: values.subject,
          description: values.description,
          priority: values.priority,
          categoryId: values.categoryId,
          assignedToUserId: values.assignedToUserId || null,
          project: primaryProjectName,
          projectId: primaryProjectId,
          projectIds: selectedProjectIds,
          startDate: values.startDate ? (values.startTime ? `${values.startDate}T${values.startTime}:00` : `${values.startDate}T00:00:00`) : null,
          dueDate: values.dueDate ? (values.dueTime ? `${values.dueDate}T${values.dueTime}:00` : `${values.dueDate}T23:59:59`) : null,
          customerName: values.customerName ? values.customerName.trim() : null,
          customerId: values.customerId || null,
          customerEmail: null,
          customerPhone: null,
          customerCompany: null,
        }),
      });

      const data = await response.json();

      // Check if the request was successful
      if (response.ok) {
        // If response is OK, treat as success unless explicitly marked as error
        const isSuccess = data.status === "SUCCESS" || 
                         data.statusCode === 200 || 
                         response.status === 200 ||
                         !data.status || // If no status field, assume success
                         (data.status && data.status !== "ERROR" && data.status !== "FAIL");
        
        if (isSuccess) {
          toast.success(data.message || "Ticket created successfully!");
          resetForm();
          handleClose();
          // Refresh the table with current page parameters
          fetchItems(currentPage, currentSearch, currentPageSize);
        } else {
          // Response is OK but status indicates failure
          toast.error(data.message || "Failed to create ticket");
        }
      } else {
        // HTTP error response
        toast.error(data.message || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("An error occurred while creating the ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{
          bgcolor: "#4299E1",
          color: "white",
          borderRadius: 2,
          px: 3,
          py: 1.5,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "0 4px 6px rgba(66, 153, 225, 0.3)",
          "&:hover": {
            bgcolor: "#3182CE",
            boxShadow: "0 6px 8px rgba(66, 153, 225, 0.4)",
          },
        }}
      >
        New Ticket
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="create-ticket-modal"
        aria-describedby="create-ticket-form"
      >
        <Box sx={style}>
          <Typography id="create-ticket-modal" variant="h6" component="h2" mb={2}>
            Create New Ticket
          </Typography>

          <Formik
            initialValues={{
              subject: "",
              description: "",
              priority: defaultPriorityValue,
              categoryId: "",
              assignedToUserId: null,
              projectIds: [],
              startDate: "",
              startTime: "",
              dueDate: "",
              dueTime: "",
              customerName: "",
              customerId: null,
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="subject"
                      label="Subject"
                      size="small"
                      error={touched.subject && !!errors.subject}
                      helperText={touched.subject && errors.subject}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={normalizedProjects}
                      getOptionLabel={(option) => option?.name || ""}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      value={
                        normalizedProjects.find((project) =>
                          Array.isArray(values.projectIds)
                            ? values.projectIds.includes(project.id)
                            : false
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        const projectId = newValue?.id ?? null;
                        setFieldValue("projectIds", projectId ? [projectId] : []);

                        if (newValue) {
                          if (newValue.customerNameNormalized) {
                            setFieldValue("customerName", newValue.customerNameNormalized);
                          }
                          setFieldValue("customerId", newValue.customerIdNormalized || null);
                        } else {
                          setFieldValue("customerId", null);
                          setFieldValue("customerName", "");
                        }
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {option?.name || "Unnamed Project"}
                            </Typography>
                            {option.customerNameNormalized ? (
                              <Typography variant="caption" color="text.secondary">
                                {option.customerNameNormalized}
                              </Typography>
                            ) : null}
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Project"
                          placeholder="Select project"
                          size="small"
                          error={touched.projectIds && !!errors.projectIds}
                          helperText={touched.projectIds && errors.projectIds}
                        />
                      )}
                      noOptionsText="No projects found"
                      loadingText="Loading projects..."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="customerName"
                      label="Customer Name"
                      value={values.customerName}
                      size="small"
                      disabled={true}
                      onChange={(e) => {
                        setFieldValue("customerName", e.target.value);
                        setFieldValue("customerId", null);
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => {
                        if (!option) return "";
                        const name = `${option.firstName || ""} ${option.lastName || ""}`.trim();
                        return name || option.email || option.userName || "Unknown";
                      }}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      value={users.find((u) => u?.id === values.assignedToUserId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue("assignedToUserId", newValue?.id || null);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Assign To (Optional)" size="small" />
                      )}
                      noOptionsText="No users found"
                      loadingText="Loading users..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="description">
                      {({ field, form }) => (
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={(content) => {
                            form.setFieldValue("description", content);
                            form.setFieldTouched("description", true);
                          }}
                          error={touched.description && !!errors.description}
                          helperText={touched.description && errors.description}
                          label="Description *"
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={touched.priority && !!errors.priority} size="small">
                      <InputLabel size="small">Priority</InputLabel>
                      <Field
                        as={Select}
                        name="priority"
                        label="Priority"
                        value={values.priority}
                        size="small"
                      >
                        {prioritySettings.length > 0 ? (
                          prioritySettings.map((priority) => (
                            <MenuItem key={priority.priority} value={priority.priority}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: priority.colorHex || "#2563EB",
                                  }}
                                />
                                {priority.displayName || priority.priority}
                              </Box>
                            </MenuItem>
                          ))
                        ) : (
                          <>
                            <MenuItem value={1}>Low</MenuItem>
                            <MenuItem value={2}>Medium</MenuItem>
                            <MenuItem value={3}>High</MenuItem>
                            <MenuItem value={4}>Critical</MenuItem>
                          </>
                        )}
                      </Field>
                      {touched.priority && errors.priority && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.priority}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={touched.categoryId && !!errors.categoryId} size="small">
                      <InputLabel size="small">Category</InputLabel>
                      <Field
                        as={Select}
                        name="categoryId"
                        label="Category"
                        value={values.categoryId}
                        size="small"
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.categoryId && errors.categoryId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.categoryId}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="startDate"
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={values.startDate}
                      size="small"
                      onChange={(e) => setFieldValue("startDate", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="startTime"
                      label="Start Time"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      value={values.startTime}
                      size="small"
                      onChange={(e) => setFieldValue("startTime", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="dueDate"
                      label="Due Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={values.dueDate}
                      size="small"
                      onChange={(e) => setFieldValue("dueDate", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="dueTime"
                      label="Due Time"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      value={values.dueTime}
                      size="small"
                      onChange={(e) => setFieldValue("dueTime", e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button onClick={handleClose} variant="outlined">
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Ticket"}
                      </Button>
                    </Box>
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

