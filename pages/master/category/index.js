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

const Category = () => {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [categoryList, setCategoryList] = useState([]);
  const controller = "Category/DeleteCategory";

  const fetchCategoryList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Category/GetAllCategory`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Size List");
      }

      const data = await response.json();
      setCategoryList(data.result);
    } catch (error) {
      console.error("Error fetching Size List:", error);
    }
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
        <Grid item xs={12} mb={2} display="flex" justifyContent="end">
          {create ? <AddCategory fetchItems={fetchCategoryList} /> : ""}
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow sx={{ background: "#757fef" }}>
                  <TableCell sx={{ color: "#fff" }}>#</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Category</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Created On</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryList.length === 0 ? (
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
                  categoryList.map((category, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {category.name}
                      </TableCell>
                      <TableCell>{formatDate(category.createdOn)}</TableCell>
                      <TableCell>
                        {category.isActive == true ? (
                          <span className="successBadge">Active</span>
                        ) : (
                          <span className="dangerBadge">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {update ? <EditCategory fetchItems={fetchCategoryList} category={category} /> : ""}
                        {remove ? <DeleteConfirmationById id={category.id} controller={controller} fetchItems={fetchCategoryList} /> : ""}                        
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default Category;
