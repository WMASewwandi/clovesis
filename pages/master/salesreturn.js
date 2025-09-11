import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Button,
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
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import BASE_URL from "Base/api";
import { formatDate } from "@/components/utils/formatHelper";

const SalesReturn = () => {
  const [salesReturn, setSalesReturn] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const navigateToCreate = () => {
    router.push("/master/create-salesreturn");
  };

  const navigateToEdit = (id) => {
    router.push(`/master/edit-salesreturn?id=${id}`);
  };

  const fetchSalesReturn = async () => {
    try {
      const response = await fetch(`${BASE_URL}/SalesReturn/GetAllSalesReturn`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch Sales Return List");
      }
      const data = await response.json();
      setSalesReturn(data.result);
    } catch (error) {
      console.error("Error fetching Sales Return List:", error);
    }
  };

  useEffect(() => {
    fetchSalesReturn();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const filteredData = salesReturn.filter((item) =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Sales Return</h1>
        <ul>
          <li><Link href="/">Dashboard</Link></li>
          <li>Sales Return</li>
        </ul>
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <InputBase
            placeholder="Search here.."
            inputProps={{ "aria-label": "search" }}
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: "100%", padding: "8px", border: "1px solid #a0b8f6", borderRadius: "4px" }}
          />
        </Grid>
        <Grid item xs={12} lg={8} display="flex" justifyContent="end">
          <Button variant="outlined" onClick={navigateToCreate}>
            + Add New
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Return Date</TableCell>
                  <TableCell>Return No</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Return Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="error">No Sales Returns Available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{formatDate(item.salesReturnDate)}</TableCell>
                      <TableCell>{item.documentNo}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>{item.invoiceNo}</TableCell>
                      <TableCell>{item.returnAmount}</TableCell>
                    </TableRow>
                  ))
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

export default SalesReturn;
