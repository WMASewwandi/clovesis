import React, { useEffect, useState } from "react";
import styles from "@/styles/PageTitle.module.css";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import AddSize from "@/components/UIElements/Modal/AddSize";
import { Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";
import EditSize from "@/components/UIElements/Modal/EditSize";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import { formatDate } from "@/components/utils/formatHelper";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";

export default function Size() {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [sizeList, setSizeList] = useState([]);
  const controller = "Size/DeleteSize";

  const fetchSizeList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Size/GetAllSize`, {
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
      setSizeList(data.result);
    } catch (error) {
      console.error("Error fetching Size List:", error);
    }
  };

  useEffect(() => {
    fetchSizeList();
  }, []);

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Size</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Size</li>
        </ul>
      </div>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} mb={2} display="flex" justifyContent="end">
          {create ? <AddSize fetchItems={fetchSizeList} /> : ""}
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="end">
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow sx={{ background: "#757fef" }}>
                  <TableCell sx={{ color: "#fff" }}>Size</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Created On</TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sizeList.length === 0 ? (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell colSpan={3} component="th" scope="row">
                      <Typography color="error">No Sizes Available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sizeList.map((size, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {size.name}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {formatDate(size.createdOn)}
                      </TableCell>
                      <TableCell align="right">
                        {size.isActive == true ? (
                          <span className="successBadge">Active</span>
                        ) : (
                          <span className="dangerBadge">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {update ? <EditSize fetchItems={fetchSizeList} item={size} /> : ""}
                        {remove ? <DeleteConfirmationById id={size.id} controller={controller} fetchItems={fetchSizeList} /> : ""}
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
}
