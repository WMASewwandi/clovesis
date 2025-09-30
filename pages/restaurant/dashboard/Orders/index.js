import { Grid, Switch, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import React, { useState, useEffect } from "react";
import usePaginatedFetch from "../usePaginatedFetch";
import PaginationUI from "../pagination";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import Swal from "sweetalert2";
import BASE_URL from "Base/api";

export default function Orders({ searchText, onOrderClick }) {
    const [isPickup, setIsPickup] = useState(false);
    const [orderType, setOrderType] = useState(2);

    const {
        data: orderList,
        totalCount,
        page,
        pageSize,
        setPage,
        setPageSize,
        setSearch,
        fetchData: fetchOrderList,
    } = usePaginatedFetch(`RestaurantPOS/GetAllOrdersByShiftAsync?type=${orderType}`);

    useEffect(() => {
        setPage(1);
        setSearch(searchText);
        fetchOrderList(1, searchText, pageSize);
    }, [orderType, searchText, pageSize]);

    const handleChange = () => {
        const newPickup = !isPickup;
        setIsPickup(newPickup);
        setOrderType(newPickup ? 1 : 2);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        fetchOrderList(value, searchText, pageSize);
    };

    const handlePageSizeChange = (event) => {
        const size = event.target.value;
        setPageSize(size);
        setPage(1);
        fetchOrderList(1, searchText, size);
    };

    const handleRowClick = (item) => {
        if (item.status != 4) {
            Swal.fire({
                title: "Choose Action",
                text: "What do you want to do with this order?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Pay Order",
                denyButtonText: "Update Order",
                showDenyButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Payment",
                        html: `
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px;">
            <div class="payment-tile" data-method="Cash">💵 Cash</div>
            <div class="payment-tile" data-method="Card">💳 Card</div>
            <div class="payment-tile" data-method="Bank">🏦 Bank</div>
          </div>
        `,
                        showCancelButton: true,
                        confirmButtonText: "Done",
                        cancelButtonText: "Close",
                        showConfirmButton: true,
                        showCloseButton: false,
                        preConfirm: () => {
                            return selectedPayment;
                        },
                        didOpen: () => {
                            window.selectedPayment = null;

                            document.querySelectorAll(".payment-tile").forEach(tile => {
                                tile.style.cssText = `
              border: 2px solid #ccc;
              padding: 15px 25px;
              border-radius: 10px;
              cursor: pointer;
              text-align: center;
              font-weight: bold;
            `;
                                tile.addEventListener("click", () => {
                                    document.querySelectorAll(".payment-tile").forEach(t => t.style.borderColor = "#ccc");
                                    tile.style.borderColor = "#3085d6";
                                    window.selectedPayment = tile.getAttribute("data-method");
                                });
                            });
                        }
                    }).then((res) => {
                        if (res.isConfirmed) {
                            if (!window.selectedPayment) {
                                Swal.fire("Warning", "Please select a payment method", "warning").then(() => {
                                    handleRowClick(item, onOrderClick, onPaymentDone);
                                });
                                return;
                            }
                            if (onPaymentDone) {
                                onPaymentDone(item, window.selectedPayment);
                            }
                        }
                    });

                } else if (result.isDenied) {
                    if (onOrderClick) {
                        onOrderClick(item);
                    }
                }
            });
        } else {
            Swal.fire({
                title: 'Print Bill?',
                text: 'Do you want to print the bill?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Print Bill',
                cancelButtonText: 'Close',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    // printBill();
                }
            });
        }
    };


    const onPaymentDone = async (item) => {
        try {
            const response = await fetch(`${BASE_URL}/RestaurantPOS/CreateOrderPayment?orderId=${item.orderId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            fetchOrderList();
            if (data.result.statusCode === 200) {
                Swal.fire("Success", data.result.message, "success");
            } else {
                Swal.fire("Error", data.result.message, "error");
            }

        } catch (error) {
            console.error(error);
        }
    };

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
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Orders</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography sx={{ color: isPickup ? '#fe6564' : 'gray', fontWeight: isPickup ? 'bold' : 'normal' }}>Pickup</Typography>
                    <Switch
                        checked={isPickup}
                        onChange={handleChange}
                        color="error"
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: 'white', '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' } },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#fe6564' },
                            '& .MuiSwitch-track': { borderRadius: 20, backgroundColor: '#ccc' }
                        }}
                    />
                    <Typography sx={{ color: !isPickup ? '#fe6564' : 'gray', fontWeight: !isPickup ? 'bold' : 'normal' }}>Dine In</Typography>
                </Box>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', flexDirection: 'column', height: '75vh' }}>
                <TableContainer
                    component={Paper}
                    sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Bill No</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Order Type</TableCell>
                                {!isPickup ? <>
                                    <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Steward</TableCell>
                                    <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Table</TableCell>
                                </> : <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Pick Up Type</TableCell>}
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Items</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Service Charge</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Total Amount</TableCell>
                                <TableCell sx={{ backgroundColor: '#fe6564', color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9}><Typography color="error">No Orders Available</Typography></TableCell>
                                </TableRow>
                            ) : (
                                orderList.map((item, index) => (
                                    <TableRow
                                        key={index}
                                        onClick={() => handleRowClick(item)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: 'rgba(254,101,100,0.1)' }
                                        }}
                                    >
                                        <TableCell>{item.orderNo}</TableCell>
                                        <TableCell>{item.orderTypeName}</TableCell>
                                        {!isPickup ? <>
                                            <TableCell>{item.stewardDetails ? item.stewardDetails.firstName : ""}</TableCell>
                                            <TableCell>{item.tableDetails ? item.tableDetails.code : ""}</TableCell>
                                        </> : <TableCell>{item.pickupTypeName}</TableCell>}
                                        <TableCell>
                                            {item.orderItems.map((x, idx) => <Box key={idx}>{x.name} x {x.qty} - Rs.{x.price * x.qty}</Box>)}
                                        </TableCell>
                                        <TableCell>{formatCurrency(item.serviceCharge)}</TableCell>
                                        <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                                        <TableCell>
                                            <span className={item.status === 1 ? "dangerBadge" : (item.status === 2 ? "primaryBadge" : "successBadge")}>{item.orderStatus}</span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 1 }}>
                    <PaginationUI totalCount={totalCount} pageSize={pageSize} page={page} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
                </Box>
            </Grid>
        </Grid>
    );
}
