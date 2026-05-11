"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Heart, 
  LayoutDashboard, 
  Clock, 
  Image as ImageIcon, 
  BookOpen, 
  Lock, 
  Users, 
  LineChart, 
  Settings,
  Plus,
  User,
  LogOut
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Journal", href: "/upload", icon: BookOpen },
  { name: "Time Capsule", href: "/capsule", icon: Lock },
  { name: "Growth Tracker", href: "/dashboard", icon: LineChart },
  { name: "Family", href: "/family", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] my-4 ml-4 sticky top-4 overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-2xl shadow-[0_0_40px_-10px_rgba(255,204,51,0.2)] border border-white/10">
      <div className="p-8 pb-4 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-royal-gold to-emerald p-2.5 rounded-2xl shadow-[0_0_20px_rgba(255,204,51,0.4)]">
          <Heart className="text-white fill-white w-6 h-6 animate-pulse" />
        </div>
        <span className="font-heading font-black text-2xl tracking-tight text-gradient drop-shadow-sm">MemoryNest</span>
      </div>

      <div className="px-6 py-8 font-sans">
        <Link 
          href="/upload" 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-royal-gold to-emerald text-black px-4 py-4 rounded-[1.5rem] text-sm font-black shadow-[0_10px_30px_-5px_rgba(255,204,51,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(255,204,51,0.7)] transition-all duration-500 hover:scale-[1.05] active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span className="relative z-10">Add Amazing Memory</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto w-full pb-8 sidebar-scroll">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "w-full group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 relative overflow-hidden",
                isActive 
                  ? "text-black font-black" 
                  : "text-white/80 font-bold hover:text-royal-gold"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gradient-to-r from-royal-gold to-emerald shadow-[0_0_20px_rgba(255,204,51,0.4)] rounded-2xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(255,204,51,0.8)]", isActive ? "stroke-[3px] scale-110" : "text-white/60 group-hover:scale-125")} />
              <span className={cn(
                "text-sm tracking-widest uppercase font-black transition-colors duration-300",
                isActive ? "text-black" : "text-white/80 group-hover:text-royal-gold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile Mini */}
      <div className="p-6">
        <div className="rounded-[2rem] p-5 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl relative group cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-royal-gold/10 to-emerald/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-royal-gold to-emerald p-0.5 shrink-0 shadow-lg group-hover:rotate-6 transition-transform duration-500">
             <div className="w-full h-full bg-black/60 rounded-[calc(1rem-2px)] flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-royal-gold" />
                )}
             </div>
          </div>
          <div className="flex-1 min-w-0 pr-10 relative z-10">
            <p className="text-white font-black text-base truncate font-attract tracking-tighter">
              {session?.user?.name || "Member"}
            </p>
            <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">
              PREMIUM VAULT
            </p>
          </div>
          
          <button 
            type="button"
            onClick={() => signOut()}
            className="absolute right-4 p-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 z-20 group/btn"
          >
            <LogOut className="w-5 h-5 group-active/btn:scale-75 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}
