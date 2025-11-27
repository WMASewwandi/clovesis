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
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useRouter } from "next/router";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";

const STATUS_META = {
  1: { label: "Pending", color: "warning" },
  2: { label: "Paid", color: "success" },
};

export default function VendorInvoiceList() {
  const router = useRouter();
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const {
    data: vendorInvoices,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchVendorInvoices,
  } = usePaginatedFetch("VendorInvoice/GetAllVendorInvoices", "", 10, false, false);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    fetchVendorInvoices(1, value, pageSize, false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchVendorInvoices(value, search, pageSize, false);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchVendorInvoices(1, search, size, false);
  };

  const navigateToCreate = () => {
    router.push({
      pathname: "/finance/vendor-invoice/create",
    });
  };

  const navigateToEdit = (id) => {
    router.push({
      pathname: "/finance/vendor-invoice/edit",
      query: { id },
    });
  };

  const controller = "VendorInvoice/DeleteVendorInvoice";

  const renderStatusChip = (status) => {
    const meta = STATUS_META[status] || { label: "Unknown", color: "default" };
    return (
      <Chip
        label={meta.label}
        color={meta.color}
        variant={meta.color === "default" ? "outlined" : "filled"}
        size="small"
        sx={{ textTransform: "capitalize" }}
      />
    );
  };

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Vendor Invoice</h1>
        <ul>
          <li>
            <Link href="/finance/vendor-invoice/">Vendor Invoice</Link>
          </li>
        </ul>
      </div>
      <ToastContainer />
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={6} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search vendor invoices..."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} lg={6} mb={1} display="flex" justifyContent="flex-end" order={{ xs: 1, lg: 2 }}>
          {create ? (
            <Button variant="contained" onClick={navigateToCreate}>
              + Add Vendor Invoice
            </Button>
          ) : (
            ""
          )}
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="vendor invoice table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Supplier Name</TableCell>
                  <TableCell>Invoice Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Net Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography color="error">No vendor invoices available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  vendorInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNo || "-"}</TableCell>
                      <TableCell>{invoice.supplierName || "-"}</TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.totalAmount || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.netAmount || 0)}</TableCell>
                      <TableCell>{renderStatusChip(invoice.status)}</TableCell>
                      <TableCell align="right">
                        {update ? (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label="edit vendor invoice"
                              onClick={() => navigateToEdit(invoice.id)}
                            >
                              <EditOutlinedIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          ""
                        )}
                        {remove ? (
                          <DeleteConfirmationById
                            id={invoice.id}
                            controller={controller}
                            fetchItems={() => fetchVendorInvoices(page, search, pageSize, false)}
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

