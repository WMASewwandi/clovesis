import React from "react";
import {
    KeyboardArrowRight as ArrowRight,
    KeyboardArrowDown as ArrowDown,
    GridView as GridIcon,
    AdminPanelSettings as AdminIcon,
    AssessmentOutlined as ReportIcon,
    Brush as BrushIcon,
    Folder as FolderIcon,
    DesignServices as DesignIcon,
    AttachMoney,
} from "@mui/icons-material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import { ProjectNo } from "Base/catelogue";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import BeenhereOutlinedIcon from "@mui/icons-material/BeenhereOutlined";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

export const getSidebarData = (IsGarmentSystem) => {
    const sidebarData = [
        {
            title: "Dashboard",
            path: "/dashboard/dashboard/",
            icon: <GridIcon />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 7,
            IsAvailable: true,
            subNav: [
                { title: "Dashboard", path: "/dashboard/main", categoryId: 39, isAvailable: true },
                { title: "Dashboard", path: "/dashboard/pos", categoryId: 60, isAvailable: true },
                { title: "Dashboard", path: "/dashboard/reservation", categoryId: 61, isAvailable: true },
            ],
        },
        {
            title: "Finance",
            path: "/finance/finance/",
            icon: <AttachMoney />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 10,
            IsAvailable: true,
            subNav: [
                { title: "Chart Of Account", path: "/finance/chart-of-account/", categoryId: 41, isAvailable: true },
                { title: "Payments", path: "/finance/payments/", categoryId: 42, isAvailable: true },
                { title: "Tax", path: "/finance/tax/", categoryId: 58, isAvailable: true },
            ],
        },
        {
            title: "Master Data",
            path: "/master/master/",
            icon: <FolderIcon />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 1,
            IsAvailable: true,
            subNav: [
                { title: "Customers", path: "/master/customers/", categoryId: 1, isAvailable: true },
                { title: "Sales Person", path: "/master/sales-person/", categoryId: 2, isAvailable: true },
                { title: "Inquiry Category", path: "/master/inquiry/", categoryId: 3, isAvailable: true },
                { title: "Fabric", path: "/master/fabric/", categoryId: 4, isAvailable: true },
                { title: "GSM", path: "/master/gsm/", categoryId: 5, isAvailable: true },
                { title: "Composition", path: "/master/composition/", categoryId: 6, isAvailable: true },
                { title: "Supplier", path: "/master/supplier/", categoryId: 7, isAvailable: true },
                { title: "Color Code", path: "/master/color-code/", categoryId: 8, isAvailable: true },
                { title: "Size", path: "/master/size/", categoryId: 9, isAvailable: true },
                { title: "Items", path: "/master/items/", categoryId: 10, isAvailable: true },
                { title: "Unit of Measures", path: "/master/uom/", categoryId: 11, isAvailable: true },
                { title: "Category", path: "/master/category/", categoryId: 12, isAvailable: true },
                { title: "Sub Category", path: "/master/sub-category/", categoryId: 13, isAvailable: true },
                { title: "Orders", path: "/master/orders/", categoryId: 16, isAvailable: true },
                { title: "Bank", path: "/master/bank/", categoryId: 15, isAvailable: true },
                { title: "Cash Flow Types", path: "/master/cash-flow/", categoryId: 59, isAvailable: true },
                { title: "Doctors", path: "/master/doctors/", categoryId: 70, isAvailable: true },
                { title: "Tasks", path: "/master/tasks/", categoryId: 63, isAvailable: true },
                { title: "Packages", path: "/master/package/", categoryId: 65, isAvailable: true },
                { title: "Time Slots", path: "/master/time-slots/", categoryId: 66, isAvailable: true },
                { title: "Day Type", path: "/master/day-type/", categoryId: 76, isAvailable: true },
            ],
        },
        {
            title: "Apparel",
            path: "/inquiry/Inquiry/",
            icon: <DesignIcon />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 8,
            IsAvailable: true,
            subNav: [
                {
                    title: "Inquiry",
                    path: "/inquiry/inquries/",
                    categoryId: 51,
                    isAvailable: true
                },
                {
                    title: "Pending Quotations",
                    path: "/quotations/pending-quotation/",
                    categoryId: 52,
                    isAvailable: true,
                },
                {
                    title: "Approved Quotations",
                    path: "/quotations/approved-quotation/",
                    categoryId: 54,
                    isAvailable: true,
                },
                { title: "Sent Quotations", path: "/quotations/sent-list/", categoryId: 71, isAvailable: true },
                { title: "Proforma Invoice", path: "/quotations/proforma-list/", categoryId: 72, isAvailable: true },
                { title: "Tech Pack", path: "/quotations/tech-pack/", categoryId: 73, isAvailable: true },
                { title: "Sample", path: "/quotations/sample/", categoryId: 74, isAvailable: true },
                { title: "Projects", path: "/production/projects/", categoryId: 53, isAvailable: true },
                { title: "My Tasks", path: "/production/tasks/", categoryId: 55, isAvailable: true },
                { title: "Ongoing", path: "/production/ongoing/", categoryId: 56, isAvailable: true },
                { title: "Follow Up", path: "/production/follow-up/", categoryId: 75, isAvailable: true },
            ],
        },
        {
            title: "Inventory",
            path: "/inventory/inventory/",
            icon: <InventoryIcon />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 2,
            IsAvailable: true,
            subNav: [
                { title: "Goods Receive Note", path: "/inventory/grn/", categoryId: 17, isAvailable: true },
                { title: "Shipment", path: "/inventory/shipment/", categoryId: 19, isAvailable: true },
                { title: "Outlet Note", path: "/inventory/outlet-note/", categoryId: 20, isAvailable: true },
                { title: "Stock Dispatch", path: "/inventory/stock-dispatch/", categoryId: 21, isAvailable: true },
                { title: "Stock Adjustment", path: "/inventory/stock-adjustment/", categoryId: 40, isAvailable: true },
                { title: "Stock Transfer Note", path: "/inventory/stock-transfer/", categoryId: 69, isAvailable: true },
                { title: "Goods Return Note", path: "/inventory/grn-return/", categoryId: 77, isAvailable: true },
            ],
        },
        {
            title: "Sales",
            path: "/sales/sales/",
            icon: <ReceiptIcon />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 3,
            IsAvailable: true,
            subNav: [
                { title: "Invoice", path: "/sales/invoice/", categoryId: 22, isAvailable: true },
                { title: "Customer Credit Notes", path: "/sales/credit-note/", categoryId: 23, isAvailable: true },
                { title: "Receipt", path: "/sales/receipt/", categoryId: 24, isAvailable: true },
                { title: "Shift", path: "/sales/shift/", categoryId: 25, isAvailable: true },
                { title: "Day End", path: "/sales/day-end/", categoryId: 26, isAvailable: true },
                { title: "Daily Deposit", path: "/sales/deposit/", categoryId: 27, isAvailable: true },
                { title: "Sales Return", path: "/sales/sales-return/", categoryId: 62, isAvailable: true },
            ],
        },
        {
            title: "Production",
            path: "/production/production/",
            icon: <PrecisionManufacturingIcon />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 15,
            IsAvailable: true,
            subNav: [
                { title: "Bill Of Material", path: "/production/bom/", categoryId: 14, isAvailable: true },
            ],
        }
    ];
    if (ProjectNo === 2) {
        sidebarData.push({
            title: "Calendar",
            path: "/reservation/inner-calendar",
            icon: <EventAvailableIcon />,
            iconClosed: <ArrowRight />,
            iconOpened: <ArrowDown />,
            ModuleId: 14,
            IsAvailable: true,
        });
    }

    sidebarData.push({
        title: "Reservation",
        path: "/reservation/reservation/",
        icon: <EventSeatOutlinedIcon />,
        iconClosed: <ArrowRight />,
        iconOpened: <ArrowDown />,
        ModuleId: 11,
        IsAvailable: true,
        subNav: [
            { title: "Pencil Notes", path: "/reservation/notes/", categoryId: 64, isAvailable: true },
            { title: "Reservations", path: "/reservation/reservations/", categoryId: 43, isAvailable: true },
            { title: "Gallery", path: "/reservation/gallery/", categoryId: 44, isAvailable: true },
            { title: "Bookings", path: "/reservation/booking/", categoryId: 67, isAvailable: true },
            { title: "Reserved Slots", path: "/reservation/reserved-slots/", categoryId: 68, isAvailable: true },
        ],
    });
    sidebarData.push({
        title: "Approval",
        path: "/reservation/reservation/",
        icon: <BeenhereOutlinedIcon />,
        iconClosed: <ArrowRight />,
        iconOpened: <ArrowDown />,
        ModuleId: 12,
        IsAvailable: true,
        subNav: [
            { title: "Payment Approval", path: "/reservation/approval/", categoryId: 45, isAvailable: true },
            { title: "Charge Sheet Approval", path: "/reservation/charge-sheet-approval/", categoryId: 46, isAvailable: true },
        ],
    });
    sidebarData.push({
        title: "Payments",
        path: "/reservation/reservation/",
        icon: <DescriptionIcon />,
        iconClosed: <ArrowRight />,
        iconOpened: <ArrowDown />,
        ModuleId: 13,
        IsAvailable: true,
        subNav: [
            { title: "Invoice", path: "/reservation/invoice/", categoryId: 47, isAvailable: true },
            { title: "Payment History", path: "/reservation/payment-history/", categoryId: 48, isAvailable: true },
        ],
    });
    sidebarData.push({
        title: "Reports",
        path: "/reports/reports/",
        icon: <ReportIcon />,
        iconClosed: <ArrowRight />,
        iconOpened: <ArrowDown />,
        ModuleId: 4,
        IsAvailable: true,
        subNav: [
            // { title: "Stock Balance", path: "/reports/stock/", categoryId: 28, isAvailable: true },
            { title: "Summary Reports", path: "/reports/summery-report/", categoryId: 29, isAvailable: true },
            { title: "Customer Outstanding", path: "/reports/outstanding/", categoryId: 30, isAvailable: true },
            { title: "Reservation Reports", path: "/reservation/reports/", categoryId: 50, isAvailable: true },
        ],
    });

    sidebarData.push({
        title: "Administrator",
        path: "/administrator/administrator/",
        icon: <AdminIcon />,
        iconClosed: <ArrowRight />,
        iconOpened: <ArrowDown />,
        ModuleId: 5,
        IsAvailable: true,
        subNav: [
            { title: "Users", path: "/administrator/users/", categoryId: 31, isAvailable: true },
            { title: "Roles", path: "/administrator/roles/", categoryId: 32, isAvailable: true },
            { title: "Settings", path: "/administrator/settings/", categoryId: 33, isAvailable: true },
            { title: "Report Settings", path: "/administrator/report-settings/", categoryId: 34, isAvailable: true },
            { title: "Warehouse", path: "/administrator/warehouse/", categoryId: 35, isAvailable: true },
            { title: "Company", path: "/administrator/company/", categoryId: 36, isAvailable: true },
            { title: "Fiscal Periods", path: "/administrator/fiscal-period/", categoryId: 37, isAvailable: true },
            { title: "Terminal", path: "/administrator/terminal/", categoryId: 38, isAvailable: true },
        ],
    });

    return sidebarData;
};
