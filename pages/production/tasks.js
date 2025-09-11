import React, { useState } from "react";
import styles from "@/styles/PageTitle.module.css";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Button
} from "@mui/material";
import { useRouter } from "next/router";

export default function Tasks() {

  const router = useRouter();
  const navigateToTask = () => {
    router.push({
      pathname: "/production/task-details",
    });
  };

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Tasks</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Tasks</li>
        </ul>
      </div>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12}>
            <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Style Name</TableCell>
                  <TableCell>Project Completed Percentage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    1
                  </TableCell>
                  <TableCell>Apex</TableCell>
                  <TableCell>Buyan</TableCell>
                  <TableCell>Style Name</TableCell>
                  <TableCell>100%</TableCell>
                  <TableCell>
                    <span className="successBadge">completed</span>
                  </TableCell>
                  <TableCell>03/06/2024</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" onClick={navigateToTask}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    1
                  </TableCell>
                  <TableCell>Apex</TableCell>
                  <TableCell>Buyan</TableCell>
                  <TableCell>Style Name</TableCell>
                  <TableCell>100%</TableCell>
                  <TableCell>
                    <span className="primaryBadge">ongoing</span>
                  </TableCell>
                  <TableCell>03/06/2024</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" onClick={navigateToTask}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    1
                  </TableCell>
                  <TableCell>Apex</TableCell>
                  <TableCell>Buyan</TableCell>
                  <TableCell>Style Name</TableCell>
                  <TableCell>100%</TableCell>
                  <TableCell>
                    <span className="dangerBadge">Not Started</span>
                  </TableCell>
                  <TableCell>03/06/2024</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" onClick={navigateToTask}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </TableContainer>
          </Grid>
      </Grid>
    </>
  );
}
