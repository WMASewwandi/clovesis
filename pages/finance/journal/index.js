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
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { FormControl, InputLabel, MenuItem, Pagination, Select } from "@mui/material";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import { ToastContainer } from "react-toastify";
import Chip from "@mui/material/Chip";
import { format } from "date-fns";
import usePaginatedFetch from "@/components/hooks/usePaginatedFetch";
import BASE_URL from "Base/api";
import { toast } from "react-toastify";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import AddJournalEntry from "./create";
import EditJournalEntry from "./edit";
import { formatDate } from "@/components/utils/formatHelper";

const STATUS_META = {
  1: { label: "Draft", color: "default" },
  2: { label: "Approved", color: "success" },
  3: { label: "Rejected", color: "error" },
};

export default function JournalList() {
  const cId = sessionStorage.getItem("category");
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);

  const {
    data: journals,
    totalCount,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchData: fetchJournals,
  } = usePaginatedFetch("JournalEntry/GetAllJournalEntries", "", 10, false, false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedJournal, setSelectedJournal] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleDeleteClick = (journal) => {
    setSelectedJournal(journal);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedJournal(null);
  };

  const handleDeleteJournal = async () => {
    if (!selectedJournal?.id) {
      toast.error("Unable to determine journal entry to delete.");
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`${BASE_URL}/JournalEntry/DeleteJournalEntry?id=${selectedJournal.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete journal entry");
      }

      const data = await response.json();
      toast.success(data?.message || "Journal entry deleted successfully.");
      handleCloseDialog();
      fetchJournals(page, search, pageSize, false);
    } catch (error) {
      toast.error(error.message || "Unable to delete journal entry");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setPage(1);
    fetchJournals(1, value, pageSize, false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchJournals(value, search, pageSize, false);
  };

  const handlePageSizeChange = (event) => {
    const size = event.target.value;
    setPageSize(size);
    setPage(1);
    fetchJournals(1, search, size, false);
  };

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
        <h1>Journal Entries</h1>
        <ul>
          <li>
            <Link href="/finance/journal/">Journal Entries</Link>
          </li>
        </ul>
      </div>
      <ToastContainer />
      <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}>
        <Grid item xs={12} lg={6} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search journal entries..."
              inputProps={{ "aria-label": "search" }}
              value={search}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid item xs={12} lg={6} mb={1} display="flex" justifyContent="flex-end" order={{ xs: 1, lg: 2 }}>
          {create && <AddJournalEntry fetchItems={fetchJournals} />}
        </Grid>

        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="journal entries table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>Journal No</TableCell>
                  <TableCell>Journal Date</TableCell>
                  <TableCell>Reference No</TableCell>
                  <TableCell>Narration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Approved By</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="error">No journal entries available</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  journals.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell>{journal.journalNo || "-"}</TableCell>
                      <TableCell>{formatDate(journal.journalDate)}</TableCell>
                      <TableCell>{journal.referenceNo || "-"}</TableCell>
                      <TableCell>{journal.narration || "-"}</TableCell>
                      <TableCell>{renderStatusChip(journal.status)}</TableCell>
                      <TableCell>{journal.createdByName || "-"}</TableCell>
                      <TableCell>{journal.approvedByName || "-"}</TableCell>
                      <TableCell align="right">
                        {update && <EditJournalEntry fetchItems={fetchJournals} item={journal} />}
                        {remove && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="delete journal"
                              onClick={() => handleDeleteClick(journal)}
                            >
                              <DeleteOutlineIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
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

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Journal Entry</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Are you sure you want to delete journal entry{" "}
            <strong>{selectedJournal ? selectedJournal.journalNo || "this entry" : "this entry"}</strong>? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit" disabled={deleteLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteJournal} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

