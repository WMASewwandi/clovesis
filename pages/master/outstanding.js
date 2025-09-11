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
  TablePagination,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer } from "react-toastify";
import useApi from "@/components/utils/useApi";

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

export const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0.00";
  }
  return `${amount.toFixed(2)}`;
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: 0,
  border: "1px solid #a0b8f6",
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginRight: theme.spacing(1),
    width: "auto",
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    backgroundColor: "#F5F7FA",
    borderRadius: "30px",
    padding: theme.spacing(1.4, 0, 1.4, 2),
    paddingRight: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "260px",
      "&:focus": {
        width: "280px",
      },
    },
  },
}));

const outstanding = () => {
  const [outstanding, setOutstanding] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: outstandingList,
    loading: Loading,
    error: Error,
  } = useApi("/Outstanding/GetAllOutstandings");

  useEffect(() => {
    if (outstandingList) {
      setOutstanding(outstandingList);
    }
  }, [outstandingList]);

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

  const filteredData = outstanding.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Customer Outstanding</h1>
        <ul>
          <li>
            <Link href="/">Reports</Link>
          </li>
          <li>Customer Outstanding</li>
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
              placeholder="Search here..."
              inputProps={{ "aria-label": "search" }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Total Invoice Amount</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Outstanding Amount</TableCell>
                  <TableCell>Outstanding Date</TableCell>
                  <TableCell>Sales Person Name</TableCell>
                  <TableCell>Remark</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="error">
                        No Outstanding Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => {
                    const paidAmount = item.totalInvoiceAmount - item.outstandingAmount;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{item.invoiceNumber}</TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell>{formatCurrency(item.totalInvoiceAmount)}</TableCell>
                        <TableCell>{formatCurrency(paidAmount)}</TableCell>
                        <TableCell>{formatCurrency(item.outstandingAmount)}</TableCell>
                        <TableCell>{formatDate(item.documentDate)}</TableCell>
                        <TableCell>{item.salesPersonName}</TableCell>
                        <TableCell>{item.remark}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
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
};

export default outstanding;
