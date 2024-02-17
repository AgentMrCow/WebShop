// @/app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import BootstrapNext from '@/app/(component)/BootstrapNext';
import { Toaster } from "@/components/ui/toaster"
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const ShoppingCartComponentWithProvider = dynamic(() => import('@/app/(component)/ShoppingCart'), { ssr: false });
const Breadcrumbs = dynamic(() => import('@/app/(component)/breadcrumbs'), { ssr: false });


export const metadata: Metadata = {
  title: "IERG4210 WebShop",
  description: "Created by Niu Ka Ngai 1155174712",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const defaultBreadcrumbs:[] = [];
  <BootstrapNext />
  return (
    <html lang="en">
      <body className={inter.className}>

            <header>
              <ShoppingCartComponentWithProvider/>
            </header>

            <nav aria-label="breadcrumb">
            <Breadcrumbs breadcrumbs={defaultBreadcrumbs}/>
            </nav>

            <main>
              <section className="main">
                {children}
              </section>
            </main>

            <footer className="py-3 my-4">
              <ul className="nav justify-content-center border-bottom pb-3 mb-3">
                <li className="nav-item"><a href="#" className="nav-link px-2 text-muted">Return to Top</a></li>
              </ul>
              <p className="text-center text-muted">Copyright © 2024 Niu Ka Ngai. All rights reserved.</p>
            </footer>
            <Toaster />

          <BootstrapNext />
      </body>
    </html>

  );
};
