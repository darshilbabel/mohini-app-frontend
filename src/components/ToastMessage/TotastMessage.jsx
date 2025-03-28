import React from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toastmessage_style.css";

const Notification = () => {
  return (
    <ToastContainer
      position="bottom-left"
      autoClose={false}
      limit={1}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      theme="colored"
      transition={Bounce}
      toastClassName="custom-toast"
      bodyClassName="custom-toast-body"
    />
  );
};

const defaultConfig = {
  position: "bottom-left",
  autoClose: false,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  transition: Bounce,
};

export const showNotification = ({
  message = "🦄 Default Message",
  type = "warn",
  options = {},
}) => {
  return toast[type](message, { ...defaultConfig, ...options }); 
};

export default Notification;
