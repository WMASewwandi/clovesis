import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer } from "react-toastify";
import AddCategory from "@/components/UIElements/Modal/AddCategory";
import BASE_URL from "Base/api";
import EditCategory from "@/components/UIElements/Modal/EditCategory";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import { formatDate } from "@/components/utils/formatHelper";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import { FormControl, Pagination } from "@mui/material";
import { InputLabel, MenuItem, Select } from "@mui/material";

const Category = () => {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [categoryList, setCategoryList] = useState([]);
  const controller = "Category/DeleteCategory";

  const {
    data: Category,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchCategoryList,
  } = usePaginatedFetch("Category/GetAllCategoryPage");

  // const fetchCategoryList = async () => {
  //   try {
  //     const response = await fetch(`${BASE_URL}/Category/GetAllCategory`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch Size List");
  //     }

  //     const data = await response.json();
  //     setCategoryList(data.result);
  //   } catch (error) {
  //     console.error("Error fetching Size List:", error);
  //   }
  // };

  const handleSearchChange = (event) => {
    const val = event.target.value;
    setSearch(val);
    setPage(1);
    fetchCategoryList(1, val, pageSize);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchCategoryList(value, search, pageSize);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchCategoryList(1, search, size);
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Category</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Category</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12}>
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Grid item xs={12} md={6} lg={5} order={{ xs: 2, lg: 1 }}>
              <Search className="search-form" style={{ width: "100%" }}>
                <StyledInputBase
                  placeholder="Search here.."
                  inputProps={{ "aria-label": "search" }}
                  value={search}
                  onChange={handleSearchChange}
                />
              </Search>
            </Grid>
            {create ? <AddCategory fetchItems={fetchCategoryList} /> : ""}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Created On</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Category.length === 0 ? (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell colSpan={4} component="th" scope="row">
                      <Typography color="error">
                        No Categories Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  Category.map((Category, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {Category.name}
                      </TableCell>
                      <TableCell>{formatDate(Category.createdOn)}</TableCell>
                      <TableCell>
                        {Category.isActive == true ? (
                          <span className="successBadge">Active</span>
                        ) : (
                          <span className="dangerBadge">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {update ? (
                          <EditCategory
                            fetchItems={fetchCategoryList}
                            category={Category}
                          />
                        ) : (
                          ""
                        )}
                        {remove ? (
                          <DeleteConfirmationById
                            id={Category.id}
                            controller={controller}
                            fetchItems={fetchCategoryList}
                          />
                        ) : (
                          ""
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination + Page size */}
            <Grid container justifyContent="space-between" mt={2} mb={2}>
              <Pagination
                count={Math.max(
                  1,
                  Math.ceil((totalCount || 0) / (pageSize || 10))
                )}
                page={page || 1}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
              <FormControl size="small" sx={{ mr: 2, width: "120px" }}>
                <InputLabel>Page Size</InputLabel>
                <Select
                  value={pageSize || 10}
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

export default Category;
