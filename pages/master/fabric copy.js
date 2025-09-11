import React from "react";
import styles from "@/styles/PageTitle.module.css";
import Link from "next/link";
import Grid from "@mui/material/Grid";


export default function Fabric() {
  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Fabric</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Fabric</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        
      </Grid>
    </>
  );
}
