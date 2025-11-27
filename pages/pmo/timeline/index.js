import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import PageHeader from "@/components/ProjectManagementModule/PageHeader";
import TimelineGanttChart from "@/components/ProjectManagementModule/TimelineGanttChart";
import TimelineEntryFormDialog from "@/components/ProjectManagementModule/TimelineEntryFormDialog";
import {
  createTimelineEntry,
  deleteTimelineEntry,
  getProjects,
  getTeamMembers,
  getTimeline,
  updateTimelineEntry,
} from "@/Services/projectManagementService";

const TimelinePage = () => {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects({});
      setProjects(data ?? []);
      if (data?.length && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [selectedProject]);

  const loadTeamMembers = useCallback(async () => {
    try {
      const data = await getTeamMembers();
      setTeamMembers(data ?? []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadTimeline = useCallback(
    async (projectId) => {
      if (!projectId) return;
      try {
        const data = await getTimeline(projectId);
        setTimeline(data ?? []);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    },
    []
  );

  useEffect(() => {
    loadProjects();
    loadTeamMembers();
  }, [loadProjects, loadTeamMembers]);

  useEffect(() => {
    if (selectedProject?.projectId) {
      loadTimeline(selectedProject.projectId);
    }
  }, [selectedProject, loadTimeline]);

  const handleSubmitEntry = async (values) => {
    if (!selectedProject) return;
    if (editEntry) {
      await updateTimelineEntry(editEntry.timelineEntryId, {
        ...values,
        projectId: selectedProject.projectId,
      });
    } else {
      await createTimelineEntry({
        ...values,
        projectId: selectedProject.projectId,
      });
    }
    setDialogOpen(false);
    setEditEntry(null);
    await loadTimeline(selectedProject.projectId);
  };

  const handleDeleteEntry = async (entryId) => {
    await deleteTimelineEntry(entryId);
    await loadTimeline(selectedProject.projectId);
  };

  return (
    <>
      <PageHeader
        title="Project Timeline"
        subtitle="Plan SDLC milestones, dependencies and deliverable dates."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditEntry(null);
              setDialogOpen(true);
            }}
            disabled={!selectedProject}
          >
            Add Phase
          </Button>
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Autocomplete
          sx={{ maxWidth: 320 }}
          options={projects}
          value={selectedProject}
          getOptionLabel={(option) => option.name ?? ""}
          onChange={(_, newValue) => setSelectedProject(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select Project" />
          )}
        />
      </Paper>

      {selectedProject ? (
        <>
          <TimelineGanttChart data={timeline} />

          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Phase Ledger
            </Typography>
            <Stack spacing={2}>
              {timeline.map((entry) => (
                <Box
                  key={entry.timelineEntryId}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {entry.phaseName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(entry.startDate).toLocaleDateString()} →{" "}
                      {new Date(entry.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      {entry.assignedToName ?? "Unassigned"}
                    </Typography>
                    {entry.notes ? (
                      <Typography variant="body2" color="text.secondary">
                        {entry.notes}
                      </Typography>
                    ) : null}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => {
                        setEditEntry(entry);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteEntry(entry.timelineEntryId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
              {!timeline.length ? (
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    border: (theme) => `1px dashed ${theme.palette.divider}`,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  No timeline entries yet. Start with planning, design and dev
                  checkpoints.
                </Box>
              ) : null}
            </Stack>
          </Paper>
        </>
      ) : (
        <Box
          sx={{
            p: 5,
            borderRadius: 3,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Select a project to manage timeline.
        </Box>
      )}

      <TimelineEntryFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditEntry(null);
        }}
        onSubmit={handleSubmitEntry}
        initialValues={
          editEntry
            ? {
                ...editEntry,
                startDate: editEntry.startDate,
                endDate: editEntry.endDate,
                assignedToMemberId: editEntry.assignedToMemberId ?? "",
              }
            : undefined
        }
        title={editEntry ? "Update Phase" : "Add Phase"}
        teamMembers={teamMembers}
      />
    </>
  );
};

export default TimelinePage;

