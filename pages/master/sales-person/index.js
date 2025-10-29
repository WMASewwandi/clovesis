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
import { Pagination, Typography, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { ToastContainer } from "react-toastify";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import AddSalesPerson from "./create";
import IsAppSettingEnabled from "@/components/utils/IsAppSettingEnabled";
import EditSalesPerson from "./edit";
// import ViewViewSalesPersonDialog from "./view";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch"; // adjust import as needed

export default function SalesPerson() { // <-- Renamed component
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [chartOfAccInfo, setChartOfAccInfo] = useState({});
  //const { data: accountList } = useApi("/ChartOfAccount/GetAll");
  
 
  const {
    data: salesPersonList, // <-- Renamed variable
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchSalesPersonList, // <-- Renamed function
  } = usePaginatedFetch("SalesPerson/GetAllSalesPerson");


  // --- THIS IS THE FIX ---
  useEffect(() => {
    // Fetch data when the component mounts using the initial state from the hook
    fetchSalesPersonList(page, search, pageSize);
  }, []); // <-- The empty array [] ensures this runs only ONCE on mount
  // --- END OF FIX ---


  const controller = "SalesPerson/DeleteSalesPerson";

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
    fetchSalesPersonList(1, event.target.value, pageSize); // <-- Use renamed function
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchSalesPersonList(value, search, pageSize); // <-- Use renamed function
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchSalesPersonList(1, search, size); // <-- Use renamed function
  };

  // useEffect(() => {
  //     if (accountList) {
  //       const accMap = accountList.reduce((acc, account) => {
  //         acc[account.id] = account;
  //         return acc;
  //       }, {});
  //       setChartOfAccInfo(accMap);
  //       setChartOfAccounts(accountList);
  //     }
  //   }, [accountList]);

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
          {create ? <AddSalesPerson fetchItems={fetchSalesPersonList} chartOfAccounts={chartOfAccounts}/> : ""} {/* <-- Pass renamed function */}
        </Grid>
        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>remark</TableCell>
              
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesPersonList.length === 0 ? ( // <-- Use renamed variable
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="error">No Sales Person Available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  salesPersonList.map((item, index) => ( // <-- Use renamed variable
                    <TableRow key={index}>
                      <TableCell>
                        {[ item?.code].filter(Boolean).join(" ")}
                      </TableCell>
                      <TableCell>  {[ item?.name].filter(Boolean).join(" ")}</TableCell>
                      <TableCell>  {[ item?.mobileNumber].filter(Boolean).join(" ")}</TableCell>
                      <TableCell>  {[ item?.remark].filter(Boolean).join(" ")}</TableCell>

                      
                      <TableCell align="right">
                        {update ? <EditSalesPerson fetchItems={fetchSalesPersonList} item={item} chartOfAccounts={chartOfAccounts}/> : ""} {/* <-- Pass renamed function */}
                        {remove ? <DeleteConfirmationById id={item.id} controller={controller} fetchItems={fetchSalesPersonList} /> : ""} {/* <-- Pass renamed function */}
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
// Note: I also removed an extra closing brace } that was at the end of your original file.