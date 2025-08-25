import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { MockDataProvider } from "@/lib/mock-data-context"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        {/*
          MockDataProvider wraps the app during development to source data from local JSON files
          inside the `mocks/` directory. Replace/remove this provider once real APIs are ready,
          and move data access into API calls (hooks/services).
        */}
        <MockDataProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <Toaster />
        </MockDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)


