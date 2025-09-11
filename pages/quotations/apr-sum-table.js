import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import BASE_URL from "Base/api";

export default function ApprovedSummaryTable() {
  const [items, setItems] = useState([]);
  const [patternItem, setPatternItem] = useState({});
  const QuotationDetails = JSON.parse(localStorage.getItem("QuotationDetails"));

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/Inquiry/GetAllInquirySummeryTableItems?InquiryID=${QuotationDetails.inquiryID}&OptionId=${QuotationDetails.optionId}&WindowType=${QuotationDetails.windowType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Size List");
      }

      const data = await response.json();
      setItems(data.result);
    } catch (error) {
      console.error("Error fetching Size List:", error);
    }
  };

  const fetchPattern = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/Inquiry/GetAllInquirySummeryLinesPattern?InquiryID=${QuotationDetails.inquiryID}&OptionId=${QuotationDetails.optionId}&WindowType=${QuotationDetails.windowType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Size List");
      }
      const data = await response.json();
      setPatternItem(data.result[0]);
    } catch (error) {
      console.error("Error fetching Size List:", error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchPattern();
  }, []);

  return (
    <>
      <TableContainer>
        <Table size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell style={{ color: "#191919" }}>Description</TableCell>
              <TableCell style={{ color: "#191919" }}>Unit Cost</TableCell>
              <TableCell style={{ color: "#191919" }}>Qty</TableCell>
              <TableCell style={{ color: "#191919" }} align="right">
                Total Cost
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  style={{ color: "#191919" }}
                  component="th"
                  scope="row"
                >
                  {item.itemName}
                </TableCell>
                <TableCell style={{ color: "#191919" }}>
                  {item.approvedUnitCost === null ? 0 : item.approvedUnitCost}
                </TableCell>
                <TableCell style={{ color: "#191919" }}>
                  {item.approvedQuantity === null ? 0 : item.approvedQuantity}
                </TableCell>
                <TableCell style={{ color: "#191919" }} align="right">
                  {item.approvedTotalCost === null ? 0 : item.approvedTotalCost}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell component="th" scope="row">
                {patternItem.itemName}
              </TableCell>
              <TableCell>
                {patternItem.approvedUnitCost === null
                  ? 0
                  : patternItem.approvedUnitCost}
              </TableCell>
              <TableCell>
                {patternItem.approvedQuantity === null
                  ? 0
                  : patternItem.approvedQuantity}
              </TableCell>
              <TableCell align="right">
                {patternItem.approvedTotalCost === null
                  ? 0
                  : patternItem.approvedTotalCost}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer sx={{ mt: 2 }}>
        <Table size="small" aria-label="simple table" className="dark-table">
          <TableHead>
            <TableRow>
              <TableCell style={{ color: "#191919" }} colSpan={3}>
                Total Cost
              </TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedTotalCost}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#191919" }}>No of Units</TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedTotalUnits}
              </TableCell>
              <TableCell sx={{ color: "#191919" }}>Unit Cost</TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedUnitCost}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#191919" }}>Profit</TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedUnitProfit}
              </TableCell>

              <TableCell sx={{ color: "#191919" }}>Profit %</TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedProfitPercentage}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#191919" }}>Selling Price</TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedSellingPrice}
              </TableCell>

              <TableCell sx={{ color: "#191919" }}>Total Profit</TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedTotalProfit}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: "#191919" }} colSpan={3}>
                Revenue
              </TableCell>
              <TableCell sx={{ color: "#191919" }} align="right">
                {QuotationDetails.apprvedRevanue}
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    </>
  );
}
