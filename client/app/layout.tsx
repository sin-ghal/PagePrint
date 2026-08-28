import "./globals.css"
import { Toaster } from "react-hot-toast"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PagePrint",
  description: "QR-based print management for modern shops",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖨️</text></svg>",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
