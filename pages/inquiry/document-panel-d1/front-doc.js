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

export default function FrontDocument() {
  const [frontImage, setFrontImage] = useState(null);
  const [frontEMBImage, setFrontEMBImage] = useState(null);
  const [frontSUBImage, setFrontSUBImage] = useState(null);
  const [frontSPrintImage, setFrontSPrintImage] = useState(null);
  const [frontDTFImage, setFrontDTFImage] = useState(null);

  const [isFrontChecked, setIsFrontChecked] = useState(false);
  const [isFrontEMBChecked, setIsFrontEMBChecked] = useState(false);
  const [isFrontSUBChecked, setIsFrontSUBChecked] = useState(false);
  const [isFrontSPrintChecked, setIsFrontSPrintChecked] = useState(false);
  const [isFrontDTFChecked, setIsFrontDTFChecked] = useState(false);

  const handleFrontCheckboxChange = (event) => {
    setIsFrontChecked(event.target.checked);
  };
  const handleFrontEMBCheckboxChange = (event) => {
    setIsFrontEMBChecked(event.target.checked);
  };
  const handleFrontSUBCheckboxChange = (event) => {
    setIsFrontSUBChecked(event.target.checked);
  };
  const handleFrontSPrintCheckboxChange = (event) => {
    setIsFrontSPrintChecked(event.target.checked);
  };
  const handleFrontDTFCheckboxChange = (event) => {
    setIsFrontDTFChecked(event.target.checked);
  };

  const handleFrontImageUpload = (event) => {
    const file = event.target.files[0];
    setFrontImage(URL.createObjectURL(file));
  };
  const handleRemoveFrontImage = () => {
    setFrontImage(null);
  };
  const handleFrontEMBImageUpload = (event) => {
    const file = event.target.files[0];
    setFrontEMBImage(URL.createObjectURL(file));
  };
  const handleRemoveFrontEMBImage = () => {
    setFrontEMBImage(null);
  };
  const handleFrontSUBImageUpload = (event) => {
    const file = event.target.files[0];
    setFrontSUBImage(URL.createObjectURL(file));
  };
  const handleRemoveFrontSUBImage = () => {
    setFrontSUBImage(null);
  };
  const handleFrontSPrintImageUpload = (event) => {
    const file = event.target.files[0];
    setFrontSPrintImage(URL.createObjectURL(file));
  };
  const handleRemoveFrontSPrintImage = () => {
    setFrontSPrintImage(null);
  };
  const handleFrontDTFImageUpload = (event) => {
    const file = event.target.files[0];
    setFrontDTFImage(URL.createObjectURL(file));
  };
  const handleRemoveFrontDTFImage = () => {
    setFrontDTFImage(null);
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
                    backgroundImage: frontImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${frontImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFrontChecked}
                        onChange={handleFrontCheckboxChange}
                      />
                    }
                  />
                  <Typography variant="h5" fontWeight="bold">
                    Front
                  </Typography>
                  <Box mt={1}>
                    <input
                      type="file"
                      id="frontImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFrontImageUpload}
                    />
                    <label htmlFor="frontImage">
                      <Button
                        disabled={!isFrontChecked && !frontImage}
                        fullWidth
                        variant="contained"
                        component="span"
                      >
                        {frontImage ? "Change Image" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      disabled={!isFrontChecked && !frontImage}
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveFrontImage}
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
                    backgroundImage: frontEMBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${frontEMBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFrontEMBChecked}
                        onChange={handleFrontEMBCheckboxChange}
                      />
                    }
                    label="EMB"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="frontEMBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFrontEMBImageUpload}
                    />
                    <label htmlFor="frontEMBImage">
                      <Button
                        fullWidth
                        disabled={!isFrontEMBChecked && !frontEMBImage}
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                      >
                        {frontEMBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      disabled={!isFrontEMBChecked && !frontEMBImage}
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveFrontEMBImage}
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
                    backgroundImage: frontSUBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${frontSUBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox />}
                    checked={isFrontSUBChecked}
                    onChange={handleFrontSUBCheckboxChange}
                    label="SUB"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="frontSUBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFrontSUBImageUpload}
                    />
                    <label htmlFor="frontSUBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        disabled={!isFrontSUBChecked && !frontSUBImage}
                        component="span"
                      >
                        {frontSUBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveFrontSUBImage}
                      disabled={!isFrontSUBChecked && !frontSUBImage}
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
                    backgroundImage: frontSPrintImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${frontSPrintImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFrontSPrintChecked}
                        onChange={handleFrontSPrintCheckboxChange}
                      />
                    }
                    label="S Print"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="frontSPrintImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFrontSPrintImageUpload}
                    />
                    <label htmlFor="frontSPrintImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isFrontSPrintChecked && !frontSPrintImage}
                      >
                        {frontSPrintImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveFrontSPrintImage}
                      disabled={!isFrontSPrintChecked && !frontSPrintImage}
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
                    backgroundImage: frontDTFImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${frontDTFImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isFrontDTFChecked}
                        onChange={handleFrontDTFCheckboxChange}
                      />
                    }
                    label="DTF"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="frontDTFImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFrontDTFImageUpload}
                    />
                    <label htmlFor="frontDTFImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isFrontDTFChecked && !frontDTFImage}
                      >
                        {frontDTFImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveFrontDTFImage}
                      disabled={!isFrontDTFChecked && !frontDTFImage}
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
