import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fermer Pro - Qishloq Xo'jaligi Boshqaruvi",
  description: "Zamonaviy fermerlik boshqaruv tizimi",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // O'ZGARISH: h-full classi qo'shildi
    <html lang="uz" className="h-full">
      <body className={`font-sans antialiased h-full`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
