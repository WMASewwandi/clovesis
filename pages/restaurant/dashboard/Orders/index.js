import { Grid, Switch, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from "@mui/material";
import React, { useState } from "react";

const sampleOrders = [
  {
    id: 1,
    type: "Pickup",
    table: null,
    steward: "John Doe",
    items: [
      { name: "Burger", qty: 2, price: 250, served: true },
      { name: "Coke", qty: 2, price: 100, served: false },
    ],
    billNo: "B101",
    total: 700,
    date: "2025-09-23"
  },
  {
    id: 2,
    type: "Dine In",
    table: "T2",
    steward: "Alice Smith",
    items: [
      { name: "Pizza", qty: 1, price: 450, served: false },
      { name: "Salad", qty: 1, price: 200, served: true },
    ],
    billNo: "B102",
    total: 650,
    date: "2025-09-23"
  }
];

export default function Orders() {
    const [isPickup, setIsPickup] = useState(false);

    const handleChange = () => setIsPickup(!isPickup);

    const filteredOrders = sampleOrders.filter(order =>
        isPickup ? order.type === "Pickup" : order.type === "Dine In"
    );

    return (
        <Grid container spacing={2}>
            <Grid
                item
                xs={12}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ borderBottom: '1px solid #e5e5e5', pb: 1 }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Orders
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

            <Grid item xs={12} sx={{ mt: 2 }}>
                <TableContainer component={Paper} sx={{ maxHeight: '60vh' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {!isPickup && (
                                    <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>
                                        Table
                                    </TableCell>
                                )}
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Steward Name</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Items</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Bill No</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Total</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredOrders.map(order => (
                                <TableRow key={order.id}>
                                    {!isPickup && <TableCell>{order.table}</TableCell>}
                                    <TableCell>{order.steward}</TableCell>
                                    <TableCell>
                                        {order.items.map((item, idx) => (
                                            <Box key={idx}>
                                                {item.name} x {item.qty} - Rs.{item.price * item.qty}
                                            </Box>
                                        ))}
                                    </TableCell>
                                    <TableCell>{order.billNo}</TableCell>
                                    <TableCell>Rs.{order.total}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>
                                        {order.items.map((item, idx) => (
                                            <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: item.served ? 'line-through' : 'none',
                                                        color: item.served ? 'gray' : '#000',
                                                    }}
                                                >
                                                    {item.name} x {item.qty} - Rs.{item.price * item.qty}
                                                </Typography>
                                                {item.served ? (
                                                    <Chip label="Served" size="small" color="success" />
                                                ) : (
                                                    <Chip label="Pending" size="small" color="error" />
                                                )}
                                            </Box>
                                        ))}
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
}
