"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";
import { SearchProvider } from "@/components/providers/SearchProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true';
      if (!isDemo) {
        router.push("/login");
        return;
      }
      setChecking(false);
      return;
    }
    
    if (status === "authenticated") {
      setChecking(false);
      return;
    }
  }, [status, router]);

  if (status === "loading" || checking) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="absolute inset-0 bg-aurora opacity-50" />
        <div className="relative flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-teal-light animate-spin mb-4" />
          <p className="text-teal-dark dark:text-teal-light font-bold animate-pulse text-lg tracking-wider">Opening Sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <SearchProvider>
      {/* Dashboard Background Image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/dashboard-bg.png')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/10" />

      <div className="flex h-screen overflow-hidden bg-transparent">
        <motion.div 
          key="dashboard-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-screen overflow-hidden bg-transparent w-full"
        >
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto relative">
              <TopNav />
              <main className="p-6 lg:p-10">
                <div className="w-full max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </motion.div>
      </div>
    </SearchProvider>
  );
}
