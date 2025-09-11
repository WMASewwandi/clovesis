import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import Features from "@/components/Dashboard/ProjectManagement/Features";
import BASE_URL from "Base/api";
import TotalItems from "@/components/Dashboard/ProjectManagement/TotalItems";
import SalesAnalytics from "./SalesAnalytics";
import AudienceOverview from "./AudienceOverview";
import OutstandingCustomers from "./OutstandingCustomers";
import ShippingTargetData from "./ShippingTargetData";

export default function Dashboard() {
  const [features, setFeatures] = useState({});
  const [outstandingCustomers, setOutstandingCustomers] = useState([]);

  const fetchIncomeDetails = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/Receipt/GetPaymentTypeWiseTotal`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setFeatures(data.result);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const fetchOutstandingCustomers = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/Outstanding/GetAllOutstandingsGroupedByCustomer`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setOutstandingCustomers(data.result);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchIncomeDetails();
    fetchOutstandingCustomers();
  }, []);

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Dashboard</h1>
        <ul>
          <li>
            <Link href="/dashboard/main">Dashboard</Link>
          </li>
        </ul>
      </div>

      <Features features={features} />
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} md={12} lg={6} xl={6}>          
          <AudienceOverview />
          <TotalItems />
        </Grid>
        <Grid item xs={12} md={12} lg={6} xl={6}>
          <OutstandingCustomers outstandingCustomers={outstandingCustomers}/>
          <SalesAnalytics />
          <ShippingTargetData/>
        </Grid>       
      </Grid>
    </>
  );
}
