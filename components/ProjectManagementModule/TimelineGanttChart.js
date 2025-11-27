import { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Box, Button, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const colorPalette = [
  "#6366F1",
  "#EC4899",
  "#22D3EE",
  "#F97316",
  "#84CC16",
  "#F87171",
  "#38BDF8",
  "#A855F7",
];

const TimelineGanttChart = ({ data = [], title = "Project Timeline" }) => {
  const chartRef = useRef(null);

  const series = useMemo(() => {
    const transformed = data.map((item, index) => ({
      x: item.phaseName,
      y: [
        new Date(item.startDate).getTime(),
        new Date(item.endDate).getTime(),
      ],
      fillColor: colorPalette[index % colorPalette.length],
      goals: item.assignedToName
        ? [
            {
              name: item.assignedToName,
              value: new Date(item.endDate).getTime(),
              strokeColor: "#0EA5E9",
            },
          ]
        : undefined,
    }));

    return [
      {
        name: "Phases",
        data: transformed,
      },
    ];
  }, [data]);

  const options = useMemo(
    () => ({
      chart: {
        type: "rangeBar",
        height: 420,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          rangeBarGroupRows: true,
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: {
            colors: "#94A3B8",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#64748B",
            fontWeight: 600,
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value, opts) => {
          const assigned =
            data?.[opts.dataPointIndex]?.assignedToName ?? "Unassigned";
          return `${assigned}`;
        },
        style: {
          colors: ["#0F172A"],
          fontWeight: 600,
        },
      },
      tooltip: {
        shared: false,
        custom: ({ dataPointIndex }) => {
          const entry = data[dataPointIndex];
          return `<div style="padding:12px;">
            <strong>${entry.phaseName}</strong><br/>
            ${new Date(entry.startDate).toLocaleDateString()} → ${new Date(
            entry.endDate
          ).toLocaleDateString()}<br/>
            ${entry.assignedToName ?? "Unassigned"}
          </div>`;
        },
      },
      grid: {
        borderColor: "#1E293B22",
      },
    }),
    [data]
  );

  const handleExport = () => {
    const chart = chartRef.current?.chart;
    if (chart) {
      chart.downloadPNG();
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visual timeline with responsibility mapping.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Gantt
        </Button>
      </Stack>
      <Chart ref={chartRef} options={options} series={series} type="rangeBar" height={420} />
    </Box>
  );
};

export default TimelineGanttChart;

