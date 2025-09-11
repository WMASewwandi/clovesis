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
  Tooltip,
  IconButton,
} from "@mui/material";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import BASE_URL from "Base/api";
import { formatDate } from "@/components/utils/formatHelper";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import StatusType from "pages/production/ongoing/Types/StatusType";
import ShipmentReport from "@/components/UIElements/Modal/Reports/Shipment";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";

const Shipment = () => {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [shipments, setShipments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const navigateToCreate = () => {
    router.push({
      pathname: "/inventory/shipment/create-shipment",
    });
  };

  const navigateToEdit = (id) => {
    router.push({
      pathname: `/inventory/shipment/edit-shipment`,
      query: { id: id },
    });
  };

  const fetchShipments = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/ShipmentNote/GetAllShipmentNotes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch GSM List");
      }

      const data = await response.json();
      setShipments(data.result);
    } catch (error) {
      console.error("Error fetching GSM List:", error);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

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

  const filteredData = shipments.filter(
    (item) =>
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referanceNo.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1>Shipment Note</h1>
        <ul>
          <li>
            <Link href="/inventory/shipment">Shipment Note</Link>
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
          {create ? <Button variant="outlined" onClick={() => navigateToCreate()}>
            + Add New
          </Button> : ""}
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Shipment Date</TableCell>
                  <TableCell>Shipment No</TableCell>
                  <TableCell>Reference No</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Remark</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="error">
                        No Shipment Notes Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{formatDate(item.shipmentDate)}</TableCell>
                      <TableCell>{item.documentNo}</TableCell>
                      <TableCell>{item.referanceNo}</TableCell>
                      <TableCell>{item.supplierName}</TableCell>
                      <TableCell>{item.remark}</TableCell>
                      <TableCell>
                        <StatusType type={item.status} />
                      </TableCell>
                      <TableCell align="right">
                        {item.status != 7 ? (
                          update ? (
                            <Tooltip title="Edit" placement="top">
                              <IconButton
                                onClick={() => navigateToEdit(item.id)}
                                aria-label="edit"
                                size="small"
                              >
                                <BorderColorIcon color="primary" fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          ) : null
                        ) : (
                          print ? <ShipmentReport shipment={item} /> : null
                        )}
                      </TableCell>
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

export default Shipment;
