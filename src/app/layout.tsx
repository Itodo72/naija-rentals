import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: "NaijaRentals — Nigeria's Fairest Rental Marketplace",
  description: 'Rent properties across all 36 states. Only 5% platform fee — no agents, no hidden charges.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.paystack.co/v1/inline.js" async />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: '#0D3B2E', color: '#fff', fontFamily: 'DM Sans,sans-serif', fontSize: '13px', borderRadius: '9px' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
