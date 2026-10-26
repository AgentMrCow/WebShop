// @/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import AppProviders from '@/app/(component)/SessionContext';
import Header from '@/app/(component)/header';
import Link from 'next/link';
import "./globals.css";

export const metadata: Metadata = {
  title: "IERG4210 WebShop",
  description: "WebShop by Nelson Niu — an interactive e-commerce course project with a product catalogue, shopping cart and test checkout.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
        <html lang="en">
          <body className="font-sans antialiased">
            <AppProviders>
              <div id="top" className='mx-auto max-w-screen-xl px-4'>

                <Header />

                <main>
                  <section>
                    {children}
                  </section>
                </main>

                <footer className="py-4 my-8">
                  <div className="flex justify-center border-b border-gray-200 pb-4 mb-4">
                    <Link href="#top" className="mx-2 text-gray-500 hover:text-gray-700">Return to Top</Link>
                  </div>
                  <p className="text-center text-gray-500">Copyright © 2024 Niu Ka Ngai. All rights reserved.</p>
                  <p className="mt-2 text-center text-sm text-gray-500">Course project · Prices in USD · Test checkout only, no real payment.</p>
                </footer>

              </div>
              <Toaster />
            </AppProviders>
          </body>
        </html>

  );
};
