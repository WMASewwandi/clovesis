import { Switch, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid } from "@mui/material";
import React, { useState } from "react";

export default function SwitchDesign() {
    const [isPickup, setIsPickup] = useState(false);
    const [exitDialogOpen, setExitDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    const handleChange = () => {
        setIsPickup(!isPickup);
        if (!isPickup) {
            setExitDialogOpen(true);
        }
    };

    const handleCancelExit = () => {
        setExitDialogOpen(false);
        setIsPickup(false);
        setSelectedType(null);
    };

    const handleConfirmExit = () => {
        setExitDialogOpen(false);
        setSelectedType(null);
    };

    const pickupTypes = ["Customer","Uber", "Pick Me"];

    return (
        <>
            <Box display="flex" alignItems="center" gap={1}>
                <Typography sx={{ color: isPickup ? "#fe6564" : "gray", fontWeight: isPickup ? "bold" : "normal" }}>
                    Pickup
                </Typography>
                <Switch
                    checked={isPickup}
                    onChange={handleChange}
                    color="error"
                    sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "white",
                            "&:hover": { backgroundColor: "rgba(255,0,0,0.1)" },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#fe6564",
                        },
                        "& .MuiSwitch-track": {
                            borderRadius: 20,
                            backgroundColor: "#ccc",
                        },
                    }}
                />
                <Typography sx={{ color: !isPickup ? "#fe6564" : "gray", fontWeight: !isPickup ? "bold" : "normal" }}>
                    Dine In
                </Typography>
            </Box>

            <Dialog open={exitDialogOpen} onClose={handleCancelExit}>
                <DialogTitle sx={{ background: "#fe6564", color: "#fff", width: "350px" }}>
                    Choose Pick up Type
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <Grid container spacing={1}>
                            {pickupTypes.map((type, i) => (
                                <Grid key={i} item xs={12} lg={4}>
                                    <Button
                                        onClick={() => setSelectedType(type)}
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            height: '70px',
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "5px",
                                            border: selectedType === type ? "3px solid #fe6564" : "3px solid #e9eced",
                                            backgroundColor: selectedType === type ? "#fff" : "#e9eced",
                                            color: selectedType === type ? "#fe6564" : "#bdbebe",
                                            "&:hover": {
                                                backgroundColor:
                                                    selectedType === type ? "#fe6564" : "#d1d5d8",
                                                color: "#fff",
                                                "& svg": {
                                                    color: "#fff",
                                                },
                                            },
                                        }}
                                    >
                                        {type}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box px={2} pb={1} display="flex" sx={{width:'100%'}} justifyContent="space-between">
                        <Button onClick={handleCancelExit} variant="outlined" color="error">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmExit}
                            variant="contained"
                            disabled={!selectedType}
                            sx={{
                                backgroundColor: '#fe6564',
                                '&:hover': { backgroundColor: '#fe6564' },
                            }}
                        >
                            Select
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
}
