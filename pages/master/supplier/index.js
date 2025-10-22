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
import AddSupplier from "pages/master/supplier/AddSupplier";
import { Pagination, Typography, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";

import EditSupplier from "pages/master/supplier/EditSupplier";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import IsAppSettingEnabled from "@/components/utils/IsAppSettingEnabled";
import GetAllWarehouse from "@/components/utils/GetAllWarehouse";
import { formatDate } from "@/components/utils/formatHelper";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import useApi from "@/components/utils/useApi";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";


export default function Customers() {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [chartOfAccInfo, setChartOfAccInfo] = useState({});
  const {
    data: customerList,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchCustomerList,
  } = usePaginatedFetch("Supplier/GetAll");

  const controller = "Supplier/DeleteSupplier";

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
    fetchCustomerList(1, event.target.value, pageSize);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchCustomerList(value, search, pageSize);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchCustomerList(1, search, size);
  };



  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Supplier</h1>
        <ul>
          <li>
        
          </li>
        </ul>
      </div>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={4} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search here.."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} lg={8} mb={1} display="flex" justifyContent="end" order={{ xs: 1, lg: 2 }}>
          {create ? <AddSupplier fetchItems={fetchCustomerList} chartOfAccounts={chartOfAccounts}/> : ""}
        </Grid>
        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>Payable Account</TableCell>
                   <TableCell>Status</TableCell>
                 
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="error">No Supplier Available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  customerList.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {[item?.name].filter(Boolean).join(" ")}
                      </TableCell>
                      <TableCell> {[item?.mobileNo].filter(Boolean).join(" ")}</TableCell>
                      <TableCell>{[item?.payableAccount].filter(Boolean).join(" ")}</TableCell>
                      {/* //<TableCell>{[item?.isActive].filter(Boolean).join(" ")}</TableCell> */}

                      <TableCell>
                                              {item?.isActive == true ? (
                                                <span className="successBadge">Active</span>
                                              ) : (
                                                <span className="dangerBadge">Inactive</span>
                                              )}
                                            </TableCell>

                     
                      <TableCell align="right">
                        {update ? <EditSupplier fetchItems={fetchCustomerList} item={item} chartOfAccounts={chartOfAccounts}/> : ""}
                        {remove ? <DeleteConfirmationById id={item.id} controller={controller} fetchItems={fetchCustomerList} /> : ""}
                      </TableCell>
                    </TableRow>
                  ))
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
                <Select value={pageSize} label="Page Size" onChange={handlePageSizeChange}>
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


}
