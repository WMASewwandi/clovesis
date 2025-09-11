import React, { useEffect, useState } from "react";
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
import { Box, Button, Typography } from "@mui/material";
import AddPayment from "@/components/UIElements/Modal/AddPayment";
import Notes from "@/components/UIElements/Modal/Notes";
import BASE_URL from "Base/api";
import { useRouter } from "next/router";

const TypographyHeadingStyles = {
  fontWeight: "500",
  fontSize: "14px",
  mt: "15px",
};
const TypographyDataStyles = {
  fontSize: "14px",
  mt: "15px",
};

export default function ProjectDetails() {
  const router = useRouter();
  const id = router.query.id;
  const [project, setProject] = useState({});
  const [tasks, setTasks] = useState([]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/Inquiry/GetAllProjectsByStatus?InquiryStatus=6`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Fabric List");
      }
      const data = await response.json();
      // const filteredResults = data.result.find(
      //   (item) => item.optionId === parseInt(id)
      // );
      //setProject(filteredResults);
    } catch (error) {
      console.error("Error fetching Fabric List:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/Inquiry/GetAllProjectTaskListByInqID?InquiryID=30&OptionId=62&WindowType=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Fabric List");
      }
      const data = await response.json();
      setTasks(data.result);
    } catch (error) {
      console.error("Error fetching Fabric List:", error);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
  }, []);

  const handleStatusChange = (taskId, status) => {
    const token = localStorage.getItem("token");
    fetch(
      `${BASE_URL}/Inquiry/UpdateProjectTaskStatus?InquiryID=30&OptionId=62&WindowType=1&ProductionTaskStatus=${status}&ProductTaskId=${taskId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 200) {
          fetchTasks();
        }
      })
      .catch((error) => {
        toast.error(error.message || "");
      });
  };
  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Project Details</h1>
        <ul>
          <li>
            <Link href="/production/projects">All Projects</Link>
          </li>
          <li>Projects Details</li>
        </ul>
      </div>
      <Grid container sx={{ background: "#fff" }}>
        <Grid item xs={12} px={2} pt={2}>
          <Link href="/production/projects">
            <Button variant="outlined">Go Back</Button>
          </Link>
        </Grid>
        <Grid item xs={12} lg={5} px={2}>
          <Box mt={1} display="flex" justifyContent="space-between">
            <Typography as="h5" sx={TypographyHeadingStyles}>
              Company Name
            </Typography>
            <Typography as="h5" sx={TypographyDataStyles}>
              MAC DONALS
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography as="h5" sx={TypographyHeadingStyles}>
              Customer Name
            </Typography>
            <Typography as="h5" sx={TypographyDataStyles}>
              TAILOR MADE APPARELS
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography as="h5" sx={TypographyHeadingStyles}>
              Customer Contact Details
            </Typography>
            <Typography as="h5" sx={TypographyDataStyles}>
              Nimasha - 0782827827
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography as="h5" sx={TypographyHeadingStyles}>
              Project Completed Percentage
            </Typography>
            <Typography as="h5" sx={TypographyDataStyles}>
              50%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} lg={5} px={2}>
          <Box mt={1} display="flex" justifyContent="space-between">
            <Typography as="h5" sx={TypographyHeadingStyles}>
              Style Name
            </Typography>
            <Typography as="h5" sx={TypographyDataStyles}>
              MAC DONALS
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography as="h5" sx={TypographyHeadingStyles}>
              Quantity
            </Typography>
            <Typography as="h5" sx={TypographyDataStyles}>
              100
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography as="h5" sx={TypographyHeadingStyles}>
              Delivery Date
            </Typography>
            <Typography as="h5" sx={TypographyDataStyles}>
              4-05-2024
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} lg={2} px={2}>
          <Box mt={3}>
            <AddPayment />
          </Box>
          <Box mt={1}>
            <Button fullWidth variant="contained" color="primary">
              Delivered
            </Button>
          </Box>
          <Box mt={1}>
            <Notes />
          </Box>
        </Grid>
        <Grid item xs={12} mb={3} px={2}>
          <Typography color="primary" variant="h5" mt={2} mb={2}>
            Task Details
          </Typography>
          <TableContainer component={Paper}>
            <Table
              size="small"
              aria-label="simple table"
              className="dark-table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  {/* <TableCell>Task Complete Percentage</TableCell> */}
                  <TableCell>Completed Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {item.taskName}
                    </TableCell>
                    {/* <TableCell>50%</TableCell> */}
                    <TableCell>{item.totalCompletedQty}</TableCell>
                    <TableCell>
                      {item.status == 1 ? (
                        <span className="primaryBadge">pending</span>
                      ) : item.status == 2 ? (
                        <span className="successBadge">started</span>
                      ) : item.status == 3 ? (
                        <span className="dangerBadge">skipped</span>
                      ) : (
                        <span className="successBadge">completed</span>
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ display: "flex", gap: "5px" }}
                    >
                      {item.status === 1 || item.status === 3 ? (
                        item.status === 3 ? (
                          <Button
                            onClick={() => handleStatusChange(index + 1, 1)}
                            variant="outlined"
                            color="error"
                          >
                            Unskip
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleStatusChange(index + 1, 3)}
                            variant="outlined"
                            color="error"
                          >
                            Skip
                          </Button>
                        )
                      ) : (
                        ""
                      )}

                      {item.status == 4 ? (
                        <Button variant="outlined">Done</Button>
                      ) : item.status == 2 ? (
                        <Button
                          onClick={() => handleStatusChange(index + 1, 4)}
                          variant="outlined"
                        >
                          Complete
                        </Button>
                      ) : item.status == 1 ? (
                        <Button
                          variant="outlined"
                          onClick={() => handleStatusChange(index + 1, 2)}
                        >
                          Start
                        </Button>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
}
