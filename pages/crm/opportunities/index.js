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
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import AddOpportunityModal from "./create";
import EditOpportunityModal from "./edit";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import useCRMAccounts from "../../../hooks/useCRMAccounts";
import useOpportunityStages from "../../../hooks/useOpportunityStages";
import useOpportunityStatuses from "../../../hooks/useOpportunityStatuses";
import BASE_URL from "Base/api";
import { formatCurrency } from "@/components/utils/formatHelper";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function OpportunitiesList() {
  const {
    data: opportunities,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchOpportunities,
  } = usePaginatedFetch("CRMOpportunities/GetAllCRMOpportunities", "", 10, false, false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const { accounts } = useCRMAccounts();
  const { stages } = useOpportunityStages();
  const { statuses } = useOpportunityStatuses();

  const accountMap = React.useMemo(() => {
    const map = {};
    accounts.forEach((account) => {
      map[String(account.id)] = account.accountName;
    });
    return map;
  }, [accounts]);

  const stageMap = React.useMemo(() => {
    const map = {};
    stages.forEach((stage) => {
      map[String(stage.value)] = stage.label;
    });
    return map;
  }, [stages]);

  const statusMap = React.useMemo(() => {
    const map = {};
    statuses.forEach((status) => {
      map[String(status.value)] = status.label;
    });
    return map;
  }, [statuses]);

  const refreshOpportunities = React.useCallback(
    (targetPage = page) => {
      fetchOpportunities(targetPage, search, pageSize, false);
    },
    [fetchOpportunities, page, pageSize, search]
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    fetchOpportunities(1, value, pageSize, false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchOpportunities(value, search, pageSize, false);
  };

  const handlePageSizeChange = (event) => {
    const size = Number(event.target.value);
    setPageSize(size);
    setPage(1);
    fetchOpportunities(1, search, size, false);
  };

  const handleDeleteClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedOpportunity(null);
    setDeleteLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOpportunity?.id) {
      toast.error("Unable to determine opportunity to delete.");
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`${BASE_URL}/CRMOpportunities/DeleteCRMOpportunity?id=${selectedOpportunity.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete opportunity");
      }

      toast.success(data?.message || "Opportunity deleted successfully.");
      handleCloseDialog();
      refreshOpportunities(page);
    } catch (error) {
      toast.error(error.message || "Unable to delete opportunity");
      setDeleteLoading(false);
    }
  };

  const normalizedOpportunities = React.useMemo(
    () =>
      opportunities.map((opportunity) => ({
        ...opportunity,
        name: opportunity.opportunityName || opportunity.name || "",
        accountId: opportunity.accountId ?? opportunity.account,
        contactId: opportunity.contactId ?? opportunity.contact,
        stage: opportunity.stage,
        status: opportunity.status,
      })),
    [opportunities]
  );

  const renderStatusChip = (statusValue) => {
    const label = statusMap[String(statusValue)] || "Unknown";
    const isClosed = String(statusValue) === "1" || label.toLowerCase() === "closed";
    const color = isClosed ? "default" : "success";
    const variant = isClosed ? "outlined" : "filled";
    return (
      <Chip
        label={label}
        color={color}
        variant={variant}
        size="small"
        sx={{ textTransform: "capitalize" }}
      />
    );
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }
    return currencyFormatter.format(numericValue);
  };

  const formatProbability = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }
    return `${numericValue}%`;
  };

  const formatDateValue = (value) => {
    if (!value) {
      return "-";
    }
    try {
      return format(new Date(value), "MMM dd, yyyy");
    } catch (error) {
      return value;
    }
  };

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Opportunities</h1>
        <ul>
          <li>
            <Link href="/crm/opportunities/">Opportunities</Link>
          </li>
        </ul>
      </div>

      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={6} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search opportunities..."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>

        <Grid item xs={12} lg={6} mb={1} display="flex" justifyContent="flex-end" order={{ xs: 1, lg: 2 }}>
          <AddOpportunityModal onOpportunityCreated={() => refreshOpportunities(1)} />
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="opportunities table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Opportunity Name</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Expected Close Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {normalizedOpportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography color="error">No opportunities available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  normalizedOpportunities.map((opportunity) => {
                    const accountName = accountMap[String(opportunity.accountId)] || "-";
                    const stageLabel = stageMap[String(opportunity.stage)] || "-";

                    return (
                      <TableRow key={opportunity.id}>
                        <TableCell>{opportunity.name}</TableCell>
                        <TableCell>{opportunity.accountName}</TableCell>
                        <TableCell>{opportunity.contactName}</TableCell>
                        <TableCell>{opportunity.stageName}</TableCell>
                        <TableCell>{formatCurrency(opportunity.value)}</TableCell>
                        <TableCell>{formatProbability(opportunity.probability)}</TableCell>
                        <TableCell>{formatDateValue(opportunity.expectedCloseDate)}</TableCell>
                        <TableCell>{opportunity.statusName}</TableCell>
                        <TableCell align="right">
                          <EditOpportunityModal
                            opportunity={{
                              ...opportunity,
                              accountId: opportunity.accountId,
                              contactId: opportunity.contactId,
                            }}
                            onOpportunityUpdated={() => refreshOpportunities(page)}
                          />
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="delete opportunity"
                              onClick={() => handleDeleteClick(opportunity)}
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
        <DialogTitle>Delete Opportunity</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{selectedOpportunity ? selectedOpportunity.name : "this opportunity"}</strong>? This action cannot be
            undone.
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
    </>
  );
}

