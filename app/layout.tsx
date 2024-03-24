// @/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from '@/app/(component)/CartContext';
import { SessionProvider } from '@/app/(component)/SessionContext';
import Header from '@/app/(component)/header';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Link from 'next/link';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IERG4210 WebShop",
  description: "Created by Niu Ka Ngai 1155174712",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body className={inter.className}>
          <CartProvider>
            <div className='mx-auto max-w-screen-xl px-4'>

              <Header />

              <main>
                <section className="my-8">
                  {children}
                  <Analytics />
                  <SpeedInsights />
                </section>
              </main>

              <footer className="py-4 my-8">
                <div className="flex justify-center border-b border-gray-200 pb-4 mb-4">
                  <Link href="#" className="mx-2 text-gray-500 hover:text-gray-700">Return to Top</Link>
                </div>
                <p className="text-center text-gray-500">Copyright © 2024 Niu Ka Ngai. All rights reserved.</p>
              </footer>

            </div>
            <Toaster />
          </CartProvider>
        </body>
      </html>
      </SessionProvider>

  );
};
