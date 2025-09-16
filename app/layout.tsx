import type { ReactNode } from "react"
import "./globals.css"
import Providers from "./providers"

export const metadata = {
  title: "Adelbaba Dashboard",
  description: "Supplier dashboard",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

