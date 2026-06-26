import React, { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
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
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { v4 as uuidv4 } from "uuid";
import SearchDropdown from "@/components/utils/SearchDropdown";
import Link from "next/link";
import styles from "@/styles/PageTitle.module.css";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "Base/api";
import { useRouter } from "next/router";
import { formatCurrency, formatDate } from "@/components/utils/formatHelper";
import AddPOProducts from "@/components/UIElements/Modal/AddPOProducts";
import LoadingButton from "@/components/UIElements/Buttons/LoadingButton";
import IsAppSettingEnabled from "@/components/utils/IsAppSettingEnabled";
import PurchasingOrderType from "@/components/utils/enums/PurchasingOrderType";

const POEdit = () => {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isCredit, setIsCredit] = useState(false);
  const [grossTotal, setGrossTotal] = useState(null);
  const { id } = router.query;
  const [selectedRows, setSelectedRows] = useState([]);
  const [poTallyList, setPOTallyList] = useState([]);
  const [po, setPO] = useState();
  const [hasShipmentForPO, setHasShipmentForPO] = useState(false);
  const [isShipmentCheckLoading, setIsShipmentCheckLoading] = useState(true);
  const [isDisable, setIsDisable] = useState(false);
  const [isRefreshingLines, setIsRefreshingLines] = useState(false);

  const { data: IsEnableCreditGRN } =
    IsAppSettingEnabled("IsEnableCreditGRN");

  const { data: AllowCostLessThanSelling } = IsAppSettingEnabled(
    "AllowCostLessThanSelling"
  );

  const { data: IsProfitVisibleOnGRNAndPO } = IsAppSettingEnabled(
    "IsProfitVisibleOnGRNAndPO"
  );

  const calculateProfit = (sellingPrice, costPrice) => {
    const sp = parseFloat(sellingPrice);
    const cp = parseFloat(costPrice);
    if (Number.isNaN(sp) || Number.isNaN(cp)) return 0;
    return sp - cp;
  };

  const calculateProfitMargin = (sellingPrice, costPrice) => {
    const sp = parseFloat(sellingPrice);
    const cp = parseFloat(costPrice);
    if (Number.isNaN(sp) || Number.isNaN(cp) || sp <= 0) return 0;
    return ((sp - cp) / sp) * 100;
  };

  const fetchPOTally = async (purchaseOrderNo, { isShipmentCheck = false } = {}) => {
    try {
      const response = await fetch(
        `${BASE_URL}/GoodReceivedNote/GetAllPOTally`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PO");
      }

      const data = await response.json();
      const result = data.result || [];

      if (purchaseOrderNo) {
        setHasShipmentForPO(
          result.some((item) => item.purchaseOrderNo === purchaseOrderNo)
        );
      }

      const filteredResult = purchaseOrderNo
        ? result.filter((item) => item.purchaseOrderNo === purchaseOrderNo)
        : result;

      const summary = filteredResult.reduce((acc, item) => {
        const key = `${item.productId}-${item.purchaseOrderNo}`;

        if (!acc[key]) {
          acc[key] = {
            productId: item.productId,
            purchaseOrderNo: item.purchaseOrderNo,
            weightedUnitPriceTotal: 0,
            weightedAdditionalCostTotal: 0,
            totalFreightDutyDisplay: 0,
            totalAdditionalDisplay: 0,
            totalReceivedQty: 0,
          };
        }

        const receivedQty = Number(item.poReceivedQty) || 0;
        const shipmentUnitPrice = Number(item.shipmentUnitPrice) || 0;
        const shipmentAdditionalCost = Number(item.shipmentAdditionalCost) || 0;
        const shipmentFreightDutyCost = Number(item.shipmentFreightDutyCost) || 0;

        if (receivedQty > 0) {
          acc[key].weightedUnitPriceTotal += shipmentUnitPrice * receivedQty;
          acc[key].weightedAdditionalCostTotal +=
            (shipmentAdditionalCost + shipmentFreightDutyCost) * receivedQty;
          acc[key].totalReceivedQty += receivedQty;
        }

        acc[key].totalFreightDutyDisplay += shipmentFreightDutyCost;
        acc[key].totalAdditionalDisplay += shipmentAdditionalCost;

        return acc;
      }, {});
      const summaryArray = Object.values(summary).map((item) => ({
        ...item,
        averageUnitPrice:
          item.totalReceivedQty > 0
            ? item.weightedUnitPriceTotal / item.totalReceivedQty
            : 0,
        averageFreightDutyCost:
          item.totalReceivedQty > 0
            ? item.weightedAdditionalCostTotal / item.totalReceivedQty
            : 0,
        poReceivedQty: item.totalReceivedQty,
        totalFreightDutyCost: item.totalFreightDutyDisplay,
        totalAdditionalCost: item.totalAdditionalDisplay,
      }));
      setPOTallyList(summaryArray);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      if (isShipmentCheck) {
        setIsShipmentCheckLoading(false);
      }
    }
  };
  const fetchPO = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/GoodReceivedNote/GetPurchaseOrderById?id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch PO");
      }

      const data = await response.json();
      setPO(data.result);
      setIsCredit(data.result.isCredit);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const poType = po?.type ?? po?.purchasingOrderType;
  const isLocalPO = poType == 1;

  const getLineItemId = (row) => {
    const lineId = row.id ?? row.Id;
    return lineId > 0 ? lineId : 0;
  };

  const isPOComplete = po?.isPurchasingOrderComplete;

  /** Shipment locks only add row, delete row, and ordered qty editing. */
  const canModifyLineItems = !hasShipmentForPO && !isPOComplete;
  const showLineItemModifications =
    !isShipmentCheckLoading && canModifyLineItems;

  const mapPendingSubmitLine = (row, index) => ({
    Id: getLineItemId(row),
    GRNHeaderID: po.id,
    DocumentNo: po.purchaseOrderNo,
    PurchaseOrderNo: po.purchaseOrderNo,
    SequenceNumber: index + 1,
    WarehouseId: row.warehouseId ?? po.warehouseId,
    WarehouseCode: row.warehouseCode ?? po.warehouseCode,
    WarehouseName: row.warehouseName ?? po.warehouseName,
    ProductId: row.productId,
    ProductCode: row.productCode || "",
    ProductName: row.productName || "",
    Batch: row.batch || "",
    ExpDate: row.expDate || null,
    POQty: Number(row.poQty),
    Qty: Number(row.poQty),
    OrderedQty: 0,
    ReceivedQty: 0,
    Status: row.status || "Approval",
    Remark: row.remark || "",
  });

  const createEmptyLineItem = () => ({
    _clientKey: uuidv4(),
    id: 0,
    productId: null,
    productCode: "",
    productName: "",
    batch: "",
    expDate: "",
    poQty: "",
    poReceivedQty: 0,
    receivedQty: 0,
    avgUnitPrice: "0.00",
    avgFreighCost: "0.00",
    costPrice: "0.00",
    sellingPrice: "",
    maxSellingPrice: 0,
    free: 0,
    status: "Approval",
    remark: "",
    discountType: "value",
    discountInput: "",
    discountRate: 0,
    discountAmount: "0.00",
    lineGrossTot: "0.00",
    lineTot: "0.00",
    warehouseId: po?.warehouseId,
    warehouseCode: po?.warehouseCode,
    warehouseName: po?.warehouseName,
    purchaseOrderNo: po?.purchaseOrderNo,
  });

  const handleAddEmptyRow = () => {
    if (!canModifyLineItems) return;
    setSelectedRows((prev) => [...prev, createEmptyLineItem()]);
  };

  const handleDeleteRow = (index) => {
    if (!canModifyLineItems) return;
    setSelectedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index, item) => {
    const productId = item.id ?? item.Id;
    const productCode = item.code ?? item.Code ?? "";
    const productName = item.name ?? item.Name ?? "";

    setSelectedRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              productId,
              productCode,
              productName,
            }
          : row
      )
    );
  };

  const formatPOEditProductOption = (item, { uomInfo, catInfo, subCatInfo }) => {
    const code = item.code ?? item.Code ?? "";
    const name = item.name ?? item.Name ?? "";
    const uom = uomInfo[item.uom ?? item.UOM]?.name || "";
    const category = catInfo[item.categoryId]?.name || "-";
    const subCategory = subCatInfo[item.subCategoryId]?.name || "-";
    const codePrefix = code ? `${code} - ` : "";
    return `${codePrefix}${name} - ${uom} - ${category} - ${subCategory}`;
  };

  const getPOEditProductLabel = (item) => item.name ?? item.Name ?? "";

  /** Qty basis for line gross and discount. Import PO must use received qty, not ordered (poQty / line Qty). */
  const getLineQtyForDiscount = (row) => {
    if (!isLocalPO) {
      const received =
        parseFloat(row.poReceivedQty) || parseFloat(row.receivedQty) || 0;
      return received;
    }
    return parseFloat(row.poReceivedQty) || 0;
  };

  const computeLineFinancials = (row) => {
    const costPrice = parseFloat(row.costPrice) || 0;
    const qty = getLineQtyForDiscount(row);
    const gross = costPrice * qty;

    const discountInput = parseFloat(row.discountInput) || 0;
    const isPercentage = row.discountType === "percentage";

    let discountAmount = isPercentage
      ? (gross * discountInput) / 100
      : discountInput;

    if (discountAmount < 0) discountAmount = 0;
    if (discountAmount > gross) discountAmount = gross;

    return {
      discountRate: isPercentage ? discountInput : 0,
      discountAmount: discountAmount.toFixed(2),
      lineGrossTot: gross.toFixed(2),
      lineTot: (gross - discountAmount).toFixed(2),
    };
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = selectedRows.map((row, i) => {
      if (i !== index) return row;
      const updated = { ...row, [field]: value };

      if (isLocalPO && ["avgUnitPrice", "avgFreighCost", "poReceivedQty"].includes(field)) {
        const unitPrice = parseFloat(updated.avgUnitPrice) || 0;
        const freightCost = parseFloat(updated.avgFreighCost) || 0;
        updated.costPrice = (unitPrice + freightCost).toFixed(2);
      }

      if (field === "poQty") {
        updated.qty = value;
      }

      if (
        [
          "avgUnitPrice",
          "avgFreighCost",
          "poReceivedQty",
          "poQty",
          "discountInput",
          "discountType",
        ].includes(field)
      ) {
        Object.assign(updated, computeLineFinancials(updated));
      }

      return updated;
    });
    setSelectedRows(updatedRows);
  };

  useEffect(() => {
    if (po) {
      const mapDbLineRow = (row) => {
        const dbDiscountRate = parseFloat(row.discountRate) || 0;
        const dbDiscountAmount = parseFloat(row.discountAmount) || 0;
        const discountType = dbDiscountRate > 0 ? "percentage" : "value";
        const discountInput = dbDiscountRate > 0 ? dbDiscountRate : dbDiscountAmount;

        if ((po.type ?? po.purchasingOrderType) == 1) {
          const unitPrice = parseFloat(row.unitPrice) || 0;
          const additionalCost = parseFloat(row.additionalCost) || 0;
          const costPrice = unitPrice + additionalCost;
          const receivedQty = parseFloat(row.qty) || 0;

          const baseRow = {
            ...row,
            poQty: row.poQty ?? row.qty ?? 0,
            avgUnitPrice: unitPrice.toFixed(2),
            avgFreighCost: additionalCost.toFixed(2),
            costPrice: costPrice.toFixed(2),
            poReceivedQty: receivedQty,
            discountType,
            discountInput,
          };
          return { ...baseRow, ...computeLineFinancials(baseRow) };
        }

        const matchedItem = poTallyList.find(
          (tally) =>
            tally.productId === row.productId &&
            tally.purchaseOrderNo === row.purchaseOrderNo
        );

        const avgUnitPrice = matchedItem ? matchedItem.averageUnitPrice : 0;
        const rawFreightCost = matchedItem?.averageFreightDutyCost || 0;
        const avgFreighCost = !isFinite(rawFreightCost) ? 0 : rawFreightCost;

        const costPrice = avgUnitPrice + avgFreighCost;
        const poReceivedQty = matchedItem
          ? matchedItem.poReceivedQty
          : parseFloat(row.receivedQty) || 0;

        const baseRow = {
          ...row,
          poQty: row.poQty ?? row.qty ?? 0,
          avgUnitPrice: avgUnitPrice.toFixed(2),
          avgFreighCost: avgFreighCost.toFixed(2),
          costPrice: costPrice.toFixed(2),
          poReceivedQty,
          discountType,
          discountInput,
        };
        return { ...baseRow, ...computeLineFinancials(baseRow) };
      };

      const dbRows = (po.goodReceivedNoteLineDetails || [])
        .filter((row) => !row.isDeleted)
        .map(mapDbLineRow);

      setSelectedRows((prev) => {
        const unsavedRows = prev.filter(
          (row) => row._clientKey && getLineItemId(row) === 0
        );
        return [...dbRows, ...unsavedRows];
      });
    }
  }, [po, poTallyList]);

  useEffect(() => {
    fetchPO();
  }, []);

  useEffect(() => {
    if (po?.purchaseOrderNo) {
      fetchPOTally(po.purchaseOrderNo, { isShipmentCheck: true });
    } else if (po) {
      setIsShipmentCheckLoading(false);
    }
  }, [po]);

  const navigateToBack = () => {
    router.push({
      pathname: "/inventory/purchase-order",
    });
  };

  const handlePendingSubmit = async () => {
    if (selectedRows.length === 0) {
      toast.info("At least one item must be added to the table.");
      return;
    }

    const missingProduct = selectedRows.find((row) => !row.productId);
    if (missingProduct) {
      toast.info("Please select a product for all line items.");
      return;
    }

    const invalidOrderedQty = selectedRows.find(
      (row) => !row.poQty || parseFloat(row.poQty) <= 0
    );
    if (invalidOrderedQty) {
      toast.info("Ordered Quantity must be greater than 0.");
      return;
    }

    const totalOrderedQty = selectedRows.reduce(
      (total, row) => total + (Number(row.poQty) || 0),
      0
    );

    const data = {
      Id: po.id,
      PurchaseOrderNo: po.purchaseOrderNo,
      SupplierId: po.supplierId,
      SupplierCode: po.supplierCode || "0",
      SupplierName: po.supplierName,
      ReferanceNo: po.referanceNo,
      GRNDate: po.grnDate ?? po.poDate,
      Remark: po.remark,
      WarehouseId: po.warehouseId,
      WarehouseCode: po.warehouseCode,
      WarehouseName: po.warehouseName,
      InventoryPeriodId: po.inventoryPeriodId,
      TotalAmount: 0,
      TotalQty: totalOrderedQty,
      IsCredit: isCredit,
      IsPurchasingOrderComplete: false,
      PurchasingOrderType: po.type ?? po.purchasingOrderType,
      GoodReceivedNoteLineDetails: selectedRows.map(mapPendingSubmitLine),
    };

    try {
      setIsSubmit(true);
      const response = await fetch(
        `${BASE_URL}/GoodReceivedNote/UpdatePurchaseOrder`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const jsonResponse = await response.json();
      const innerResult = jsonResponse.result;
      const isSuccess =
        response.ok &&
        (innerResult?.statusCode === 200 ||
          innerResult?.statusCode === "SUCCESS");

      if (isSuccess) {
        toast.success(
          innerResult?.message || "Purchase Order updated successfully."
        );

        const purchaseOrderNo = po?.purchaseOrderNo;
        const poId = po?.id ?? id;

        setIsRefreshingLines(true);
        try {
          const refreshResponse = await fetch(
            `${BASE_URL}/GoodReceivedNote/GetPurchaseOrderById?id=${poId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!refreshResponse.ok) {
            throw new Error("Failed to refresh Purchase Order");
          }

          const refreshData = await refreshResponse.json();
          const freshPo = refreshData.result;
          const freshIsLocal =
            (freshPo.type ?? freshPo.purchasingOrderType) == 1;

          let freshTallyList = poTallyList;
          let freshHasShipment = hasShipmentForPO;

          if (!freshIsLocal && purchaseOrderNo) {
            const tallyResponse = await fetch(
              `${BASE_URL}/GoodReceivedNote/GetAllPOTally`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (tallyResponse.ok) {
              const tallyData = await tallyResponse.json();
              const tallyResult = tallyData.result || [];
              freshHasShipment = tallyResult.some(
                (item) => item.purchaseOrderNo === purchaseOrderNo
              );

              const filteredResult = tallyResult.filter(
                (item) => item.purchaseOrderNo === purchaseOrderNo
              );

              const summary = filteredResult.reduce((acc, item) => {
                const key = `${item.productId}-${item.purchaseOrderNo}`;

                if (!acc[key]) {
                  acc[key] = {
                    productId: item.productId,
                    purchaseOrderNo: item.purchaseOrderNo,
                    weightedUnitPriceTotal: 0,
                    weightedAdditionalCostTotal: 0,
                    totalFreightDutyDisplay: 0,
                    totalAdditionalDisplay: 0,
                    totalReceivedQty: 0,
                  };
                }

                const receivedQty = Number(item.poReceivedQty) || 0;
                const shipmentUnitPrice = Number(item.shipmentUnitPrice) || 0;
                const shipmentAdditionalCost =
                  Number(item.shipmentAdditionalCost) || 0;
                const shipmentFreightDutyCost =
                  Number(item.shipmentFreightDutyCost) || 0;

                if (receivedQty > 0) {
                  acc[key].weightedUnitPriceTotal +=
                    shipmentUnitPrice * receivedQty;
                  acc[key].weightedAdditionalCostTotal +=
                    (shipmentAdditionalCost + shipmentFreightDutyCost) *
                    receivedQty;
                  acc[key].totalReceivedQty += receivedQty;
                }

                acc[key].totalFreightDutyDisplay += shipmentFreightDutyCost;
                acc[key].totalAdditionalDisplay += shipmentAdditionalCost;

                return acc;
              }, {});

              freshTallyList = Object.values(summary).map((item) => ({
                ...item,
                averageUnitPrice:
                  item.totalReceivedQty > 0
                    ? item.weightedUnitPriceTotal / item.totalReceivedQty
                    : 0,
                averageFreightDutyCost:
                  item.totalReceivedQty > 0
                    ? item.weightedAdditionalCostTotal / item.totalReceivedQty
                    : 0,
                poReceivedQty: item.totalReceivedQty,
                totalFreightDutyCost: item.totalFreightDutyDisplay,
                totalAdditionalCost: item.totalAdditionalDisplay,
              }));
            }
          }

          const mappedRows = (freshPo.goodReceivedNoteLineDetails || [])
            .filter((row) => !row.isDeleted)
            .map((row) => {
              const dbDiscountRate = parseFloat(row.discountRate) || 0;
              const dbDiscountAmount = parseFloat(row.discountAmount) || 0;
              const discountType = dbDiscountRate > 0 ? "percentage" : "value";
              const discountInput =
                dbDiscountRate > 0 ? dbDiscountRate : dbDiscountAmount;

              if (freshIsLocal) {
                const unitPrice = parseFloat(row.unitPrice) || 0;
                const additionalCost = parseFloat(row.additionalCost) || 0;
                const costPrice = unitPrice + additionalCost;
                const receivedQty = parseFloat(row.qty) || 0;

                const baseRow = {
                  ...row,
                  poQty: row.poQty ?? row.qty ?? 0,
                  avgUnitPrice: unitPrice.toFixed(2),
                  avgFreighCost: additionalCost.toFixed(2),
                  costPrice: costPrice.toFixed(2),
                  poReceivedQty: receivedQty,
                  discountType,
                  discountInput,
                };
                return { ...baseRow, ...computeLineFinancials(baseRow) };
              }

              const matchedItem = freshTallyList.find(
                (tally) =>
                  tally.productId === row.productId &&
                  tally.purchaseOrderNo === row.purchaseOrderNo
              );

              const avgUnitPrice = matchedItem ? matchedItem.averageUnitPrice : 0;
              const rawFreightCost = matchedItem?.averageFreightDutyCost || 0;
              const avgFreighCost = !isFinite(rawFreightCost) ? 0 : rawFreightCost;
              const costPrice = avgUnitPrice + avgFreighCost;
              const poReceivedQty = matchedItem
                ? matchedItem.poReceivedQty
                : parseFloat(row.receivedQty) || 0;

              const baseRow = {
                ...row,
                poQty: row.poQty ?? row.qty ?? 0,
                avgUnitPrice: avgUnitPrice.toFixed(2),
                avgFreighCost: avgFreighCost.toFixed(2),
                costPrice: costPrice.toFixed(2),
                poReceivedQty,
                discountType,
                discountInput,
              };
              return { ...baseRow, ...computeLineFinancials(baseRow) };
            });

          setHasShipmentForPO(freshHasShipment);
          setPOTallyList(freshTallyList);
          setPO(freshPo);
          setIsCredit(freshPo.isCredit);
          setSelectedRows(mappedRows);
        } catch (refreshError) {
          console.error("Error refreshing Purchase Order:", refreshError);
        } finally {
          setIsRefreshingLines(false);
        }
      } else {
        toast.error(
          innerResult?.message ||
            jsonResponse.message ||
            "Failed to update Purchase Order."
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleSubmit = async () => {
    if (!isLocalPO && showLineItemModifications) {
      await handlePendingSubmit();
      return;
    }

    const totalQty = selectedRows.reduce(
      (total, row) => total + (Number(row.poReceivedQty) || 0),
      0
    );

    const invalidQty = selectedRows.find((row) => row.poReceivedQty <= 0);
    if (invalidQty) {
      toast.info("Received Quantity Cannot be 0.");
      return;
    }

    if (isLocalPO) {
      const missingUnitPrice = selectedRows.find(
        (row) => !row.avgUnitPrice || parseFloat(row.avgUnitPrice) <= 0
      );
      if (missingUnitPrice) {
        toast.info("Unit Price is required and must be greater than 0.");
        return;
      }
    }

    const missingSellingPrice = selectedRows.find(
      (row) => !row.sellingPrice || row.sellingPrice === "" || row.sellingPrice === null || row.sellingPrice === undefined
    );
    if (missingSellingPrice) {
      toast.info("Selling Price is required.");
      return;
    }

    const invalidRow = selectedRows.find(
      (row) =>
        parseFloat(row.sellingPrice) <= 0 ||
        (!AllowCostLessThanSelling &&
          parseFloat(row.sellingPrice) <= parseFloat(row.costPrice))
    );

    if (invalidRow) {
      toast.info("Please Enter Selling Price greater than Cost Price.");
      return;
    }

    const invalidDiscount = selectedRows.find((row) => {
      const discountInput = parseFloat(row.discountInput) || 0;
      if (discountInput < 0) return true;
      if (row.discountType === "percentage" && discountInput > 100) return true;
      const gross =
        (parseFloat(row.costPrice) || 0) * getLineQtyForDiscount(row);
      const discountAmount =
        row.discountType === "percentage"
          ? (gross * discountInput) / 100
          : discountInput;
      return discountAmount > gross;
    });

    if (invalidDiscount) {
      toast.info("Discount cannot exceed the line total (or 100%).");
      return;
    }

    const data = {
      PurchaseOrderNo: po.purchaseOrderNo,
      SupplierId: po.supplierId,
      SupplierCode: "0",
      SupplierName: po.supplierName,
      ReferanceNo: po.referanceNo,
      GRNDate: po.grnDate ?? po.poDate,
      Remark: po.remark,
      WarehouseId: po.warehouseId,
      WarehouseCode: po.warehouseCode,
      WarehouseName: po.warehouseName,
      InventoryPeriodId: po.inventoryPeriodId,
      TotalAmount: grossTotal,
      TotalQty: totalQty,
      IsCredit: isCredit,
      PurchasingOrderType: po.type ?? po.purchasingOrderType,
      GoodReceivedNoteLineDetails: selectedRows.map((row, index) => ({
        Id: getLineItemId(row),
        GRNHeaderID: row.grnHeaderID ?? po.id,
        DocumentNo: row.purchaseOrderNo,
        PurchaseOrderNo: row.purchaseOrderNo,
        SequenceNumber: index + 1,
        WarehouseId: row.warehouseId,
        WarehouseCode: row.warehouseCode,
        WarehouseName: row.warehouseName,
        ProductId: row.productId,
        ProductCode: row.productCode,
        ProductName: row.productName,
        Batch: row.batch,
        ExpDate: row.expDate,
        UnitPrice: row.avgUnitPrice,
        AdditionalCost: row.avgFreighCost,
        CostPrice: row.costPrice,
        SellingPrice: row.sellingPrice,
        MaximumSellingPrice: row.maxSellingPrice,
        Profit: calculateProfit(row.sellingPrice, row.costPrice),
        ProfitMargin: calculateProfitMargin(row.sellingPrice, row.costPrice),
        Qty: row.poReceivedQty,
        Free: row.free,
        DiscountRate: row.discountRate,
        DiscountAmount: row.discountAmount,
        Status: row.status,
        Remark: row.remark,
        LineTotal: row.lineTot,
        AverageCostPrice: 0.0,
      })),
    };
    try {
      setIsSubmit(true);
      const response = await fetch(
        `${BASE_URL}/GoodReceivedNote/UpdatePurchaseOrder`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            IsPurchasingOrderComplete: true,
          }),
        }
      );

      if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.result.result != "") {
          setIsDisable(true);
          toast.success(jsonResponse.result.message);
          setTimeout(() => {
            window.location.href = "/inventory/purchase-order";
          }, 1500);
        } else {
          toast.error(jsonResponse.result.message);
        }
      } else {
        toast.error("Please fill all required fields");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  useEffect(() => {
    const gross = selectedRows.reduce(
      (gross, row) => gross + (Number(row.lineTot) || 0),
      0
    );
    setGrossTotal(gross);
  }, [selectedRows]);

  const totalLineDiscount = useMemo(
    () =>
      selectedRows.reduce(
        (sum, row) => sum + (parseFloat(row.discountAmount) || 0),
        0
      ),
    [selectedRows]
  );

  const totalTableColumns = useMemo(() => {
    let count = isLocalPO ? 15 : 16;
    if (showLineItemModifications) count += 1;
    if (IsProfitVisibleOnGRNAndPO) count += 2;
    return count;
  }, [showLineItemModifications, isLocalPO, IsProfitVisibleOnGRNAndPO]);

  return (
    <>
      <ToastContainer />
      <div className={styles.pageTitle}>
        <h1>Purchase Order Edit</h1>
        <ul>
          <li>
            <Link href="/inventory/purchase-order">Purchase Order</Link>
          </li>
          <li> Edit</li>
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
              <Button variant="outlined" disabled>
                <Typography sx={{ fontWeight: "bold" }}>
                  PO No: {po && po.purchaseOrderNo}
                </Typography>
              </Button>
              <Button variant="outlined" onClick={() => navigateToBack()}>
                <Typography sx={{ fontWeight: "bold" }}>Go Back</Typography>
              </Button>
            </Grid>
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
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Supplier
              </Typography>

              <TextField
                disabled
                sx={{ width: "60%" }}
                size="small"
                fullWidth
                value={po && po.supplierName}
              />
            </Grid>
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
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Reference No:
              </Typography>
              <TextField
                disabled
                sx={{ width: "60%" }}
                size="small"
                fullWidth
                value={po && (po.referanceNo ?? po.referenceNo ?? "")}
              />
            </Grid>
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
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                GRN Date
              </Typography>
              <TextField
                disabled
                sx={{ width: "60%" }}
                size="small"
                type="date"
                fullWidth
                value={
                  po &&
                  (po.grnDate || po.poDate
                    ? String(po.grnDate || po.poDate).substring(0, 10)
                    : "")
                }
              />
            </Grid>
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
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                Remark
              </Typography>
              <TextField
                disabled
                sx={{ width: "60%" }}
                size="small"
                fullWidth
                value={po && po.remark}
              />
            </Grid>
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
                sx={{
                  fontWeight: "500",
                  p: 1,
                  fontSize: "14px",
                  display: "block",
                  width: "35%",
                }}
              >
                PO Type
              </Typography>
              <TextField
                disabled
                sx={{ width: "60%" }}
                size="small"
                fullWidth
                value={po && isLocalPO ? "Local" : "Import"}
              />
            </Grid>
            {IsEnableCreditGRN ? <Grid
              item
              xs={12}
              lg={6}
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Box sx={{ marginLeft: '10px' }}>
                <FormControlLabel control={<Checkbox checked={isCredit} onChange={(e) => setIsCredit(e.target.checked)} />} label="Credit Payment" />
              </Box>
            </Grid> : ""}

            <Grid item xs={12} my={2} sx={{ position: "relative" }}>
              <TableContainer
                component={Paper}
                sx={{ position: "relative" }}
              >
                {isRefreshingLines && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(255, 255, 255, 0.55)",
                      pointerEvents: "none",
                    }}
                  >
                    <CircularProgress size={32} thickness={4} />
                  </Box>
                )}
                <Table
                  size="small"
                  aria-label="simple table"
                  className="dark-table"
                >
                  <TableHead>
                    <TableRow sx={{ background: "#757fef" }}>
                      {showLineItemModifications && (
                        <TableCell sx={{ color: "#fff" }}></TableCell>
                      )}
                      <TableCell sx={{ color: "#fff" }}>#</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Product&nbsp;Name
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>Batch</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Exp&nbsp;Date
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>Ordered Qty</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {isLocalPO ? "Received Qty" : "Qty"}
                      </TableCell>
                      {!isLocalPO && (
                        <TableCell sx={{ color: "#fff" }}>Received Qty</TableCell>
                      )}
                      <TableCell sx={{ color: "#fff" }}>
                        Unit&nbsp;Price
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Freight&nbsp;Duty & Transport
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Cost&nbsp;Price
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Selling&nbsp;Price
                      </TableCell>
                      {IsProfitVisibleOnGRNAndPO && (
                        <>
                          <TableCell sx={{ color: "#fff" }}>Profit</TableCell>
                          <TableCell sx={{ color: "#fff" }}>
                            Profit&nbsp;Margin&nbsp;(%)
                          </TableCell>
                        </>
                      )}
                      <TableCell sx={{ color: "#fff" }}>Discount</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Status</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Remark</TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        Total&nbsp;Cost
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRows.map((row, index) => {
                      const rowKey = getLineItemId(row) || row._clientKey || index;

                      return (
                      <TableRow
                        key={rowKey}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        {showLineItemModifications && (
                          <TableCell sx={{ p: 1 }}>
                            <Tooltip title="Delete" placement="top">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteRow(index)}
                                aria-label="delete row"
                              >
                                <DeleteIcon color="error" fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                        <TableCell sx={{ p: 1 }}>{index + 1}</TableCell>
                        <TableCell sx={{ p: 1 }} component="th" scope="row">
                          {showLineItemModifications && !row.productId ? (
                            <SearchDropdown
                              label=""
                              placeholder="Search product"
                              fetchUrl={`${BASE_URL}/Items/GetAllItemsBySupplierIdAndName`}
                              queryParams={{ supplierId: po?.supplierId }}
                              onSelect={(item) => handleProductSelect(index, item)}
                              wideDropdown
                              dropdownMinWidth={360}
                              getResultLabel={getPOEditProductLabel}
                              getOptionDisplay={formatPOEditProductOption}
                            />
                          ) : (
                            row.productName
                          )}
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          {!isPOComplete ? (
                            <TextField
                              size="small"
                              type="text"
                              sx={{ width: "150px" }}
                              fullWidth
                              value={row.batch || ""}
                              onChange={(e) =>
                                handleInputChange(index, "batch", e.target.value)
                              }
                            />
                          ) : (
                            <Typography>{row.batch}</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            size="small"
                            type="date"
                            sx={{ width: "150px" }}
                            fullWidth
                            value={formatDate(row.expDate)}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "expDate",
                                e.target.value
                              )
                            }
                            disabled={isPOComplete}
                          />
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          {showLineItemModifications ? (
                            <TextField
                              size="small"
                              type="number"
                              sx={{ width: "100px" }}
                              value={row.poQty === 0 ? "" : row.poQty}
                              onChange={(e) =>
                                handleInputChange(index, "poQty", e.target.value)
                              }
                              inputProps={{ min: 0, step: "any" }}
                            />
                          ) : (
                            row.poQty
                          )}
                        </TableCell>
                        <TableCell>
                          {isLocalPO ? (
                            <TextField
                              size="small"
                              type="number"
                              sx={{ width: "100px" }}
                              value={row.poReceivedQty === 0 ? "" : row.poReceivedQty}
                              onChange={(e) =>
                                handleInputChange(index, "poReceivedQty", e.target.value)
                              }
                              disabled={isPOComplete}
                            />
                          ) : (
                            <AddPOProducts
                              item={row}
                              fetchPO={fetchPO}
                              fetchPOTally={() => fetchPOTally(po?.purchaseOrderNo)}
                            />
                          )}
                        </TableCell>
                        {!isLocalPO && (
                          <TableCell>{row.poReceivedQty}</TableCell>
                        )}
                        <TableCell sx={{ p: 1 }}>
                          {isLocalPO ? (
                            <TextField
                              size="small"
                              type="number"
                              sx={{ width: "120px" }}
                              value={row.avgUnitPrice == "0.00" ? "" : row.avgUnitPrice}
                              onChange={(e) =>
                                handleInputChange(index, "avgUnitPrice", e.target.value)
                              }
                            />
                          ) : (
                            <Typography>{row.avgUnitPrice}</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          {isLocalPO ? (
                            <TextField
                              size="small"
                              type="number"
                              sx={{ width: "120px" }}
                              value={row.avgFreighCost == "0.00" ? "" : row.avgFreighCost}
                              onChange={(e) =>
                                handleInputChange(index, "avgFreighCost", e.target.value)
                              }
                            />
                          ) : (
                            formatCurrency(row.avgFreighCost)
                          )}
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>{formatCurrency(row.costPrice)}</TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            size="small"
                            type="number"
                            sx={{ width: "150px" }}
                            fullWidth
                            value={row.sellingPrice === 0 || row.sellingPrice === null || row.sellingPrice === undefined ? "" : row.sellingPrice}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "sellingPrice",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        {IsProfitVisibleOnGRNAndPO && (
                          <>
                            <TableCell sx={{ p: 1 }}>
                              {formatCurrency(
                                calculateProfit(row.sellingPrice, row.costPrice)
                              )}
                            </TableCell>
                            <TableCell sx={{ p: 1 }}>
                              {calculateProfitMargin(
                                row.sellingPrice,
                                row.costPrice
                              ).toFixed(2)}
                            </TableCell>
                          </>
                        )}
                        <TableCell sx={{ p: 1 }}>
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <Select
                              size="small"
                              value={row.discountType || "value"}
                              onChange={(e) =>
                                handleInputChange(index, "discountType", e.target.value)
                              }
                              sx={{ width: "85px" }}
                            >
                              <MenuItem value="value">Value</MenuItem>
                              <MenuItem value="percentage">%</MenuItem>
                            </Select>
                            <TextField
                              size="small"
                              type="number"
                              sx={{ width: "110px" }}
                              inputProps={{
                                min: 0,
                                max:
                                  row.discountType === "percentage" ? 100 : undefined,
                                step: "0.01",
                              }}
                              value={
                                row.discountInput === 0 ||
                                row.discountInput === null ||
                                row.discountInput === undefined ||
                                row.discountInput === ""
                                  ? ""
                                  : row.discountInput
                              }
                              onChange={(e) =>
                                handleInputChange(index, "discountInput", e.target.value)
                              }
                            />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ p: 1 }}>
                          <Select
                            label="Status"
                            value={row.status}
                            onChange={(e) =>
                              handleInputChange(index, "status", e.target.value)
                            }
                            sx={{ width: "150px" }}
                            size="small"
                          >
                            <MenuItem value="Approval">Approval</MenuItem>
                            <MenuItem value="Damage">Damage</MenuItem>
                          </Select>
                        </TableCell>

                        <TableCell sx={{ p: 1 }}>
                          <TextField
                            size="small"
                            type="text"
                            fullWidth
                            sx={{ width: "150px" }}
                            value={row.remark || ""}
                            onChange={(e) =>
                              handleInputChange(index, "remark", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ p: 1 }}>
                          {formatCurrency(row.lineGrossTot)}
                        </TableCell>
                      </TableRow>
                    );
                    })}
                    {showLineItemModifications && (
                      <TableRow>
                        <TableCell colSpan={totalTableColumns}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddEmptyRow}
                          >
                            Add Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#fff",
                  pr: 1,
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 2,
                    py: 0.5,
                  }}
                >
                  <Typography variant="h6">Discount</Typography>
                  <Typography variant="h6">
                    {formatCurrency(totalLineDiscount)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 2,
                    py: 0.5,
                  }}
                >
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6">
                    {formatCurrency(grossTotal)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} my={3}>
              <LoadingButton
                loading={isSubmit}
                handleSubmit={() => handleSubmit()}
                disabled={isDisable}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default POEdit;
