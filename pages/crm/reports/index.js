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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { ToastContainer, toast } from "react-toastify";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import AddReportModal from "./create";
import EditReportModal from "./edit";
import ReportChartModal from "../../../components/crm/reports/ReportChartModal";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import useRelatedEntityTypes from "../../../hooks/useRelatedEntityTypes";
import useChartTypes from "../../../hooks/useChartTypes";
import BASE_URL from "Base/api";

export default function ReportsList() {
  const {
    data: reports,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchReports,
  } = usePaginatedFetch("CRMReports/GetAllCRMReports", "", 10, false, false);

  const { entities: reportTypeOptions } = useRelatedEntityTypes();
  const { chartTypes } = useChartTypes();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [chartDialogOpen, setChartDialogOpen] = React.useState(false);
  const [chartReport, setChartReport] = React.useState(null);

  const reportTypeMap = React.useMemo(() => {
    const map = {};
    reportTypeOptions.forEach((option) => {
      map[String(option.value)] = option.label;
    });
    return map;
  }, [reportTypeOptions]);

  const chartTypeMap = React.useMemo(() => {
    const map = {};
    chartTypes.forEach((option) => {
      map[String(option.value)] = option.label;
    });
    return map;
  }, [chartTypes]);

  const refreshReports = React.useCallback(
    (targetPage = page) => {
      fetchReports(targetPage, search, pageSize, false);
    },
    [fetchReports, page, pageSize, search]
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    fetchReports(1, value, pageSize, false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchReports(value, search, pageSize, false);
  };

  const handlePageSizeChange = (event) => {
    const size = Number(event.target.value);
    setPageSize(size);
    setPage(1);
    fetchReports(1, search, size, false);
  };

  const handleDeleteClick = (report) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };

  const handleViewChart = (report) => {
    setChartReport(report);
    setChartDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedReport(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReport?.id) {
      toast.error("Unable to determine report to delete.");
      return;
    }

    try {
      setDeleteLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/CRMReports/DeleteCRMReport?id=${selectedReport.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete report");
      }

      toast.success(data?.message || "Report deleted successfully.");
      handleCloseDialog();
      refreshReports(page);
    } catch (error) {
      toast.error(error.message || "Unable to delete report");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDateValue = (value) => {
    if (!value) {
      return "-";
    }
    try {
      return new Date(value).toLocaleDateString();
    } catch (error) {
      return value;
    }
  };

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Reports</h1>
        <ul>
          <li>
            <Link href="/crm/reports/">Reports</Link>
          </li>
        </ul>
      </div>

      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={6} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search reports..."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>

        <Grid item xs={12} lg={6} mb={1} display="flex" justifyContent="flex-end" order={{ xs: 1, lg: 2 }}>
          <AddReportModal
            onReportCreated={() => {
              setPage(1);
              refreshReports(1);
            }}
          />
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="reports table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Chart Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="error">No reports available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => {
                    const reportTypeLabel =
                      report.reportTypeName ||
                      reportTypeMap[String(report.reportType ?? "")] ||
                      "-";
                    const chartTypeLabel =
                      report.chartName ||
                      chartTypeMap[String(report.chartType ?? "")] ||
                      "-";

                    return (
                      <TableRow key={report.id}>
                        <TableCell>{report.reportName || "-"}</TableCell>
                        <TableCell>{reportTypeLabel}</TableCell>
                        <TableCell>{chartTypeLabel}</TableCell>
                        <TableCell>
                          <Chip
                            label={report.isActive ? "Active" : "Inactive"}
                            color={report.isActive ? "success" : "default"}
                            variant={report.isActive ? "filled" : "outlined"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDateValue(report.createdOn)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Chart">
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label="view chart"
                              onClick={() => handleViewChart(report)}
                            >
                              <InsertChartOutlinedIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <EditReportModal
                            report={report}
                            onReportUpdated={() => refreshReports(page)}
                          />
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="delete report"
                              onClick={() => handleDeleteClick(report)}
                            >
                              <DeleteOutlineIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2} px={2}>
              <Pagination
                count={Math.max(1, Math.ceil(totalCount / pageSize))}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
              <FormControl size="small" sx={{ width: 110 }}>
                <InputLabel>Page Size</InputLabel>
                <Select value={pageSize} label="Page Size" onChange={handlePageSizeChange}>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{selectedReport ? selectedReport.reportName || selectedReport.name : "this report"}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit" disabled={deleteLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
      <ReportChartModal
        open={chartDialogOpen}
        report={chartReport}
        onClose={() => {
          setChartDialogOpen(false);
          setChartReport(null);
        }}
      />
    </>
  );
}
