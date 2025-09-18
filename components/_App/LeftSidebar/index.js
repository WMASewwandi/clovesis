import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { getSidebarData, SidebarData } from "./SidebarData";
import SubMenu from "./SubMenu";
import Link from "next/link";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import IsAppSettingEnabled from "@/components/utils/IsAppSettingEnabled";
import BASE_URL from "Base/api";
import { ProjectNo } from "Base/catelogue";

const SidebarNav = styled("nav")(({ theme }) => ({
  background: "#fff",
  boxShadow: "0px 4px 20px rgba(47, 143, 232, 0.07)",
  width: "300px",
  padding: "30px 10px",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  position: "fixed",
  top: 0,
  left: 0,
  transition: "350ms",
  zIndex: "10",
  overflowY: "auto",
}));

const SidebarWrap = styled("div")(({ theme }) => ({
  width: "100%",
}));

const Sidebar = ({ toogleActive, onGrantedCheck }) => {
  const { data: IsGarmentSystem } = IsAppSettingEnabled("IsGarmentSystem");
  const [sidebarItems, setSidebarItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const role = localStorage.getItem("role");
  const [companyLogo, setCompanyLogo] = useState("");
  const [permission, setPermission] = useState(true);
  const availableItems = sidebarItems.filter((item) => item.IsAvailable);

  const warehouse = localStorage.getItem("warehouse");

  const handleSetPermission = (bool) => {
    setPermission(bool);
  }

  const fetchCompanyImage = async () => {
    const response = await fetch(
      `${BASE_URL}/Company/GetCompanyLogoByWarehouseId?warehouseId=${warehouse}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    setCompanyLogo(data.logoUrl);
  };

  const fetchModulePermissions = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/User/GetRolePermissionByRolePermissionTypeId?roleId=${role}&permissionTypeId=1`,
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
      const transformed = data.result.map((item) => {
        const navPermission = item.permissionTypes.find(
          (p) => p.name === "Navigation"
        );
        return {
          CategoryId: item.id,
          IsAvailable: navPermission ? navPermission.isActive : false,
        };
      });
      const rawItems = getSidebarData(IsGarmentSystem);
      const updatedItems = rawItems.map((menu) => {
        let updatedMenu = { ...menu };

        if (updatedMenu.subNav) {
          updatedMenu.subNav = updatedMenu.subNav.map((sub) => {
            const matched = transformed.find(
              (t) => t.CategoryId === sub.categoryId
            );
            return {
              ...sub,
              isAvailable: matched ? matched.IsAvailable : false,
            };
          });
        }

        return updatedMenu;
      });

      setAllItems(updatedItems);

      const filteredMenus = updatedItems
        .map((menu) => {
          if (menu.subNav) {
            const filteredSubNav = menu.subNav.filter((sub) => sub.isAvailable);
            return {
              ...menu,
              subNav: filteredSubNav,
              IsAvailable: filteredSubNav.length > 0,
            };
          }
          return {
            ...menu,
            IsAvailable: true,
          };
        })
        .filter((menu) => menu.IsAvailable);
      setSidebarItems(filteredMenus);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchModulePermissions();
    fetchCompanyImage();
  }, []);

  useEffect(() => {
    if (onGrantedCheck) {
      onGrantedCheck(permission);
    }
  }, [permission]);


  return (
    <>
      <div className="leftSidebarDark">
        <SidebarNav className="LeftSidebarNav">
          <SidebarWrap>
            <Box
              sx={{
                mb: "20px",
                px: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Link href={ProjectNo === 2 ? "/dashboard/reservation" : "/"}>
                {ProjectNo === 1 ? (
                  <>
                    <img
                      src={companyLogo != "" ? companyLogo : "/images/logo(1).png"}
                      alt="Logo"
                      className="black-logo"
                    />
                    <img
                      src={companyLogo != "" ? companyLogo : "/images/logo(1).png"}
                      alt="Logo"
                      className="white-logo"
                    />
                  </>
                ) : (
                  <>
                    <img
                      src="/images/db-logo.png"
                      alt="Logo"
                      className="black-logo"
                    />
                    <img
                      src="/images/db-logo.png"
                      alt="Logo"
                      className="white-logo"
                    />
                  </>
                )}
              </Link>

              <IconButton
                onClick={toogleActive}
                size="small"
                sx={{
                  background: "rgb(253, 237, 237)",
                  display: { lg: "none" },
                }}
              >
                <ClearIcon />
              </IconButton>
            </Box>
            {availableItems.map((item, index) => (
              <SubMenu item={item} allItems={allItems} key={index} onCheckPermission={handleSetPermission} />
            ))}
          </SidebarWrap>
        </SidebarNav>
      </div>
    </>
  );
};

export default Sidebar;
