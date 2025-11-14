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
  Divider,
  Avatar,
  Chip,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import useApi from "@/components/utils/useApi";
import RichTextEditor from "@/components/help-desk/RichTextEditor";
import { formatDate } from "@/components/utils/formatHelper";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: "95%", md: "95%", xs: "100%" },
  maxWidth: "1400px",
  height: { xs: "100vh", sm: "95vh", md: "90vh" },
  maxHeight: { xs: "100vh", sm: "95vh", md: "90vh" },
  bgcolor: "#F5F5F5",
  boxShadow: 24,
  borderRadius: { xs: 0, sm: 2 },
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const commentValidationSchema = Yup.object().shape({
  comment: Yup.string().trim().required("Comment is required"),
});

const validationSchema = Yup.object().shape({
  subject: Yup.string().trim().required("Subject is required"),
  description: Yup.string().required("Description is required").test(
    "not-empty",
    "Description is required",
    (value) => {
      if (!value) return false;
      // Remove HTML tags and check if there's actual content
      const textContent = value.replace(/<[^>]*>/g, "").trim();
      return textContent.length > 0;
    }
  ),
  status: Yup.number().required("Status is required"),
  priority: Yup.number().required("Priority is required"),
  categoryId: Yup.number().required("Category is required"),
  projectIds: Yup.array().of(Yup.number()).nullable(),
  startDate: Yup.string(),
  startTime: Yup.string(),
  dueDate: Yup.string(),
  dueTime: Yup.string(),
  customerName: Yup.string().trim(),
  customerId: Yup.number().nullable(),
  feedbackRating: Yup.number().nullable(),
  feedbackComment: Yup.string().trim(),
});

