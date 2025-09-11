import React from "react";
import Grid from "@mui/material/Grid";
import {
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import useApi from "@/components/utils/useApi";

const AddCustomColorItem = ({ rows, onChange, onDelete }) => {
    if (!rows.length) return null;
    // const {
    //     data: itemList,
    //     loading: itemLoading,
    //     error: itemError,
    // } = useApi("/CustomColorMachine/GetAllColorMachine");

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
    
        // if (field === "code" && itemList?.length) {
        //     const matchedItem = itemList.find((item) => item.code === value);
        //     if (matchedItem) {
        //         updatedRows[index].name = matchedItem.name || "";
        //         updatedRows[index].costPrice = matchedItem.costPrice || 0;
        //         updatedRows[index].value = matchedItem.value || 0;
        //         updatedRows[index].sellingPrice = matchedItem.sellingPrice || 0;
        //         updatedRows[index].totalAmount = (updatedRows[index].qty || 0) * (matchedItem.sellingPrice || 0);
        //         updatedRows[index].id = matchedItem.id || 0;
        //         updatedRows[index].warehouse = matchedItem.warehouseId || 0;
        //     } else {
        //         updatedRows[index].name = "";
        //         updatedRows[index].costPrice = 0;
        //         updatedRows[index].value = 0;
        //         updatedRows[index].sellingPrice = 0;
        //         updatedRows[index].totalAmount = 0;
        //     }
        // }
    
        const qty = parseFloat(updatedRows[index].value || 0);
        const price = parseFloat(updatedRows[index].sellingPrice || 0);
        updatedRows[index].totalAmount = price; 
    
        onChange(updatedRows);
    };
    

    return (
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, md: 1 }}>
            <Grid item xs={12}>
                <Typography variant="h6" my={2}>
                    Custom Color Items
                </Typography>
                <TableContainer component={Paper}>
                    <Table size="small" className="dark-table">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Machine</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Grams</TableCell>
                                <TableCell>Cost Price</TableCell>
                                <TableCell>Selling Price</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Select size="small" onChange={(e) => handleChange(index, "machine", e.target.value)} value={row.machine}>
                                            <MenuItem value={1}>Dupond</MenuItem>
                                            <MenuItem value={2}>Debeer</MenuItem>
                                            <MenuItem value={3}>Nippon</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            value={row.code}
                                            onChange={(e) => handleChange(index, "code", e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            value={row.value}
                                            onChange={(e) => handleChange(index, "value", e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            value={row.costPrice}
                                            onChange={(e) => handleChange(index, "costPrice", e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            value={row.sellingPrice}
                                            onChange={(e) => handleChange(index, "sellingPrice", e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>{row.totalAmount}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => onDelete(index)}
                                        >
                                            <DeleteIcon color="error" fontSize="inherit" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default AddCustomColorItem;
