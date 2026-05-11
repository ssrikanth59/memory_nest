import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import React from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta"
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit"
});

export const metadata: Metadata = {
  title: "MemoryNest | Every Little Moment Deserves Forever",
  description: "An emotional digital baby memory vault for parents to securely preserve their child's memories forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${outfit.variable} antialiased selection:bg-pink-100 selection:text-pink-900 dark:selection:bg-pink-900 dark:selection:text-pink-100`}>
        <AuthProvider>
          <div className="bg-aurora pointer-events-none" />
          <main className="relative z-10 min-h-screen flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
