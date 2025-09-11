import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import AddUserDialog from "pages/administrator/users/AddUserDialog";
import BASE_URL from "Base/api";
import GetAllWarehouse from "@/components/utils/GetAllWarehouse";
import { Search, StyledInputBase } from "@/styles/main/search-styles";
import EditUserDialog from "./EditUserDialog";
import DeleteUserConfirmationById from "@/components/UIElements/Modal/DeleteUserConfirmationById";
import AccessDenied from "@/components/UIElements/Permission/AccessDenied";
import IsPermissionEnabled from "@/components/utils/IsPermissionEnabled";

export default function Users() {
  const cId = sessionStorage.getItem("category")
  const { navigate, create, update, remove, print } = IsPermissionEnabled(cId);
  const [usersList, setUsersLists] = useState([]);
  const [roles, setRoles] = useState([]);
  const { data: warehouseList } = GetAllWarehouse();
  const controller = "User/DeleteUser";
  const [warehouseInfo, setWarehouseInfo] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/User/GetAllUser`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch usere");
      }

      const data = await response.json();
      setUsersLists(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRolesList = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = `${BASE_URL}/User/GetAllRoles`;

      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (warehouseList) {
      const warehouseMap = warehouseList.reduce((acc, warehouse) => {
        acc[warehouse.id] = warehouse;
        return acc;
      }, {});
      setWarehouseInfo(warehouseMap);
    }
  }, [warehouseList]);

  useEffect(() => {
    fetchUsers();
    fetchRolesList();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = usersList.filter((item) =>
    item.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!navigate) {
    return <AccessDenied />;
  }

  return (
    <>
      <div className={styles.pageTitle}>
        <h1>Users</h1>
        <ul>
          <li>
            <Link href="/administrator/users/">Users</Link>
          </li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} lg={4} order={{ xs: 2, lg: 1 }}>
          <Search className="search-form">
            <StyledInputBase
              placeholder="Search here.."
              inputProps={{ "aria-label": "search" }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Search>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          mb={1}
          display="flex"
          justifyContent="end"
          order={{ xs: 1, lg: 2 }}
        >
          {create ? <AddUserDialog fetchItems={fetchUsers} warehouses={warehouseList} roles={roles} /> : ""}
        </Grid>
        <Grid item xs={12} order={{ xs: 3, lg: 3 }}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" className="dark-table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Mobile No</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell>User Role</TableCell>
                  <TableCell>User Type</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row" colSpan={8}>
                      <Typography color="error">
                        No Users Available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((user, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>
                        {user.phoneNumber}
                      </TableCell>
                      <TableCell>
                        {warehouseInfo[user.warehouseId]
                          ? `${warehouseInfo[user.warehouseId].code} - ${warehouseInfo[user.warehouseId].name
                          }`
                          : "-"}
                      </TableCell>
                      <TableCell>{user.userRoleName}</TableCell>
                      <TableCell>{user.userTypeName}</TableCell>
                      <TableCell align="right" display="flex" gap={2}>
                        {update ? <EditUserDialog
                          item={user}
                          fetchItems={fetchUsers}
                          roles={roles}
                          warehouses={warehouseList}
                        /> : ""}
                        {remove ? <DeleteUserConfirmationById
                          id={user.id}
                          controller={controller}
                          fetchItems={fetchUsers}
                        /> : ""}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={paginatedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
}
