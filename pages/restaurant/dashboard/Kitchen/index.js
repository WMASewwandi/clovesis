import { Grid, Switch, Typography, Box, Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Chip, IconButton, Select, MenuItem } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import React, { useState, useEffect, useRef } from "react";
import SwitchDesign from "../switch";

const initialOrders = [
    { id: 1, billNo: "B101", name: "Burger", qty: 2, status: "Pending", tableNo: 5, steward: "John", img: "/images/restaurant/sample.jpg" },
    { id: 2, billNo: "B102", name: "Pizza", qty: 1, status: "Pending", tableNo: 3, steward: "Mary", img: "/images/restaurant/sample.jpg" },
    { id: 3, billNo: "B103", name: "Fries", qty: 3, status: "Pending", tableNo: 2, steward: "Alex", img: "/images/restaurant/sample.jpg" },
    { id: 4, billNo: "B104", name: "Coke", qty: 2, status: "Pending", tableNo: 1, steward: "Lisa", img: "/images/restaurant/sample.jpg" },
];

export default function Kitchen() {
    const [isPickup, setIsPickup] = useState(false);
    const [filter, setFilter] = useState("All");
    const [orders, setOrders] = useState(initialOrders);
    const audioRef = useRef(null);

    const handleChange = () => setIsPickup(!isPickup);
    const handleBellClick = () => audioRef.current.play();

    const updateStatus = (id, newStatus) => {
        setOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status: newStatus } : order
        ));
    };

    const filteredOrders = orders.filter(item => filter === "All" || item.status === filter);

    return (
        <Grid container spacing={1}>
            <Grid
                item
                xs={12}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ borderBottom: '1px solid #e5e5e5', pb: 1 }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Kitchen</Typography>
                <SwitchDesign/>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
                <ButtonGroup variant="outlined" color="error">
                    {["All", "KOT", "BOT"].map(type => (
                        <Button
                            key={type}
                            onClick={() => setFilter(type)}
                            sx={{
                                borderColor: '#fe6564',
                                color: filter === type ? '#fff' : '#fe6564',
                                backgroundColor: filter === type ? '#fe6564' : 'transparent',
                                '&:hover': { backgroundColor: filter === type ? '#fe6564' : 'rgba(254,101,100,0.1)' }
                            }}
                        >
                            {type}
                        </Button>
                    ))}
                </ButtonGroup>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, maxHeight: "60vh", overflowY: "auto" }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#fe6564" }}>
                            <TableRow>
                                <TableCell sx={{ color: "#fff", fontWeight: 'bold' }}>Bill No</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 'bold' }}>Food</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 'bold' }}>Quantity</TableCell>
                                {!isPickup && (
                                    <>
                                        <TableCell sx={{ color: "#fff", fontWeight: 'bold' }}>Table No</TableCell>
                                        <TableCell sx={{ color: "#fff", fontWeight: 'bold' }}>Steward</TableCell>
                                    </>
                                )}
                                <TableCell sx={{ color: "#fff", fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: 'bold' }} align="right">Notify</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.billNo}</TableCell>
                                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar src={order.img} variant="rounded" sx={{ width: 40, height: 40 }} />
                                        <Typography>{order.name}</Typography>
                                    </TableCell>
                                    <TableCell>{order.qty}</TableCell>
                                    {!isPickup && (
                                        <>
                                            <TableCell>{order.tableNo}</TableCell>
                                            <TableCell>{order.steward}</TableCell>
                                        </>
                                    )}
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            size="small"
                                        >
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Preparing">Preparing</MenuItem>
                                            <MenuItem value="Prepared">Prepared</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell align="right">
                                        {order.status === "Prepared" && (
                                            <IconButton onClick={handleBellClick} color="error">
                                                <NotificationsIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            <audio ref={audioRef} src="/images/restaurant/audio/bell.wav" />
        </Grid>
    );
}
