import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const rootPath = process.env.REACT_APP_ROOT_PATH
  ? `/${process.env.REACT_APP_ROOT_PATH.replace(/^\/|\/$/g, "")}`
  : "";

const el = document.getElementById("root");
const root = ReactDOM.createRoot(el);

root.render(
  <BrowserRouter basename={rootPath}>
    <App />
  </BrowserRouter>
);
