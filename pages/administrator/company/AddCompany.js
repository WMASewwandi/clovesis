import React, { useEffect, useRef, useState } from "react";
import { Grid, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
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
  width: { lg: 400, xs: 350 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

const validationSchema = Yup.object().shape({
  Name: Yup.string().required("Name is required"),
  Code: Yup.string().required("Code is required"),
  ContactPerson: Yup.string().required("Contact Person is required"),
  ContactNumber: Yup.string()
    .required("Mobile No is required")
    .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
});

export default function AddCompany({ fetchItems }) {
  const [errors, setErrors] = useState([]);
    const [image,setImage] = useState("");
  const [open, setOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const handleOpen = async () => {
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleSubmit = (values) => {
    const formData = new FormData();

    formData.append("Code", values.Code);
    formData.append("Name", values.Name);
    formData.append("Description", values.Description);
    formData.append("ContactPerson", values.ContactPerson);
    formData.append("ContactNumber", values.ContactNumber);
    formData.append("CompanyLogo", logo ? logo : null);

    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}/Company/CreateCompany`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 200) {
          toast.success(data.message);
          setOpen(false);
          fetchItems();
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
      <Button variant="outlined" onClick={handleOpen}>
        + new company
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="bg-black">
          <Formik
            initialValues={{
              Name: "",
              Code: "",
              ContactPerson: "",
              ContactNumber: "",
              Description: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "500",
                      mb: "12px",
                    }}
                  >
                    Add Company
                  </Typography>
                </Box>
                <Box sx={{ height: "60vh", overflowY: "scroll" }} my={2}>
                  <Grid spacing={1} container>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Name
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        inputRef={inputRef}
                        name="Name"
                        size="small"
                        error={touched.Name && Boolean(errors.Name)}
                        helperText={touched.Name && errors.Name}
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Code
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="Code"
                        size="small"
                        error={touched.Code && Boolean(errors.Code)}
                        helperText={touched.Code && errors.Code}
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Contact Person
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="ContactPerson"
                        size="small"
                        error={
                          touched.ContactPerson && Boolean(errors.ContactPerson)
                        }
                        helperText={
                          touched.ContactPerson && errors.ContactPerson
                        }
                      />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Contact No
                      </Typography>
                      <Field
                        as={TextField}
                        fullWidth
                        name="ContactNumber"
                        size="small"
                        error={
                          touched.ContactNumber && Boolean(errors.ContactNumber)
                        }
                        helperText={
                          touched.ContactNumber && errors.ContactNumber
                        }
                      />
                    </Grid>
                    <Grid item xs={12} mb={3} mt={1}>
                      <Typography
                        sx={{
                          fontWeight: "500",
                          fontSize: "14px",
                          mb: "5px",
                        }}
                      >
                        Description
                      </Typography>
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
                          onChange= {(event) => {
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
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
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
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    </>
  );
}
