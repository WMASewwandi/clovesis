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
  // --- REMOVED ---
  // TablePagination, 
  Chip,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Link as MuiLink,
  // --- ADDED ---
  Pagination,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import EditAccount from "./edit"; 
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import useApi from "@/components/utils/useApi";
import BASE_URL from "Base/api";

const Account = () => {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove } = IsPermissionEnabled(cId);
  const router = useRouter();

  const [tagMap, setTagMap] = useState({});

  const { data: enumsData, loading: enumsLoading } = useApi("/Enums/crm");
  
  useEffect(() => {
    if (enumsData) {
      if (enumsData.leadTags) {
        setTagMap(enumsData.leadTags);
      }
    }
  }, [enumsData]);

  const {
    data: accounts, 
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchAccounts, 
    loading: accountsLoading, 
  } = usePaginatedFetch("Account/GetAllAccounts"); 

  // Fetch data on component mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]); // fetchAccounts is memoized by useCallback in the hook

  const navigateToCreate = () => router.push("/crm/account/create-account");

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/Account/DeleteAccount?id=${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Account deleted successfully!");
        fetchAccounts(); // Refresh accounts list
      } else {
        toast.error(result.message || "Failed to delete account.");
      }
    } catch (err) {
      toast.error("An error occurred while connecting to the server.");
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    fetchAccounts(1, event.target.value, pageSize);
    setPage(1);
  };

  // --- CHANGED: Handler for Pagination component ---
  const handlePageChange = (event, value) => {
    setPage(value);
    fetchAccounts(value, search, pageSize);
  };

  // --- CHANGED: Handler for PageSize Select component ---
  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchAccounts(1, search, size);
  };
  
  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Accounts</h1>
          <ul>
            <li>
              <Link href="/crm/account">Account</Link>
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
              + New Account
            </Button>
          )}
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Website</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Annual Revenue</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accountsLoading || enumsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? ( 
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="error">
                        No Accounts Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((item) => { 
                    let tagIds = [];
                    try {
                      if (typeof item.tags === 'string') {
                        tagIds = JSON.parse(item.tags); 
                      } else if (Array.isArray(item.tags)) {
                        tagIds = item.tags;
                      }
                    } catch (e) {
                      console.error("Failed to parse tags:", item.tags, e);
                    }
                    
                    const tagNames = Array.isArray(tagIds)
                      ? tagIds
                          .map((tagId) => tagMap[tagId])
                          .filter(Boolean)
                      : [];

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.name}
                        </TableCell>
                        <TableCell>{item.industry || "--"}</TableCell>
                        <TableCell>
                           {item.website ? (
                            <MuiLink href={item.website} target="_blank" rel="noopener noreferrer">
                              {item.website}
                            </MuiLink>
                          ) : (
                            "--"
                          )}
                        </TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>
                          {item.annualRevenue
                            ? item.annualRevenue.toLocaleString()
                            : "--"}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
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
                              "--"
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                          >
                            {update && (
                              <EditAccount
                                item={item}
                                fetchItems={fetchAccounts}
                              />
                            )}
                            {remove && (
                              <Tooltip title="Delete Account">
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
            
            
            <Grid container justifyContent="space-between" mt={2} mb={2}>
              <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
              <FormControl size="small" sx={{ mr: 2, width: "100px" }}>
                <InputLabel>Page Size</InputLabel>
                <Select
                  value={pageSize}
                  label="Page Size"
                  onChange={handlePageSizeChange}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          

          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default Account;