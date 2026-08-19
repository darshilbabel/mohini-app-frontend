import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { BrowserRouter } from "react-router-dom"
import env from "./utils/env"

const strippedRoot = (env.ROOT_PATH() || "").replace(/^\/|\/$/g, "")
const rootPath = strippedRoot ? `/${strippedRoot}` : ""

// Redirect bare "/" or the root path itself to the app's home page
const pathname = window.location.pathname
if (pathname === "/" || (rootPath && (pathname === rootPath || pathname === `${rootPath}/`))) {
  window.location.replace(`${rootPath}/home`)
}

const el = document.getElementById("root")
const root = ReactDOM.createRoot(el)

root.render(
  <BrowserRouter basename={rootPath}>
    <App />
  </BrowserRouter>
)
