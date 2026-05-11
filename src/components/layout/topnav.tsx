"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, LogOut, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useSearch } from "@/components/providers/SearchProvider";

export function TopNav() {
  const { data: session } = useSession();
  const { searchQuery, setSearchQuery } = useSearch();
  const userName = session?.user?.name || "User";
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "Aarya's 3rd Month!", desc: "Time to update the growth chart.", time: "2h ago", isNew: true },
    { id: 2, title: "New Memory Added", desc: "Dad uploaded 3 new photos.", time: "5h ago", isNew: true },
    { id: 3, title: "Vaccine Reminder", desc: "Upcoming appointment next week.", time: "1d ago", isNew: false },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between pointer-events-none relative z-50">
      <div className="flex items-center gap-4 pointer-events-auto w-full md:w-auto">
        <button className="md:hidden glass-card p-3 rounded-full hover:bg-white/60 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-3 glass-card rounded-2xl pl-6 pr-2 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/60 focus-within:ring-2 focus-within:ring-ruby-rose transition-all w-96 shadow-2xl group">
          <Search className="w-5 h-5 text-ruby-rose" />
          <input 
            type="text" 
            placeholder="Search the vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Focus out on enter to "submit" search visually
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="bg-transparent border-none outline-none text-base w-full placeholder:text-zinc-600 font-black text-zinc-900 dark:text-white"
          />
          <button 
            type="button"
            onClick={() => {
              // Focus out to "submit" search visually
              const input = document.querySelector('input[placeholder="Search the vault..."]') as HTMLInputElement;
              if (input) input.blur();
            }}
            className="bg-ruby-rose text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-ruby-rose/90 transition-all active:scale-95 shadow-md flex items-center gap-2 shrink-0"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnread(false);
            }}
            className="glass-card p-3.5 rounded-2xl hover:bg-white/60 transition-all relative shadow-lg group bg-white/80 dark:bg-black/80 backdrop-blur-xl cursor-pointer"
          >
            <Bell className="w-6 h-6 text-ruby-rose group-hover:animate-bounce" />
            {hasUnread && <span className="absolute top-3 right-3 w-3 h-3 bg-ruby-rose rounded-full border-2 border-white animate-pulse"></span>}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-80 sm:w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/20 dark:border-zinc-700/50 overflow-hidden z-50"
              >
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-800/80">
                  <div>
                    <h3 className="font-black text-lg tracking-tight text-zinc-900 dark:text-white">Notifications</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Recent Activity</p>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2 bg-white/50 dark:bg-zinc-900/50">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-start gap-4 relative group cursor-pointer">
                      {notif.isNew && <div className="absolute left-2 top-6 w-1.5 h-1.5 bg-ruby-rose rounded-full shadow-[0_0_8px_rgba(255,45,85,0.8)]"></div>}
                      <div className={`p-3 rounded-xl flex-shrink-0 mt-1 ${notif.isNew ? 'bg-ruby-rose/15 text-ruby-rose dark:bg-ruby-rose/20' : 'bg-emerald/15 text-emerald dark:bg-emerald/20'}`}>
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm mb-1 text-zinc-900 dark:text-zinc-100">{notif.title}</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mb-2 leading-relaxed">{notif.desc}</p>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer">
                  <span className="text-xs font-black text-ruby-rose uppercase tracking-widest">Mark all as read</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="hidden sm:flex items-center gap-4 glass-card pl-2 pr-6 py-2 rounded-2xl cursor-pointer hover:bg-white/80 transition-all shadow-xl group bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/40">
          <div className="p-1 rounded-xl bg-gradient-to-tr from-ruby-rose to-amethyst">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ff2d55&color=fff&bold=true`} 
              alt={userName} 
              className="w-10 h-10 rounded-lg" 
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-ruby-rose font-black uppercase tracking-[0.2em] leading-none mb-1">Authenticated</span>
            <span className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 font-attract truncate max-w-[150px]">
              {userName}
            </span>
          </div>
        </div>
        
        {/* Mobile/Quick Logout Button */}
        <button 
          onClick={() => {
            signOut({ redirect: false }).then(() => {
              window.location.replace("/login");
            });
          }}
          className="glass-card p-3.5 rounded-2xl bg-white/80 dark:bg-black/80 hover:bg-red-500/20 text-ruby-rose transition-all shadow-lg active:scale-95 border border-white/40"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
