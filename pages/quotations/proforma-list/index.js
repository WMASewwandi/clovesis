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
import { Pagination, Typography, FormControl, InputLabel, MenuItem, Select, Tooltip, IconButton, Box, Tabs, Tab, Button, Chip } from "@mui/material";
import { ToastContainer } from "react-toastify";
import BASE_URL from "Base/api";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import GetReportSettingValueByName from "@/components/utils/GetReportSettingValueByName";
import { Catelogue } from "Base/catelogue";
import ShareReports from "@/components/UIElements/Modal/Reports/ShareReports";
import { Report } from "Base/report";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import { useRouter } from "next/router";
import ViewSentQuotations from "./view";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import RejectConfirmationById from "./reject";
import ConfirmInovoiceById from "./confirm";

export default function ProformaList() {
    const router = useRouter();
    const cId = sessionStorage.getItem("category");
    const { navigate, print, create, update } = IsPermissionEnabled(cId);
    const [quotationList, setQuotationList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const name = localStorage.getItem("name");
    const { data: InvoiceReportName } = GetReportSettingValueByName("ProformaInvoiceReport");

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        setPage(1);
        fetchQuotationList(1, value, pageSize, tabValue);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        fetchQuotationList(value, searchTerm, pageSize, tabValue);
    };

    const handlePageSizeChange = (event) => {
        const newSize = event.target.value;
        setPageSize(newSize);
        setPage(1);
        fetchQuotationList(1, searchTerm, newSize, tabValue);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(1);
        fetchQuotationList(1, searchTerm, pageSize, newValue);
    };

    const navigateToCreate = () => {
        router.push({
            pathname: "/quotations/proforma-list/create",
        });
    };

    const navigateToEdit = (id) => {
        router.push({
            pathname: "/quotations/proforma-list/edit",
            query: { id: id }
        });
    };

    const fetchQuotationList = async (page = 1, search = "", size = pageSize, tab = tabValue) => {
        try {
            const token = localStorage.getItem("token");
            const skip = (page - 1) * size;
            const bool = tab === 1 ? true : false;
            const query = `${BASE_URL}/Inquiry/GetAllProformaInvoice?SkipCount=${skip}&MaxResultCount=${size}&Search=${search || "null"}&isRejected=${bool}`;
            const response = await fetch(query, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Failed to fetch items");
            const data = await response.json();
            setQuotationList(data.result.items);
            setTotalCount(data.result.totalCount || 0);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        fetchQuotationList();
    }, []);

    if (!navigate) {
        return <AccessDenied />;
    }

    return (
        <>
            <ToastContainer />
            <div className={styles.pageTitle}>
                <h1>Proforma Invoice List</h1>
                <ul>
                    <li>
                        <Link href="/quotations/proforma-list/">Proforma Invoice List</Link>
                    </li>
                </ul>
            </div>
            <Grid container>
                <Grid item xs={12} lg={8} mb={1} order={{ xs: 2, lg: 1 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Pending" />
                        <Tab label="Rejected" />
                    </Tabs>
                </Grid>
                <Grid item xs={12} lg={4} mb={1} display="flex" alignItems="center" justifyContent="end" order={{ xs: 1, lg: 2 }}>
                    <Box>
                        {create ? <Button variant="outlined" onClick={() => navigateToCreate()}>
                            + Add New
                        </Button> : ""}
                    </Box>
                </Grid>
            </Grid>

            <Grid mt={1} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
                <Grid item xs={12} lg={4}>
                    <Search className="search-form">
                        <StyledInputBase
                            placeholder="Search here.."
                            inputProps={{ "aria-label": "search" }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </Search>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table" className="dark-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice Date</TableCell>
                                    <TableCell>Customer Name</TableCell>
                                    <TableCell>Inquiry Code</TableCell>
                                    <TableCell>Style Name</TableCell>
                                    <TableCell>Total Amount</TableCell>
                                    <TableCell>Advance Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    {tabValue === 1 ? <TableCell align="right">Rejected Reason</TableCell> : <TableCell align="right">Action</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {quotationList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Typography color="error">No Invoice Available</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    quotationList.map((item, index) => {
                                        const whatsapp = `/PrintDocuments?InitialCatalog=${Catelogue}&documentNumber=${item.inquiryCode}&reportName=${InvoiceReportName}&warehouseId=${item.warehouseId}&currentUser=${name}`;
                                        const invoiceReportLink = `/PrintDocumentsLocal?InitialCatalog=${Catelogue}&documentNumber=${item.documentNo}&reportName=${InvoiceReportName}&warehouseId=${item.warehouseId}&currentUser=${name}`;
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{formatDate(item.invoiceDate)}</TableCell>
                                                <TableCell>{item.customerName}</TableCell>
                                                <TableCell>{item.inquiryCode}</TableCell>
                                                <TableCell>{item.styleName}</TableCell>
                                                <TableCell>{formatCurrency(item.totalPayment)}</TableCell>
                                                <TableCell>{formatCurrency(item.advancePayment)}</TableCell>
                                                <TableCell>
                                                    {tabValue === 0 && item.isConfirmed ? (
                                                        <Chip label="Confirmed" size="small" color="success" />
                                                    ) : tabValue === 1 && item.isRejected ? (
                                                        <Chip label="Rejected" size="small" color="error" />
                                                    ) : (
                                                        <Chip label="Pending" size="small" color="warning" />
                                                    )}

                                                </TableCell>
                                                {tabValue === 1 ?
                                                    <TableCell align="right">{item.rejectedReason}</TableCell>
                                                    :
                                                    <TableCell align="right">
                                                        <Box display="flex" gap={1} justifyContent="end">
                                                            {update && (
                                                                <Tooltip title="Edit" placement="top">
                                                                    <IconButton onClick={() => navigateToEdit(item.inquiryId)} aria-label="edit" size="small">
                                                                        <BorderColorIcon color="primary" fontSize="inherit" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            <ShareReports url={whatsapp} mobile={item.sentWhatsappNumber} />
                                                            {print && (
                                                                <Tooltip title="Print" placement="top">
                                                                    <a href={`${Report}` + invoiceReportLink} target="_blank">
                                                                        <IconButton aria-label="print" size="small">
                                                                            <LocalPrintshopIcon color="primary" fontSize="medium" />
                                                                        </IconButton>
                                                                    </a>
                                                                </Tooltip>
                                                            )}
                                                            {update && (
                                                                <RejectConfirmationById id={item.id} controller="Inquiry/RejectProformaInvoice" fetchItems={fetchQuotationList} />
                                                            )}
                                                            {update && (
                                                                <ConfirmInovoiceById id={item.id} fetchItems={fetchQuotationList} />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                }
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                        <Grid container justifyContent="space-between" mt={2} mb={2}>
                            <Pagination count={Math.ceil(totalCount / pageSize)} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
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
