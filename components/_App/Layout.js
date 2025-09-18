import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import LeftSidebar from "@/components/_App/LeftSidebar";
import TopNavbar from "@/components/_App/TopNavbar";
import Footer from "@/components/_App/Footer";
import ScrollToTop from "./ScrollToTop";
import ControlPanelModal from "./ControlPanelModal";
import HidableButtons from "../Dashboard/eCommerce/HidableButtons";
import AccessDenied from "../UIElements/Permission/AccessDenied";

const Layout = ({ children }) => {
  const router = useRouter();
  const [isGranted, setIsGranted] = useState(true);

  const [active, setActive] = useState(false);

  const toogleActive = () => {
    setActive(!active);
  };

  const handleCheckGranted = (bool) => {
    setIsGranted(bool);
  }

  return (
    <>
      <Head>
        <title>
          Apexflow
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div className={`main-wrapper-content ${active && "active"}`}>
        {!(
          router.pathname === "/authentication/sign-in" ||
          router.pathname === "/authentication/sign-up" ||
          router.pathname === "/authentication/forgot-password" ||
          router.pathname === "/authentication/lock-screen" ||
          router.pathname === "/authentication/confirm-mail" ||
          router.pathname === "/authentication/logout"
        ) && (
            <>
              <TopNavbar toogleActive={toogleActive}  />

              <LeftSidebar toogleActive={toogleActive} onGrantedCheck={handleCheckGranted}/>
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
            router.pathname === "/authentication/logout"
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
        router.pathname === "/authentication/logout"
      ) &&
        <ControlPanelModal />
      }
      <HidableButtons />
    </>
  );
};

export default Layout;
