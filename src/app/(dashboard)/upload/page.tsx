"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
       setError("Title is required");
       return;
    }
    
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("date", date || new Date().toISOString());
      formData.append("description", description);
      formData.append("pin", pin);
      
      if (file) {
        formData.append("file", file);
        if (file.type.startsWith("video/")) {
          formData.append("type", "video");
        } else if (file.type.startsWith("audio/")) {
          formData.append("type", "audio");
        } else {
          formData.append("type", "photo");
        }
      } else {
        formData.append("type", "note");
      }

      const res = await fetch("/api/memories", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");

      router.push("/gallery");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="pb-24 max-w-4xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-heading font-black mb-6 tracking-tighter font-attract">
          Vault <span className="text-gradient">Secrets</span>
        </h1>
        <p className="text-muted text-xl font-medium tracking-tight border-b-2 border-amethyst pb-4 inline-block italic">
          "Each upload is a diamond in your child's crown."
        </p>
      </div>

      <div className="glass-card p-10 md:p-20 rounded-[4rem] shadow-3xl border border-white/40 dark:border-white/10 relative overflow-hidden bg-white/70 dark:bg-zinc-900/60">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amethyst/10 blur-[100px] pointer-events-none rounded-full" />
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*,video/*" 
        />
        
        <motion.div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`group border-[3px] border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all mb-12 relative overflow-hidden ${
            isDragging 
              ? "border-emerald bg-emerald/10 scale-105" 
              : "border-amethyst/30 dark:border-amethyst/20 bg-gradient-to-br from-white/30 to-amethyst/5 dark:from-black/20 dark:to-amethyst/10 hover:border-amethyst"
          }`}
        >
          {file ? (
             <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-black truncate max-w-sm font-attract text-zinc-900 dark:text-zinc-100">{file.name}</h3>
                <p className="text-amethyst font-black uppercase tracking-widest text-xs mt-4 italic">Crystal Clear! Click to Swap</p>
             </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-gradient-to-tr from-amethyst to-ruby-rose text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                <UploadCloud className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-heading font-black mb-4 font-attract">Deposit a Memory</h3>
              <p className="text-muted text-lg max-w-sm font-medium">Photos, 4K Videos, or handwritten notes. Your vault handles everything.</p>
            </>
          )}
        </motion.div>

        {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-2xl text-center font-bold font-attract">ERROR: {error}</div>}

        <form className="space-y-10" onSubmit={handleUpload}>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-[0.3em] ml-2 text-muted">Memory Label</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. The First Symphony" 
                className="w-full bg-white/50 dark:bg-black/30 border-2 border-transparent focus:border-amethyst rounded-2xl px-8 py-5 outline-none transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 font-bold"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-[0.3em] ml-2 text-muted">Cosmic Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/30 border-2 border-transparent focus:border-amethyst rounded-2xl px-8 py-5 outline-none transition-all text-zinc-900 dark:text-zinc-100 font-bold" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.3em] ml-2 text-muted">The Storyteller's Note</label>
            <textarea 
              rows={4} 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell the legend of this precious moment..." 
              className="w-full bg-white/50 dark:bg-black/30 border-2 border-transparent focus:border-amethyst rounded-[2rem] px-8 py-6 outline-none transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 font-bold resize-none">
            </textarea>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.3em] ml-2 text-muted">Secure with PIN (Optional)</label>
            <div className="relative">
              <input 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Set a 4-digit PIN to lock this memory" 
                className="w-full bg-white/50 dark:bg-black/30 border-2 border-transparent focus:border-amethyst rounded-2xl px-14 py-5 outline-none transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 font-bold"
              />
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-amethyst/50" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amethyst/60 ml-2">Keep it secret. Keep it safe.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-4 text-xs font-black text-muted uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800/50 px-6 py-3 rounded-full">
              <Lock className="w-5 h-5 text-emerald" /> 
              <span>End-to-End Encrypted Vault</span>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto btn-crystal px-12 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-4 active:scale-95 shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>Upload Memory <CheckCircle2 className="w-6 h-6" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
