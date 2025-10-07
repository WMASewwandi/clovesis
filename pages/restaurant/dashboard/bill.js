import React, { useState } from "react";
import { Grid, Typography, Box, Button, IconButton, Paper } from "@mui/material";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";

const sampleItems = [
    { id: 1, name: "Burger", price: 590, qty: 1, image: "/images/restaurant/sample.jpg" },
    { id: 2, name: "Fries", price: 250, qty: 2, image: "/images/restaurant/sample.jpg" },
    { id: 3, name: "Fries", price: 300, qty: 2, image: "/images/restaurant/sample.jpg" },
];

export default function Bill() {
    const [items, setItems] = useState(sampleItems);
    const today = new Date();

    const handleQtyChange = (id, delta) => {
        setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <Box>
            <Grid container mb={2} pb={2} sx={{ borderBottom: "1px dashed #ccc" }}>
                <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Order Bill</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography>{formatDate(today)}</Typography>
                </Grid>
            </Grid>

            <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
                {items.map(item => (
                    <Box key={item.id} sx={{ display: "flex", alignItems: "center", mb: 1, background: '#f1f6fa', p: 1, borderRadius: '5px', pb: 1 }}>
                        <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 10 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Rs.{item.price.toFixed(2)}</Typography>
                            <Typography color="error">Remove</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <IconButton sx={{ width: 25, height: 25 }} size="small" onClick={() => handleQtyChange(item.id, -1)}>-</IconButton>
                            <Typography mx={1}>{item.qty}</Typography>
                            <IconButton sx={{ width: 25, height: 25 }} size="small" onClick={() => handleQtyChange(item.id, 1)}>+</IconButton>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box mb={2}>
                <Grid container justifyContent="space-between">
                    <Typography>Subtotal</Typography>
                    <Typography>Rs.{formatCurrency(subtotal)}</Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Typography>Tax (8%)</Typography>
                    <Typography>Rs.{formatCurrency(tax)}</Typography>
                </Grid>
                <Grid container justifyContent="space-between" mt={1}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">Rs.{formatCurrency(total)}</Typography>
                </Grid>
            </Box>

            <Button
                variant="contained"
                fullWidth
                sx={{
                    backgroundColor: '#fe6564',
                    '&:hover': { backgroundColor: '#fe6564' },
                }}
            >
                Place order
            </Button>
        </Box>
    );
}
