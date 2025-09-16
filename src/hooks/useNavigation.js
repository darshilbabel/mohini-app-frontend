// hooks/useNavigation.js
import { useEffect } from "react";
import { useLocation } from "react-use";
import { clearFromStorage, getFromStorage } from "../services/storage_service";

export const useNavigation = () => {
  const location = useLocation();

  // Handle browser back button prevention
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.history.replaceState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
    return () => {
      window.onpopstate = null;
    };
  }, []);

  // Handle access token based navigation
  useEffect(() => {
    const accessToken = getFromStorage("accessToken");
    if (!accessToken) {
      // Trap the back button
      window.history.pushState(null, "", window.location.href);

      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      const handlePopState = () => {
        const rerouteURL = getFromStorage("ssoRerouteURL", false);
        if (rerouteURL) {
          clearFromStorage(true, ["ssoRerouteURL"]);
          window.location.href = rerouteURL;
        }
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [location.pathname]);
};