"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vaultPin, setVaultPin] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Ensure any old sessions are cleared when starting registration
  useEffect(() => {
    signOut({ redirect: false });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, vaultPin }),
      });

      if (res.ok) {
        setIsSuccess(true);
        // We STAY on this page. We do NOT open any dashboard.
        // The user must manually click "Sign in" at the bottom.
      } else {
        const data = await res.json();
        setError(data.message || "An error occurred");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end p-0 relative z-0 bg-black md:pr-12 lg:pr-24">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/login-bg.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-xl glass-card p-10 md:p-14 py-12 rounded-none md:rounded-[3rem] relative border border-white/40 shadow-2xl text-white z-10 backdrop-blur-3xl flex flex-col justify-center my-8"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/40 text-rose-500 mb-8 shadow-xl backdrop-blur-sm">
            <Heart className="w-10 h-10 fill-rose-500" />
          </div>
          <h1 className="text-5xl font-heading font-black mb-4 font-attract tracking-tighter text-rose-950">New Legacy</h1>
          <p className="text-rose-900/70 text-lg font-medium italic">Join the <span className="text-rose-950 font-bold">aurora of memories</span></p>
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-6 bg-white/20 rounded-[2rem] border border-white/40 backdrop-blur-md shadow-inner"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-rose-950 mb-4 tracking-tight">Registration Successful!</h2>
              <p className="text-rose-900 font-bold text-lg mb-4 italic leading-relaxed">
                Your account has been created.
              </p>
              <p className="text-rose-950/80 font-black uppercase text-xs tracking-[0.2em] mt-8 bg-rose-500/10 p-4 rounded-xl">
                Please click the <span className="text-rose-600 underline">Sign In</span> link below to enter.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white text-sm p-4 rounded-2xl mb-6 text-center font-bold backdrop-blur-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-rose-950/80">Full Name</label>
                  <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-white/40 border-2 border-white/40 focus:border-rose-300 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-rose-900/30 text-rose-950 font-bold shadow-sm backdrop-blur-md" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-rose-950/80">Email Address</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/40 border-2 border-white/40 focus:border-rose-300 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-rose-900/30 text-rose-950 font-bold shadow-sm backdrop-blur-md" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-rose-950/80">Secure Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/40 border-2 border-white/40 focus:border-rose-300 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-rose-900/30 text-rose-950 font-bold shadow-sm backdrop-blur-md" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-rose-950/80">Vault PIN</label>
                  <input type="password" placeholder="1234" maxLength={4} pattern="\d*" inputMode="numeric" value={vaultPin} onChange={(e) => setVaultPin(e.target.value)} required className="w-full bg-white/40 border-2 border-white/40 focus:border-rose-300 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-rose-900/30 text-rose-950 font-bold shadow-sm backdrop-blur-md" />
                </div>

                <button disabled={loading} type="submit" className="w-full mt-4 bg-rose-500 text-white hover:bg-rose-600 py-5 rounded-2xl font-black text-xl tracking-tight flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-rose-500/20">
                  {loading ? "Creating..." : "Join Now"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-10 text-center text-sm font-bold relative z-10 text-rose-950/70">
          Already have a vault? <Link href="/login" className="text-rose-600 font-black hover:underline uppercase tracking-widest ml-1">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}