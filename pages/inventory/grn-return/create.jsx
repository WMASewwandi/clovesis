import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Autocomplete,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import { useRouter } from "next/router";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";
import useApi from "@/components/utils/useApi";
import { Textarea } from "@mantine/core";

const FormField = ({ label, children }) => (
  <Grid
    item
    xs={12}
    lg={6}
    display="flex"
    justifyContent="space-between"
    mt={1}
  >
    <Typography
      component="label"
      sx={{ fontWeight: "500", p: 1, fontSize: "14px", width: "35%" }}
    >
      {label}
    </Typography>
    {children}
  </Grid>
);

const GrnReturn = () => {
  const today = new Date();
  const [grossTotal, setGrossTotal] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [grnProducts, setGrnProducts] = useState([]);
  const [selectedGrnProduct, setSelectedGrnProduct] = useState(null);
  const [grnDate, setGrnDate] = useState(formatDate(today));
  const [remark, setRemark] = useState("");
  const [isCredit, setIsCredit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [editRows, setEditRows] = useState([]);
  const router = useRouter();

  const {
    data: supplierList,
    loading: supplierListLoading,
    error: supplierListError,
  } = useApi("/Supplier/GetAllSupplier");

  useEffect(() => {
    if (supplierList) {
      setSuppliers(supplierList);
    }

    const gross = selectedRows.reduce(
      (gross, row) => gross + (Number(row.returnAmount) || 0),
      0
    );

    setGrossTotal(gross);
  }, [supplierList]);

  const handleSubmit = async () => {
    if (supplier == null) {
      toast.warning("Please Select Supplier");
      return;
    }

    if (selectedGrnProduct == null) {
      toast.warning("Please Select GRN");
      return;
    }

    if (editRows.length === 0) {
      toast.warning("edit");
      return;
    }

    const postData = {
      DocumentNo: "001",
      SupplierId: supplier.id,
      GRNHeaderId: selectedGrnProduct.id,
      GRNDocumentNo: selectedGrnProduct.documentNo,
      SupplierCode: selectedGrnProduct.supplierCode,
      SupplierName: selectedGrnProduct.supplierName,
      ReferanceNo: selectedGrnProduct.referanceNo,
      GRNDate: grnDate,
      Remark: remark,
      WarehouseId: selectedGrnProduct.warehouseId,
      WarehouseCode: selectedGrnProduct.warehouseCode,
      WarehouseName: selectedGrnProduct.warehouseName,
      InventoryPeriodId: selectedGrnProduct.inventoryPeriodId,
      TotalAmount: grossTotal,
      Discount: selectedGrnProduct.discount,
      IsCredit: selectedGrnProduct.isCredit,
      SalesPerson: selectedGrnProduct.salesPerson,
      GoodReturnNoteLineDetails: editRows.map((row) => ({
        GoodReturnHeaderID: 1,
        GoodReceivedLineId: row.id,
        DocumentNo: "001",
        SequenceNumber: row.sequenceNumber,
        WarehouseId: row.warehouseId,
        WarehouseCode: row.warehouseCode,
        WarehouseName: row.warehouseName,
        ProductId: row.productId,
        ProductCode: row.productCode,
        ProductName: row.productName,
        Batch: row.batch,
        ExpDate: row.expDate,
        UnitPrice: row.unitPrice,
        CostPrice: row.costPrice,
        SellingPrice: row.sellingPrice,
        MaximumSellingPrice: row.maximumSellingPrice,
        ReturnQty: row.returnedQty,
        GRNQty: row.qty,
        DiscountRate: row.discountRate,
        DiscountAmount: row.discountAmount,
        Status: row.status,
        Remark: row.remark,
        LineTotal: row.returnAmount,
        AverageCostPrice: row.averageCostPrice,
        AdditionalCost: row.additionalCost,
        IsNonInventoryItem: row.isNonInventoryItem,
      })),
    };

    try {
      const response = await fetch(
        `${BASE_URL}/GoodReceivedNote/CreateGoodReturnNote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch usere");
      }

      const data = await response.json();

      if (data.statusCode === 200) {
        toast.success(data.result.message);
        setEditRows([]);
        setSelectedRows([]);
        setSupplier(null);
        setSelectedGrnProduct(null);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSelectRow = (index) => {
    const updatedRows = [...selectedRows];
    updatedRows[index].isSelected = !updatedRows[index].isSelected;
    if (!updatedRows[index].isSelected) {
      updatedRows[index].returnQuantity = 0;
      updatedRows[index].returnAmount = 0;

      setEditRows((prev) => prev.filter((r) => r.id !== updatedRows[index].id));
    }
    setSelectedRows(updatedRows);
  };

  const handleQuantityChange = (index, value) => {
    const rows = [...selectedRows];
    const selectedRow = rows[index];
    selectedRow.returnedQty = parseInt(value);
    const returnTotal = parseFloat(selectedRow.unitPrice) * parseInt(value);
    selectedRow.returnAmount = returnTotal;
    setSelectedRows(rows);

    const gross = rows.reduce(
      (gross, row) => gross + (Number(row.returnAmount) || 0),
      0
    );
    setGrossTotal(gross);

    //set edited rows
    setEditRows((prev) => {
      const updated = [...prev];
      const exist = updated.findIndex((r) => r.id == selectedRow.id);
      if (exist !== -1) {
        updated[exist] = selectedRow;
      } else {
        updated.push(selectedRow);
      }
      return updated;
    });
  };

  const navigateToBack = () => {
    router.push({
      pathname: "/inventory/grn-return",
    });
  };

  const handleSelectSupplier = async (supplierId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/GoodReceivedNote/GetAllGRNBySupplierId?supplierId=${supplierId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch usere");
      }

      const data = await response.json();
      setGrnProducts(data.result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Goods Return Note Create</h1>
        <ul>
          <li>
            <Link href="/inventory/grn-return">GRN Return</Link>
          </li>
          <li>Create</li>
        </ul>
      </div>

      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 2 }}
      >
        <Grid item xs={12} sx={{ background: "#fff" }}>
          <Grid container p={1}>
            <Grid item gap={2} xs={12} display="flex" justifyContent="end">
              <Button variant="outlined" onClick={() => navigateToBack()}>
                <Typography sx={{ fontWeight: "bold" }}>Go Back</Typography>
              </Button>
            </Grid>

            <FormField label="Supplier">
              <Autocomplete
                sx={{ width: "60%" }}
                options={suppliers}
                getOptionLabel={(option) => option.name || ""}
                value={supplier}
                disableClearable
                onChange={(event, newValue) => {
                  handleSelectSupplier(newValue.id);
                  setSupplier(newValue);
                  setSelectedRows([]);
                  setSelectedGrnProduct(null);
                  setGrnProducts([]);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    fullWidth
                    placeholder="Search Supplier"
                    error={!!supplierListError}
                    helperText={
                      supplierListError ? "Failed to load suppliers" : ""
                    }
                  />
                )}
              />
            </FormField>

            <FormField label="Select GRN">
              <Autocomplete
                sx={{ width: "60%" }}
                options={grnProducts}
                getOptionLabel={(option) =>
                  option.documentNo || option.name || ""
                }
                value={selectedGrnProduct}
                onChange={(event, newValue) => {
                  const list = newValue.goodReceivedNoteLineDetails;
                  setSelectedGrnProduct(newValue);
                  setSelectedRows(list);
                }}
                disabled={!supplier}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    fullWidth
                    placeholder="Search GRN by document no"
                  />
                )}
              />
            </FormField>

            <FormField label="GRN Return Date">
              <TextField
                sx={{ width: "60%" }}
                size="small"
                type="date"
                fullWidth
                value={grnDate}
                onChange={(e) => setGrnDate(e.target.value)}
              />
            </FormField>

            <FormField label="Remark">
              <Textarea
                sx={{ width: "60%" }}
                size="small"
                fullWidth
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </FormField>

            {/* <Grid item xs={12} mt={3} mb={1}>
              <SearchDropdown
                label="Search Products"
                placeholder="Search Items by name"
                fetchUrl={`${BASE_URL}/Items/GetAllItemsBySupplierIdAndName`}
                queryParams={{ supplierId: supplier?.id }}
                onSelect={(item) => handleAddRow(item)}
                disabled={!supplier}
              />
            </Grid> */}

            <Grid item xs={12} mt={3}>
              <TableContainer component={Paper}>
                <Table
                  size="small"
                  aria-label="simple table"
                  className="dark-table"
                >
                  <TableHead>
                    <TableRow sx={{ background: "#757fef" }}>
                      <TableCell sx={{ color: "#fff" }}></TableCell>
                      <TableCell sx={{ color: "#fff" }}>#</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Product Name</TableCell>
                      <TableCell sx={{ color: "#fff" }}>GRN Quantity</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Return Quantity
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>Unit Price</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Total Received Amount
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Return Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography color="error">
                            No items selected. Please add products to return.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ p: 1 }}>
                            <Checkbox
                              checked={row.isSelected}
                              onChange={() => handleSelectRow(index)}
                            />
                          </TableCell>
                          <TableCell sx={{ p: 1 }}>{index + 1}</TableCell>
                          <TableCell sx={{ p: 1 }}>{row.productName}</TableCell>
                          <TableCell sx={{ p: 1 }}>{row.qty}</TableCell>
                          <TableCell sx={{ p: 1 }}>
                            <TextField
                              size="small"
                              type="number"
                              value={row.returnedQty}
                              onChange={(e) =>
                                handleQuantityChange(index, e.target.value)
                              }
                              disabled={!row.isSelected}
                              fullWidth
                              inputProps={{ min: 0, max: row.qty }}
                            />
                          </TableCell>
                          <TableCell sx={{ p: 1 }}>
                            {formatCurrency(row.unitPrice)}
                          </TableCell>
                          <TableCell sx={{ p: 1 }}>
                            {formatCurrency(row.qty * row.unitPrice)}
                          </TableCell>
                          <TableCell sx={{ p: 1 }} align="right">
                            {formatCurrency(row.returnAmount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableRow>
                      <TableCell colSpan={7} align="right">
                        <Typography fontWeight="bold">Return Total</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ p: 1 }}>
                        {formatCurrency(grossTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} my={3}>
              <LoadingButton
                loading={isSubmitting}
                handleSubmit={handleSubmit}
                disabled={isDisable}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default GrnReturn;
