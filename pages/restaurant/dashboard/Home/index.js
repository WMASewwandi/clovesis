import { Grid, Typography, Box, Button } from "@mui/material";
import React, { useState } from "react";
import FilteredItems from "./filteredItems";
import PersonIcon from "@mui/icons-material/Person";
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import SwitchDesign from "../switch";


const categories = [
    { id: 0, name: "All Items", img: "/images/restaurant/sample.jpg" },
    { id: 1, name: "Pizza", img: "/images/restaurant/sample.jpg" },
    { id: 2, name: "Burger", img: "/images/restaurant/sample.jpg" },
    { id: 3, name: "Drinks", img: "/images/restaurant/sample.jpg" },
    { id: 4, name: "Desserts", img: "/images/restaurant/sample.jpg" },
];

export default function Home() {
    const [activeCategory, setActiveCategory] = useState(0);

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
                    Choose Category
                </Typography>
                <SwitchDesign />
            </Grid>

            <Grid item xs={12} lg={10} sx={{ mt: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        overflowX: "auto",
                        gap: 1,
                        py: 1,
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": { display: "none" }
                    }}
                >
                    {categories.map((cat) => (
                        <Box
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                borderRadius: 10,
                                p: 1,
                                border:
                                    activeCategory === cat.id ? "2px solid #fe6564" : "2px solid #fff",
                                backgroundColor:
                                    activeCategory === cat.id ? "rgba(254,101,100,0.1)" : "transparent",
                                transition: "all 0.2s",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    mr: 1,
                                    border:
                                        activeCategory === cat.id
                                            ? "2px solid #fe6564"
                                            : "2px solid transparent",
                                }}
                            >
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: activeCategory === cat.id ? "bold" : "normal",
                                    color: activeCategory === cat.id ? "#fe6564" : "gray",
                                }}
                            >
                                {cat.name}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Grid>
            <Grid item xs={12} lg={2} sx={{ mt: 1, display: "flex", gap: 1 }}>
                <Button
                    variant="outlined"
                    sx={{
                        borderColor: "#fe6564",
                        color: "#fe6564",
                        "&:hover": {
                            borderColor: "#fe6564",
                            backgroundColor: "rgba(254, 101, 100, 0.1)"
                        },
                        textTransform: "none",
                        fontSize: "0.75rem",
                        minWidth: 64,
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 1
                    }}
                >
                    <PersonIcon sx={{ fontSize: 20 }} />
                    Steward
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        borderColor: "#fe6564",
                        color: "#fe6564",
                        "&:hover": {
                            borderColor: "#fe6564",
                            backgroundColor: "rgba(254, 101, 100, 0.1)"
                        },
                        textTransform: "none",
                        fontSize: "0.75rem",
                        minWidth: 64,
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 1
                    }}
                >
                    <TableRestaurantIcon sx={{ fontSize: 20 }} />
                    Table
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Box
                    sx={{
                        maxHeight: '70vh',
                        overflowY: 'scroll',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        paddingBottom: "100px"
                    }}
                >
                    <FilteredItems />
                </Box>

            </Grid>
        </Grid>
    );
}
