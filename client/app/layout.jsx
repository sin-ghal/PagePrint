import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'PagePrint',
  description: 'QR-based print management for modern shops',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🖨️</text></svg>",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
