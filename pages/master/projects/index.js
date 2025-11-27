import React, { useEffect, useState } from "react";
import styles from "@/styles/PageTitle.module.css";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import { ToastContainer } from "react-toastify";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Pagination,
  FormControl,
  Typography,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Chip,
  Box,
} from "@mui/material";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import AddIcon from "@mui/icons-material/Add";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditProjectModal from "./edit";
import CreateProjectModal from "./create";

const Index = () => {
  useEffect(() => {
    sessionStorage.setItem("category", "53"); // Projects (Master Data)
  }, []);

  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove } = IsPermissionEnabled(cId);

  const [projectList, setProjectList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchProjectList = async (currentPage = page, currentSearch = search, currentPageSize = pageSize) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/Project/GetAllProjects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      const data = await response.json();
      const projects = data.result || [];
      
      // Filter by search term
      let filteredProjects = projects;
      if (currentSearch && currentSearch.trim()) {
        filteredProjects = projects.filter(
          (p) =>
            p.name?.toLowerCase().includes(currentSearch.toLowerCase()) ||
            p.description?.toLowerCase().includes(currentSearch.toLowerCase())
        );
      }

      // Pagination
      const startIndex = (currentPage - 1) * currentPageSize;
      const paginatedProjects = filteredProjects.slice(startIndex, startIndex + currentPageSize);

      setProjectList(paginatedProjects);
      setTotalCount(filteredProjects.length);
      setPage(currentPage);
      setPageSize(currentPageSize);
      setSearch(currentSearch);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjectList();
  }, []);

  const [editProject, setEditProject] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleSearchChange = (event) => {
    const newSearch = event.target.value;
    setSearch(newSearch);
    setPage(1);
    fetchProjectList(1, newSearch, pageSize);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchProjectList(value, search, pageSize);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchProjectList(1, search, size);
  };

  const resolveProjectCustomerName = (project) => {
    if (!project) return "Unassigned";

    const buildPersonName = (entity) => {
      const displayName = entity?.displayName || entity?.name;
      if (displayName) return displayName;

      const name = [entity?.firstName, entity?.lastName].filter(Boolean).join(" ").trim();
      if (name) return name;

      return entity?.company || entity?.customerName || entity?.emailAddress || entity?.email || "";
    };

    const candidateEntities = [
      project.customer,
      project.customerDetails,
      project.customerInfo,
      project.assignedCustomer,
      project.assignedToCustomer,
    ].filter(Boolean);

    for (const entity of candidateEntities) {
      const name = buildPersonName(entity);
      if (name) return name;
    }

    const directFields = [
      project.customerName,
      project.customerDisplayName,
      project.assignedCustomerName,
      project.customerCompany,
    ].filter((value) => typeof value === "string" && value.trim().length > 0);

    if (directFields.length > 0) {
      return directFields[0];
    }

    if (project.assignedToUser) {
      const name = [project.assignedToUser.firstName, project.assignedToUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (name) return name;

      return project.assignedToUser.email || project.assignedToUser.userName || "Unassigned";
    }

    return "Unassigned";
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/Project/DeleteProject?id=${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && (data.status === "SUCCESS" || data.statusCode === 200)) {
        toast.success("Project deleted successfully!");
        fetchProjectList(page, search, pageSize);
      } else {
        toast.error(data.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("An error occurred while deleting the project");
    }
  };

  if (!navigate) {
    return <div>Access Denied</div>;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Projects</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Master Data</li>
          <li>Projects</li>
        </ul>
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Search>
                <StyledInputBase
                  placeholder="Search projects..."
                  inputProps={{ "aria-label": "search" }}
                  value={search}
                  onChange={handleSearchChange}
                />
              </Search>
              {create && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create Project
                </Button>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Created On</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!projectList || projectList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No projects found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectList.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.description || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status || "Open"}
                            color={project.status === "Closed" ? "default" : "primary"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{resolveProjectCustomerName(project)}</TableCell>
                        <TableCell>
                          {project.createdOn
                            ? new Date(project.createdOn).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            {update && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleEdit(project)}
                              >
                                Edit
                              </Button>
                            )}
                            {remove && (
                              <DeleteConfirmationById
                                id={project.id}
                                controller="Project/DeleteProject"
                                onDelete={() => handleDelete(project.id)}
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid container justifyContent="space-between" mt={2} mb={2}>
              <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Page Size</InputLabel>
                <Select value={pageSize} label="Page Size" onChange={handlePageSizeChange}>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {create && (
        <CreateProjectModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          fetchItems={() => fetchProjectList(page, search, pageSize)}
        />
      )}

      {update && editProject && (
        <EditProjectModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditProject(null);
          }}
          project={editProject}
          fetchItems={() => fetchProjectList(page, search, pageSize)}
        />
      )}
    </>
  );
};

export default Index;

