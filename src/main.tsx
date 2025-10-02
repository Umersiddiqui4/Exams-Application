import "./polyfills"
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { BrowserCompatibilityWrapper } from "./components/BrowserCompatibilityWrapper"
import "./globals.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserCompatibilityWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BrowserCompatibilityWrapper>
  </React.StrictMode>,
)
