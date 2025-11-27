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
import { Box, FormControl, InputLabel, MenuItem, Pagination, Select } from "@mui/material";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import { ToastContainer, toast } from "react-toastify";
import Chip from "@mui/material/Chip";
import { format } from "date-fns";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import CreatePeriodClosing from "./create";
import EditPeriodClosing from "./edit";
import { formatDate } from "@/components/utils/formatHelper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BASE_URL from "Base/api";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";

export default function PeriodClosingList() {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove } = IsPermissionEnabled(cId);
  const {
    data: periods,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchPeriods,
  } = usePaginatedFetch("PeriodClosing/GetAllPeriods", "", 10, false, false);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    fetchPeriods(1, value, pageSize, false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchPeriods(value, search, pageSize, false);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchPeriods(1, search, size, false);
  };

  const handlePeriodCreated = () => {
    setPage(1);
    fetchPeriods(1, search, pageSize, false);
  };

  const controller = "PeriodClosing/DeletePeriod";

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Period Closing</h1>
        <ul>
          <li>
            <Link href="/finance/period-closing/">Period Closing</Link>
          </li>
        </ul>
      </div>
      <ToastContainer />
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={6} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search periods..."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} lg={6} mb={1} display="flex" justifyContent="flex-end" order={{ xs: 1, lg: 2 }}>
          {create ? <CreatePeriodClosing onPeriodCreated={handlePeriodCreated} /> : ""}
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="period closing table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Period Name</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Closed By</TableCell>
                  <TableCell>Closed Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="error">No periods available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>{period.periodName}</TableCell>
                      <TableCell>{formatDate(period.startDate)}</TableCell>
                      <TableCell>{formatDate(period.endDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={period.isClosed ? "Closed" : "Open"}
                          color={period.isClosed ? "success" : "warning"}
                          variant="filled"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{period.closedBy || "-"}</TableCell>
                      <TableCell>{formatDate(period.closedDate)}</TableCell>
                      <TableCell align="right">
                        {update ? (
                          <EditPeriodClosing period={period} onPeriodUpdated={handlePeriodCreated} />
                        ) : (
                          ""
                        )}
                        {remove ? (
                          <DeleteConfirmationById
                            id={period.id}
                            controller={controller}
                            fetchItems={() => fetchPeriods(page, search, pageSize, false)}
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

