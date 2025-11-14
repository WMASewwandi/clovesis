import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import dynamic from "next/dynamic";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";

// Dynamically import modals that use RichTextEditor (Quill) to avoid SSR issues
const CreateTicketModal = dynamic(() => import("./create"), { ssr: false });
const EditTicketModal = dynamic(() => import("./edit"), { ssr: false });
const ViewTicketModal = dynamic(() => import("./view"), { ssr: false });
import BASE_URL from "Base/api";
import { formatDate } from "@/components/utils/formatHelper";
import { toast } from "react-toastify";
import { keyframes } from "@emotion/react";

// Animation for Critical priority tickets - eye-catching blinking effect (responsive)
const blink = keyframes`
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 15px rgba(198, 40, 40, 0.8),
                0 0 30px rgba(198, 40, 40, 0.6),
                0 0 45px rgba(198, 40, 40, 0.4),
                0 2px 10px rgba(198, 40, 40, 0.5);
  }
  50% {
    opacity: 0.75;
    box-shadow: 0 0 25px rgba(255, 23, 68, 1),
                0 0 50px rgba(255, 23, 68, 0.8),
                0 0 75px rgba(255, 23, 68, 0.6),
                0 4px 20px rgba(255, 23, 68, 0.7);
  }
`;

// Mobile-optimized blink animation
const blinkMobile = keyframes`
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 10px rgba(198, 40, 40, 0.8),
                0 0 20px rgba(198, 40, 40, 0.6),
                0 2px 8px rgba(198, 40, 40, 0.5);
  }
  50% {
    opacity: 0.75;
    box-shadow: 0 0 20px rgba(255, 23, 68, 1),
                0 0 40px rgba(255, 23, 68, 0.8),
                0 4px 15px rgba(255, 23, 68, 0.7);
  }
`;

const statusConfig = [
  { value: 1, label: "Open", color: "#2196F3", bgColor: "#E3F2FD", columnBg: "#E8F4FD" },
  { value: 2, label: "In Progress", color: "#FF9800", bgColor: "#FFF3E0", columnBg: "#FFF8E1" },
  { value: 3, label: "Resolved", color: "#4CAF50", bgColor: "#E8F5E9", columnBg: "#F1F8F4" },
  { value: 4, label: "Closed", color: "#9E9E9E", bgColor: "#F5F5F5", columnBg: "#FAFAFA" },
  { value: 5, label: "On Hold", color: "#F44336", bgColor: "#FFEBEE", columnBg: "#FFF5F5" },
];

const statusNameToValue = {
  open: 1,
  "inprogress": 2,
  "in_progress": 2,
  "in progress": 2,
  resolved: 3,
  closed: 4,
  "onhold": 5,
  "on_hold": 5,
  "on hold": 5,
};

const defaultPriorityPalette = {
  1: { label: "Low", color: "#1976D2", bgColor: "#E3F2FD", cardBg: "#E8F4FD" },
  2: { label: "Medium", color: "#F57C00", bgColor: "#FFF3E0", cardBg: "#FFF8E1" },
  3: { label: "High", color: "#D32F2F", bgColor: "#FFEBEE", cardBg: "#FFE0E0" },
  4: { label: "Critical", color: "#C62828", bgColor: "#FFCDD2", cardBg: "#FFB3BA" },
};

