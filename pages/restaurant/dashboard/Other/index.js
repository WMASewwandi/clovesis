import { Grid, Typography, Button } from "@mui/material";
import React, { useState } from "react";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

const menuItems = [
    { key: "cash-in", label: "Cash In", icon: <ArrowCircleDownIcon sx={{ fontSize: "2rem", my: 1 }} /> },
    { key: "cash-out", label: "Cash Out", icon: <ArrowCircleUpIcon sx={{ fontSize: "2rem", my: 1 }} /> },
    { key: "recall", label: "Re Call", icon: <EventRepeatIcon sx={{ fontSize: "2rem", my: 1 }} /> },
];

export default function Other() {
    const [activeTab, setActiveTab] = useState("home");

    return (
        <Grid container spacing={1}>
            <Grid
                item
                xs={12}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ borderBottom: '1px solid #e5e5e5' }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Other
                </Typography>
            </Grid>
            <Grid item xs={10} sx={{ mt: 1 }}>
                <Grid container spacing={1}>
                    {menuItems.map((menu, i) => (
                        <Grid key={i} item xs={12} lg={3}>
                            <Button
                                onClick={() => {
                                    setActiveTab(menu.key);
                                }}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "10px",
                                    backgroundColor: activeTab === menu.key ? "#fe6564" : "#e9eced",
                                    color: activeTab === menu.key ? "#fff" : "#bdbebe",
                                    "&:hover": {
                                        backgroundColor:
                                            activeTab === menu.key ? "#fe6564" : "#d1d5d8",
                                        color: "#fff",
                                        "& svg": {
                                            color: "#fff",
                                        },
                                    },
                                }}
                            >
                                {menu.icon}
                                {menu.label}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
}
