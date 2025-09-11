import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  Typography,
  Card,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export default function BackInsideDocument() {
  const [backInsideImage, setBackInsideImage] = useState(null);
  const [backInsideEMBImage, setBackInsideEMBImage] = useState(null);
  const [backInsideSUBImage, setBackInsideSUBImage] = useState(null);
  const [backInsideSPrintImage, setBackInsideSPrintImage] = useState(null);
  const [backInsideDTFImage, setBackInsideDTFImage] = useState(null);

  const [isBackInsideChecked, setIsBackInsideChecked] = useState(false);
  const [isBackInsideEMBChecked, setIsBackInsideEMBChecked] = useState(false);
  const [isBackInsideSUBChecked, setIsBackInsideSUBChecked] = useState(false);
  const [isBackInsideSPrintChecked, setIsBackInsideSPrintChecked] = useState(false);
  const [isBackInsideDTFChecked, setIsBackInsideDTFChecked] = useState(false);

  const handleBackInsideCheckboxChange = (event) => {
    setIsBackInsideChecked(event.target.checked);
  };
  const handleBackInsideEMBCheckboxChange = (event) => {
    setIsBackInsideEMBChecked(event.target.checked);
  };
  const handleBackInsideSUBCheckboxChange = (event) => {
    setIsBackInsideSUBChecked(event.target.checked);
  };
  const handleBackInsideSPrintCheckboxChange = (event) => {
    setIsBackInsideSPrintChecked(event.target.checked);
  };
  const handleBackInsideDTFCheckboxChange = (event) => {
    setIsBackInsideDTFChecked(event.target.checked);
  };

  const handleBackInsideImageUpload = (event) => {
    const file = event.target.files[0];
    setBackInsideImage(URL.createObjectURL(file));
  };
  const handleRemoveBackInsideImage = () => {
    setBackInsideImage(null);
  };
  const handleBackInsideEMBImageUpload = (event) => {
    const file = event.target.files[0];
    setBackInsideEMBImage(URL.createObjectURL(file));
  };
  const handleRemoveBackInsideEMBImage = () => {
    setBackInsideEMBImage(null);
  };
  const handleBackInsideSUBImageUpload = (event) => {
    const file = event.target.files[0];
    setBackInsideSUBImage(URL.createObjectURL(file));
  };
  const handleRemoveBackInsideSUBImage = () => {
    setBackInsideSUBImage(null);
  };
  const handleBackInsideSPrintImageUpload = (event) => {
    const file = event.target.files[0];
    setBackInsideSPrintImage(URL.createObjectURL(file));
  };
  const handleRemoveBackInsideSPrintImage = () => {
    setBackInsideSPrintImage(null);
  };
  const handleBackInsideDTFImageUpload = (event) => {
    const file = event.target.files[0];
    setBackInsideDTFImage(URL.createObjectURL(file));
  };
  const handleRemoveBackInsideDTFImage = () => {
    setBackInsideDTFImage(null);
  };
  return (
    <>
      <Grid item xs={12}>
        <Grid container>
          <Grid mt={2} item xs={12}>
            <Grid container mt={2}>
              <Grid item xs={12} lg={3}>
                <Card
                  sx={{
                    boxShadow: "none",
                    p: "10px",
                    mb: "10px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backInsideImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backInsideImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackInsideChecked} onChange={handleBackInsideCheckboxChange}/>} />
                  <Typography variant="h5" fontWeight="bold">
                    Back Inside
                  </Typography>
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backInsideImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackInsideImageUpload}
                    />
                    <label htmlFor="backInsideImage">
                      <Button fullWidth variant="contained" disabled={!isBackInsideChecked && !backInsideImage} component="span">
                        {backInsideImage ? "Change Image" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveBackInsideImage}
                      disabled={!isBackInsideChecked && !backInsideImage}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} lg={1}></Grid>
              <Grid item xs={12} lg={2}>
                <Card
                  sx={{
                    boxShadow: "none",
                    p: "10px",
                    mb: "10px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backInsideEMBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backInsideEMBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackInsideEMBChecked} onChange={handleBackInsideEMBCheckboxChange}/>} label="EMB" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backInsideEMBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackInsideEMBImageUpload}
                    />
                    <label htmlFor="backInsideEMBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        disabled={!isBackInsideEMBChecked && !backInsideEMBImage}
                        component="span"
                      >
                        {backInsideEMBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveBackInsideEMBImage}
                      disabled={!isBackInsideEMBChecked && !backInsideEMBImage}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} lg={2}>
                <Card
                  sx={{
                    boxShadow: "none",
                    p: "10px",
                    mb: "10px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backInsideSUBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backInsideSUBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackInsideSUBChecked} onChange={handleBackInsideSUBCheckboxChange}/>} label="SUB" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backInsideSUBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackInsideSUBImageUpload}
                    />
                    <label htmlFor="backInsideSUBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isBackInsideSUBChecked && !backInsideSUBImage}
                      >
                        {backInsideSUBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveBackInsideSUBImage}
                      disabled={!isBackInsideSUBChecked && !backInsideSUBImage}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} lg={2}>
                <Card
                  sx={{
                    boxShadow: "none",
                    p: "10px",
                    mb: "10px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backInsideSPrintImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backInsideSPrintImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackInsideSPrintChecked} onChange={handleBackInsideSPrintCheckboxChange}/>} label="S Print" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backInsideSPrintImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackInsideSPrintImageUpload}
                    />
                    <label htmlFor="backInsideSPrintImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isBackInsideSPrintChecked && !backInsideSPrintImage}
                      >
                        {backInsideSPrintImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveBackInsideSPrintImage}
                      disabled={!isBackInsideSPrintChecked && !backInsideSPrintImage}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} lg={2}>
                <Card
                  sx={{
                    boxShadow: "none",
                    p: "10px",
                    mb: "10px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backInsideDTFImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backInsideDTFImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackInsideDTFChecked} onChange={handleBackInsideDTFCheckboxChange}/>} label="DTF" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backInsideDTFImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackInsideDTFImageUpload}
                    />
                    <label htmlFor="backInsideDTFImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isBackInsideDTFChecked && !backInsideDTFImage}
                      >
                        {backInsideDTFImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveBackInsideDTFImage}
                      disabled={!isBackInsideDTFChecked && !backInsideDTFImage}
                    >
                      Remove
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
