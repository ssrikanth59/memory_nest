"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock, Gift, Unlock, Loader2 } from "lucide-react";
import { useSearch } from "@/components/providers/SearchProvider";

export default function TimeCapsulePage() {
  const { searchQuery } = useSearch();
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [capsuleName, setCapsuleName] = useState("");
  const [isManualLocked, setIsManualLocked] = useState(true);
  const [capsules, setCapsules] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedCapsule, setSelectedCapsule] = useState<any>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    fetchCapsules();
  }, []);

  const fetchCapsules = async () => {
    try {
      const res = await fetch("/api/capsules");
      const data = await res.json();
      if (data.capsules) setCapsules(data.capsules);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !unlockDate || !pin) {
      alert("Please provide content, an unlock date, and a security PIN.");
      return;
    }

    if (pin.length !== 4) {
      alert("PIN must be exactly 4 digits.");
      return;
    }
    try {
      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          unlockDate, 
          pin, 
          name: capsuleName,
          status: isManualLocked ? 'locked' : 'unlocked' 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCapsules([data.capsule, ...capsules]);
        setContent("");
        setUnlockDate("");
        setPin("");
        setCapsuleName("");
        alert("Capsule locked successfully! See you in the future.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCapsule = (capsule: any) => {
    // If there's a PIN, we always show the PIN entry modal first
    if (capsule.pin) {
      setSelectedCapsule(capsule);
      setPinInput("");
      setPinError(false);
    } else {
      // If no PIN and it's time-unlocked or manually unlocked, show content
      const isTimeUnlocked = new Date(capsule.unlockDate) <= new Date();
      const isUnlocked = isTimeUnlocked || capsule.status === 'unlocked';
      
      if (isUnlocked) {
        setSelectedCapsule(capsule);
      }
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === selectedCapsule.pin) {
      setPinError(false);
      // We don't need a separate isUnlocked state here because we can just use selectedCapsule.pinMatch or similar
      // But simpler is to modify the selectedCapsule in state to mark it as verified
      setSelectedCapsule({ ...selectedCapsule, pinVerified: true });
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  return (
    <motion.div 
      className="pb-24 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 font-attract">
          Future <span className="text-gradient">Letters</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">
          Write heartfelt digital letters holding your emotions today. Lock them securely and set a magical future unlock date for your child.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl h-fit border-orange-200/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-3xl rounded-full" />
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-400 to-pink-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <Gift className="w-7 h-7" />
          </div>
          <h3 className="text-3xl font-black font-attract tracking-tighter mb-8">Create New Capsule</h3>
          
          <form className="space-y-6" onSubmit={handleSeal}>
            <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl mb-6 items-center">
              <button
                type="button"
                onClick={() => setIsManualLocked(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  isManualLocked 
                    ? "bg-white dark:bg-zinc-800 shadow-lg text-teal-dark dark:text-yellow-warm scale-[1.02]" 
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <Lock className={`w-4 h-4 ${isManualLocked ? "text-orange-400" : "text-zinc-400"}`} />
                Locked
              </button>
              <button
                type="button"
                onClick={() => setIsManualLocked(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  !isManualLocked 
                    ? "bg-white dark:bg-zinc-800 shadow-lg text-teal-dark dark:text-yellow-warm scale-[1.02]" 
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <Unlock className={`w-4 h-4 ${!isManualLocked ? "text-teal-light" : "text-zinc-400"}`} />
                Unlocked
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Open On</label>
              <input 
                type="date" 
                required
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-orange-400 rounded-2xl px-6 py-4 outline-none transition-all font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Capsule Name</label>
              <input 
                type="text" 
                required
                value={capsuleName}
                onChange={(e) => setCapsuleName(e.target.value)}
                placeholder="e.g., Leo's First Steps" 
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-orange-400 rounded-2xl px-6 py-4 outline-none transition-all font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Letter Content</label>
              <textarea 
                rows={6} 
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="My dearest Leo, watching you sleep today makes me realize..." 
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-orange-400 rounded-2xl px-6 py-4 outline-none transition-all font-medium resize-none"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Secure with 4-Digit PIN (Required)</label>
              <div className="relative">
                <input 
                  type="password" 
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Set your 4-digit PIN" 
                  className="w-full bg-white/50 dark:bg-black/20 border-2 border-transparent focus:border-orange-400 rounded-2xl px-12 py-4 outline-none transition-all font-bold" 
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400/50" />
              </div>
            </div>
             <button 
               type="submit" 
               disabled={loading}
               className={`w-full mt-4 bg-gradient-to-r ${
                 isManualLocked ? "from-orange-400 to-pink-500 shadow-[0_10px_30px_-5px_rgba(251,146,60,0.5)]" : "from-teal-light to-teal-dark shadow-[0_10px_30px_-5px_rgba(42,157,143,0.4)]"
               } text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3`}
             >
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                 <>
                   {isManualLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                   {isManualLocked ? "Seal Capsule" : "Create Open Capsule"}
                 </>
               )}
             </button>
          </form>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-black font-attract tracking-tighter mb-6 flex items-center gap-3">
            <Clock className="w-7 h-7 text-pink-500 animate-pulse" /> Active Capsules
          </h3>

          {isFetching ? (
             <div className="flex justify-center p-12">
               <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
             </div>
          ) : capsules.length === 0 ? (
            <div className="glass-card p-12 rounded-[2.5rem] text-center bg-white/40 dark:bg-zinc-900/40 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
               <Lock className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No locked time capsules yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {capsules
                .filter(capsule => 
                  (capsule.name && capsule.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  capsule.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  new Date(capsule.unlockDate).toLocaleDateString().includes(searchQuery)
                )
                .map((capsule) => {
                  const isTimeUnlocked = new Date(capsule.unlockDate) <= new Date();
                const isUnlocked = isTimeUnlocked || capsule.status === 'unlocked';
                
                return (
                  <motion.div 
                    key={capsule._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleOpenCapsule(capsule)}
                    className="glass-card p-6 rounded-[2rem] border border-white/40 flex items-center gap-5 group transition-all cursor-pointer hover:scale-[1.02] hover:bg-white/60 dark:hover:bg-zinc-900/60"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                      isUnlocked ? "bg-emerald text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    )}>
                      {capsule.pin ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">
                        {isUnlocked ? (capsule.status === 'unlocked' ? "Always Open" : "Unlocked on") : "Unlocks on"}
                      </p>
                      <p className="font-bold text-lg text-zinc-800 dark:text-zinc-200 truncate">
                        {capsule.name || "Untitled Capsule"}
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500">
                        {capsule.status === 'unlocked' && !isTimeUnlocked ? "Manual Access" : new Date(capsule.unlockDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {isUnlocked && capsule.pin && (
                       <div className="text-[10px] font-black bg-royal-gold/10 text-royal-gold px-3 py-1 rounded-full uppercase">PIN PROTECTED</div>
                    )}
                    {capsule.status === 'unlocked' && (
                       <div className="text-[10px] font-black bg-emerald/10 text-emerald px-3 py-1 rounded-full uppercase">Open</div>
                    )}
                    {!isUnlocked && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase">Scheduled</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PIN / Content Modal */}
      <AnimatePresence>
        {selectedCapsule && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedCapsule(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card max-w-2xl w-full p-10 rounded-[3rem] shadow-[0_0_100px_rgba(251,146,60,0.1)] border-white/20 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedCapsule(null)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
              >
                <Lock className="w-6 h-6 rotate-45" />
              </button>

              {(selectedCapsule.pin && !selectedCapsule.pinVerified) ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <Lock className="w-10 h-10 text-white animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-black font-attract mb-4">Security Check</h2>
                  <p className="text-zinc-500 mb-8 font-bold">Please enter the 4-digit PIN to read this letter.</p>
                  
                  <form onSubmit={handlePinSubmit} className="space-y-6 max-w-xs mx-auto">
                    <input 
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      autoFocus
                      className={cn(
                        "w-full bg-white/10 dark:bg-black/40 border-2 rounded-2xl px-6 py-4 text-center text-4xl font-black tracking-[1em] outline-none transition-all",
                        pinError ? "border-red-500 animate-shake" : "border-orange-400/50 focus:border-orange-400"
                      )}
                    />
                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-orange-400/30 transition-all active:scale-95"
                    >
                      Unlock Letter
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 uppercase tracking-widest text-[10px] font-black text-zinc-400">
                    <Unlock className="w-4 h-4 text-emerald" />
                    Message from {new Date(selectedCapsule.createdAt).toLocaleDateString()}
                  </div>
                  <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-emerald rounded-full" />
                    <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-zinc-800 dark:text-zinc-200">
                      "{selectedCapsule.content}"
                    </p>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Signed with love</p>
                      <p className="font-attract text-2xl text-gradient">Your Parents</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Add local cn helper if not imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
