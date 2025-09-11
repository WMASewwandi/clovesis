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

export default function LSleeveDocument() {
  const [lsleeveImage, setLSleeveImage] = useState(null);
  const [lsleeveEMBImage, setLSleeveEMBImage] = useState(null);
  const [lsleeveSUBImage, setLSleeveSUBImage] = useState(null);
  const [lsleeveSPrintImage, setLSleeveSPrintImage] = useState(null);
  const [lsleeveDTFImage, setLSleeveDTFImage] = useState(null);

  const [isLSleeveChecked, setIsLSleeveChecked] = useState(false);
  const [isLSleeveEMBChecked, setIsLSleeveEMBChecked] = useState(false);
  const [isLSleeveSUBChecked, setIsLSleeveSUBChecked] = useState(false);
  const [isLSleeveSPrintChecked, setIsLSleeveSPrintChecked] = useState(false);
  const [isLSleeveDTFChecked, setIsLSleeveDTFChecked] = useState(false);

  const handleLSleeveCheckboxChange = (event) => {
    setIsLSleeveChecked(event.target.checked);
  };
  const handleLSleeveEMBCheckboxChange = (event) => {
    setIsLSleeveEMBChecked(event.target.checked);
  };
  const handleLSleeveSUBCheckboxChange = (event) => {
    setIsLSleeveSUBChecked(event.target.checked);
  };
  const handleLSleeveSPrintCheckboxChange = (event) => {
    setIsLSleeveSPrintChecked(event.target.checked);
  };
  const handleLSleeveDTFCheckboxChange = (event) => {
    setIsLSleeveDTFChecked(event.target.checked);
  };

  const handleLSleeveImageUpload = (event) => {
    const file = event.target.files[0];
    setLSleeveImage(URL.createObjectURL(file));
  };
  const handleRemoveLSleeveImage = () => {
    setLSleeveImage(null);
  };
  const handleLSleeveEMBImageUpload = (event) => {
    const file = event.target.files[0];
    setLSleeveEMBImage(URL.createObjectURL(file));
  };
  const handleRemoveLSleeveEMBImage = () => {
    setLSleeveEMBImage(null);
  };
  const handleLSleeveSUBImageUpload = (event) => {
    const file = event.target.files[0];
    setLSleeveSUBImage(URL.createObjectURL(file));
  };
  const handleRemoveLSleeveSUBImage = () => {
    setLSleeveSUBImage(null);
  };
  const handleLSleeveSPrintImageUpload = (event) => {
    const file = event.target.files[0];
    setLSleeveSPrintImage(URL.createObjectURL(file));
  };
  const handleRemoveLSleeveSPrintImage = () => {
    setLSleeveSPrintImage(null);
  };
  const handleLSleeveDTFImageUpload = (event) => {
    const file = event.target.files[0];
    setLSleeveDTFImage(URL.createObjectURL(file));
  };
  const handleRemoveLSleeveDTFImage = () => {
    setLSleeveDTFImage(null);
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
                    backgroundImage: lsleeveImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${lsleeveImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isLSleeveChecked} onChange={handleLSleeveCheckboxChange}/>} />
                  <Typography variant="h5" fontWeight="bold">
                    L Sleeve
                  </Typography>
                  <Box mt={1}>
                    <input
                      type="file"
                      id="lsleeveImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleLSleeveImageUpload}
                    />
                    <label htmlFor="lsleeveImage">
                      <Button disabled={!isLSleeveChecked && !lsleeveImage} fullWidth variant="contained" component="span">
                        {lsleeveImage ? "Change Image" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveLSleeveImage}
                      disabled={!isLSleeveChecked && !lsleeveImage}
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
                    backgroundImage: lsleeveEMBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${lsleeveEMBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isLSleeveEMBChecked} onChange={handleLSleeveEMBCheckboxChange}/>} label="EMB" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="lsleeveEMBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleLSleeveEMBImageUpload}
                    />
                    <label htmlFor="lsleeveEMBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isLSleeveEMBChecked && !lsleeveEMBImage}
                      >
                        {lsleeveEMBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      onClick={handleRemoveLSleeveEMBImage}
                      disabled={!isLSleeveEMBChecked && !lsleeveEMBImage}
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
                    backgroundImage: lsleeveSUBImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${lsleeveSUBImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isLSleeveSUBChecked} onChange={handleLSleeveSUBCheckboxChange}/>} label="SUB" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="lsleeveSUBImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleLSleeveSUBImageUpload}
                    />
                    <label htmlFor="lsleeveSUBImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isLSleeveSUBChecked && !lsleeveSUBImage}
                      >
                        {lsleeveSUBImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveLSleeveSUBImage}
                      disabled={!isLSleeveSUBChecked && !lsleeveSUBImage}
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
                    backgroundImage: lsleeveSPrintImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${lsleeveSPrintImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isLSleeveSPrintChecked} onChange={handleLSleeveSPrintCheckboxChange}/>} label="S Print" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="lsleeveSPrintImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleLSleeveSPrintImageUpload}
                    />
                    <label htmlFor="lsleeveSPrintImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isLSleeveSPrintChecked && !lsleeveSPrintImage}
                      >
                        {lsleeveSPrintImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveLSleeveSPrintImage}
                      disabled={!isLSleeveSPrintChecked && !lsleeveSPrintImage}
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
                    backgroundImage: lsleeveDTFImage
                      ? `linear-gradient(rgba(255,255,255, 0.7), rgba(255,255,255, 0.7)), url(${lsleeveDTFImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <FormControlLabel control={<Checkbox checked={isLSleeveDTFChecked} onChange={handleLSleeveDTFCheckboxChange}/>} label="DTF" />
                  <Box mt={1}>
                    <input
                      type="file"
                      id="lsleeveDTFImage"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleLSleeveDTFImageUpload}
                    />
                    <label htmlFor="lsleeveDTFImage">
                      <Button
                        fullWidth
                        sx={{ mt: 4 }}
                        variant="contained"
                        component="span"
                        disabled={!isLSleeveDTFChecked && !lsleeveDTFImage}
                      >
                        {lsleeveDTFImage ? "Change" : "Add Image"}
                      </Button>
                    </label>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveLSleeveDTFImage}
                      disabled={!isLSleeveDTFChecked && !lsleeveDTFImage}
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
