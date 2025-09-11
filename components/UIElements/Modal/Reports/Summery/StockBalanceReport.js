import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import "react-toastify/dist/ReactToastify.css";
import { Visibility } from "@mui/icons-material";
import GetReportSettingValueByName from "@/components/utils/GetReportSettingValueByName";
import { Report } from "Base/report";
import SearchItemByName from "@/components/utils/SearchItemByName";
import BASE_URL from "Base/api";
import { Catelogue } from "Base/catelogue";
import useApi from "@/components/utils/useApi";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: 400, xs: 350 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

export default function StockBalanceReport({ docName,reportName }) {
  const warehouseId = localStorage.getItem("warehouse");
  const name = localStorage.getItem("name");
  const [open, setOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(true);
  const [selectedItem, setSelectedItem] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(0);
  const [items, setItems] = useState([]);
  const [productId, setProductId] = useState();
  const { data: StockBalanceReport } = GetReportSettingValueByName(reportName);
  const searchRef = useRef(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedItem({});
    setIsSelected(true);
    setSupplierId(0)
  };

  const handleCheckAll = (bool) => {
    setSelectedItem({});
    if (bool) {
      setIsSelected(bool);
    }

  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsSelected(false);
  }

  const {
    data: supplierList,
    loading: Loading,
    error: Error,
  } = useApi("/Supplier/GetAllSupplier");

  const handleGetSupplierItems = async (id) => {
    setSelectedItem({});
    try {
      const token = localStorage.getItem("token");
      const query = `${BASE_URL}/Items/GetAllItemsBySupplierId?supplierId=${id}`;
      const response = await fetch(query, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setItems(data.result);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    if (supplierList) {
      setSuppliers(supplierList);
    }
  }, [supplierList]);

  return (
    <>
      <Tooltip title="View" placement="top">
        <IconButton onClick={handleOpen} aria-label="View" size="small">
          <Visibility color="primary" fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="bg-black">
          <Box>
            <Grid container spacing={1}>
              <Grid item xs={12} my={2} display="flex" justifyContent="space-between">
                <Typography variant="h5" fontWeight="bold">
                  Stock Balance Report
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography as="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }}>
                  Select Supplier
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={supplierId}
                  onChange={(e) => {
                    setSupplierId(e.target.value);
                    handleGetSupplierItems(e.target.value);
                  }}
                >
                  <MenuItem value={0}>All</MenuItem>
                  {suppliers.length === 0 ? <MenuItem value="">No Suppliers Available</MenuItem>
                    : (suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                    )))}
                </Select>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                <Typography as="h5" sx={{ fontWeight: "500", fontSize: "14px", mb: "12px" }}>
                  Select Product
                </Typography>
                <FormControlLabel control={<Checkbox checked={isSelected} onChange={(e) => handleCheckAll(e.target.checked)} />} label="All" />
              </Grid>
              <Grid item xs={12}>
                {supplierId != 0 ?
                  <Select
                    fullWidth
                    size="small"
                    value={productId}
                    onChange={(e) => {
                      setProductId(e.target.value);
                      const selectedItem = items.find((item) => item.id === e.target.value);
                      handleSelectItem(selectedItem);
                    }}
                  >
                    {items.length === 0 ? <MenuItem value="">No Items Available</MenuItem>
                      : (items.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                      )))}
                  </Select> : <SearchItemByName
                    ref={searchRef}
                    label="Search"
                    placeholder="Search Items by name"
                    fetchUrl={supplierId != 0 ? `${BASE_URL}/Items/GetAllItemsBySupplierIdAndName?supplierId=${supplierId}` : `${BASE_URL}/Items/GetAllItemsWithoutZeroQty`}
                    onSelect={(item) => {
                      handleSelectItem(item);
                    }}
                  />}
              </Grid>
              <Grid item xs={12}>
                <Typography>Selected Item :</Typography>
                {Object.keys(selectedItem).length > 0 ? (
                  <>
                    <Typography variant="h6">
                      {selectedItem.name} {selectedItem.uomName} {selectedItem.categoryName} {selectedItem.subCategoryName}
                    </Typography>
                    {selectedItem.supplierName && (
                      <Typography>Supplier: {selectedItem.supplierName}</Typography>
                    )}
                  </>
                ) : <Typography variant="h6">All Items</Typography>}

              </Grid>
              <Grid item xs={12} display="flex" justifyContent="space-between" mt={2}>
                <Button onClick={handleClose} variant="contained" color="error">
                  Close
                </Button>
                <a href={`${Report}/${docName}?InitialCatalog=${Catelogue}&reportName=${StockBalanceReport}&supplierId=${supplierId != 0 ? supplierId :selectedItem.supplier || 0}&categoryId=${selectedItem.categoryId || 0}&subCategoryid=${selectedItem.subCategoryId || 0}&productId=${selectedItem.id || 0}&warehouseId=${warehouseId}&currentUser=${name}`} target="_blank">
                    <Button variant="contained" aria-label="print" size="small">
                      Submit
                    </Button>
                  </a>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
