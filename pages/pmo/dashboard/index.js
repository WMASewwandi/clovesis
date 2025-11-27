import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PageHeader from "@/components/ProjectManagementModule/PageHeader";
import MetricCard from "@/components/ProjectManagementModule/MetricCard";
import StatusPill from "@/components/ProjectManagementModule/StatusPill";
import {
  getDashboardSummary,
  getProjects,
} from "@/Services/projectManagementService";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [summaryResponse, projectsResponse] = await Promise.all([
          getDashboardSummary(),
          getProjects({}),
        ]);
        setSummary(summaryResponse);
        setProjects(projectsResponse ?? []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const trendSeries = useMemo(() => {
    if (!summary?.financialTrend) return [];
    return [
      {
        name: "Income",
        data: summary.financialTrend.map((point) => ({
          x: new Date(point.period).toISOString(),
          y: Number(point.income?.toFixed(2)),
        })),
      },
      {
        name: "Expense",
        data: summary.financialTrend.map((point) => ({
          x: new Date(point.period).toISOString(),
          y: Number(point.expense?.toFixed(2)),
        })),
      },
    ];
  }, [summary]);

  const trendOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        height: 320,
        toolbar: { show: false },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.55,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          format: "MMM yy",
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => `${val?.toLocaleString?.() ?? val}`,
        },
      },
      colors: ["#6366F1", "#F97316"],
      legend: {
        position: "top",
        horizontalAlign: "left",
      },
    }),
    []
  );

  const expenseSeries = useMemo(() => {
    if (!summary?.expenseBreakdown?.length) {
      return [{ name: "Expenses", data: [] }];
    }
    return [
      summary.expenseBreakdown.map((item) => Number(item.amount?.toFixed(2))),
    ];
  }, [summary]);

  const expenseOptions = useMemo(() => {
    const labels =
      summary?.expenseBreakdown?.map((item) => item.categoryName) ?? [];

    return {
      chart: {
        type: "donut",
        height: 320,
      },
      labels,
      legend: {
        position: "right",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#6366F1", "#22D3EE", "#F59E0B", "#F97316", "#A855F7", "#22C55E"],
    };
  }, [summary]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <PageHeader
        title="Project Operations Control Center"
        subtitle="Realtime health of programmes, financial burn and delivery focus."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label="Total Projects"
            value={summary?.totalProjects ?? 0}
            accent="primary.main"
            secondary={`${summary?.completedProjects ?? 0} completed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label="Active Projects"
            value={summary?.activeProjects ?? 0}
            accent="success.main"
            secondary={`${summary?.upcomingDeadlines ?? 0} deadlines in 14 days`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label="On Hold"
            value={summary?.onHoldProjects ?? 0}
            accent="warning.main"
            secondary="Review blockers & resources"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label="Completion Rate"
            value={
              summary?.totalProjects
                ? `${Math.round(
                    ((summary.completedProjects ?? 0) /
                      (summary.totalProjects || 1)) *
                      100
                  )}%`
                : "0%"
            }
            accent="secondary.main"
            secondary="Based on delivered projects"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
              spacing={1}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Income vs Expense Trend
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly burn-down and revenue captures across programmes.
                </Typography>
              </Box>
            </Stack>
            <Chart options={trendOptions} series={trendSeries} type="area" height={320} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Expense Distribution
            </Typography>
            {expenseSeries[0]?.length ? (
              <Chart options={expenseOptions} series={expenseSeries[0]} type="donut" height={320} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No expense data available yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={4}>
          <MetricCard
            label="Budget Ledger"
            value={summary?.financialSnapshot?.totalBudget?.toLocaleString() ?? "0"}
            accent="primary.main"
            secondary={`Advance secured: ${
              summary?.financialSnapshot?.totalAdvance?.toLocaleString() ?? 0
            }`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            label="Expenses To Date"
            value={summary?.financialSnapshot?.totalExpenses?.toLocaleString() ?? "0"}
            accent="error.main"
            secondary={`Due to collect: ${
              summary?.financialSnapshot?.totalDue?.toLocaleString() ?? 0
            }`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            label="Profit / Loss Outlook"
            value={summary?.financialSnapshot?.profitOrLoss?.toLocaleString() ?? "0"}
            accent={
              summary?.financialSnapshot?.profitOrLoss >= 0
                ? "success.main"
                : "error.main"
            }
            secondary="Projection based on booked income"
          />
        </Grid>
      </Grid>

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
          Highlight Projects
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Budget</TableCell>
              <TableCell align="right">Progress</TableCell>
              <TableCell align="right">Due</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects?.slice(0, 8).map((project) => (
              <TableRow key={project.projectId} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{project.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.code}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{project.clientName}</TableCell>
                <TableCell>
                  <StatusPill label={project.statusName} />
                </TableCell>
                <TableCell align="right">
                  {project.budgetAmount?.toLocaleString() ?? "—"}
                </TableCell>
                <TableCell align="right">{project.progress}%</TableCell>
                <TableCell align="right">
                  {new Date(project.endDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default Dashboard;

