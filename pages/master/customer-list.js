import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import AppsIcon from "@mui/icons-material/Apps";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import AddCustomerDialog from "@/components/UIElements/Modal/AddCustomerDialog";
import ViewCustomerDialog from "@/components/UIElements/Modal/ViewCustomerDialog";
import {
  Button,
  ButtonGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditCustomerDialog from "@/components/UIElements/Modal/EditCustomerDialog";
import DeleteConfirmationById from "@/components/UIElements/Modal/DeleteConfirmationById";
import BASE_URL from "Base/api";
import { ToastContainer } from "react-toastify";

export default function CustomerList() {
  const [customersLists, setCustomersLists] = useState([]);
  const [view, setView] = useState(1);
  const controller ="Customer/DeleteCustomer";

  const fetchCustomersList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Customer/GetAllCustomer`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Fabric List");
      }

      const data = await response.json();
      setCustomersLists(data.result);
    } catch (error) {
      console.error("Error fetching Fabric List:", error);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, []);

  const handleCardChange = () => {
    setView(1);
  };
  const handleTableChange = () => {
    setView(2);
  };
  return (
    <>
    <ToastContainer/>
      <div className={styles.pageTitle}>
        <h1>Customers</h1>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>Customers</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} mb={3} display="flex" justifyContent="space-between">
          <ButtonGroup sx={{ mr: 1 }}>
            <Button
              onClick={handleCardChange}
              variant={view === 1 ? "contained" : "outlined"}
              color="dark"
            >
              <AppsIcon />
            </Button>
            <Button
              onClick={handleTableChange}
              variant={view === 2 ? "contained" : "outlined"}
              color="dark"
            >
              <ViewHeadlineIcon />
            </Button>
          </ButtonGroup>
          <AddCustomerDialog fetchItems={fetchCustomersList} />
        </Grid>
        {view === 1 ? (
          customersLists.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ width: "100%", mt: 5, height: "50vh" }}
            >
              <Box sx={{ width: "50%", padding: "30px" }}>
                <center>
                  <img width="100px" src="/images/empty-folder.png" />
                </center>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ color: "#BEBEBE", fontWeight: "bold" }}
                >
                  No Customers Available.
                </Typography>
              </Box>
            </Box>
          ) : (
            customersLists.map((customer, index) => (
              <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={customer.id}>
                <Card
                  sx={{
                    textAlign: "center",
                    boxShadow: "none",
                    borderRadius: "10px",
                    p: "20px 15px",
                    mb: "15px",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <img
                    src="https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg"
                    alt="Member"
                    width="148px"
                    height="148px"
                    className="borRadius100"
                  />
                  <Typography
                    as="h4"
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      mt: "10px",
                    }}
                  >
                    {customer.firstName} {customer.lastName}
                    <span
                      style={{
                        fontSize: "14px",
                        paddingLeft: "5px",
                        color: "gray",
                      }}
                    >
                      ({customer.title})
                    </span>
                  </Typography>

                  <Typography
                    as="h4"
                    sx={{
                      fontSize: 13,
                      color: "#A9A9C8",
                      mb: 2,
                    }}
                  >
                    <Link
                      style={{ textDecoration: "none", color: "#A9A9C8" }}
                      href={`mailto:${customer.customerContactDetails[0].emailAddress}`}
                    >
                      {customer.customerContactDetails[0].emailAddress}
                    </Link>
                  </Typography>

                  <Box>
                    <ViewCustomerDialog
                      viewtype={view}
                      customerId={customer.id}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                    }}
                  >
                    <EditCustomerDialog
                      fetchItems={fetchCustomersList}
                      item={customer}
                    />
                   <DeleteConfirmationById id={customer.id} controller={controller} fetchItems={fetchCustomersList}/>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "center",
                      mt: "30px",
                    }}
                  >
                    <Box sx={{ width: "50%" }}>
                      <Typography color="#A9A9C8" mb={1}>
                        Location
                      </Typography>
                      <Typography
                        sx={{ height: "40px", overflow: "hidden" }}
                        fontWeight="500"
                        fontSize="15px"
                      >
                        {customer.addressLine1},{customer.addressLine2},
                        {customer.addressLine3}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography color="#A9A9C8" mb={1}>
                        Phone
                      </Typography>
                      <Typography fontWeight="500" fontSize="15px">
                        {customer.customerContactDetails[0].contactNo}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          )
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              boxShadow: "none",
            }}
          >
            <Table
              sx={{ minWidth: 950 }}
              aria-label="custom pagination table"
              className="dark-table"
            >
              <TableHead sx={{ background: "#F7FAFF" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13.5px",
                      padding: "15px 10px",
                    }}
                  >
                    Customer Name
                  </TableCell>

                  <TableCell
                    sx={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13.5px",
                      padding: "15px 10px",
                    }}
                  >
                    Email
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13.5px",
                      padding: "15px 10px",
                    }}
                  >
                    Mobile No
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13.5px",
                      padding: "15px 10px",
                    }}
                  >
                    Address
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13.5px",
                      padding: "15px 10px",
                    }}
                  >
                    NIC
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13.5px",
                      padding: "15px 10px",
                    }}
                  >
                    Date of Birth
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      borderBottom: "1px solid #F7FAFF",
                      fontSize: "13.5px",
                      padding: "15px 10px",
                    }}
                  >
                    View Details
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {customersLists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="error">
                        No Customers Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  customersLists.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          width: 250,
                          borderBottom: "1px solid #F7FAFF",
                          padding: "8px 10px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src="https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg"
                            alt="Product Img"
                            width={50}
                            className="borderRadius10"
                          />
                          <Typography
                            sx={{
                              fontWeight: "500",
                              fontSize: "13px",
                            }}
                            className="ml-10px"
                          >
                            {customer.firstName + " " + customer.lastName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom: "1px solid #F7FAFF",
                          padding: "8px 10px",
                          fontSize: "13px",
                        }}
                      >
                        {customer.customerContactDetails[0].emailAddress}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: "1px solid #F7FAFF",
                          padding: "8px 10px",
                          fontSize: "13px",
                        }}
                      >
                        {customer.customerContactDetails[0].contactNo}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: "1px solid #F7FAFF",
                          padding: "8px 10px",
                          fontSize: "13px",
                        }}
                      >
                        {customer.addressLine1 +
                          "," +
                          customer.addressLine2 +
                          "," +
                          customer.addressLine3}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: "1px solid #F7FAFF",
                          padding: "8px 10px",
                          fontSize: "13px",
                        }}
                      >
                        {customer.nic}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          borderBottom: "1px solid #F7FAFF",
                          padding: "8px 10px",
                          fontSize: "13px",
                        }}
                      >
                        {customer.dateofBirth.split("T")[0]}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "1px solid #F7FAFF",
                          padding: "8px 10px",
                          fontSize: "13px",
                        }}
                      >
                        <ViewCustomerDialog
                          viewtype={view}
                          customerId={customer.id}
                        />
                      </TableCell>
                      <TableCell sx={{display: 'flex'}}>
                        <EditCustomerDialog
                          fetchItems={getItems}
                          item={customer}
                        />
                       <DeleteConfirmationById id={customer.id} controller={controller} fetchItems={getItems}/>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Grid>
    </>
  );
}
