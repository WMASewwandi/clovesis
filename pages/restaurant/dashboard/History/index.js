import { Grid, Switch, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

const sampleOrders = [
    {
        id: 1,
        name: "Cheese Pizza",
        image: "/images/restaurant/sample.jpg",
        billNo: "B101",
        price: 12.99,
        qty: 2,
        date: dayjs().subtract(1, 'day').format("YYYY-MM-DD"),
        type: "Dine In"
    },
    {
        id: 2,
        name: "Veg Burger",
        image: "/images/restaurant/sample.jpg",
        billNo: "B102",
        price: 8.5,
        qty: 1,
        date: dayjs().format("YYYY-MM-DD"),
        type: "Pickup"
    }
];

export default function History() {
    const [isPickup, setIsPickup] = useState(false);
    const [orders, setOrders] = useState(sampleOrders);
    const [dateFilter, setDateFilter] = useState("");

    const handleChange = () => setIsPickup(!isPickup);

    useEffect(() => {
        let filtered = sampleOrders;

        if (dateFilter) {
            filtered = filtered.filter(order => order.date === dateFilter);
        }

        filtered = filtered.filter(order => order.type === (isPickup ? "Pickup" : "Dine In"));

        setOrders(filtered);
    }, [isPickup, dateFilter]);

    return (
        <Grid container spacing={1}>
            <Grid
                item
                xs={12}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ borderBottom: '1px solid #e5e5e5', mb: 1 }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Order History
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography sx={{ color: isPickup ? '#fe6564' : 'gray', fontWeight: isPickup ? 'bold' : 'normal' }}>
                        Pickup
                    </Typography>
                    <Switch
                        checked={isPickup}
                        onChange={handleChange}
                        color="error"
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'white',
                                '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#fe6564'
                            },
                            '& .MuiSwitch-track': {
                                borderRadius: 20,
                                backgroundColor: '#ccc'
                            }
                        }}
                    />
                    <Typography sx={{ color: !isPickup ? '#fe6564' : 'gray', fontWeight: !isPickup ? 'bold' : 'normal' }}>
                        Dine In
                    </Typography>
                </Box>
            </Grid>

            <Grid item xs={12} sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    size="small"
                    sx={{ maxWidth: 200 }}
                />
            </Grid>

            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#fe6564' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white' }}>Image</TableCell>
                                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                                <TableCell sx={{ color: 'white' }}>Bill No</TableCell>
                                <TableCell sx={{ color: 'white' }}>Price</TableCell>
                                <TableCell sx={{ color: 'white' }}>Qty</TableCell>
                                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                                <TableCell sx={{ color: 'white' }}>Type</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length ? orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell><Avatar src={order.image} variant="square" /></TableCell>
                                    <TableCell>{order.name}</TableCell>
                                    <TableCell>{order.billNo}</TableCell>
                                    <TableCell>${order.price.toFixed(2)}</TableCell>
                                    <TableCell>{order.qty}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>{order.type}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No orders found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
}
