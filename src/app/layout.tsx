import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Melting Cheese | Direct Food Ordering & Delivery',
  description: 'Order hot pizzas, burgers, chicken strips, snacks & mocktails from Melting Cheese, Bhadohi. Open till 12:00 AM.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#121214',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#121214] text-stone-100 antialiased selection:bg-amber-500 selection:text-black">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
