import React, { useEffect, useRef, useState } from "react";
import { Grid, Typography, Box, Button, IconButton, Tooltip } from "@mui/material";
import { formatCurrency } from "@/components/utils/formatHelper";
import BASE_URL from "Base/api";
import Swal from "sweetalert2";
import ReplayIcon from '@mui/icons-material/Replay';

export default function Bill({
    billItems,
    onUpdateFromBill,
    steward,
    table,
    pickupType,
    onCleanBill,
    shift,
    orderId,
    isOffer,
    offerTotal }) {
    const [items, setItems] = useState([]);
    const audioRef = useRef(null);

    const handleQtyChange = (id, delta) => {
        setItems(prevItems => {
            const updated = prevItems.map(item =>
                item.id === id
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            );
            if (onUpdateFromBill) {
                onUpdateFromBill(updated);
            }
            return updated;
        });
    };

    const handleRemove = (id) => {
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        if (onUpdateFromBill) {
            onUpdateFromBill(updatedItems);
        }
    };

    const subtotal = isOffer ? offerTotal : items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const charge = subtotal * 0.05;
    const total = subtotal + charge;

    useEffect(() => {
        if (billItems) {
            setItems(billItems);
        }
    }, [billItems]);

    const handleSubmit = async () => {
        if (!pickupType) {
            if (!table) {
                Swal.fire("Warning", "Please select a table", "warning");
                return;
            }
            if (!steward) {
                Swal.fire("Warning", "Please select a steward", "warning");
                return;
            }
        }
        if (items.length === 0 && orderId === null) {
            Swal.fire("Warning", "Please add items to place order", "warning");
            return;
        }

        var payload = {
            OrderId: orderId,
            OrderType: pickupType ? 1 : 2,
            TotalAmount: total,
            LineAmount: subtotal,
            ServiceCharge: charge,
            StewardId: steward ? steward.id : null,
            TableId: table ? table.id : null,
            PickUpType: pickupType,
            ShiftId: shift ? shift.shiftId : null,
            IsOffer: isOffer,
            OrderLineDetails: items.map((row) => ({
                MenuId: row.id,
                PortionId: row.portionId,
                UnitPrice: row.price,
                Quantity: row.qty,
                KitchenId: row.kitchenId
            })),
        };

        try {
            const response = await fetch(
                `${BASE_URL}/RestaurantPOS/CreateOrUpdateRestaurantOrder`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.ok) {
                const jsonResponse = await response.json();
                if (jsonResponse.result.result !== "") {
                    Swal.fire({
                        title: "Success",
                        text: jsonResponse.result.message,
                        icon: "success",
                        showConfirmButton: true,
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: "Print KOT/BOT",
                        denyButtonText: "Print Guest Check",
                        cancelButtonText: "Close",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        focusCancel: true,
                        preConfirm: () => {
                            // printKotBot()
                            return false
                        },
                        preDeny: () => {
                            // printGuestCheck()
                            return false
                        }
                    })



                    onCleanBill();
                    // audioRef.current.play();
                } else {
                    Swal.fire("Error", jsonResponse.result.message, "error");
                }
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <Box>
            <Grid container mb={2} pb={2} sx={{ borderBottom: "1px dashed #ccc" }}>
                <Grid item xs={6} display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Order Bill</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Tooltip title="Reset" placement="top">
                        <IconButton onClick={onCleanBill} aria-label="edit" size="small">
                            <ReplayIcon sx={{ color: '#fe6564' }} fontSize="medium" />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>

            <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
                {items.map(item => (
                    <Box key={item.id} sx={{ display: "flex", alignItems: "center", mb: 1, background: '#f1f6fa', p: 1, borderRadius: '5px', pb: 1 }}>
                        <img src={item.image} alt={item.name} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 10 }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Rs.{formatCurrency(item.price)}</Typography>
                            <Typography
                                color="error"
                                sx={{ cursor: "pointer" }}
                                onClick={() => handleRemove(item.id)}
                            >
                                Remove
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <IconButton sx={{ width: 25, height: 25 }} size="small" onClick={() => handleQtyChange(item.id, -1)}>-</IconButton>
                            <Typography mx={1}>{item.qty}</Typography>
                            <IconButton sx={{ width: 25, height: 25 }} size="small" onClick={() => handleQtyChange(item.id, 1)}>+</IconButton>
                        </Box>
                    </Box>
                ))}
            </Box>
            <Box mb={2} sx={{ borderBottom: "1px dashed #ccc" }}>
                <Grid container justifyContent="space-between">
                    <Typography>Subtotal</Typography>
                    <Typography>Rs.{formatCurrency(subtotal)}</Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Typography>Service Charge (5%)</Typography>
                    <Typography>Rs.{formatCurrency(charge)}</Typography>
                </Grid>
                <Grid container justifyContent="space-between" mt={1}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">Rs.{formatCurrency(total)}</Typography>
                </Grid>
            </Box>
            <Box mb={2} sx={{ borderBottom: "1px dashed #ccc" }}>
                <Grid container justifyContent="space-between">
                    <Typography>Steward</Typography>
                    <Typography>
                        {steward ? `${steward.firstName} ${steward.lastName}` : "-"}
                    </Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                    <Typography>Table</Typography>
                    <Typography>
                        {table ? table.code : "-"}
                    </Typography>
                </Grid>
            </Box>
            <Button
                onClick={() => handleSubmit()}
                variant="contained"
                fullWidth
                sx={{
                    backgroundColor: '#fe6564',
                    '&:hover': { backgroundColor: '#fe6564' },
                }}
            >
                {orderId ? "Update Order" : "Place order"}
            </Button>
            <audio ref={audioRef} src="/images/restaurant/audio/bell.wav" />
        </Box>
    );
}
