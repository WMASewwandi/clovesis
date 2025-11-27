import React, { useContext } from "react";
import QuickAccessContent from "@/components/quickaccess/QuickAccessContent";
import WelcomeHero from "@/components/landing/WelcomeHero";
import { TopbarContext } from "@/components/_App/TopbarContext";

const Landing = () => {
  const { activeButton } = useContext(TopbarContext);

  if (activeButton === "quick-access") {
    return <QuickAccessContent />;
  }

  return <WelcomeHero />;
};

export default Landing;