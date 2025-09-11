import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import AddIcon from '@mui/icons-material/Add';
import BASE_URL from "Base/api";
import { getModule } from "@/components/types/module";
import { toast } from "react-toastify";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 1200, xs: 350 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

export default function AddPermission({ module, role }) {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const handleSelectAll = () => {
    const updatedPermissions = permissions.map(category => ({
      ...category,
      permissionTypes: category.permissionTypes.map(perm => ({
        ...perm,
        isActive: !allSelected,
      })),
    }));
    setPermissions(updatedPermissions);
    setAllSelected(!allSelected);
  };

  const handleCategorySelectAll = (categoryIndex) => {
    setPermissions(prev => {
      const updated = [...prev];
      const category = updated[categoryIndex];
      const allChecked = category.permissionTypes.every(perm => perm.isActive);
      category.permissionTypes = category.permissionTypes.map(perm => ({
        ...perm,
        isActive: !allChecked,
      }));
      return updated;
    });
  };


  const handleOpen = () => {
    fetchPermissions();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/User/GetRolePermission?roleId=${role.id}&module=${module.moduleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch permissions");
      const data = await response.json();
      setPermissions(data.result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCheckboxChange = (categoryIndex, permissionIndex) => {
    setPermissions((prev) => {
      const updated = [...prev];
      const current = updated[categoryIndex].permissionTypes[permissionIndex];
      current.isActive = !current.isActive;

      const allChecked = updated.every(category =>
        category.permissionTypes.every(perm => perm.isActive)
      );
      setAllSelected(allChecked);

      return updated;
    });
  };


  const handleSubmit = () => {
    const data = permissions.flatMap((category) =>
      category.permissionTypes.map((perm) => ({
        PermissionId: perm.id,
        IsGranted: perm.isActive,
      }))
    );


    fetch(`${BASE_URL}/Permission/CreateOrUpdateRolePermissions?roleId=${role.id}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 200) {
          toast.success(data.message);
          setOpen(false);
        } else {
          toast.error(data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message || "");
      });
  };

  return (
    <>
      <Tooltip title="Edit">
        <IconButton onClick={handleOpen} size="small">
          <AddIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle} className="bg-black">
          <Formik
            initialValues={{}}
            onSubmit={(values, actions) => {
              handleSubmit();
              actions.setSubmitting(false);
              handleClose();
            }}
          >
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="space-between">
                  <Typography variant="h5" fontWeight={500}>Add Permissions</Typography>
                  <Typography variant="h6" fontWeight={500}>{role.name} - {getModule(module.moduleId)}</Typography>
                </Grid>
                <Grid item xs={12} display="flex">
                  <Button variant="outlined" size="small" onClick={handleSelectAll}>
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ height: "70vh", overflowY: "auto" }}>
                    <Grid container>
                      {permissions.map((category, categoryIndex) => (
                        <Grid item key={categoryIndex} xs={12} lg={3} md={6} my={2}>
                          <Box display="flex" gap={2} alignItems="center">
                            <Typography variant="h6" color="primary" fontWeight={500}>
                              {category.name}
                            </Typography>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={category.permissionTypes.every(p => p.isActive)}
                                  onChange={() => handleCategorySelectAll(categoryIndex)}
                                  size="small"
                                />
                              }
                            />
                          </Box>
                          <Grid container>
                            {category.permissionTypes.map((permission, permIndex) => (
                              <Grid item key={permIndex} xs={12}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={permission.isActive}
                                      onChange={() =>
                                        handleCheckboxChange(categoryIndex, permIndex)
                                      }
                                    />
                                  }
                                  label={permission.name}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>

                      ))}
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="space-between">
                  <Button variant="contained" size="small" color="error" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" size="small">
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Form>
          </Formik>
        </Box>
      </Modal>
    </>
  );
}
