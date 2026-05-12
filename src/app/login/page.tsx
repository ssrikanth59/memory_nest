"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("Database") || res.error.includes("authentication failed")) {
          // Auto-transition to demo mode if DB is unreachable
          router.push("/dashboard?demo=true");
        } else {
          setError(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      // Force redirect. If the server successfully authenticated but the browser threw a network error,
      // the secure cookie is already set. If they are truly unauthenticated, the dashboard will safely kick them back.
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    router.push("/dashboard?demo=true");
  };

  return (
    <div className="min-h-screen flex items-center justify-end p-0 relative bg-black md:pr-12 lg:pr-24">
      {/* Dynamic Background Image - High Quality Setup */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: 'url("/images/login-bg.png")',
          imageRendering: 'auto'
        }}
      >
        {/* Subtle overlay to enhance contrast without losing image detail */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg my-8 glass-card p-8 md:p-16 rounded-none md:rounded-[3rem] relative overflow-hidden border border-white/30 z-10 shadow-2xl backdrop-blur-3xl flex flex-col justify-center"
      >
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/40 text-rose-500 mb-6 shadow-xl backdrop-blur-sm"
          >
            <Heart className="w-8 h-8 fill-rose-500" />
          </motion.div>
          <h1 className="text-4xl font-heading font-extrabold mb-2 text-rose-950 tracking-tight drop-shadow-sm">Welcome Back</h1>
          <p className="text-rose-900/70 font-medium tracking-tight">Access your baby's digital sanctuary</p>
        </div>

        {error && !error.includes("Database") && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-600/90 border-2 border-red-400 text-white text-sm py-4 px-4 rounded-xl mb-6 text-center font-bold shadow-xl backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1 text-rose-950/80">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-900/40 group-focus-within:text-rose-900 transition-colors" />
              <input 
                type="email" 
                suppressHydrationWarning
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/40 border-2 border-white/40 focus:border-rose-300 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all placeholder:text-rose-900/30 text-rose-950 font-bold shadow-sm backdrop-blur-md" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black uppercase tracking-widest text-rose-950/80">Password</label>
              <Link href="#" className="text-[10px] text-rose-900/60 hover:text-rose-900 hover:underline font-black uppercase tracking-widest">Forgot Password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-900/40 group-focus-within:text-rose-900 transition-colors" />
              <input 
                type="password" 
                suppressHydrationWarning
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/40 border-2 border-white/40 focus:border-rose-300 rounded-2xl pl-12 pr-6 py-4 outline-none transition-all placeholder:text-rose-900/30 text-rose-950 font-bold shadow-sm backdrop-blur-md" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-rose-500 text-white hover:bg-rose-600 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-rose-500/20 disabled:opacity-70"
          >
            {loading ? "Signing in..." : (
              <>
                Sign In <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-rose-950/70 font-bold">
            Don't have an account?{" "}
            <Link href="/register" className="text-rose-600 font-black hover:underline">
              Create a vault
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
