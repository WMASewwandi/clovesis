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

export default function BackDocument() {
  const [backImage, setBackImage] = useState(null);
  const [backEMBImage, setBackEMBImage] = useState(null);
  const [backSUBImage, setBackSUBImage] = useState(null);
  const [backSPrintImage, setBackSPrintImage] = useState(null);
  const [backDTFImage, setBackDTFImage] = useState(null);

  const [isBackChecked, setIsBackChecked] = useState(false);
  const [isBackEMBChecked, setIsBackEMBChecked] = useState(false);
  const [isBackSUBChecked, setIsBackSUBChecked] = useState(false);
  const [isBackSPrintChecked, setIsBackSPrintChecked] = useState(false);
  const [isBackDTFChecked, setIsBackDTFChecked] = useState(false);

  const handleBackCheckboxChange = (event) => {
    setIsBackChecked(event.target.checked);
  };
  const handleBackEMBCheckboxChange = (event) => {
    setIsBackEMBChecked(event.target.checked);
  };
  const handleBackSUBCheckboxChange = (event) => {
    setIsBackSUBChecked(event.target.checked);
  };
  const handleBackSPrintCheckboxChange = (event) => {
    setIsBackSPrintChecked(event.target.checked);
  };
  const handleBackDTFCheckboxChange = (event) => {
    setIsBackDTFChecked(event.target.checked);
  };

  const handleBackImageUpload = (event) => {
    const file = event.target.files[0];
    setBackImage(URL.createObjectURL(file));
  };
  const handleRemoveBackImage = () => {
    setBackImage(null);
  };
  const handleBackEMBImageUpload = (event) => {
    const file = event.target.files[0];
    setBackEMBImage(URL.createObjectURL(file));
  };
  const handleRemoveBackEMBImage = () => {
    setBackEMBImage(null);
  };
  const handleBackSUBImageUpload = (event) => {
    const file = event.target.files[0];
    setBackSUBImage(URL.createObjectURL(file));
  };
  const handleRemoveBackSUBImage = () => {
    setBackSUBImage(null);
  };
  const handleBackSPrintImageUpload = (event) => {
    const file = event.target.files[0];
    setBackSPrintImage(URL.createObjectURL(file));
  };
  const handleRemoveBackSPrintImage = () => {
    setBackSPrintImage(null);
  };
  const handleBackDTFImageUpload = (event) => {
    const file = event.target.files[0];
    setBackDTFImage(URL.createObjectURL(file));
  };
  const handleRemoveBackDTFImage = () => {
    setBackDTFImage(null);
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
                    mb: "15px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackChecked} onChange={handleBackCheckboxChange}/>} />
                  <Typography variant="h5" fontWeight="bold">
                    Back
                  </Typography>
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackImageUpload}
                    />
                    <label htmlFor="backImage">
                      <Button disabled={!isBackChecked && !backImage} fullWidth variant="contained" component="span">
                        {backImage ? "Change Image" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveBackImage}
                      disabled={!isBackChecked && !backImage}
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
                    mb: "15px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backEMBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backEMBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackEMBChecked} onChange={handleBackEMBCheckboxChange}/>} label="EMB" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backEMBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackEMBImageUpload}
                    />
                    <label htmlFor="backEMBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isBackEMBChecked && !backEMBImage}
                      >
                        {backEMBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveBackEMBImage}
                      disabled={!isBackEMBChecked && !backEMBImage}
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
                    mb: "15px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backSUBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backSUBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackSUBChecked} onChange={handleBackSUBCheckboxChange}/>} label="SUB" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backSUBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackSUBImageUpload}
                    />
                    <label htmlFor="backSUBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isBackSUBChecked && !backSUBImage}
                      >
                        {backSUBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveBackSUBImage}
                      disabled={!isBackSUBChecked && !backSUBImage}
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
                    mb: "15px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backSPrintImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backSPrintImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackSPrintChecked} onChange={handleBackSPrintCheckboxChange} />} label="S Print" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backSPrintImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackSPrintImageUpload}
                    />
                    <label htmlFor="backSPrintImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isBackSPrintChecked && !backSPrintImage}
                      >
                        {backSPrintImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveBackSPrintImage}
                      disabled={!isBackSPrintChecked && !backSPrintImage}
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
                    mb: "15px",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                    backgroundImage: backDTFImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${backDTFImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isBackDTFChecked} onChange={handleBackDTFCheckboxChange}/>} label="DTF" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="backDTFImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleBackDTFImageUpload}
                    />
                    <label htmlFor="backDTFImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isBackDTFChecked && !backDTFImage}
                      >
                        {backDTFImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveBackDTFImage}
                      disabled={!isBackDTFChecked && !backDTFImage}
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
