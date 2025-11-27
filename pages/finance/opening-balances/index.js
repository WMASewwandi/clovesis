import React from "react";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { FormControl, InputLabel, MenuItem, Pagination, Select } from "@mui/material";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import { ToastContainer, toast } from "react-toastify";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import CreateOpeningBalance from "./create";
import EditOpeningBalance from "./edit";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BASE_URL from "Base/api";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";

export default function OpeningBalancesList() {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove } = IsPermissionEnabled(cId);
  const {
    data: openingBalances,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchOpeningBalances,
  } = usePaginatedFetch("OpeningBalances/GetAllOpeningBalances", "", 10, false, false);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    fetchOpeningBalances(1, value, pageSize, false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchOpeningBalances(value, search, pageSize, false);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchOpeningBalances(1, search, size, false);
  };

  const handleOpeningBalanceCreated = () => {
    setPage(1);
    fetchOpeningBalances(1, search, pageSize, false);
  };

  const controller = "OpeningBalances/DeleteOpeningBalance";

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Opening Balances</h1>
        <ul>
          <li>
            <Link href="/finance/opening-balances/">Opening Balances</Link>
          </li>
        </ul>
      </div>
      <ToastContainer />
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={6} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search opening balances..."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} lg={6} mb={1} display="flex" justifyContent="flex-end" order={{ xs: 1, lg: 2 }}>
          {create ? <CreateOpeningBalance onOpeningBalanceCreated={handleOpeningBalanceCreated} /> : ""}
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="opening balances table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Account Code</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Financial Year</TableCell>
                  <TableCell>Opening Debit</TableCell>
                  <TableCell>Opening Credit</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openingBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="error">No opening balances available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  openingBalances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell>{balance.accountCode || "-"}</TableCell>
                      <TableCell>{balance.accountName || "-"}</TableCell>
                      <TableCell>{balance.financialYear || "-"}</TableCell>
                      <TableCell align="right">{formatCurrency(balance.openingDebit || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(balance.openingCredit || 0)}</TableCell>
                      <TableCell>{formatDate(balance.createdOn)}</TableCell>
                      <TableCell align="right">
                        {update ? (
                          <EditOpeningBalance openingBalance={balance} onOpeningBalanceUpdated={handleOpeningBalanceCreated} />
                        ) : (
                          ""
                        )}
                        {remove ? (
                          <DeleteConfirmationById
                            id={balance.id}
                            controller={controller}
                            fetchItems={() => fetchOpeningBalances(page, search, pageSize, false)}
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
            <Grid container justifyContent="space-between" mt={2} mb={2}>
              <Pagination
                count={Math.max(1, Math.ceil(totalCount / pageSize))}
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

