import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from "@/components/auth/AuthProvider";
import Header from "@/components/auth/Header";
import MobileOptimization from "@/components/mobile/MobileOptimization";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'USCG Evaluation Report Generator',
  description: 'Generate performance bullets and create Evaluation Reports for USCG personnel',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <MobileOptimization>
            <Header />
            <main className="min-h-screen bg-gray-50 pt-4">
              {children}
            </main>
          </MobileOptimization>
        </AuthProvider>
      </body>
    </html>
  );
}
