import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MockDataProvider } from "@/lib/mock-data-context"
import { AuthProvider } from "@/lib/auth-context"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {/*
          MockDataProvider wraps the app during development to source data from local JSON files
          inside the `mocks/` directory. Replace/remove this provider once real APIs are ready,
          and move data access into API calls (hooks/services).
        */}
        <MockDataProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
            <Toaster />
          </AuthProvider>
        </MockDataProvider>
    </ThemeProvider>
  </React.StrictMode>,
)


