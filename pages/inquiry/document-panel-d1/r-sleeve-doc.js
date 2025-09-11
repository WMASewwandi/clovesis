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

export default function RSleeveDocument() {
  const [rsleeveImage, setRSleeveImage] = useState(null);
  const [rsleeveEMBImage, setRSleeveEMBImage] = useState(null);
  const [rsleeveSUBImage, setRSleeveSUBImage] = useState(null);
  const [rsleeveSPrintImage, setRSleeveSPrintImage] = useState(null);
  const [rsleeveDTFImage, setRSleeveDTFImage] = useState(null);

  const [isRSleeveChecked, setIsRSleeveChecked] = useState(false);
  const [isRSleeveEMBChecked, setIsRSleeveEMBChecked] = useState(false);
  const [isRSleeveSUBChecked, setIsRSleeveSUBChecked] = useState(false);
  const [isRSleeveSPrintChecked, setIsRSleeveSPrintChecked] = useState(false);
  const [isRSleeveDTFChecked, setIsRSleeveDTFChecked] = useState(false);

  const handleRSleeveCheckboxChange = (event) => {
    setIsRSleeveChecked(event.target.checked);
  };
  const handleRSleeveEMBCheckboxChange = (event) => {
    setIsRSleeveEMBChecked(event.target.checked);
  };
  const handleRSleeveSUBCheckboxChange = (event) => {
    setIsRSleeveSUBChecked(event.target.checked);
  };
  const handleRSleeveSPrintCheckboxChange = (event) => {
    setIsRSleeveSPrintChecked(event.target.checked);
  };
  const handleRSleeveDTFCheckboxChange = (event) => {
    setIsRSleeveDTFChecked(event.target.checked);
  };

  const handleRSleeveImageUpload = (event) => {
    const file = event.target.files[0];
    setRSleeveImage(URL.createObjectURL(file));
  };
  const handleRemoveRSleeveImage = () => {
    setRSleeveImage(null);
  };
  const handleRSleeveEMBImageUpload = (event) => {
    const file = event.target.files[0];
    setRSleeveEMBImage(URL.createObjectURL(file));
  };
  const handleRemoveRSleeveEMBImage = () => {
    setRSleeveEMBImage(null);
  };
  const handleRSleeveSUBImageUpload = (event) => {
    const file = event.target.files[0];
    setRSleeveSUBImage(URL.createObjectURL(file));
  };
  const handleRemoveRSleeveSUBImage = () => {
    setRSleeveSUBImage(null);
  };
  const handleRSleeveSPrintImageUpload = (event) => {
    const file = event.target.files[0];
    setRSleeveSPrintImage(URL.createObjectURL(file));
  };
  const handleRemoveRSleeveSPrintImage = () => {
    setRSleeveSPrintImage(null);
  };
  const handleRSleeveDTFImageUpload = (event) => {
    const file = event.target.files[0];
    setRSleeveDTFImage(URL.createObjectURL(file));
  };
  const handleRemoveRSleeveDTFImage = () => {
    setRSleeveDTFImage(null);
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
                    backgroundImage: rsleeveImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${rsleeveImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRSleeveChecked}
                        onChange={handleRSleeveCheckboxChange}
                      />
                    }
                  />
                  <Typography variant="h5" fontWeight="bold">
                    R Sleeve
                  </Typography>
                  <Box mt={1}>
                    <input
                      type="file"
                      id="rsleeveImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleRSleeveImageUpload}
                    />
                    <label htmlFor="rsleeveImage">
                      <Button
                        disabled={!isRSleeveChecked && !rsleeveImage}
                        fullWidth
                        variant="contained"
                        component="span"
                      >
                        {rsleeveImage ? "Change Image" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveRSleeveImage}
                      disabled={!isRSleeveChecked && !rsleeveImage}
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
                    backgroundImage: rsleeveEMBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${rsleeveEMBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRSleeveEMBChecked}
                        onChange={handleRSleeveEMBCheckboxChange}
                      />
                    }
                    label="EMB"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="rsleeveEMBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleRSleeveEMBImageUpload}
                    />
                    <label htmlFor="rsleeveEMBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isRSleeveEMBChecked && !rsleeveEMBImage}
                      >
                        {rsleeveEMBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveRSleeveEMBImage}
                      disabled={!isRSleeveEMBChecked && !rsleeveEMBImage}
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
                    backgroundImage: rsleeveSUBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${rsleeveSUBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRSleeveSUBChecked}
                        onChange={handleRSleeveSUBCheckboxChange}
                      />
                    }
                    label="SUB"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="rsleeveSUBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleRSleeveSUBImageUpload}
                    />
                    <label htmlFor="rsleeveSUBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isRSleeveSUBChecked && !rsleeveSUBImage}
                      >
                        {rsleeveSUBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveRSleeveSUBImage}
                      disabled={!isRSleeveSUBChecked && !rsleeveSUBImage}
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
                    backgroundImage: rsleeveSPrintImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${rsleeveSPrintImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRSleeveSPrintChecked}
                        onChange={handleRSleeveSPrintCheckboxChange}
                      />
                    }
                    label="S Print"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="rsleeveSPrintImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleRSleeveSPrintImageUpload}
                    />
                    <label htmlFor="rsleeveSPrintImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={
                          !isRSleeveSPrintChecked && !rsleeveSPrintImage
                        }
                      >
                        {rsleeveSPrintImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveRSleeveSPrintImage}
                      disabled={!isRSleeveSPrintChecked && !rsleeveSPrintImage}
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
                    backgroundImage: rsleeveDTFImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${rsleeveDTFImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRSleeveDTFChecked}
                        onChange={handleRSleeveDTFCheckboxChange}
                      />
                    }
                    label="DTF"
                  />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="rsleeveDTFImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleRSleeveDTFImageUpload}
                    />
                    <label htmlFor="rsleeveDTFImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isRSleeveDTFChecked && !rsleeveDTFImage}
                      >
                        {rsleeveDTFImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveRSleeveDTFImage}
                      disabled={!isRSleeveDTFChecked && !rsleeveDTFImage}
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