export default function Tickets() {
  useEffect(() => {
    sessionStorage.setItem("category", "105");
  }, []);

  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove } = IsPermissionEnabled(cId);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTicket, setMenuTicket] = useState(null);
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [priorityPalette, setPriorityPalette] = useState(defaultPriorityPalette);

  const {
    data: ticketList,
    totalCount,
    page,
    pageSize,
    search,
    setSearch,
    fetchData: fetchTicketList,
  } = usePaginatedFetch("HelpDesk/GetAllTickets", "", 10000, false);

  useEffect(() => {
    const loadPrioritySettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/HelpDesk/GetPrioritySettings`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const settings = Array.isArray(data?.result) ? data.result : [];
        if (settings.length === 0) return;

        const palette = { ...defaultPriorityPalette };
        settings.forEach((setting) => {
          const baseColorRaw = setting.colorHex || palette[setting.priority]?.color || "#2563EB";
          const baseColor = baseColorRaw.startsWith("#") ? baseColorRaw : `#${baseColorRaw}`;
          const withAlpha = (hex, alphaHex) => (hex.length === 7 ? `${hex}${alphaHex}` : hex);
          palette[setting.priority] = {
            label: setting.displayName || palette[setting.priority]?.label || `Priority ${setting.priority}`,
            color: baseColor,
            bgColor: withAlpha(baseColor, "1A") || palette[setting.priority]?.bgColor || "#E3F2FD",
            cardBg: withAlpha(baseColor, "14") || palette[setting.priority]?.cardBg || "#E8F4FD",
          };
        });

        setPriorityPalette(palette);
      } catch (error) {
        console.error("Error loading priority settings", error);
      }
    };

    loadPrioritySettings();
  }, []);

  // Group tickets by status
  const ticketsByStatus = useMemo(() => {
    const grouped = {};
    statusConfig.forEach((status) => {
      grouped[status.value] = [];
    });
    // Ensure ticketList is an array
    if (Array.isArray(ticketList)) {
      console.log("Grouping tickets. Total tickets:", ticketList.length);
      ticketList.forEach((ticket) => {
        if (!ticket) return;

        const tryParseNumeric = (value) => {
          if (value === null || value === undefined) return undefined;
          const parsed = typeof value === "number" ? value : parseInt(value, 10);
          return Number.isNaN(parsed) ? undefined : parsed;
        };

        let statusValue = tryParseNumeric(ticket.status);

        if (statusValue === undefined && typeof ticket.status === "string") {
          const normalized = ticket.status.trim().toLowerCase();
          statusValue = statusNameToValue[normalized];
        }

        if (statusValue === undefined && ticket.statusId !== undefined) {
          statusValue = tryParseNumeric(ticket.statusId);
        }

        if (statusValue === undefined && typeof ticket.statusId === "string") {
          const normalized = ticket.statusId.trim().toLowerCase();
          statusValue = statusNameToValue[normalized];
        }

        if (statusValue === undefined || grouped[statusValue] === undefined) {
          // Fallback to Open column to ensure ticket remains visible
          statusValue = 1;
        }
        grouped[statusValue].push(ticket);
      });
      console.log("Grouped tickets:", Object.keys(grouped).map(k => ({ status: k, count: grouped[k].length })));
    } else {
      console.warn("ticketList is not an array:", typeof ticketList, ticketList);
    }
    return grouped;
  }, [ticketList]);

  // Filter tickets by search
  const filteredTicketsByStatus = useMemo(() => {
    if (!search || search.trim() === "") {
      return ticketsByStatus;
    }
    const filtered = {};
    statusConfig.forEach((status) => {
      filtered[status.value] = ticketsByStatus[status.value].filter((ticket) => {
        const searchLower = search.toLowerCase();
        return (
          ticket.ticketNumber?.toLowerCase().includes(searchLower) ||
          ticket.subject?.toLowerCase().includes(searchLower) ||
          ticket.description?.toLowerCase().includes(searchLower) ||
          ticket.categoryName?.toLowerCase().includes(searchLower) ||
          (ticket.category?.name && ticket.category.name.toLowerCase().includes(searchLower)) ||
          ticket.customerName?.toLowerCase().includes(searchLower) ||
          ticket.customerEmail?.toLowerCase().includes(searchLower) ||
          ticket.customerPhone?.toLowerCase().includes(searchLower) ||
          ticket.customerCompany?.toLowerCase().includes(searchLower)
        );
      });
    });
    return filtered;
  }, [ticketsByStatus, search]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewModalOpen(true);
    setAnchorEl(null);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTicket(null);
    fetchTicketList(page, search, pageSize);
  };

  const handleMenuOpen = (event, ticket) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTicket(null);
  };

  const handleDragStart = (e, ticket) => {
    if (!update) {
      e.preventDefault();
      return false;
    }
    e.stopPropagation();
    console.log("Drag started for ticket:", ticket.id, "Status:", ticket.status);
    setDraggedTicket(ticket.id);
    e.dataTransfer.setData("text/plain", ticket.id.toString()); // Use text/plain as fallback
    e.dataTransfer.setData("ticketId", ticket.id.toString());
    e.dataTransfer.setData("currentStatus", ticket.status.toString());
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDraggedTicket(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    if (!update) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, newStatus) => {
    if (!update) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);

    // Use draggedTicket state if available, otherwise use dataTransfer
    let ticketId = draggedTicket;
    let ticketIdStr = null;
    if (!ticketId) {
      ticketIdStr = e.dataTransfer.getData("ticketId") || e.dataTransfer.getData("text/plain");
      if (ticketIdStr) {
        ticketId = parseInt(ticketIdStr);
      }
    }

    if (!ticketId) {
      console.error("No ticket ID available");
      setDraggedTicket(null);
      return;
    }

    // Find the ticket to verify it exists - try both string and number comparison
    const ticket = ticketList.find((t) => {
      const tId = t.id;
      return tId === ticketId || 
             tId === parseInt(ticketId) || 
             String(tId) === String(ticketId) ||
             (ticketIdStr && (tId === parseInt(ticketIdStr) || String(tId) === ticketIdStr));
    });
    
    if (!ticket) {
      console.error("Ticket not found in list");
      setDraggedTicket(null);
      return;
    }
    
    // Use the ticket's actual ID and current status
    const actualTicketId = ticket.id;
    const currentStatus = ticket.status;

    // If same status, no update needed
    if (currentStatus === newStatus) {
      setDraggedTicket(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/HelpDesk/UpdateTicketStatus?ticketId=${actualTicketId}&status=${newStatus}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();

      if (response.ok && (data.status === "SUCCESS" || data.statusCode === 200 || response.status === 200)) {
        // Update successful - refresh the ticket list silently (no toast messages)
        fetchTicketList(page, search, pageSize);
      } else {
        // Silently handle error - just log it
        console.error("Update failed:", data);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    } finally {
      setDraggedTicket(null);
    }
  };

  if (!navigate) {
    return <div>Access Denied</div>;
  }

  return (
    <>
      <ToastContainer />
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#F5F7FA", minHeight: "100vh" }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              gap: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1A202C",
                fontSize: { xs: "1.5rem", md: "1.875rem" },
                flexShrink: 0,
              }}
            >
              Help Desk Board
            </Typography>

            {/* Search and Create Button */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: { xs: "stretch", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <Box sx={{ width: { xs: "100%", sm: "400px", md: "450px" } }}>
                <TextField
                  placeholder="Search tickets..."
                  value={search}
                  onChange={handleSearchChange}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "white",
                      borderRadius: 2,
                      height: { xs: "48px", sm: "52px" },
                      fontSize: "0.9375rem",
                      "& fieldset": {
                        borderColor: "#E2E8F0",
                        borderWidth: "1.5px",
                      },
                      "&:hover fieldset": {
                        borderColor: "#CBD5E0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4299E1",
                        borderWidth: "2px",
                      },
                    },
                    "& .MuiInputBase-input": {
                      py: { xs: 1.5, sm: 1.75 },
                      px: 1,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <SearchIcon sx={{ color: "#718096", fontSize: "1.5rem" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              {create && (
                <Box sx={{ flexShrink: 0 }}>
                  <CreateTicketModal
                    fetchItems={fetchTicketList}
                    currentPage={page}
                    currentSearch={search}
                    currentPageSize={pageSize}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Kanban Board */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.25, sm: 1.5, md: 2 },
            overflowX: "auto",
            overflowY: "hidden",
            pb: { xs: 1.5, sm: 2 },
            px: { xs: 0.5, sm: 0 },
            mx: { xs: -0.5, sm: 0 },
            "&::-webkit-scrollbar": {
              height: { xs: 6, sm: 8 },
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "#E2E8F0",
              borderRadius: { xs: 3, sm: 4 },
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#CBD5E0",
              borderRadius: { xs: 3, sm: 4 },
              "&:hover": {
                bgcolor: "#A0AEC0",
              },
            },
            // Smooth scrolling on mobile
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >
          {statusConfig.map((status) => {
            const tickets = filteredTicketsByStatus[status.value] || [];
            const isDragOver = dragOverColumn === status.value;
            
            // Debug logging
            if (tickets.length > 0) {
              console.log(`Status ${status.value} (${status.label}): ${tickets.length} tickets`);
            }

            return (
              <Box
                key={status.value}
                sx={{
                  minWidth: { xs: "260px", sm: "280px", md: "300px", lg: "320px" },
                  width: { xs: "260px", sm: "280px", md: "300px", lg: "320px" },
                  maxWidth: { xs: "calc(100vw - 32px)", sm: "none" },
                  flexShrink: 0,
                  bgcolor: status.columnBg,
                  borderRadius: { xs: 1.5, sm: 2 },
                  p: { xs: 1, sm: 1.25, md: 1.5 },
                  border: `2px solid ${status.color}40`,
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    mb: { xs: 1, sm: 1.25, md: 1.5 },
                    p: { xs: 1, sm: 1.25, md: 1.5 },
                    bgcolor: "white",
                    borderRadius: { xs: 1.5, sm: 2 },
                    border: isDragOver ? `2px solid ${status.color}` : `1px solid ${status.color}60`,
                    boxShadow: isDragOver
                      ? `0 4px 12px ${status.color}40`
                      : `0 2px 4px ${status.color}20`,
                    transition: "all 0.2s",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: status.color,
                        fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {status.label}
                    </Typography>
                    <Chip
                      label={tickets.length}
                      size="small"
                      sx={{
                        bgcolor: status.bgColor,
                        color: status.color,
                        fontWeight: 600,
                        minWidth: { xs: "28px", sm: "32px" },
                        height: { xs: "24px", sm: "28px" },
                        fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </Box>

                {/* Tickets */}
                <Box
                  onDrop={(e) => {
                    console.log("onDrop triggered for status:", status.value);
                    handleDrop(e, status.value);
                  }}
                  onDragOver={(e) => {
                    handleDragOver(e, status.value);
                  }}
                  onDragEnter={(e) => {
                    if (update) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  onDragLeave={handleDragLeave}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 0.75, sm: 1 },
                    minHeight: { xs: "150px", sm: "180px", md: "200px" },
                    maxHeight: { xs: "calc(100vh - 240px)", sm: "calc(100vh - 260px)", md: "calc(100vh - 280px)" },
                    overflowY: "auto",
                    overflowX: "hidden",
                    p: isDragOver ? { xs: 0.25, sm: 0.5 } : 0,
                    transition: "padding 0.2s",
                    bgcolor: isDragOver ? `${status.bgColor}60` : "transparent",
                    border: isDragOver ? `2px dashed ${status.color}` : "2px dashed transparent",
                    borderRadius: { xs: 0.75, sm: 1 },
                    "&::-webkit-scrollbar": {
                      width: { xs: 4, sm: 6 },
                    },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "#CBD5E0",
                      borderRadius: { xs: 2, sm: 3 },
                    },
                  }}
                >
                  {tickets.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        color: "#A0AEC0",
                        fontSize: "0.875rem",
                      }}
                    >
                      No tickets
                    </Box>
                  ) : (
                    tickets.map((ticket) => {
                      const priority = priorityPalette[ticket.priority] || defaultPriorityPalette[1];
                      const isDragging = draggedTicket === ticket.id;

                      // Get priority-based colors
                      const priorityBorderColor = priority.color;
                      const priorityBgColor = priority.bgColor;
                      const priorityCardBg = priority.cardBg || "#FFFFFF";

                      return (
                        <Box
                          key={ticket.id}
                          draggable={update ? true : false}
                          onDragStart={(e) => {
                            console.log("onDragStart triggered for ticket:", ticket.id);
                            handleDragStart(e, ticket);
                          }}
                          onDragEnd={(e) => {
                            console.log("onDragEnd triggered");
                            handleDragEnd();
                          }}
                          onMouseDown={(e) => {
                            if (update && (e.target.closest('button') || e.target.closest('[role="button"]'))) {
                              e.stopPropagation();
                              e.preventDefault();
                            }
                          }}
                          onClick={(e) => {
                            // Open ticket edit modal on click (but not if clicking menu button)
                            if (!e.target.closest('button') && !e.target.closest('[role="button"]')) {
                              if (update) {
                                setEditTicket(ticket);
                                setEditModalOpen(true);
                              } else {
                                handleViewTicket(ticket);
                              }
                            }
                          }}
                          sx={{
                            cursor: "pointer",
                            opacity: isDragging ? 0.5 : 1,
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            MozUserSelect: "none",
                            msUserSelect: "none",
                            touchAction: "none",
                            "&:active": {
                              cursor: update ? "grabbing" : "pointer",
                            },
                          }}
                        >
                          <Card
                            sx={{
                              bgcolor: priorityCardBg,
                              borderRadius: { xs: 1.5, sm: 2 },
                              border: ticket.priority === 4 
                                ? `2px solid ${priorityBorderColor}` 
                                : `1px solid ${priorityBorderColor}40`,
                              borderLeft: ticket.priority === 4 
                                ? { xs: `5px solid ${priorityBorderColor}`, sm: `6px solid ${priorityBorderColor}` }
                                : ticket.priority === 3
                                ? { xs: `4px solid ${priorityBorderColor}`, sm: `5px solid ${priorityBorderColor}` }
                                : { xs: `3px solid ${priorityBorderColor}`, sm: `4px solid ${priorityBorderColor}` },
                              boxShadow: ticket.priority === 4
                                ? `0 2px 8px ${priorityBorderColor}60`
                                : ticket.priority === 3
                                ? `0 2px 6px ${priorityBorderColor}40`
                                : "0 1px 3px rgba(0,0,0,0.08)",
                              transition: ticket.priority === 4 ? "none" : "all 0.2s",
                              pointerEvents: "auto",
                              width: "100%",
                              maxWidth: "100%",
                              position: "relative",
                              overflow: "hidden",
                              mb: { xs: 0.5, sm: 0.75 },
                              // Eye-catching blinking animation for Critical priority tickets (responsive)
                              ...(ticket.priority === 4 && {
                                animation: {
                                  xs: `${blinkMobile} 1s ease-in-out infinite`,
                                  sm: `${blink} 1s ease-in-out infinite`,
                                },
                                borderColor: priorityBorderColor,
                                willChange: "opacity, box-shadow",
                              }),
                              "&:hover": {
                                boxShadow: ticket.priority === 4
                                  ? `0 0 30px rgba(255, 23, 68, 1),
                                     0 0 60px rgba(255, 23, 68, 0.8),
                                     0 6px 20px ${priorityBorderColor}80`
                                  : ticket.priority === 3
                                  ? `0 4px 14px ${priorityBorderColor}60`
                                  : "0 4px 12px rgba(0,0,0,0.12)",
                                transform: isDragging ? "none" : (ticket.priority === 4 ? "none" : "translateY(-2px)"),
                                borderColor: ticket.priority === 4 || ticket.priority === 3
                                  ? `${priorityBorderColor}FF`
                                  : `${priorityBorderColor}80`,
                              },
                            }}
                            onDragStart={(e) => {
                              // Prevent Card from interfering
                              e.stopPropagation();
                            }}
                          >
                            <CardContent sx={{ 
                              p: { xs: 0.875, sm: 1 }, 
                              position: "relative", 
                              zIndex: 1, 
                              "&:last-child": { pb: { xs: 0.875, sm: 1 } },
                              "& .MuiCardContent-root": {
                                padding: { xs: "0.875rem", sm: "1rem" },
                              }
                            }}>
                              {/* Ticket Header */}
                              <Box sx={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "flex-start", 
                                mb: { xs: 0.5, sm: 0.75 },
                                gap: 0.5,
                              }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#2D3748",
                                    fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                                    mb: 0.25,
                                    lineHeight: 1.3,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  {ticket.ticketNumber}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMenuOpen(e, ticket);
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                  sx={{ 
                                    p: { xs: 0.375, sm: 0.5 }, 
                                    color: "#718096", 
                                    pointerEvents: "auto",
                                    flexShrink: 0,
                                    minWidth: { xs: "28px", sm: "32px" },
                                    width: { xs: "28px", sm: "32px" },
                                    height: { xs: "28px", sm: "32px" },
                                  }}
                                >
                                  <MoreVertIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                                </IconButton>
                              </Box>

                            {/* Subject */}
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 500,
                                color: "#1A202C",
                                mb: { xs: 0.5, sm: 0.75 },
                                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                lineHeight: { xs: 1.25, sm: 1.3 },
                                display: "-webkit-box",
                                WebkitLineClamp: { xs: 2, sm: 2 },
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                wordBreak: "break-word",
                                hyphens: "auto",
                              }}
                            >
                              {ticket.subject}
                            </Typography>

                            {/* Category */}
                            {(ticket.categoryName || ticket.category?.name) && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#718096",
                                  display: "block",
                                  mb: { xs: 0.5, sm: 0.75 },
                                  fontSize: { xs: "0.625rem", sm: "0.6875rem" },
                                  lineHeight: 1.3,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ticket.categoryName || ticket.category?.name}
                              </Typography>
                            )}

                            {(ticket.customerName || ticket.customerEmail || ticket.customerPhone) && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: { xs: 0.5, sm: 0.75 },
                                  mb: { xs: 0.5, sm: 0.75 },
                                  color: "#4A5568",
                                  fontSize: { xs: "0.625rem", sm: "0.6875rem" },
                                }}
                              >
                                <PersonIcon sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "block",
                                      fontWeight: 600,
                                      color: "#2D3748",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      maxWidth: { xs: 130, sm: 160 },
                                    }}
                                  >
                                    {ticket.customerName || "Customer"}
                                  </Typography>
                                  {ticket.customerEmail && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        color: "#718096",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: { xs: 130, sm: 160 },
                                      }}
                                    >
                                      {ticket.customerEmail}
                                    </Typography>
                                  )}
                                  {!ticket.customerEmail && ticket.customerPhone && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        color: "#718096",
                                      }}
                                    >
                                      {ticket.customerPhone}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            )}

                            {/* Priority */}
                            <Box sx={{ mb: { xs: 0.5, sm: 0.75 } }}>
                              <Chip
                                label={priority.label}
                                size="small"
                                sx={{
                                  bgcolor: priority.bgColor,
                                  color: priority.color,
                                  fontWeight: 600,
                                  fontSize: { xs: "0.625rem", sm: "0.6875rem" },
                                  height: { xs: "18px", sm: "20px" },
                                  "& .MuiChip-label": {
                                    px: { xs: 0.75, sm: 1 },
                                    py: 0,
                                  },
                                }}
                              />
                            </Box>

                            {/* Footer */}
                            <Box sx={{ 
                              display: "flex", 
                              flexDirection: "column", 
                              gap: { xs: 0.5, sm: 0.75 }, 
                              mt: { xs: 0.75, sm: 1 }, 
                              pt: { xs: 0.625, sm: 0.75 }, 
                              borderTop: "1px solid #E2E8F0" 
                            }}>
                              {/* Checklist removed from frontend */}
                              <Box sx={{ 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center",
                                gap: { xs: 0.5, sm: 1 },
                                flexWrap: "wrap",
                              }}>
                                <Box sx={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: { xs: 0.375, sm: 0.5 },
                                  minWidth: 0,
                                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                                }}>
                                  <PersonIcon sx={{ 
                                    fontSize: { xs: "0.75rem", sm: "0.875rem" }, 
                                    color: "#A0AEC0",
                                    flexShrink: 0,
                                  }} />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#718096",
                                      fontSize: { xs: "0.625rem", sm: "0.6875rem" },
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      minWidth: 0,
                                    }}
                                  >
                                    {ticket.assignedToUser
                                      ? `${ticket.assignedToUserFirstName || ticket.assignedToUser?.firstName || ""} ${ticket.assignedToUserLastName || ticket.assignedToUser?.lastName || ""}`.trim() ||
                                        ticket.assignedToUserEmail ||
                                        ticket.assignedToUser?.email ||
                                        ticket.assignedToUserName ||
                                        ticket.assignedToUser?.userName ||
                                        "Unknown"
                                      : "Unassigned"}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#A0AEC0",
                                    fontSize: { xs: "0.625rem", sm: "0.75rem" },
                                    flexShrink: 0,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {formatDate(ticket.createdOn)}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {update && menuTicket && (
          <MenuItem
            onClick={() => {
              setEditTicket(menuTicket);
              setEditModalOpen(true);
              handleMenuClose();
            }}
          >
            <EditIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
            Edit
          </MenuItem>
        )}
        {!update && menuTicket && (
          <MenuItem
            onClick={() => {
              handleViewTicket(menuTicket);
              handleMenuClose();
            }}
          >
            <VisibilityIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
            View Details
          </MenuItem>
        )}
        {remove && menuTicket && (
          <>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <DeleteIcon sx={{ mr: 1, fontSize: "1.2rem", color: "error.main" }} />
              <DeleteConfirmationById
                id={menuTicket.id}
                controller="HelpDesk/DeleteTicket"
                fetchItems={fetchTicketList}
              />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* View Modal */}
      {selectedTicket && (
        <ViewTicketModal
          open={viewModalOpen}
          onClose={handleCloseViewModal}
          ticket={selectedTicket}
          fetchItems={fetchTicketList}
        />
      )}

      {/* Edit Modal */}
      {editTicket && (
        <EditTicketModal
          fetchItems={fetchTicketList}
          item={editTicket}
          currentPage={page}
          currentSearch={search}
          currentPageSize={pageSize}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditTicket(null);
          }}
        />
      )}
    </>
  );
}
