import "./polyfills"
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { BrowserCompatibilityWrapper } from "./components/layout/BrowserCompatibilityWrapper"
import "./globals.css"
import { Analytics } from '@vercel/analytics/next';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Analytics />
    <BrowserCompatibilityWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BrowserCompatibilityWrapper>
  </React.StrictMode>,
)
