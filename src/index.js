import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { BrowserRouter } from "react-router-dom"
import env from "./utils/env"

const rootPath = env.ROOT_PATH() ? `/${env.ROOT_PATH().replace(/^\/|\/$/g, "")}` : ""

// Redirect bare "/" to the app's home page
if (rootPath && window.location.pathname === "/") {
  window.location.replace(`${rootPath}/home`)
}

const el = document.getElementById("root")
const root = ReactDOM.createRoot(el)

root.render(
  <BrowserRouter basename={rootPath}>
    <App />
  </BrowserRouter>
)
