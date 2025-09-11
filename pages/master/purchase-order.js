import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    TablePagination,
    ButtonGroup,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useRouter } from "next/router";
import BASE_URL from "Base/api";
import { formatDate } from "@/components/utils/formatHelper";

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

export default function PurchaseOrder() {
    const [po, setPO] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    const navigateToCreate = () => {
        router.push({
            pathname: "/master/create-po",
        });
    };

    const navigateToEdit = (id) => {
        router.push(`/master/edit-po?id=${id}`);
    };

    const fetchPO = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/GoodReceivedNote/GetAllPurchaseOrders`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch GSM List");
            }

            const data = await response.json();
            setPO(data.result);
        } catch (error) {
            console.error("Error fetching GSM List:", error);
        }
    };

    useEffect(() => {
        fetchPO();
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

    const filteredData = po.filter(
        (item) =>
            item.supplierName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            item.documentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.referanceNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <>
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
                    <Button
                        variant="outlined"
                        onClick={() => navigateToCreate()}
                    >
                        + Add New
                    </Button>
                </Grid>

                <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table" className="dark-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>PO Date</TableCell>
                                    <TableCell>PO No</TableCell>
                                    <TableCell>Reference No</TableCell>
                                    <TableCell>Supplier</TableCell>
                                    <TableCell>Remark</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography color="error">
                                                No Purchase Orders Available
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(item.poDate)}
                                            </TableCell>
                                            <TableCell>
                                                {item.purchaseOrderNo}
                                            </TableCell>
                                            <TableCell>
                                                {item.referanceNo}
                                            </TableCell>
                                            <TableCell>
                                                {item.supplierName}
                                            </TableCell>
                                            <TableCell>{item.remark}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip
                                                    title="Edit"
                                                    placement="top"
                                                >
                                                    <IconButton
                                                        onClick={() =>
                                                            navigateToEdit(
                                                                item.id
                                                            )
                                                        }
                                                        aria-label="edit"
                                                        size="small"
                                                    >
                                                        <BorderColorIcon
                                                            color="primary"
                                                            fontSize="inherit"
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                {/* <Tooltip
                                                    title="Delete"
                                                    placement="top"
                                                >
                                                    <IconButton
                                                        aria-label="delete"
                                                        size="small"
                                                    >
                                                        <DeleteIcon
                                                            color="error"
                                                            fontSize="inherit"
                                                        />
                                                    </IconButton>
                                                </Tooltip> */}
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
}
