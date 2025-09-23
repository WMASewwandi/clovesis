import React, { useState } from "react";
import { Grid, Typography, Button, ButtonGroup, Box, IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { formatCurrency } from "@/components/utils/formatHelper";

const products = [
    {
        id: 1,
        name: "Burger",
        img: "/images/restaurant/sample.jpg",
        prices: { S: 100, M: 200, L: 300 },
    },
    {
        id: 2,
        name: "Pizza",
        img: "/images/restaurant/sample.jpg",
        prices: { S: 150, M: 500, L: 750 },
    },
    {
        id: 3,
        name: "Burger",
        img: "/images/restaurant/sample.jpg",
        prices: { S: 100, M: 200, L: 300 },
    },
    {
        id: 4,
        name: "Pizza",
        img: "/images/restaurant/sample.jpg",
        prices: { S: 150, M: 500, L: 750 },
    },
    {
        id: 5,
        name: "Burger",
        img: "/images/restaurant/sample.jpg",
        prices: { S: 100, M: 200, L: 300 },
    },
    {
        id: 6,
        name: "Pizza",
        img: "/images/restaurant/sample.jpg",
        prices: { S: 150, M: 500, L: 750 },
    },
];

export default function FilteredItems() {
    const [cart, setCart] = useState(
        products.map((p) => ({ ...p, size: "S", qty: 1 }))
    );

    const handleSizeChange = (id, newSize) => {
        setCart(cart.map(item => item.id === id ? { ...item, size: newSize } : item));
    };

    const handleQtyChange = (id, delta) => {
        setCart(cart.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
    };


    return (
        <Grid container spacing={2} mt={2}>
            {cart.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                    <Box p={2} sx={{ background: '#fff' }} borderRadius={2}>
                        <img src={item.img} alt={item.name} style={{ width: "100%", borderRadius: "8px" }} />
                        <Typography textAlign="center" variant="h6" mt={1}>{item.name}</Typography>
                        <Typography textAlign="center" variant="h6" sx={{ fontWeight: 'bold', color: '#fe6564' }}>
                            Rs.{formatCurrency(item.prices[item.size])}
                        </Typography>
                        <Box display="flex" justifyContent="center">
                            <ButtonGroup size="small">
                                {["S", "M", "L"].map((s) => (
                                    <Button
                                        key={s}
                                        variant={item.size === s ? "contained" : "outlined"}
                                        onClick={() => handleSizeChange(item.id, s)}
                                        sx={{
                                            color: item.size === s ? "white" : "#fe6564",
                                            backgroundColor: item.size === s ? "#fe6564" : "transparent",
                                            borderColor: "#fe6564",
                                            "&:hover": {
                                                backgroundColor: item.size === s ? "#fe6564" : "rgba(255,0,0,0.08)"
                                            }
                                        }}
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Box>
                        <Box display="flex" my={1} alignItems="center" justifyContent="center" borderRadius={1} overflow="hidden">
                            <IconButton
                                onClick={() => handleQtyChange(item.id, -1)}
                                size="small"
                                sx={{
                                    p: 0.5,
                                    color: "#fe6564",
                                    border: '1px solid #fe6564'
                                }}
                            >
                                <RemoveIcon fontSize="small" />
                            </IconButton>

                            <TextField
                                value={item.qty}
                                size="small"
                                sx={{
                                    width: 32,
                                    mx: 0,
                                    "& .MuiInputBase-input": { textAlign: "center", padding: "4px 0" },
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                }}
                                inputProps={{ readOnly: true }}
                            />

                            <IconButton
                                onClick={() => handleQtyChange(item.id, 1)}
                                size="small"
                                sx={{
                                    p: 0.5,
                                    color: "#fe6564",
                                    border: '1px solid #fe6564'
                                }}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                backgroundColor: '#fe6564',
                                '&:hover': { backgroundColor: '#fe6564' },
                            }}
                        >
                            Add
                        </Button>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
}
