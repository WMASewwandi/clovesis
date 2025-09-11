import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  IconButton,
  MenuItem,
  Tooltip,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import getNext from "@/components/utils/getNext";
import Modules from "./modules";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});




const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 500, xs: 360 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
};

const validationSchema = Yup.object().shape({
  ContactPerson: Yup.string().required("Contact Person is required"),
  ContactNumber: Yup.string()
    .required("Mobile No is required")
    .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
});

export default function EditCompany({ item, fetchItems }) {
  const { data: code } = getNext(`12`);
  const [image,setImage] = useState("");
  const [open, setOpen] = useState(false);
  const [warehouseCode, setWarehouseCode] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [logo, setLogo] = useState(null);
  const inputRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTabIndex(0);
  };
  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (code) setWarehouseCode(code);

    if(item){
      setImage(item.companyLogo);
    }
  }, [code,item]);


  const handleSubmit = async (values) => {
    const formData = new FormData();

    formData.append("Id", values.Id);
    formData.append("Code", values.Code);
    formData.append("Name", values.Name);
    formData.append("Description", values.Description);
    formData.append("ContactPerson", values.ContactPerson);
    formData.append("ContactNumber", values.ContactNumber);
    formData.append("CompanyLogo", logo ? logo : null);
    // append fields
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/Company/UpdateCompany`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        toast.success(data.message);
        setOpen(false);
        fetchItems();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "");
    }
  };


  return (
    <>
      <Tooltip title="Edit" placement="top">
        <IconButton onClick={handleOpen} aria-label="edit" size="small">
          <BorderColorIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label="Basic" />
            <Tab label="Modules" />
          </Tabs>

          <Formik
            initialValues={{
              Id: item.id,
              Name: item.name || "",
              Code: item.code || "",
              ContactPerson: item.contactPerson || "",
              ContactNumber: item.contactNumber || "",
              Description: item.description || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                {tabIndex === 0 && (
                  <Box sx={{ maxHeight: "55vh", overflowY: "auto", my: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography>Name</Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="Name"
                          size="small"
                          inputRef={inputRef}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>Code</Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="Code"
                          size="small"
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>Contact Person</Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="ContactPerson"
                          size="small"
                          error={
                            touched.ContactPerson && !!errors.ContactPerson
                          }
                          helperText={
                            touched.ContactPerson && errors.ContactPerson
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>Contact Number</Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="ContactNumber"
                          size="small"
                          error={
                            touched.ContactNumber && !!errors.ContactNumber
                          }
                          helperText={
                            touched.ContactNumber && errors.ContactNumber
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography>Description</Typography>
                        <Field
                          as={TextField}
                          fullWidth
                          name="Description"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    <Grid item xs={12} my={1}> 
                       <Typography>Logo Upload</Typography>
                      <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        fullWidth
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload files
                        <VisuallyHiddenInput
                          type="file"
                          onChange={(event) => {
                            var file = event.target.files[0]
                            setLogo(file);
                            setImage(URL.createObjectURL(file));
                          }}
                          multiple
                        />
                      </Button>
                    </Grid>
                      <Grid item xs={12} my={1}>
                      {image != "" ?
                      <Box sx={{width: "100%",height: 200,backgroundSize: 'cover', backgroundImage: `url(${image})`}}></Box>
                       : ""}
                      
                    </Grid>
                  </Box>
                )}

                {tabIndex === 1 && (
                  <Modules handleClose={handleClose} item={item.id} />
                )}
                {tabIndex === 0 && (
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleClose}
                      size="small"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" size="small">
                      Save
                    </Button>
                  </Box>
                )}
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}
