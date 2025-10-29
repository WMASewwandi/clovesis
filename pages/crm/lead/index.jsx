import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import EditLead from "./edit";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import useApi from "@/components/utils/useApi";
import BASE_URL from "Base/api";

const LEAD_STAGE_MAP = {
  1: "New",
  2: "Contacted",
  3: "Qualified",
  4: "Unqualified",
};

const Leads = () => {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove } = IsPermissionEnabled(cId);
  const router = useRouter();

  const [tagMap, setTagMap] = useState({});

  const { data: enumsData } = useApi("/Enums/crm");
  useEffect(() => {
    if (enumsData && enumsData.leadTags) {
      setTagMap(enumsData.leadTags);
    }
  }, [enumsData]);

  const {
    data: leads,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchLeads,
  } = usePaginatedFetch("Leads/GetAllLeads");

  const navigateToCreate = () => router.push("/crm/lead/create-lead");

  // --- THIS IS THE UPDATED FUNCTION ---
  // Removed the window.confirm() wrapper
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/Leads/DeleteLead?id=${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Lead deleted successfully!");
        fetchLeads(); // This reloads the table
      } else {
        toast.error(result.message || "Failed to delete lead.");
      }
    } catch (err) {
      toast.error("An error occurred while connecting to the server.");
    }
  };
  // --- END OF UPDATE ---

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    fetchLeads(1, event.target.value, pageSize);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
    fetchLeads(newPage + 1, search, pageSize);
  };

  const handleChangeRowsPerPage = (event) => {
    const size = parseInt(event.target.value, 10);
    setPageSize(size);
    setPage(1);
    fetchLeads(1, search, size);
  };

  const getStageChipColor = (stageId) => {
    const stageName = LEAD_STAGE_MAP[stageId] || "";
    switch (stageName.toLowerCase()) {
      case "qualified": return "success";
      case "contacted": return "warning";
      case "new": return "primary";
      case "unqualified": return "error";
      default: return "default";
    }
  };

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Leads</h1>
        <h1>Contact</h1>
          <ul>
            <li>
               <Link href="/crm/lead">Lead</Link>
            </li>
          </ul>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} md={8} display="flex" justifyContent="end" gap={1}>
          {create && (
            <Button variant="outlined" size="small" onClick={navigateToCreate}>
              + New Lead
            </Button>
          )}
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="error">No Leads Available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((item) => {
                    const tagNames = Array.isArray(item.tags)
                      ? item.tags
                          .map(tagId => tagMap[tagId])
                          .filter(Boolean)
                      : [];

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.firstName} {item.lastName}
                        </TableCell>
                        <TableCell>{item.company}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={LEAD_STAGE_MAP[item.stage] || "Unknown"}
                            color={getStageChipColor(item.stage)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {tagNames.length > 0 ? (
                              tagNames.map((name, index) => (
                                <Chip
                                  key={index}
                                  label={name}
                                  size="small"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              '--'
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            {update && (
                              <EditLead item={item} fetchItems={fetchLeads} />
                            )}
                            {remove && (
                              <Tooltip title="Delete Lead">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={pageSize}
              page={page - 1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default Leads;