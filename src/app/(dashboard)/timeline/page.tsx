"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Calendar, ImageIcon, Video, Star, Clock } from "lucide-react";
import Link from "next/link";
import BlurText from "@/components/BlurText";

export default function TimelinePage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/memories");
        const data = await res.json();
        if (data.memories) {
          setMemories(data.memories);
        }
      } catch (e) {
        console.error("Failed to fetch memories", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  return (
    <motion.div 
      className="pb-24 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
        <div>
          <BlurText
            text="Baby Timeline"
            delay={150}
            animateBy="words"
            direction="top"
            className="text-5xl md:text-7xl font-heading font-black mb-4 tracking-tighter font-attract text-gradient"
          />
          <p className="text-muted text-xl font-medium tracking-tight border-l-4 border-emerald pl-4 italic">
            "Every second is a page in their legend."
          </p>
        </div>

        <div className="flex gap-4">
          <button className="glass-card px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-emerald/10 text-sm font-black uppercase tracking-widest transition-all border-emerald/20 font-attract">
            <Filter className="w-5 h-5 text-emerald" /> Filters
          </button>
        </div>
      </div>

      <div className="relative px-4">
        <div className="timeline-glow-line" />

        <div className="space-y-24">
          {loading ? (
            <div className="w-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald"></div>
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-[3rem] border-dashed border-2 border-emerald/30 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent pointer-events-none" />
              <Calendar className="w-20 h-20 text-emerald/30 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h2 className="text-3xl font-heading font-black mb-2 font-attract">The Story Hasn't Begun</h2>
              <p className="text-muted text-lg">Your baby's journey is waiting for its first entry.</p>
              <div className="mt-8">
                <Link href="/upload">
                  <button className="btn-crystal px-10 py-4 rounded-2xl bg-emerald text-white font-black uppercase tracking-widest text-xs">
                    Create First Memory
                  </button>
                </Link>
              </div>
            </div>
          ) : memories.map((memory, i) => (
            <motion.div 
              key={memory._id} 
              className="relative pl-12 md:pl-20 group"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute left-[-1px] md:left-[7px] top-8 w-6 h-6 bg-white dark:bg-black rounded-full border-4 border-emerald z-10 shadow-[0_0_20px_rgba(16,185,123,0.6)] group-hover:scale-125 transition-transform" />

              <div className="glass-card p-10 rounded-[2.5rem] hover:-translate-y-2 transition-all duration-500 bg-white/60 dark:bg-zinc-900/40 shadow-xl border-emerald/10">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-emerald text-white shadow-lg`}>
                    {memory.type === 'video' ? <Video className="w-8 h-8" /> : memory.type === 'star' ? <Star className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-3xl tracking-tight font-attract mb-1">{memory.title}</h3>
                    <div className="flex items-center gap-3 text-emerald font-black uppercase tracking-[0.2em] text-xs">
                      <Calendar className="w-4 h-4" /> {new Date(memory.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {memory.description && (
                  <p className="text-muted text-lg mb-8 leading-relaxed font-medium">{memory.description}</p>
                )}

                {memory.mediaUrl && (
                  <div className="rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/20">
                    <img 
                      src={memory.mediaUrl} 
                      alt={memory.title} 
                      className="w-full h-auto max-h-[600px] object-cover hover:scale-105 transition-transform duration-1000" 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
