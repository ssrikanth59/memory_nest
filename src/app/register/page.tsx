"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vaultPin, setVaultPin] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        // Automatically sign in the user after successful registration
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          router.push("/login?registered=true");
        } else {
          router.push("/dashboard");
        }
      } else {
        const data = await res.json();
        setError(data.message || "An error occurred");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-end p-0 relative z-0 bg-black md:pr-12 lg:pr-24">
      {/* Dynamic Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/login-bg.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl glass-card p-10 md:p-14 py-12 rounded-none md:rounded-[3rem] relative border border-white/40 shadow-2xl text-white z-10 backdrop-blur-3xl flex flex-col justify-center my-8"
      >
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ rotate: -15, scale: 1.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/40 text-rose-500 mb-8 shadow-xl backdrop-blur-sm"
          >
            <Heart className="w-10 h-10 fill-rose-500" />
          </motion.div>
          <h1 className="text-5xl font-heading font-black mb-4 font-attract tracking-tighter drop-shadow-sm">New Legacy</h1>
          <p className="text-white/80 text-lg font-medium italic">Join the <span className="text-white font-bold">aurora of memories</span></p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-white text-sm p-4 rounded-2xl mb-6 text-center font-bold backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-white/90">Full Name</label>
            <input 
              type="text" 
              placeholder="Jane Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/10 border-2 border-white/20 focus:border-white/50 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-white/40 text-white font-bold shadow-sm backdrop-blur-sm" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-white/90">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 border-2 border-white/20 focus:border-white/50 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-white/40 text-white font-bold shadow-sm backdrop-blur-sm" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-white/90">Secure Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 border-2 border-white/20 focus:border-white/50 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-white/40 text-white font-bold shadow-sm backdrop-blur-sm" 
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] ml-1 text-white/90">Vault PIN</label>
            <input 
              type="password" 
              placeholder="1234" 
              maxLength={4}
              pattern="\d*"
              inputMode="numeric"
              value={vaultPin}
              onChange={(e) => setVaultPin(e.target.value)}
              required
              className="w-full bg-white/10 border-2 border-white/20 focus:border-white/50 rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-white/40 text-white font-bold shadow-sm backdrop-blur-sm" 
            />
          </div>

          
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full mt-4 bg-white text-rose-500 hover:bg-white/90 py-5 rounded-2xl font-black text-xl tracking-tight flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-rose-500/20 disabled:opacity-50"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full"
              />
            ) : "Join Now"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm font-bold relative z-10 text-white/80">
          Already have a vault? <Link href="/login" className="text-white font-black hover:underline uppercase tracking-widest ml-1">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}