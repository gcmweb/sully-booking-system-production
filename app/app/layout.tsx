
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from "../components/auth-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sully Booking System',
  description: 'Complete booking management system for restaurants, cafes, bars, and venues',
  keywords: 'booking system, restaurant reservations, table booking, venue management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
