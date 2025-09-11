// import React, { useEffect, useState } from "react";
// import "../styles/remixicon.css";
// import "react-tabs/style/react-tabs.css";
// import "swiper/css";
// import "swiper/css/bundle";
// import "../styles/chat.css";
// import "../styles/globals.css";
// import "../styles/rtl.css";
// import "../styles/dark.css";
// import theme from "../styles/theme";

// import { ThemeProvider, CssBaseline, CircularProgress } from "@mui/material";
// import Layout from "@/components/_App/Layout";
// import SignIn from "./authentication/sign-in";
// import { ProjectNo } from "Base/catelogue";

// function MyApp({ Component, pageProps }) {
//   const tk =
//     typeof window !== "undefined" ? localStorage.getItem("token") : null;
//   const [token, setToken] = useState(tk);
//   const [hydrated, setHydrated] = useState(false);
//   const [landingVisible, setLandingVisible] = useState(true);
//   const [landingSlideUp, setLandingSlideUp] = useState(false);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("token");
//       setToken(token);
//       const timeoutId = setTimeout(() => setHydrated(true), 100);
//       return () => clearTimeout(timeoutId);
//     }
//   }, []);

//    useEffect(() => {
//     const handleSpaceKey = (e) => {
//       if (e.keyCode === 32) {
//         e.preventDefault();
//         setLandingSlideUp(true);
//         setTimeout(() => {
//           setLandingVisible(false);
//         }, 600);
//       }
//     };

//     if (landingVisible) {
//       window.addEventListener("keydown", handleSpaceKey);
//     }

//     return () => {
//       window.removeEventListener("keydown", handleSpaceKey);
//     };
//   }, [landingVisible]);


//   if (!hydrated) {
//     return <div style={{width: '100vw',height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
//       <CircularProgress />
//     </div>;
//   }

//   function clearLocalStorageDaily() {
//     var now = new Date();
//     var clearTime = new Date();
//     clearTime.setHours(3);
//     clearTime.setMinutes(0);
//     clearTime.setSeconds(0);
//     if (now.getHours() >= 3) {
//       clearTime.setDate(clearTime.getDate() + 1);
//     }

//     var timeUntilClear = clearTime.getTime() - now.getTime();
//     setTimeout(function() {
//       localStorage.clear();      
//       console.log("Local storage cleared at 3 am.");
//       clearLocalStorageDaily();
//       window.location.reload();
//     }, timeUntilClear);
//   }
//   clearLocalStorageDaily();

//   if (token == null && landingVisible) {
//     return (
//       <div className={`landing-page ${landingSlideUp ? "slide-up" : ""}`}>
//         <div className="landing-content">
//           {ProjectNo === 1 ? <img src="/images/clovesis.png" alt="Logo" className="landing-logo" /> : <img src="/images/DBlogo.png" alt="Logo" className="landing-logo" />}
//         </div>
//       </div>
//     );
//   }


//   if (token == null) {
//     return <SignIn />;
//   }

//   return (
//     <>
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Layout>
//           <Component {...pageProps} />
//         </Layout>
//       </ThemeProvider>
//     </>
//   );
// }

// export default MyApp;


import React, { useEffect, useState } from "react";
import "../styles/remixicon.css";
import "react-tabs/style/react-tabs.css";
import "swiper/css";
import "swiper/css/bundle";
import "../styles/chat.css";
import "../styles/globals.css";
import "../styles/rtl.css";
import "../styles/dark.css";
import "../styles/calendar.css";
import theme from "../styles/theme";
import SignIn from "./authentication/sign-in";

import { ThemeProvider, CssBaseline, CircularProgress } from "@mui/material";
import Layout from "@/components/_App/Layout";
import { useRouter } from "next/router";
import { ProjectNo } from "Base/catelogue";
import Calendar from "./reservation/calendar";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const tk = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [token, setToken] = useState(tk);
  const [hydrated, setHydrated] = useState(false);
  const [landingVisible, setLandingVisible] = useState(true);
  const [landingSlideUp, setLandingSlideUp] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setToken(token);
      const timeoutId = setTimeout(() => setHydrated(true), 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    const handleSpaceKey = (e) => {
      if (e.keyCode === 32) {
        e.preventDefault();
        setLandingSlideUp(true);
        setTimeout(() => {
          setLandingVisible(false);
        }, 600);
      }
    };

    if (landingVisible) {
      window.addEventListener("keydown", handleSpaceKey);
    }

    return () => {
      window.removeEventListener("keydown", handleSpaceKey);
    };
  }, [landingVisible]);

  useEffect(() => {
    if (typeof window !== "undefined" && token == null) {
      const handleKeyDownOrClick = (e) => {
        if (e.key === " " || e.key === "Enter" || e.type === "click") {
          setLandingSlideUp(true);
          setTimeout(() => setLandingVisible(false), 600);
        }
      };

      window.addEventListener("keydown", handleKeyDownOrClick);
      window.addEventListener("click", handleKeyDownOrClick);

      return () => {
        window.removeEventListener("keydown", handleKeyDownOrClick);
        window.removeEventListener("click", handleKeyDownOrClick);
      };
    }
  }, [token]);


  function clearLocalStorageDaily() {
    var now = new Date();
    var clearTime = new Date();
    clearTime.setHours(3);
    clearTime.setMinutes(0);
    clearTime.setSeconds(0);
    if (now.getHours() >= 3) {
      clearTime.setDate(clearTime.getDate() + 1);
    }

    var timeUntilClear = clearTime.getTime() - now.getTime();
    setTimeout(function () {
      localStorage.clear();
      clearLocalStorageDaily();
      window.location.reload();
    }, timeUntilClear);
  }
  clearLocalStorageDaily();

  if (!hydrated) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </div>
    );
  }

  if (token == null && landingVisible) {
    return (
      <div className={`landing-page ${landingSlideUp ? "slide-up" : ""}`}>
        <div className="landing-content">
          {ProjectNo === 1 ? <img src="/images/4c.png" alt="Logo" className="landing-logo" /> : <img src="/images/DBlogo.png" alt="Logo" className="landing-logo" />}

        </div>
      </div>
    );
  }

  if (token == null) {
    if (ProjectNo === 1) {
      return <SignIn /> ;
    } else {
      return <Calendar />;
    }

  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
