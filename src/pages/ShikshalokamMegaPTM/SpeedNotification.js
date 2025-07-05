import { useEffect } from "react";
import Notification, { showNotification } from "../../components/ToastMessage/TotastMessage";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function SpeedNotification(){
  const { t } = useTranslation();

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let toastId = null; 

    const checkNetworkSpeed = () => {
      if (connection) {
        const { effectiveType, downlink } = connection;
        if (effectiveType && (effectiveType === "2g" || effectiveType === "3g") && navigator.onLine) {
          if (toastId) {
            toast.dismiss(toastId);
          }
          const message = t("networkWarning");
          toastId = showNotification({
            message: message,
            type: "warning",
            options: { position: "top-center", style: { fontWeight: "bold", color: "#1D1616" } },
          });
        }
      }
    };

    const handleOffline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
      toastId = toast.error(t('offlineNetwork'), { position: "top-center", style: { fontWeight: "bold", color: "#fff" } });
    };

    const handleOnline = () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
      toastId = toast.success(t('onlineNetwork'), { position: "top-center", style: { fontWeight: "bold", color: "#1D1616" } });
      checkNetworkSpeed(); 
    };

    checkNetworkSpeed(); 
    connection?.addEventListener("change", checkNetworkSpeed);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      connection?.removeEventListener("change", checkNetworkSpeed);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

    return <Notification />

}

export default SpeedNotification;