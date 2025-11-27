import React, { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import LeftSidebar from "@/components/_App/LeftSidebar";
import TopNavbar from "@/components/_App/TopNavbar";
import Footer from "@/components/_App/Footer";
import ScrollToTop from "./ScrollToTop";
import ControlPanelModal from "./ControlPanelModal";
import HidableButtons from "../Dashboard/eCommerce/HidableButtons";
import AccessDenied from "../UIElements/Permission/AccessDenied";
import { TopbarContext } from "./TopbarContext";
import BASE_URL from "Base/api";

const Layout = ({ children }) => {
  const router = useRouter();
  const [isGranted, setIsGranted] = useState(true);

  const [active, setActive] = useState(true);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [activeTopbarButton, setActiveTopbarButton] = useState("quick-access");

  const showSidebar = useCallback(() => {
    setActive(false);
  }, []);

  const hideSidebar = useCallback(() => {
    setActive(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      hideSidebar();
      setActiveTopbarButton("quick-access");
      if (router.pathname === "/") {
        router.replace("/quick-access");
      }
      return;
    }

    const fetchLandingPagePreference = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/Company/GetLoggedUserLandingPage`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          hideSidebar();
          setActiveTopbarButton("quick-access");
          if (router.pathname === "/") {
            router.replace("/quick-access");
          }
          return;
        }

        const data = await response.json();
        const landingPageValue = data?.result?.result?.landingPage ?? null;

        if (landingPageValue === 2) {
          hideSidebar();
          setActiveTopbarButton("quick-access");
          if (router.pathname === "/" || router.pathname === "/quick-access") {
            router.replace("/quick-access");
          }
        } else {
          showSidebar();
          setActiveTopbarButton("menu");
          if (router.pathname === "/quick-access") {
            router.replace("/");
          }
        }
      } catch (error) {
        hideSidebar();
        setActiveTopbarButton("quick-access");
        if (router.pathname === "/") {
          router.replace("/quick-access");
        }
      }
    };

    fetchLandingPagePreference();
  }, [hideSidebar, showSidebar]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const evaluateSidebarVisibility = () => {
      const viewportWidth = window.innerWidth;

      if (viewportWidth < 1200) {
        setIsSidebarHidden(!active);
      } else {
        setIsSidebarHidden(active);
      }
    };

    evaluateSidebarVisibility();

    window.addEventListener("resize", evaluateSidebarVisibility);

    return () => {
      window.removeEventListener("resize", evaluateSidebarVisibility);
    };
  }, [active]);

  const handleCheckGranted = (bool) => {
    setIsGranted(bool);
  };

  const noWrapperRoutes = ["/restaurant/dashboard"];

  const isWrapperRequired = !noWrapperRoutes.includes(router.pathname);

  return (
    <TopbarContext.Provider value={{ activeButton: activeTopbarButton, setActiveButton: setActiveTopbarButton }}>
      <>
        <Head>
          <title>CBASS-AI</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>

        <div
          className={`${isWrapperRequired ? "main-wrapper-content" : ""} ${
            active ? "active" : ""
          }`}
        >
          {!(
            router.pathname === "/authentication/sign-in" ||
            router.pathname === "/authentication/sign-up" ||
            router.pathname === "/authentication/forgot-password" ||
            router.pathname === "/authentication/lock-screen" ||
            router.pathname === "/authentication/confirm-mail" ||
            router.pathname === "/authentication/logout" ||
            router.pathname === "/restaurant/dashboard"
          ) && (
            <>
              <TopNavbar
                showSidebar={showSidebar}
                hideSidebar={hideSidebar}
                sidebarHidden={isSidebarHidden}
                onActiveChange={setActiveTopbarButton}
              />

              <LeftSidebar toogleActive={hideSidebar} onGrantedCheck={handleCheckGranted} />
            </>
          )}

          <div className="main-content">
            {!isGranted ? <AccessDenied /> : children}

            {!(
              router.pathname === "/authentication/sign-in" ||
              router.pathname === "/authentication/sign-up" ||
              router.pathname === "/authentication/forgot-password" ||
              router.pathname === "/authentication/lock-screen" ||
              router.pathname === "/authentication/confirm-mail" ||
              router.pathname === "/authentication/logout" ||
              router.pathname === "/restaurant/dashboard"
            ) && <Footer />}
          </div>
        </div>

        {/* ScrollToTop */}
        <ScrollToTop />

        {!(
          router.pathname === "/authentication/sign-in" ||
          router.pathname === "/authentication/sign-up" ||
          router.pathname === "/authentication/forgot-password" ||
          router.pathname === "/authentication/lock-screen" ||
          router.pathname === "/authentication/confirm-mail" ||
          router.pathname === "/authentication/logout" ||
          router.pathname === "/restaurant/dashboard"
        ) && <ControlPanelModal />}
        <HidableButtons />
      </>
    </TopbarContext.Provider>
  );
};

export default Layout;
