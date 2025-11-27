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
import { ToastContainer } from "react-toastify";
import Chip from "@mui/material/Chip";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import { getPaymentMethods } from "@/components/types/types";
import CreateSupplierPayment from "./create";
import EditSupplierPaymentModal from "./edit";
import { formatDate } from "@/components/utils/formatHelper";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";

export default function SupplierPaymentsList() {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const controller = "SupplierPayment/DeleteSupplierPayment";

  const {
    data: supplierPayments,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchSupplierPayments,
  } = usePaginatedFetch("SupplierPayment/GetAllSupplierPayments", "", 10, false);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    fetchSupplierPayments(1, value, pageSize, false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchSupplierPayments(value, search, pageSize, false);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchSupplierPayments(1, search, size, false);
  };

  const handlePaymentCreated = () => {
    setPage(1);
    fetchSupplierPayments(1, search, pageSize, false);
  };

  const handlePaymentUpdated = () => {
    fetchSupplierPayments(page, search, pageSize, false);
  };

  const renderPaymentMethod = (paymentMethod) => {
    const methodLabel = getPaymentMethods(paymentMethod);
    return (
      <Chip
        label={methodLabel}
        color="primary"
        variant="outlined"
        size="small"
      />
    );
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Supplier Payments</h1>
        <ul>
          <li>
            <Link href="/finance/supplier-payments/">Supplier Payments</Link>
          </li>
        </ul>
      </div>
      <ToastContainer />
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={6} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search supplier payments..."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} lg={6} mb={1} display="flex" justifyContent="flex-end" order={{ xs: 1, lg: 2 }}>
          {create ? <CreateSupplierPayment onSupplierPaymentCreated={handlePaymentCreated} /> : ""}
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="supplier payments table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Payment No</TableCell>
                  <TableCell>Supplier Name</TableCell>
                  <TableCell>Payment Date</TableCell>
                  <TableCell>Total Paid Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Bank Account</TableCell>
                  <TableCell>Created On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplierPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography color="error">No supplier payments available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  supplierPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.paymentNo || "-"}</TableCell>
                      <TableCell>{payment.supplierName || "-"}</TableCell>
                      <TableCell>
                        {formatDate(payment.paymentDate)}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.totalPaidAmount)}</TableCell>
                      <TableCell>{renderPaymentMethod(payment.paymentMethod)}</TableCell>
                      <TableCell>{payment.bankAccountName || "-"}</TableCell>
                      <TableCell>
                        {formatDate(payment.createdOn)}
                      </TableCell>
                      <TableCell align="right">
                        {update ? (
                          <EditSupplierPaymentModal
                            supplierPayment={payment}
                            onSupplierPaymentUpdated={handlePaymentUpdated}
                          />
                        ) : (
                          ""
                        )}
                        {remove ? (
                          <DeleteConfirmationById
                            id={payment.id}
                            controller={controller}
                            fetchItems={() => fetchSupplierPayments(page, search, pageSize, false)}
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

