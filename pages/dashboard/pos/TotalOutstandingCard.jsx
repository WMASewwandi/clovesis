import React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatCurrency } from "@/components/utils/formatHelper";


const TotalOutstandingCard = ({ outStandingFeatures }) => {

  return (
    <Card
      sx={{
        boxShadow: "none",
        borderRadius: "10px",
        p: "20px 15px",
        mb: "15px",
        background: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: "58px",
              height: "58px",
              lineHeight: "58px",
              background: "#757FEF",
              color: "#fff",
              fontSize: "30px",
              borderRadius: "8px",
              textAlign: "center",
            }}
            className="mr-10px"
          >
            <i className="ri-exchange-dollar-line"></i>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "13px" }}>Total Outstanding</Typography>
            <Typography
              variant="h1"
              sx={{ fontSize: 25, fontWeight: 700, marginTop: "4px" }}
            >
              {formatCurrency(outStandingFeatures.totalOutstanding
)}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ marginTop: "8px" }}>
        <Typography sx={{ fontSize: "11px", color: "#666" }}>
          Customers: Rs. {formatCurrency(outStandingFeatures.customerOutstanding)}
        </Typography>
        <Typography sx={{ fontSize: "11px", color: "#666" }}>
          Suppliers: Rs. {formatCurrency(outStandingFeatures.supplierOutstanding
)}
        </Typography>
      </Box>
    </Card>
  );
};

export default TotalOutstandingCard;
