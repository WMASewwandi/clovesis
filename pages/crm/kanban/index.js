import React from "react";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import KanbanColumn from "./column";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import BASE_URL from "Base/api";
import AddLeadModal from "../leads/create";
import AddOpportunityModal from "../opportunities/create";

const MODULE_ENDPOINTS = {
  Leads: {
    stages: "/EnumLookup/LeadStatuses",
    data: "/Leads/GetCRMLeads",
  },
  Opportunities: {
    stages: "/EnumLookup/OpportunityStages",
    data: "/CRMOpportunities/GetCRMOpportunities",
  },
};

export default function KanbanBoard() {
  const [module, setModule] = React.useState("Leads");
  const [searchValue, setSearchValue] = React.useState("");
  const [filterDrawer, setFilterDrawer] = React.useState(false);
  const [selectedFilters, setSelectedFilters] = React.useState({
    stages: [],
    owners: [],
    statuses: [],
    startDate: "",
    endDate: "",
  });
  const [boardData, setBoardData] = React.useState([]);
  const [stageDefinitions, setStageDefinitions] = React.useState([]);
  const [originalRecords, setOriginalRecords] = React.useState([]);
  const [draggedItem, setDraggedItem] = React.useState(null);
  const [loadingStages, setLoadingStages] = React.useState(false);
  const [stageError, setStageError] = React.useState(null);
  const [loadingOwners, setLoadingOwners] = React.useState(false);
  const [ownersError, setOwnersError] = React.useState(null);
  const [loadingRecords, setLoadingRecords] = React.useState(false);
  const [recordsError, setRecordsError] = React.useState(null);
  const [filterOptions, setFilterOptions] = React.useState({
    stages: [],
    owners: [],
    statuses: [],
  });

  const totalItems = React.useMemo(
    () => boardData.reduce((acc, stage) => acc + stage.items.length, 0),
    [boardData]
  );
  const totalStages = React.useMemo(() => boardData.length, [boardData]);

  const fetchOwners = React.useCallback(async () => {
    try {
      setLoadingOwners(true);
      setOwnersError(null);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/User/GetAllUser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to load owners");
      }

      const data = await response.json().catch(() => null);
      const users = Array.isArray(data) ? data : data?.result || [];
      const owners = users.map((user) => ({
        id: String(user.id),
        label: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.userTypeName || `User #${user.id}`,
      }));

      setFilterOptions((prev) => ({
        ...prev,
        owners,
      }));
      setSelectedFilters((prev) => ({
        ...prev,
        owners: prev.owners.filter((label) => owners.some((owner) => owner.label === label)),
      }));
    } catch (error) {
      console.error("Error loading owners:", error);
      setOwnersError(error.message || "Failed to load owners");
      setFilterOptions((prev) => ({
        ...prev,
        owners: [],
      }));
      setSelectedFilters((prev) => ({
        ...prev,
        owners: [],
      }));
    } finally {
      setLoadingOwners(false);
    }
  }, []);

  const fetchStages = React.useCallback(
    async (selectedModule) => {
      const stageEndpoint = MODULE_ENDPOINTS[selectedModule]?.stages;
      if (!stageEndpoint) {
        setBoardData([]);
        setFilterOptions((prev) => ({
          ...prev,
          stages: [],
          statuses: [],
        }));
        setSelectedFilters((prev) => ({
          ...prev,
          stages: [],
          statuses: [],
        }));
        return;
      }

      try {
        setLoadingStages(true);
        setStageError(null);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}${stageEndpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to load stages");
        }

        const data = await response.json();
        const entries = Object.entries(data?.result || {});

        const stageDefs = entries.map(([value, label]) => ({
          id: `stage-${value}`,
          title: label,
        }));

        setStageDefinitions(stageDefs);
        setBoardData(stageDefs.map((stage) => ({ ...stage, items: [] })));
        const stageTitles = stageDefs.map((stage) => stage.title);
        const isLeadsModule = selectedModule === "Leads";

        setFilterOptions((prev) => ({
          ...prev,
          stages: isLeadsModule ? [] : stageTitles,
          statuses: isLeadsModule ? stageTitles : [],
        }));

        setSelectedFilters((prev) => ({
          ...prev,
          stages: isLeadsModule ? [] : prev.stages.filter((value) => stageTitles.includes(value)),
          statuses: isLeadsModule
            ? prev.statuses.filter((value) => stageTitles.includes(value))
            : [],
        }));
      } catch (error) {
        console.error("Error loading stages:", error);
        setStageError(error.message || "Failed to load stages");
        setStageDefinitions([]);
        setBoardData([]);
        setFilterOptions((prev) => ({
          ...prev,
          stages: [],
          statuses: [],
        }));
        setSelectedFilters((prev) => ({
          ...prev,
          stages: [],
          statuses: [],
        }));
      } finally {
        setLoadingStages(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const fetchRecords = React.useCallback(
    async (selectedModule) => {
      const dataEndpoint = MODULE_ENDPOINTS[selectedModule]?.data;
      if (!dataEndpoint) {
        setBoardData([]);
        return;
      }

      try {
        setLoadingRecords(true);
        setRecordsError(null);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}${dataEndpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to load records");
        }

        const data = await response.json().catch(() => null);
        const records = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
        const stageKey = selectedModule === "Leads" ? "leadStatus" : "stage";
        const stageLabelKey = selectedModule === "Leads" ? "leadStatusName" : "stageName";

        setOriginalRecords(records);
    } catch (error) {
      console.error("Error loading board records:", error);
      setRecordsError(error.message || "Failed to load records");
      setOriginalRecords([]);
      setBoardData((prevStages) =>
        prevStages.map((stage) => ({
          ...stage,
          items: [],
        }))
      );
    } finally {
        setLoadingRecords(false);
      }
    },
    []
  );

  React.useEffect(() => {
    const loadBoard = async () => {
      await fetchStages(module);
      await fetchRecords(module);
    };

    loadBoard();
  }, [module, fetchStages, fetchRecords]);

  const updateLeadStatus = React.useCallback(async (card, statusValue, statusLabel) => {
    if (!card?.raw) {
      return;
    }

    const lead = card.raw;

    const payload = {
      Id: lead.id,
      LeadName: lead.leadName || lead.name || "Unnamed Lead",
      Company: lead.company || "",
      Email: lead.email || "",
      MobileNo: lead.mobileNo || "",
      LeadSource: Number(lead.leadSource ?? 0),
      LeadStatus: Number(statusValue),
      LeadScore: Number(lead.leadScore ?? 0),
      Description: lead.description || "",
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`${BASE_URL}/Leads/UpdateLead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update lead status");
      }

      setOriginalRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === lead.id
            ? {
                ...record,
                leadStatus: Number(statusValue),
                leadStatusName: statusLabel,
              }
            : record
        )
      );
    } catch (error) {
      console.error("Error updating lead status:", error);
      fetchRecords(module);
    }
  }, [fetchRecords, module]);

  const updateOpportunityStage = React.useCallback(
    async (card, stageValue, stageLabel) => {
      if (!card?.raw) {
        return;
      }

      const opportunity = card.raw;

      const payload = {
        Id: opportunity.id,
        OpportunityName: opportunity.opportunityName || opportunity.name || "Untitled Opportunity",
        AccountId: Number(opportunity.accountId ?? 0),
        ContactId: Number(opportunity.contactId ?? 0),
        Stage: Number(stageValue),
        Value: Number(opportunity.value ?? 0),
        Probability: Number(opportunity.probability ?? 0),
        ExpectedCloseDate: opportunity.expectedCloseDate || null,
        Source: Number(opportunity.source ?? 0),
        Description: opportunity.description || "",
        Status: Number(opportunity.status ?? 0),
      };

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}/CRMOpportunities/UpdateCRMOpportunity`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to update opportunity stage");
        }

      setOriginalRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === opportunity.id
            ? {
                ...record,
                stage: Number(stageValue),
                stageName: stageLabel,
              }
            : record
        )
      );
      } catch (error) {
        console.error("Error updating opportunity stage:", error);
        fetchRecords(module);
      }
    },
    [fetchRecords, module]
  );

  const buildBoardData = React.useCallback(
    (stages, records, selectedModule, filters, searchTerm) => {
      if (!Array.isArray(stages) || stages.length === 0) {
        return [];
      }

      let filteredRecords = Array.isArray(records) ? [...records] : [];
      const stageKey = selectedModule === "Leads" ? "leadStatus" : "stage";
      const stageNameKey = selectedModule === "Leads" ? "leadStatusName" : "stageName";
      const stageValueToLabel = {};

      stages.forEach((stage) => {
        stageValueToLabel[stage.id.replace("stage-", "")] = stage.title;
      });

      if (filters.owners.length > 0) {
        filteredRecords = filteredRecords.filter((record) =>
          filters.owners.includes(record.createdByName || "-")
        );
      }

      if (selectedModule === "Leads" && filters.statuses.length > 0) {
        filteredRecords = filteredRecords.filter((record) => {
          const stageValue = record[stageKey];
          const stageLabel =
            record[stageNameKey] ||
            stageValueToLabel[String(stageValue)] ||
            String(stageValue ?? "");
          return filters.statuses.includes(stageLabel);
        });
      }

      if (selectedModule === "Opportunities" && filters.stages.length > 0) {
        filteredRecords = filteredRecords.filter((record) => {
          const stageValue = record[stageKey];
          const stageLabel =
            record[stageNameKey] ||
            stageValueToLabel[String(stageValue)] ||
            String(stageValue ?? "");
          return filters.stages.includes(stageLabel);
        });
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        filteredRecords = filteredRecords.filter((record) => {
          if (!record.createdOn) {
            return false;
          }
          const created = new Date(record.createdOn);
          return !Number.isNaN(created.getTime()) && created >= startDate;
        });
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredRecords = filteredRecords.filter((record) => {
          if (!record.createdOn) {
            return false;
          }
          const created = new Date(record.createdOn);
          return !Number.isNaN(created.getTime()) && created <= endDate;
        });
      }

      const trimmedSearch = searchTerm.trim().toLowerCase();
      if (trimmedSearch) {
        filteredRecords = filteredRecords.filter((record) => {
          const fields =
            selectedModule === "Leads"
              ? [record.leadName, record.company, record.email, record.createdByName]
              : [
                  record.opportunityName,
                  record.accountName,
                  record.contactName,
                  record.description,
                  record.createdByName,
                ];
          return fields.some(
            (value) => value && String(value).toLowerCase().includes(trimmedSearch)
          );
        });
      }

      const toCard = (record, stageTitle) => ({
        id: `${selectedModule.toLowerCase()}-${record.id}`,
        name:
          selectedModule === "Leads"
            ? record.leadName || record.company || `Lead #${record.id}`
            : record.opportunityName || record.accountName || `Opportunity #${record.id}`,
        company:
          selectedModule === "Leads"
            ? record.company || "-"
            : record.accountName || record.company || "-",
        value:
          selectedModule === "Leads"
            ? `Score: ${record.leadScore ?? "-"}`
            : record.value != null
            ? `$${Number(record.value).toLocaleString()}`
            : "-",
        owner: record.createdByName || "-",
        status: stageTitle,
        createdDate: record.createdOn ? new Date(record.createdOn).toLocaleDateString() : "-",
        dueDate:
          selectedModule === "Leads"
            ? "-"
            : record.expectedCloseDate
            ? new Date(record.expectedCloseDate).toLocaleDateString()
            : "-",
        raw: record,
      });

      return stages.map((stage) => {
        const stageValue = stage.id.replace("stage-", "");
        const stageTitle = stage.title;
        const stageRecords = filteredRecords.filter(
          (record) => String(record[stageKey]) === stageValue
        );

        return {
          ...stage,
          items: stageRecords.map((record) => toCard(record, stageTitle)),
        };
      });
    },
    []
  );

  React.useEffect(() => {
    setBoardData(
      buildBoardData(stageDefinitions, originalRecords, module, selectedFilters, searchValue)
    );
  }, [
    buildBoardData,
    stageDefinitions,
    originalRecords,
    module,
    selectedFilters,
    searchValue,
  ]);

  const handleRefreshAfterCreate = React.useCallback(() => {
    fetchStages(module);
    fetchRecords(module);
  }, [fetchStages, fetchRecords, module]);

  const handleFilterToggle = (group, value) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[group];
      const exists = currentValues.includes(value);
      return {
        ...prev,
        [group]: exists ? currentValues.filter((item) => item !== value) : [...currentValues, value],
      };
    });
  };

  const handleDateChange = (field) => (event) => {
    const value = event.target.value;
    setSelectedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDragStart = (sourceStageId, itemId) => {
    setDraggedItem({ sourceStageId, itemId });
  };

  const handleDropCard = (targetStageId) => {
    if (!draggedItem) return;

    setBoardData((prevStages) => {
      let movedCard = null;
      const stagesWithoutCard = prevStages.map((stage) => {
        if (stage.id === draggedItem.sourceStageId) {
          const remaining = stage.items.filter((item) => {
            if (item.id === draggedItem.itemId) {
              movedCard = item;
              return false;
            }
            return true;
          });
          return { ...stage, items: remaining };
        }
        return stage;
      });

      if (!movedCard) {
        return prevStages;
      }

      const updatedStages = stagesWithoutCard.map((stage) => {
        if (stage.id === targetStageId) {
          const stageValue = targetStageId.replace("stage-", "");
          const stageTitle = stage.title;
          const updatedCard = {
            ...movedCard,
            status: stageTitle,
            raw: movedCard.raw
              ? {
                  ...movedCard.raw,
                  ...(module === "Leads"
                    ? { leadStatus: Number(stageValue), leadStatusName: stageTitle }
                    : { stage: Number(stageValue), stageName: stageTitle }),
                }
              : movedCard.raw,
          };

          return {
            ...stage,
            items: [
              ...stage.items,
              updatedCard,
            ],
          };
        }
        return stage;
      });

      const targetStage = prevStages.find((stage) => stage.id === targetStageId);
      const stageValue = targetStageId.replace("stage-", "");
      const stageLabel = targetStage?.title || stageValue;

      const recordId = movedCard?.id?.split("-")[1];
      const targetStatusValue = Number(stageValue);

      if (recordId) {
        if (module === "Leads") {
          updateLeadStatus(movedCard, targetStatusValue, stageLabel);
        } else if (module === "Opportunities") {
          updateOpportunityStage(movedCard, targetStatusValue, stageLabel);
        }
      }

      return updatedStages;
    });

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>CRM Kanban Board</h1>
        <ul>
          <li>
            <Link href="/crm/kanban/">Kanban Board</Link>
          </li>
        </ul>
      </div>

      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} md={7}>
          <Typography variant="subtitle1" color="text.secondary">
            Visual view of all leads/opportunities by stage
          </Typography>
        </Grid>
        <Grid item xs={12} md="auto">
          <Typography variant="subtitle2" color="text.secondary">
            {totalItems} {module} across {totalStages} stages
          </Typography>
        </Grid>
      </Grid>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        mt={3}
        mb={3}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, flexGrow: 1 }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Module</InputLabel>
            <Select value={module} label="Module" onChange={(event) => setModule(event.target.value)}>
              <MenuItem value="Leads">Leads</MenuItem>
              <MenuItem value="Opportunities">Opportunities</MenuItem>
            </Select>
          </FormControl>
          <Search className="search-form" sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 280 } }}>
            <StyledInputBase
              placeholder={`Search ${module.toLowerCase()}...`}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </Search>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
          {module === "Leads" ? (
            <AddLeadModal onLeadCreated={handleRefreshAfterCreate} />
          ) : (
            <AddOpportunityModal onOpportunityCreated={handleRefreshAfterCreate} />
          )}
          <IconButton color="primary" onClick={() => setFilterDrawer(true)}>
            <FilterAltOutlinedIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          overflowX: "auto",
          pb: 3,
          pr: 1,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 10,
            backgroundColor: "rgba(148, 163, 184, 0.6)",
          },
        }}
      >
        {loadingStages || loadingRecords ? (
          <Box
            sx={{
              minWidth: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
            }}
          >
            <Typography color="text.secondary">Loading board...</Typography>
          </Box>
        ) : stageError ? (
          <Box
            sx={{
              minWidth: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
            }}
          >
            <Typography color="error">{stageError}</Typography>
          </Box>
        ) : recordsError ? (
          <Box
            sx={{
              minWidth: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
            }}
          >
            <Typography color="error">{recordsError}</Typography>
          </Box>
        ) : boardData.length === 0 ? (
          <Box
            sx={{
              minWidth: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 6,
            }}
          >
            <Typography color="text.secondary">No stages available.</Typography>
          </Box>
        ) : (
          boardData.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stageId={stage.id}
            stageTitle={stage.title}
            items={stage.items}
            onDragStart={handleDragStart}
            onDropCard={handleDropCard}
            onDragEnd={handleDragEnd}
          />
          ))
        )}
      </Box>

      <Drawer anchor="right" open={filterDrawer} onClose={() => setFilterDrawer(false)}>
        <Box sx={{ width: { xs: 280, sm: 320 }, p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Filters
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Narrow the board to focus on specific {module.toLowerCase()}.
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {filterOptions.stages.length > 0 && (
            <>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Stage
          </Typography>
              <Stack spacing={1} mb={2}>
            {filterOptions.stages.map((stageName) => (
              <FormControlLabel
                key={stageName}
                control={
                  <Checkbox
                    checked={selectedFilters.stages.includes(stageName)}
                    onChange={() => handleFilterToggle("stages", stageName)}
                  />
                }
                label={stageName}
              />
            ))}
          </Stack>
              <Divider sx={{ mb: 2 }} />
            </>
          )}

          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Owner
          </Typography>
          <Stack spacing={1}>
            {loadingOwners ? (
              <Typography color="text.secondary">Loading owners...</Typography>
            ) : ownersError ? (
              <Typography color="error">{ownersError}</Typography>
            ) : filterOptions.owners.length === 0 ? (
              <Typography color="text.secondary">No owners available.</Typography>
            ) : (
              filterOptions.owners.map((owner) => (
              <FormControlLabel
                  key={owner.id}
                control={
                  <Checkbox
                      checked={selectedFilters.owners.includes(owner.label)}
                      onChange={() => handleFilterToggle("owners", owner.label)}
                  />
                }
                  label={owner.label}
              />
              ))
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Date Range
          </Typography>
          <Stack spacing={1} direction="row">
            <TextField
              type="date"
              size="small"
              fullWidth
              value={selectedFilters.startDate}
              onChange={handleDateChange("startDate")}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              size="small"
              fullWidth
              value={selectedFilters.endDate}
              onChange={handleDateChange("endDate")}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {filterOptions.statuses.length > 0 && (
            <>
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Status
          </Typography>
          <Stack spacing={1}>
            {filterOptions.statuses.map((status) => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={selectedFilters.statuses.includes(status)}
                    onChange={() => handleFilterToggle("statuses", status)}
                  />
                }
                label={status}
              />
            ))}
          </Stack>
            </>
          )}

          <Stack direction="row" spacing={1.5} mt={3}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() =>
                setSelectedFilters({
                  stages: [],
                  owners: [],
                  statuses: [],
                  startDate: "",
                  endDate: "",
                })
              }
            >
              Clear
            </Button>
            <Button variant="contained" onClick={() => setFilterDrawer(false)}>
              Apply
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

