"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Image as ImageIcon, Video, Heart, Clock, ChevronRight, Baby, Cloud, Star } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BlurText from "@/components/BlurText";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Parent";
  const [stars, setStars] = React.useState<{left: string, top: string, width: string, height: string, duration: string}[]>([]);
  const [stats, setStats] = React.useState({
    totalMemories: 0,
    videos: 0,
    favorites: 0,
    capsules: 0
  });
  
  // On This Day & Quick Journal States
  const [onThisDayMemories, setOnThisDayMemories] = React.useState<any[]>([]);
  const [isFetchingOnThisDay, setIsFetchingOnThisDay] = React.useState(true);
  const [journalContent, setJournalContent] = React.useState("");
  const [isSavingJournal, setIsSavingJournal] = React.useState(false);
  const [selectedEmoji, setSelectedEmoji] = React.useState("😊");

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };

    const fetchOnThisDay = async () => {
      try {
        setIsFetchingOnThisDay(true);
        // Get all memories and filter on client to find same month/day
        const res = await fetch("/api/memories");
        const data = await res.json();
        
        if (data.memories) {
          const today = new Date();
          const matches = data.memories.filter((m: any) => {
            const memoryDate = new Date(m.date || m.createdAt);
            return memoryDate.getMonth() === today.getMonth() && 
                   memoryDate.getDate() === today.getDate() &&
                   memoryDate.getFullYear() !== today.getFullYear(); // Usually "On This Day" means past years
          });
          setOnThisDayMemories(matches);
        }
      } catch (e) {
        console.error("Failed to fetch On This Day memories", e);
      } finally {
        setIsFetchingOnThisDay(false);
      }
    };

    fetchStats();
    fetchOnThisDay();
    
    const newStars = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 3 + 2}s`
    }));
    setStars(newStars);
  }, []);

  const handleSaveJournal = async () => {
    if (!journalContent.trim()) return;
    
    try {
      setIsSavingJournal(true);
      const formData = new FormData();
      formData.append('title', `Journal: ${selectedEmoji}`);
      formData.append('description', journalContent);
      formData.append('date', new Date().toISOString());
      formData.append('type', 'photo'); // Default type
      
      const res = await fetch("/api/memories", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setJournalContent("");
        alert("Journal entry saved to your vault!");
        // Optionally refresh stats
        const statsRes = await fetch("/api/stats");
        const statsData = await statsRes.json();
        if (statsRes.ok) setStats(statsData);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save journal entry.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving.");
    } finally {
      setIsSavingJournal(false);
    }
  };

  return (
    <motion.div 
      className="pb-24 relative overflow-hidden"
      variants={container}
      initial="hidden"
      animate="show"
    >


      <motion.div variants={item} className="mb-8 md:mb-12 relative">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-ruby-rose/20 blur-3xl rounded-full animate-pulse" />
        <div className="flex items-center gap-3 mb-2">
          <BlurText
            text={`Welcome back, ${userName}`}
            delay={150}
            animateBy="words"
            direction="top"
            className="text-4xl md:text-5xl font-heading font-black tracking-tight font-attract"
          />
          <Baby className="w-8 h-8 text-ruby-rose animate-bounce" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-royal-gold/50" />
          <p className="text-muted text-sm font-semibold tracking-tight italic opacity-90">
            Reliving the <span className="text-ruby-rose font-bold">magic</span> of every precious second.
          </p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Memories", value: stats.totalMemories, icon: ImageIcon, color: "text-white", bg: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/50", textCol: "text-purple-600 dark:text-purple-400" },
          { label: "Videos", value: stats.videos, icon: Video, color: "text-white", bg: "bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/50", textCol: "text-rose-600 dark:text-rose-400" },
          { label: "Favorites", value: stats.favorites, icon: Heart, color: "text-white", bg: "bg-gradient-to-br from-pink-500 to-pink-700 shadow-pink-500/50", textCol: "text-pink-600 dark:text-pink-400" },
          { label: "Capsules", value: stats.capsules, icon: Sparkles, color: "text-white", bg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/50", textCol: "text-orange-500 dark:text-orange-400" },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-[2rem] flex items-center gap-5 hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-4xl font-black font-attract tracking-tighter drop-shadow-sm ${stat.textCol}`}>{stat.value}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-4xl font-heading font-black flex items-center gap-3 font-attract tracking-tighter">
                <Clock className="w-10 h-10 text-ruby-rose animate-pulse" />
                Recent <span className="text-ruby-rose">Memories</span>
              </h2>
              <Link href="/upload" className="btn-crystal px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center group shadow-xl bg-gradient-to-r from-ruby-rose to-pink-600 text-white">
                Add New <Sparkles className="ml-2 w-4 h-4 group-hover:rotate-12" />
              </Link>
            </div>

            <div className="scrapbook-grid rounded-[3rem] shadow-inner bg-white/30 dark:bg-zinc-900/40 p-6 flex flex-wrap gap-8 justify-center">
              <div 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      // We can store the file in a global state or just redirect to upload with a hint
                      // For now, let's redirect to upload which is the standard way to handle the formal upload
                      window.location.href = `/upload?preselect=true`;
                    }
                  };
                  input.click();
                }}
                className="w-full md:w-auto cursor-pointer"
              >
                <div className="polaroid-frame flex flex-col items-center justify-center min-h-[300px] w-full md:w-[250px] border-2 border-dashed border-zinc-300 hover:border-ruby-rose hover:bg-ruby-rose/5 transition-all group">
                  <div className="w-16 h-16 bg-zinc-100 group-hover:bg-ruby-rose/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                      <ImageIcon className="w-8 h-8 text-zinc-400 group-hover:text-ruby-rose transition-colors" />
                  </div>
                  <p className="font-attract text-zinc-500 group-hover:text-ruby-rose">First Smile...</p>
                  <span className="text-[10px] text-zinc-400 mt-2 font-black uppercase">Click to Browse</span>
                </div>
              </div>

              <div 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.click();
                }}
                className="w-full md:w-auto cursor-pointer"
              >
                <div className="polaroid-frame flex flex-col items-center justify-center min-h-[300px] w-full md:w-[250px] border-2 border-dashed border-zinc-300 rotate-[3deg] hover:rotate-0 hover:border-amethyst hover:bg-amethyst/5 transition-all group">
                  <div className="w-16 h-16 bg-zinc-100 group-hover:bg-amethyst/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                      <Baby className="w-8 h-8 text-zinc-400 group-hover:text-amethyst transition-colors" />
                  </div>
                  <p className="font-attract text-zinc-500 group-hover:text-amethyst">First Steps</p>
                  <span className="text-[10px] text-zinc-400 mt-2 font-black uppercase">Click to Browse</span>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Sidebar Widgets Area */}
        <div className="space-y-8">
          <motion.div variants={item} className="glass-card p-8 rounded-[3rem] relative overflow-hidden bg-white/80 dark:bg-zinc-900/40 shadow-2xl border-white/40">
            <div className="absolute top-0 right-0 w-48 h-48 bg-royal-gold/10 blur-[60px] pointer-events-none rounded-full" />
            <h3 className="text-2xl font-heading font-black mb-6 flex items-center gap-3 font-attract tracking-tighter">
              <Sparkles className="w-7 h-7 text-royal-gold" />
              On This Day
            </h3>
            <div className="rounded-[2rem] overflow-hidden relative mb-4 bg-zinc-50 dark:bg-zinc-800/50 p-6 min-h-[180px] text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
              {isFetchingOnThisDay ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-gold"></div>
              ) : onThisDayMemories.length > 0 ? (
                <div className="w-full">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 group">
                    <img 
                      src={onThisDayMemories[0].mediaUrl || onThisDayMemories[0].imageUrl} 
                      alt={onThisDayMemories[0].title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <Link 
                      href="/gallery"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-10 h-10 text-white" />
                    </Link>
                  </div>
                  <p className="font-attract text-zinc-800 dark:text-zinc-200 text-lg line-clamp-1">{onThisDayMemories[0].title}</p>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                    {new Date(onThisDayMemories[0].date).getFullYear()} • {onThisDayMemories.length} matches
                  </p>
                </div>
              ) : (
                <>
                  <Calendar className="w-10 h-10 text-muted opacity-30 mb-4" />
                  <span className="text-sm text-muted font-black uppercase tracking-widest text-center px-4">No past memories found for today</span>
                </>
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-card p-8 rounded-[3rem] bg-gradient-to-br from-white/90 to-amethyst/10 border-amethyst/20 shadow-2xl">
            <h3 className="text-2xl font-heading font-black mb-6 text-amethyst font-attract tracking-tighter flex items-center gap-3">
              <Heart className="w-7 h-7 text-amethyst fill-amethyst/20" /> Quick Journal
            </h3>
            <textarea 
              className="w-full bg-white/50 dark:bg-black/30 border-2 border-transparent focus:border-amethyst rounded-2xl p-6 text-lg font-bold outline-none transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 resize-none"
              rows={4}
              placeholder="Record a tiny moment..."
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              disabled={isSavingJournal}
            ></textarea>
            <div className="mt-6 flex justify-between items-center">
              <div className="flex gap-3">
                {['😊', '❤️', '🥺', '😂'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all text-lg shadow-md hover:scale-110 active:scale-90 ${selectedEmoji === emoji ? 'bg-amethyst text-white scale-110' : 'bg-white/80 hover:bg-white'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleSaveJournal}
                disabled={isSavingJournal || !journalContent.trim()}
                className="btn-crystal px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-amethyst text-white"
              >
                {isSavingJournal ? "Saving..." : "Save Note"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
