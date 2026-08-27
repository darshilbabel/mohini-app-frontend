import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { BrowserRouter } from "react-router-dom"
import env from "./utils/env"

const strippedRoot = (env.ROOT_PATH() || "").replace(/^\/|\/$/g, "")
const rootPath = strippedRoot ? `/${strippedRoot}` : ""

// Redirect legacy /mohini paths to base URL
const pathname = window.location.pathname
if (pathname === "/mohini" || pathname.startsWith("/mohini/")) {
  const newPath = pathname.replace(/^\/mohini/, "") || "/"
  window.location.replace(newPath + window.location.search + window.location.hash)
}

const el = document.getElementById("root")
const root = ReactDOM.createRoot(el)

root.render(
  <BrowserRouter basename={rootPath}>
    <App />
  </BrowserRouter>
)
