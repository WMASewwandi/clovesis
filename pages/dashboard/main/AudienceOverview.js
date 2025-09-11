import React, { useEffect, useState } from "react";
import { Box, Card, Typography, InputLabel, MenuItem, FormControl, Select } from "@mui/material";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import BASE_URL from "Base/api";

const options = {
  plugins: {
    legend: {
      labels: {
        color: "#5B5B98",
      },
    },
  },
};

const AudienceOverview = () => {
  const [select, setSelect] = useState(1);
  const [chartData, setChartData] = useState(null);

  const handleChange = (event) => {
    setSelect(event.target.value);
    fetchSalesSummary(event.target.value);
  };

  const fetchSalesSummary = async (range) => {
    try {
      const token = localStorage.getItem("token");
      const query = `${BASE_URL}/Dashboard/GetSalesSummary?dateRange=${range}`;

      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const res = await response.json();
      const result = res.result;

      const labels = result.map((item) =>
        new Date(item.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      );

      const sales = result.map((item) => item.sales);
      const cost = result.map((item) => item.cost);
      const profit = result.map((item) => item.profit);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Sales",
            backgroundColor: "#6F52ED",
            borderColor: "#6F52ED",
            data: sales,
          },
          {
            label: "Cost",
            backgroundColor: "#2DB6F5",
            borderColor: "#2DB6F5",
            data: cost,
          },
          {
            label: "Profit",
            backgroundColor: "#F765A3",
            borderColor: "#F765A3",
            data: profit,
          },
        ],
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchSalesSummary(select);
  }, [select]);

  return (
    <Card
      sx={{
        boxShadow: "none",
        borderRadius: "10px",
        p: "25px",
        mb: "15px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #EEF0F7",
          paddingBottom: "10px",
          marginBottom: "15px",
        }}
        className="for-dark-bottom-border"
      >
        <Typography
          as="h3"
          sx={{
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          Sales Summary
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="demo-select-small" sx={{ fontSize: "14px" }}>
              Select
            </InputLabel>
            <Select
              labelId="demo-select-small"
              id="demo-select-small"
              value={select}
              label="Select"
              onChange={handleChange}
              sx={{ fontSize: "14px" }}
            >
              <MenuItem value={1} sx={{ fontSize: "14px" }}>
                Last 7 Days
              </MenuItem>
              <MenuItem value={2} sx={{ fontSize: "14px" }}>
                Last Month
              </MenuItem>
              <MenuItem value={3} sx={{ fontSize: "14px" }}>
                Last 12 Months
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {/* {chartData && <Line data={chartData} options={options} height={100} />} */}

      {chartData && (
  <Box sx={{ height: 350 }}>
    <Line data={chartData} options={options} />
  </Box>
)}

    </Card>
  );
};

export default AudienceOverview;