export default function EditTicketModal({ fetchItems, item, currentPage = 1, currentSearch = "", currentPageSize = 10, open: externalOpen, onClose: externalOnClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [timeUpdateTrigger, setTimeUpdateTrigger] = useState(0);
  
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const handleOpen = () => {
    if (externalOpen === undefined) {
      setInternalOpen(true);
    }
  };
  const handleClose = () => {
    // Refresh ticket list when modal closes to update checklist percentage
    if (item?.id) {
      fetchItems(currentPage, currentSearch, currentPageSize);
    }
    if (externalOpen === undefined) {
      setInternalOpen(false);
    } else if (externalOnClose) {
      externalOnClose();
    }
  };

  // Auto-open when item is set and modal is controlled externally
  useEffect(() => {
    if (externalOpen !== undefined && item && !open) {
      // This will be handled by parent
    }
  }, [item, externalOpen, open]);

  // Fetch checklist and comments when modal opens
  useEffect(() => {
    if (open && item?.id) {
      fetchComments();
    }
  }, [open, item?.id]);

  // Timer to update remaining time display for editable comments
  useEffect(() => {
    if (!open) return;
    
    const hasEditableComments = comments.some(comment => isCommentEditable(comment));
    if (!hasEditableComments) return;

    const interval = setInterval(() => {
      // Force re-render to update remaining time display
      setTimeUpdateTrigger(prev => prev + 1);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [open, comments]);

  // Checklist removed from frontend

  const fetchComments = async () => {
    try {
      if (!item?.id) return;
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token available for fetching comments");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/HelpDesk/GetCommentsByTicketId?ticketId=${item.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        let commentsList = data.result || data.data || data.items || (Array.isArray(data) ? data : []);
        // Sort comments in descending order (newest first)
        commentsList = commentsList.sort((a, b) => {
          const dateA = new Date(a.createdOn || 0).getTime();
          const dateB = new Date(b.createdOn || 0).getTime();
          return dateB - dateA; // Descending order
        });
        setComments(commentsList);
      } else {
        console.error("Failed to fetch comments:", response.status);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Don't crash the app - just log the error
    }
  };

  // Check if comment is within 2 minutes of creation
  const isCommentEditable = (comment) => {
    if (!comment.createdOn) return false;
    const createdTime = new Date(comment.createdOn).getTime();
    const currentTime = new Date().getTime();
    const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
    return (currentTime - createdTime) <= twoMinutes;
  };

  // Get remaining time in seconds
  const getRemainingTime = (comment) => {
    if (!comment.createdOn) return 0;
    const createdTime = new Date(comment.createdOn).getTime();
    const currentTime = new Date().getTime();
    const twoMinutes = 2 * 60 * 1000;
    const elapsed = currentTime - createdTime;
    const remaining = Math.max(0, Math.floor((twoMinutes - elapsed) / 1000));
    return remaining;
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }

      const response = await fetch(`${BASE_URL}/HelpDesk/DeleteComment?commentId=${commentId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Delete comment response text:", responseText);
      } catch (textError) {
        console.error("Error reading response text:", textError);
        toast.error("Failed to read server response. Please try again.");
        return;
      }

      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        if (response.ok) {
          toast.success("Comment deleted successfully");
          await fetchComments();
          return;
        } else {
          toast.error("Invalid response from server. Please try again.");
          return;
        }
      }

      console.log("Parsed delete comment response:", data);

      // Check for success - backend returns statusCode (200 for SUCCESS, -99 for FAILED)
      const isSuccess = response.ok && (
        data.statusCode === 200 || 
        data.statusCode === "SUCCESS" ||
        data.status === "SUCCESS" || 
        data.status === 200 ||
        response.status === 200
      );

      if (isSuccess) {
        toast.success(data.message || "Comment deleted successfully");
        await fetchComments();
      } else {
        const errorMessage = data.message || data.error || "Failed to delete comment";
        console.error("API returned error:", data);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("An error occurred while deleting comment");
    }
  };

  // Handle edit comment
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.comment);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  // Handle save edited comment
  const handleSaveComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }

      console.log("Updating comment:", { commentId, comment: editingCommentText.trim() });
      console.log("API URL:", `${BASE_URL}/HelpDesk/UpdateComment`);

      const response = await fetch(`${BASE_URL}/HelpDesk/UpdateComment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentId: commentId,
          comment: editingCommentText.trim(),
        }),
      });

      console.log("Update comment response status:", response.status);

      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Update comment response text:", responseText);
      } catch (textError) {
        console.error("Error reading response text:", textError);
        toast.error("Failed to read server response. Please try again.");
        return;
      }

      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        if (response.ok) {
          toast.success("Comment updated successfully");
          setEditingCommentId(null);
          setEditingCommentText("");
          await fetchComments();
          return;
        } else {
          toast.error("Invalid response from server. Please try again.");
          return;
        }
      }

      console.log("Parsed update comment response:", data);

      // Check for success - backend returns statusCode (200 for SUCCESS, -99 for FAILED)
      const isSuccess = response.ok && (
        data.statusCode === 200 || 
        data.statusCode === "SUCCESS" ||
        data.status === "SUCCESS" || 
        data.status === 200 ||
        response.status === 200
      );

      if (isSuccess) {
        toast.success(data.message || "Comment updated successfully");
        setEditingCommentId(null);
        setEditingCommentText("");
        await fetchComments();
      } else {
        const errorMessage = data.message || data.error || "Failed to update comment";
        console.error("API returned error:", data);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error(error.message || "An error occurred while updating comment");
    }
  };

  const handleAddComment = async (values, { resetForm, setSubmitting }) => {
    try {
      if (!item?.id) {
        toast.error("Ticket ID is missing");
        setSubmitting(false);
        return;
      }

      if (!values.comment || !values.comment.trim()) {
        toast.error("Please enter a comment");
        setSubmitting(false);
        return;
      }

      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Authentication token is missing. Please log in again.");
        setSubmitting(false);
        return;
      }

      const requestBody = {
        ticketId: item.id,
        comment: values.comment.trim(),
        isInternal: values.isInternal || false,
      };

      console.log("=== COMMENT SUBMISSION START ===");
      console.log("Creating comment:", requestBody);
      console.log("API URL:", `${BASE_URL}/HelpDesk/CreateComment`);
      console.log("Ticket ID:", item.id);
      console.log("Token exists:", !!token);

      let response;
      try {
        response = await fetch(`${BASE_URL}/HelpDesk/CreateComment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
        console.log("Fetch completed. Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      } catch (fetchError) {
        console.error("=== FETCH ERROR ===");
        console.error("Error type:", fetchError.name);
        console.error("Error message:", fetchError.message);
        console.error("Full error:", fetchError);
        toast.error(`Network error: ${fetchError.message}. Please check your connection and CORS settings.`);
        setSubmitting(false);
        return;
      }

      console.log("Response status:", response.status);
      
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Response text:", responseText);
      } catch (textError) {
        console.error("Error reading response text:", textError);
        toast.error("Failed to read server response. Please try again.");
        setSubmitting(false);
        return;
      }
      
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError, "Response text:", responseText);
        // If response is not JSON but status is OK, assume success
        if (response.ok) {
          toast.success("Comment added successfully");
          resetForm();
          try {
            await fetchComments();
          } catch (err) {
            console.error("Error refreshing comments:", err);
          }
          setSubmitting(false);
          return;
        } else {
          toast.error("Invalid response from server. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      console.log("Parsed response data:", data);

      if (response.ok) {
        const isSuccess = data.status === "SUCCESS" || 
                         data.statusCode === 200 || 
                         response.status === 200 ||
                         !data.status ||
                         (data.status && data.status !== "ERROR" && data.status !== "FAIL");
        
      if (isSuccess) {
        toast.success(data.message || "Comment added successfully");
        resetForm();
        // Refresh comments immediately to show new comment at top
        try {
          await fetchComments();
        } catch (err) {
          console.error("Error refreshing comments:", err);
          // Don't fail the whole operation if refresh fails
        }
        // Don't refresh items list - it might cause navigation issues
        // fetchItems is called when modal closes anyway
      } else {
          const errorMessage = data.message || data.error || "Failed to add comment";
          console.error("API returned error:", data);
          toast.error(errorMessage);
        }
      } else {
        const errorMessage = data?.message || data?.error || `Server error (${response.status}). Please try again.`;
        console.error("HTTP error:", response.status, errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(error.message || "An error occurred while adding comment. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const helpDeskUsers = React.useMemo(() => {
    if (!Array.isArray(users) || users.length === 0) {
      return [];
    }

    const deduped = new Map();
    users.forEach((user) => {
      if (!user) return;

      const key = user?.id ?? user?.userId ?? null;
      if (key === null || key === undefined) return;

      const userTypeName = (user.userTypeName || "").toLowerCase();
      const userRoleName = (user.userRoleName || "").toLowerCase();
      const isHelpDeskSupport =
        userTypeName.includes("helpdesk") || userRoleName.includes("helpdesk");

      if (!isHelpDeskSupport) return;

      if (!deduped.has(key)) {
        deduped.set(key, user);
      }
    });

    return Array.from(deduped.values());
  }, [users]);

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

  const handleSubmit = async (values, { setSubmitting }) => {
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
      const response = await fetch(`${BASE_URL}/HelpDesk/UpdateTicket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: item.id,
          subject: values.subject,
          description: values.description,
          status: values.status,
          priority: values.priority,
          categoryId: values.categoryId,
          assignedToUserId: values.assignedToUserId || null,
          resolutionNotes: values.resolutionNotes || "",
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
          feedbackRating: values.feedbackRating ? Number(values.feedbackRating) : null,
          feedbackComment: values.feedbackComment ? values.feedbackComment.trim() : null,
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
          toast.success(data.message || "Ticket updated successfully!");
          handleClose();
          // Refresh the table with current page parameters
          fetchItems(currentPage, currentSearch, currentPageSize);
        } else {
          // Response is OK but status indicates failure
          toast.error(data.message || "Failed to update ticket");
        }
      } else {
        // HTTP error response
        toast.error(data.message || "Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("An error occurred while updating the ticket");
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) {
    return null;
  }

  const initialProjectIds = (() => {
    if (!item) return [];

    const normalizeId = (id) => {
      if (id === null || id === undefined) return null;
      if (typeof id === "number") return id;
      if (typeof id === "string") {
        const parsed = parseInt(id, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    };

    const fromArray = (arr) =>
      arr
        .map((entry) => {
          if (entry === null || entry === undefined) return null;
          if (typeof entry === "number" || typeof entry === "string") {
            return normalizeId(entry);
          }
          if (typeof entry === "object") {
            const candidate = entry.projectId ?? entry.id ?? entry.value ?? null;
            return normalizeId(candidate);
          }
          return null;
        })
        .filter((val) => val !== null && val !== undefined);

    if (Array.isArray(item.projectIds) && item.projectIds.length > 0) {
      return fromArray(item.projectIds);
    }

    if (Array.isArray(item.ticketProjects) && item.ticketProjects.length > 0) {
      return fromArray(item.ticketProjects);
    }

    if (Array.isArray(item.projects) && item.projects.length > 0) {
      return fromArray(item.projects);
    }

    const directId = normalizeId(item.projectId ?? item.projectEntity?.id);
    return directId !== null ? [directId] : [];
  })();

  const initialCustomerId = React.useMemo(() => {
    if (!item) return null;

    const candidates = [
      item.customerId,
      item.customer?.id,
      item.customer?.customerId,
      item.customerDetails?.id,
      item.customerDetails?.customerId,
      item.customerInfo?.id,
      item.customerInfo?.customerId,
    ];

    return (
      candidates
        .map((candidate) => toNumericId(candidate))
        .find((candidate) => candidate !== null && candidate !== undefined) ?? null
    );
  }, [item]);

  return (
    <>
      {externalOpen === undefined && (
        <Tooltip title="Edit Ticket">
          <IconButton size="small" onClick={handleOpen} color="primary">
            <BorderColorIcon />
          </IconButton>
        </Tooltip>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-ticket-modal"
        aria-describedby="edit-ticket-form"
        sx={{
          "& .MuiBackdrop-root": {
            bgcolor: "rgba(0, 0, 0, 0.8)",
          },
        }}
      >
        <Box sx={style}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #E2E8F0",
              bgcolor: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Typography variant="h6" sx={{ color: "#1A202C", fontWeight: 600 }}>
              Edit Ticket
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                type="submit"
                form="edit-ticket-form"
                variant="contained"
                size="small"
                sx={{ bgcolor: "#2196F3", "&:hover": { bgcolor: "#1976D2" } }}
              >
                Save
              </Button>
              <IconButton
                onClick={handleClose}
                sx={{
                  color: "#666",
                  "&:hover": { bgcolor: "#E2E8F0", color: "#1A202C" },
                }}
              >
                ×
              </IconButton>
            </Box>
          </Box>

          <Formik
            initialValues={{
              subject: item.subject || "",
              description: item.description || "",
              status: item.status || 1,
              priority: item.priority || 2,
              categoryId: item.categoryId || "",
              assignedToUserId: item.assignedToUserId || null,
              resolutionNotes: item.resolutionNotes || "",
              projectIds: initialProjectIds,
              startDate: item.startDate ? new Date(item.startDate).toISOString().split("T")[0] : "",
              startTime: item.startDate ? new Date(item.startDate).toTimeString().slice(0, 5) : "",
              dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split("T")[0] : "",
              dueTime: item.dueDate ? new Date(item.dueDate).toTimeString().slice(0, 5) : "",
              customerName:
                item.customerName ||
                item.customer?.displayName ||
                item.customer?.name ||
                [item.customer?.firstName, item.customer?.lastName].filter(Boolean).join(" ").trim() ||
                "",
              customerId: initialCustomerId,
              feedbackRating: item.feedbackRating || null,
              feedbackComment: item.feedbackComment || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form id="edit-ticket-form" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    minHeight: 0,
                    overflow: "hidden",
                    flexDirection: { xs: "column", md: "row" },
                  }}
                >
                  {/* Left Panel - Form Fields */}
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      p: { xs: 2, sm: 3 },
                      bgcolor: "white",
                      borderRight: { xs: "none", md: "1px solid #E2E8F0" },
                      borderBottom: { xs: "1px solid #E2E8F0", md: "none" },
                      maxHeight: { xs: "50vh", md: "none" },
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          name="subject"
                          label="Subject"
                          error={touched.subject && !!errors.subject}
                          helperText={touched.subject && errors.subject}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "white",
                              "& fieldset": {
                                borderColor: "#E2E8F0",
                              },
                              "&:hover fieldset": {
                                borderColor: "#CBD5E0",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#2196F3",
                              },
                            },
                          }}
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
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "white",
                                  "& fieldset": { borderColor: "#E2E8F0" },
                                  "&:hover fieldset": { borderColor: "#CBD5E0" },
                                  "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                                },
                              }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "white",
                              "& fieldset": {
                                borderColor: "#E2E8F0",
                              },
                              "&:hover fieldset": {
                                borderColor: "#CBD5E0",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#2196F3",
                              },
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Autocomplete
                          options={helpDeskUsers}
                          getOptionLabel={(option) => {
                            if (!option) return "";
                            const name = `${option.firstName || ""} ${option.lastName || ""}`.trim();
                            return name || option.email || option.userName || "Unknown";
                          }}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          value={
                            helpDeskUsers.find((u) => u?.id === values.assignedToUserId) ||
                            users.find((u) => u?.id === values.assignedToUserId) ||
                            null
                          }
                          onChange={(event, newValue) => {
                            setFieldValue("assignedToUserId", newValue?.id || null);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Assign To (Optional)"
                              size="small"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "white",
                                  "& fieldset": { borderColor: "#E2E8F0" },
                                  "&:hover fieldset": { borderColor: "#CBD5E0" },
                                  "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                                },
                              }}
                            />
                          )}
                          noOptionsText="No help desk support users found"
                          loadingText="Loading help desk support users..."
                        />
                      </Grid>

                      {/* Category aligned with Assign To */}
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={touched.categoryId && !!errors.categoryId} size="small">
                          <InputLabel size="small">Category</InputLabel>
                          <Field
                            as={Select}
                            name="categoryId"
                            label="Category"
                            value={values.categoryId}
                            size="small"
                            sx={{
                              bgcolor: "white",
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E0" },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2196F3" },
                            }}
                          >
                            {categories.map((cat) => (
                              <MenuItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </MenuItem>
                            ))}
                          </Field>
                        </FormControl>
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
                        <FormControl fullWidth error={touched.status && !!errors.status} size="small">
                          <InputLabel size="small">Status</InputLabel>
                          <Field
                            as={Select}
                            name="status"
                            label="Status"
                            value={values.status}
                            size="small"
                            sx={{
                              bgcolor: "white",
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E0" },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2196F3" },
                            }}
                          >
                            <MenuItem value={1}>Open</MenuItem>
                            <MenuItem value={2}>In Progress</MenuItem>
                            <MenuItem value={3}>Resolved</MenuItem>
                            <MenuItem value={4}>Closed</MenuItem>
                            <MenuItem value={5}>On Hold</MenuItem>
                          </Field>
                        </FormControl>
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
                            sx={{
                              bgcolor: "white",
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E0" },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2196F3" },
                            }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "white",
                              "& fieldset": { borderColor: "#E2E8F0" },
                              "&:hover fieldset": { borderColor: "#CBD5E0" },
                              "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "white",
                              "& fieldset": { borderColor: "#E2E8F0" },
                              "&:hover fieldset": { borderColor: "#CBD5E0" },
                              "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "white",
                              "& fieldset": { borderColor: "#E2E8F0" },
                              "&:hover fieldset": { borderColor: "#CBD5E0" },
                              "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                            },
                          }}
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              bgcolor: "white",
                              "& fieldset": { borderColor: "#E2E8F0" },
                              "&:hover fieldset": { borderColor: "#CBD5E0" },
                              "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                            },
                          }}
                        />
                      </Grid>

                      {/* Category moved above, removed here */}

                      {(values.status === 3 || values.status === 4) && (
                        <>
                          <Grid item xs={12}>
                            <Field
                              as={TextField}
                              fullWidth
                              multiline
                              rows={3}
                              name="resolutionNotes"
                              label="Resolution Notes"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "white",
                                  "& fieldset": { borderColor: "#E2E8F0" },
                                  "&:hover fieldset": { borderColor: "#CBD5E0" },
                                  "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                                },
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Customer Feedback Rating</InputLabel>
                              <Select
                                value={values.feedbackRating ?? ""}
                                label="Customer Feedback Rating"
                                onChange={(e) =>
                                  setFieldValue("feedbackRating", e.target.value ? Number(e.target.value) : null)
                                }
                              >
                                <MenuItem value="">Not Provided</MenuItem>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <MenuItem key={rating} value={rating}>
                                    {rating} Star{rating > 1 ? "s" : ""}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Field
                              as={TextField}
                              fullWidth
                              multiline
                              minRows={3}
                              name="feedbackComment"
                              label="Customer Feedback Comment"
                              value={values.feedbackComment}
                              onChange={(e) => setFieldValue("feedbackComment", e.target.value)}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "white",
                                  "& fieldset": { borderColor: "#E2E8F0" },
                                  "&:hover fieldset": { borderColor: "#CBD5E0" },
                                  "&.Mui-focused fieldset": { borderColor: "#2196F3" },
                                },
                              }}
                            />
                          </Grid>
                        </>
                      )}

                      {/* Checklist removed from frontend */}

                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                          <Button 
                            onClick={handleClose} 
                            variant="outlined"
                            sx={{
                              color: "#666",
                              borderColor: "#E2E8F0",
                              "&:hover": { borderColor: "#CBD5E0", bgcolor: "#F7FAFC" },
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={isSubmitting}
                            sx={{
                              bgcolor: "#2196F3",
                              "&:hover": { bgcolor: "#1976D2" },
                            }}
                          >
                            {isSubmitting ? "Updating..." : "Update Ticket"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Right Panel - Comments */}
                  <Box
                    sx={{
                      width: { xs: "100%", md: "400px" },
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: "#F7FAFC",
                      maxHeight: { xs: "50vh", md: "none" },
                    }}
                  >
                    <Box sx={{ p: { xs: 2, sm: 3 }, pb: 1, flexShrink: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography variant="h6" sx={{ color: "#1A202C" }}>
                          Comments and activity
                        </Typography>
                      </Box>

                      {/* Add Comment Form */}
                    <Formik
                      initialValues={{ comment: "", isInternal: false }}
                      validationSchema={commentValidationSchema}
                      onSubmit={async (values, formikHelpers) => {
                        console.log("=== FORM SUBMISSION TRIGGERED ===");
                        console.log("Form values:", values);
                        console.log("Formik helpers:", formikHelpers);
                        try {
                          console.log("Calling handleAddComment...");
                          await handleAddComment(values, formikHelpers);
                          console.log("handleAddComment completed");
                        } catch (error) {
                          console.error("=== UNEXPECTED ERROR IN FORM SUBMISSION ===");
                          console.error("Error:", error);
                          console.error("Error stack:", error.stack);
                          toast.error("An unexpected error occurred. Please try again.");
                          formikHelpers.setSubmitting(false);
                        }
                      }}
                    >
                      {({ values: commentValues, errors: commentErrors, touched: commentTouched, setFieldValue: setCommentFieldValue, isSubmitting: isCommentSubmitting, handleSubmit }) => (
                        <Box>
                          <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            maxRows={10}
                            name="comment"
                            placeholder="Write a comment... (Press Enter for new line)"
                            value={commentValues.comment}
                            onChange={(e) => setCommentFieldValue("comment", e.target.value)}
                            error={commentTouched.comment && !!commentErrors.comment}
                            helperText={commentTouched.comment && commentErrors.comment}
                            sx={{
                              mb: 2,
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "white",
                                "& fieldset": {
                                  borderColor: "#E2E8F0",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#CBD5E0",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#2196F3",
                                },
                              },
                            }}
                          />
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <input
                                type="checkbox"
                                checked={commentValues.isInternal || false}
                                onChange={(e) => setCommentFieldValue("isInternal", e.target.checked)}
                                style={{ marginRight: 8 }}
                              />
                              <Typography sx={{ color: "#666", fontSize: "0.875rem" }}>
                                Internal Note
                              </Typography>
                            </Box>
                            <Button
                              type="button"
                              variant="contained"
                              disabled={isCommentSubmitting || !commentValues.comment.trim()}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("=== ADD COMMENT BUTTON CLICKED ===");
                                console.log("Button disabled:", isCommentSubmitting || !commentValues.comment.trim());
                                console.log("Comment value:", commentValues.comment);
                                console.log("Is submitting:", isCommentSubmitting);
                                // Manually trigger Formik's handleSubmit
                                handleSubmit(e);
                              }}
                              sx={{
                                bgcolor: "#2196F3",
                                "&:hover": { bgcolor: "#1976D2" },
                                textTransform: "uppercase",
                                fontWeight: 600,
                              }}
                            >
                              {isCommentSubmitting ? "Adding..." : "ADD COMMENT"}
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Formik>
                    </Box>

                    {/* Comments List - Scrollable */}
                    <Box
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                        px: { xs: 2, sm: 3 },
                        pt: 1,
                        pb: 3,
                        "&::-webkit-scrollbar": {
                          width: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "#f1f1f1",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#888",
                          borderRadius: "4px",
                          "&:hover": {
                            background: "#555",
                          },
                        },
                      }}
                    >
                      {comments.length === 0 ? (
                        <Typography sx={{ color: "#999", fontSize: "0.875rem" }}>
                          No comments yet
                        </Typography>
                      ) : (
                        comments.map((comment) => {
                          const editable = isCommentEditable(comment);
                          const remainingTime = getRemainingTime(comment);
                          const isEditing = editingCommentId === comment.id;

                          return (
                            <Box key={comment.id} sx={{ mb: 2, p: { xs: 1.5, sm: 2 }, bgcolor: "white", borderRadius: 1, border: "1px solid #E2E8F0" }}>
                              <Box sx={{ display: "flex", gap: 1, mb: 1, justifyContent: "space-between", alignItems: "flex-start", flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                                <Box sx={{ display: "flex", gap: 1, flex: 1, minWidth: 0 }}>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: "#2196F3",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {comment.user?.firstName?.[0] || comment.user?.email?.[0] || "U"}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ color: "#1A202C", fontSize: "0.875rem", fontWeight: 500 }}>
                                      {comment.user?.firstName && comment.user?.lastName
                                        ? `${comment.user.firstName} ${comment.user.lastName}`
                                        : comment.user?.email || comment.user?.userName || "Unknown User"}
                                    </Typography>
                                    <Typography sx={{ color: "#718096", fontSize: "0.75rem" }}>
                                      {formatDate(comment.createdOn)}
                                      {comment.isInternal && (
                                        <Chip
                                          label="Internal"
                                          size="small"
                                          sx={{ ml: 1, height: 18, fontSize: "0.65rem", bgcolor: "#EDF2F7", color: "#4A5568" }}
                                        />
                                      )}
                                    </Typography>
                                  </Box>
                                </Box>
                                {editable && !isEditing && (
                                  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                    <Tooltip title="Edit comment">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleEditComment(comment)}
                                        sx={{ color: "#2196F3" }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete comment">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        sx={{ color: "#F44336" }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </Box>
                              
                              {editable && !isEditing && (
                                <Box sx={{ mb: 1, p: 1, bgcolor: "#FFF3CD", borderRadius: 1, border: "1px solid #FFC107" }}>
                                  <Typography sx={{ color: "#856404", fontSize: "0.75rem", fontWeight: 500 }}>
                                    ⚠️ You have {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')} to edit or delete this comment
                                  </Typography>
                                </Box>
                              )}

                              {isEditing ? (
                                <Box sx={{ ml: 5 }}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    maxRows={10}
                                    value={editingCommentText}
                                    onChange={(e) => setEditingCommentText(e.target.value)}
                                    sx={{ mb: 1 }}
                                  />
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<SaveIcon />}
                                      onClick={() => handleSaveComment(comment.id)}
                                      sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#45a049" } }}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<CancelIcon />}
                                      onClick={handleCancelEdit}
                                    >
                                      Cancel
                                    </Button>
                                  </Box>
                                </Box>
                              ) : (
                                <Typography 
                                  sx={{ 
                                    color: "#2D3748", 
                                    fontSize: "0.875rem", 
                                    ml: 5,
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {comment.comment}
                                </Typography>
                              )}
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}

