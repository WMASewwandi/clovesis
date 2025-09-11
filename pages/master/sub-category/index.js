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
import AddSubCategory from "@/components/UIElements/Modal/AddSubCategory";
import BASE_URL from "Base/api";
import EditSubCategory from "@/components/UIElements/Modal/EditSubCategory";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import { formatDate } from "@/components/utils/formatHelper";

const SubCategory = () => {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const controller = "SubCategory/DeleteSubCategory";

  const fetchSubCategoryList = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/SubCategory/GetAllSubCategory`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Size List");
      }

      const data = await response.json();
      setSubCategoryList(data.result);
    } catch (error) {
      console.error("Error fetching Size List:", error);
    }
  };

  useEffect(() => {
    fetchSubCategoryList();
  }, []);

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Sub Category</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Sub Category</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} mb={2} display="flex" justifyContent="end">
          <AddSubCategory fetchItems={fetchSubCategoryList} />
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow sx={{ background: "#757fef" }}>
                  <TableCell sx={{ color: "#fff" }}>
                    Sub Category Name
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>Category</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Created On</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subCategoryList.length === 0 ? (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell colSpan={4} component="th" scope="row">
                      <Typography color="error">
                        No Sub Categories Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  subCategoryList.map((subcategory, index) => (
                    <TableRow key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell> {subcategory.name}</TableCell>
                      <TableCell component="th" scope="row">
                        {subcategory.categoryDetails ? subcategory.categoryDetails.name : ""}
                      </TableCell>
                      <TableCell>{subcategory.categoryDetails ? formatDate(subcategory.categoryDetails.createdOn) : ""}</TableCell>
                      <TableCell>
                        {subcategory.isActive == true ? (
                          <span className="successBadge">Active</span>
                        ) : (
                          <span className="dangerBadge">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {update ? <EditSubCategory fetchItems={fetchSubCategoryList} subcategory={subcategory} /> : ""}
                        {remove ? <DeleteConfirmationById id={subcategory.id} controller={controller} fetchItems={fetchSubCategoryList} /> : ""}

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

export default SubCategory;
