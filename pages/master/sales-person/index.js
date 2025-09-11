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
import { TablePagination, Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import AddSalesPerson from "./create";
import IsAppSettingEnabled from "@/components/utils/IsAppSettingEnabled";
import GetAllSuppliers from "@/components/utils/GetAllSuppliers";
import EditSalesPerson from "./edit";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";

export default function SalesPerson() {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [salesPersonList, setSalesPersonList] = useState([]);
  const controller = "SalesPerson/DeleteSalesPerson";
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: isSupplierSalesRef } =
    IsAppSettingEnabled(`IsSupplierSalesRef`);
  const { data: supplierList } = GetAllSuppliers();
  const [supplierInfo, setSupplierInfo] = useState({});

  useEffect(() => {
    if (supplierList) {
      const supplierMap = supplierList.reduce((acc, supplier) => {
        acc[supplier.id] = supplier;
        return acc;
      }, {});
      setSupplierInfo(supplierMap);
    }
  }, [supplierList]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const fetchSalesPersonList = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/SalesPerson/GetAllSalesPerson`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setSalesPersonList(data.result);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchSalesPersonList();
  }, []);

  const filteredData = salesPersonList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Sales Person</h1>
        <ul>
          <li>
            <Link href="/master/sales-person/">Sales Person</Link>
          </li>
        </ul>
      </div>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} lg={4} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search here.."
              inputProps={{ "aria-label": "search" }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          mb={1}
          display="flex"
          justifyContent="end"
          order={{ xs: 1, lg: 2 }}
        >
          {create ? <AddSalesPerson
            fetchItems={fetchSalesPersonList}
            isSupplierSalesRef={isSupplierSalesRef}
            suppliers={supplierList}
          /> : ""}
        </Grid>
        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile No</TableCell>
                  {isSupplierSalesRef && <TableCell>Supplier</TableCell>}
                  <TableCell>Remark</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell colSpan={6} component="th" scope="row">
                      <Typography color="error">
                        No Sales Persons Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((person, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {person.code}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {person.name}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        {person.mobileNumber}
                      </TableCell>
                      {isSupplierSalesRef && (
                        <TableCell>
                          {supplierInfo[person.supplier]
                            ? supplierInfo[person.supplier].name
                            : "-"}
                        </TableCell>
                      )}
                      <TableCell component="th" scope="row">
                        {person.remark}
                      </TableCell>
                      <TableCell align="right">
                        {update ? <EditSalesPerson
                          item={person}
                          fetchItems={fetchSalesPersonList}
                          isSupplierSalesRef={isSupplierSalesRef}
                          suppliers={supplierList}
                        /> : ""}
                        {remove ? <DeleteConfirmationById
                          id={person.id}
                          controller={controller}
                          fetchItems={fetchSalesPersonList}
                        /> : ""}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={paginatedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
}
