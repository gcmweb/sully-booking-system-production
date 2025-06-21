
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "../components/auth-provider";
import { Toaster } from "../components/ui/toaster";
import { Toaster as SonnerToaster } from 'sonner';

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <SonnerToaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
