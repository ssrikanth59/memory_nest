"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Heart, Upload, ArrowRight, Star, Sparkles, Image as ImageIcon, Video, CalendarHeart, X, Mail, Link as LinkIcon, Send, Phone, MessageSquare, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("from_name"),
      email: formData.get("reply_to"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Message sent to MemoryNest team! We will get back to you soon.");
        (e.target as HTMLFormElement).reset();
        setIsContactOpen(false);
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      alert("Error sending message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      {/* Dark overlay for text readability */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
      
      {/* Navbar with Glassmorphism - Mobile Responsive */}
      <nav className="absolute top-4 left-4 right-4 p-3 md:p-4 flex flex-row justify-between items-center z-50 rounded-2xl md:rounded-[2rem] backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-1.5 md:gap-2 text-xl md:text-2xl font-heading font-bold text-teal-dark dark:text-white">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-light/20 rounded-lg md:rounded-xl flex items-center justify-center border border-teal-light/30">
            <Heart className="text-teal-light fill-teal-light w-4 h-4 md:w-6 md:h-6 animate-pulse" />
          </div>
          <span className="tracking-tighter font-black">MemoryNest</span>
        </div>
        <div className="flex gap-3 md:gap-6 items-center">
          <Link href="/login" className="text-[10px] md:text-sm font-black uppercase tracking-widest text-teal-dark dark:text-white/80 hover:text-teal-light transition-colors">
            Log in
          </Link>
          <Link href="/register" className="text-[10px] md:text-sm font-black uppercase tracking-widest bg-gradient-to-r from-teal-light to-teal-dark text-white px-4 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl hover:scale-105 transition-all shadow-lg active:scale-95">
            Start
          </Link>
        </div>
      </nav>

      <div className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-12 md:pt-48 md:pb-24">
        <motion.div 
          className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2.5 rounded-full glass-card mb-6 md:mb-10 shadow-xl border border-teal-light/30 bg-teal-light/5 backdrop-blur-xl">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-emerald-400" />
            <span className="text-[8px] md:text-xs font-black uppercase tracking-[0.2em] text-teal-dark dark:text-teal-light">
              Secure digital time capsule
            </span>
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-heading font-black tracking-tighter text-balance leading-[0.9] mb-6 md:mb-8 text-teal-dark dark:text-white">
            Every Moment <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light via-teal-dark to-yellow-warm italic font-serif">Deserves Forever</span> 
          </motion.h1>

          <motion.p variants={fadeIn} className="text-base md:text-xl lg:text-2xl text-teal-dark/60 dark:text-white/50 max-w-2xl mb-10 md:mb-14 leading-relaxed font-medium">
            Preserve your baby's journey through a sanctuary designed as a <span className="text-teal-dark dark:text-white font-bold">timeless storybook</span>.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center w-full sm:w-auto mt-4">
            <div className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border-2 border-dashed border-white/20 text-white/40 px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-[2rem] text-[10px] md:text-sm font-black uppercase tracking-widest backdrop-blur-sm grayscale">
              <Upload className="w-4 h-4 md:w-5 md:h-5" />
              Upload Memory
            </div>
            <div className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border-2 border-dashed border-white/20 text-white/40 px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-[2rem] text-[10px] md:text-sm font-black uppercase tracking-widest backdrop-blur-sm grayscale">
               Timeline
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Cards - Fully Responsive Grid */}
        <motion.div 
          className="mt-20 md:mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="glass-card p-6 md:p-10 group transition-all hover:-translate-y-2 lg:hover:-translate-y-4 cursor-pointer border-white/20 rounded-[2rem] md:rounded-[3rem]">
            <Link href="/gallery" className="absolute inset-0 z-10" />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-teal-light/20 flex items-center justify-center mb-6 md:mb-8 border border-teal-light/30 group-hover:rotate-12 transition-all">
              <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-teal-light" />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-4 text-teal-dark dark:text-white tracking-tighter">Magical Gallery</h3>
            <p className="text-teal-dark/50 dark:text-white/40 leading-relaxed text-[10px] md:text-xs font-bold uppercase tracking-tight">
              AI-generated storytelling for your photos.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="glass-card p-6 md:p-10 group transition-all hover:-translate-y-2 lg:md:-translate-y-12 lg:hover:-translate-y-16 cursor-pointer border-white/20 rounded-[2rem] md:rounded-[3rem]">
            <Link href="/timeline" className="absolute inset-0 z-10" />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-yellow-warm/20 flex items-center justify-center mb-6 md:mb-8 border border-yellow-warm/30 group-hover:-rotate-12 transition-all">
              <CalendarHeart className="w-6 h-6 md:w-8 md:h-8 text-yellow-warm" />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-4 text-teal-dark dark:text-white tracking-tighter">Cinematic Feed</h3>
            <p className="text-teal-dark/50 dark:text-white/40 leading-relaxed text-[10px] md:text-xs font-bold uppercase tracking-tight">
              Chronological journey of baby firsts.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="glass-card p-6 md:p-10 group transition-all hover:-translate-y-2 lg:hover:-translate-y-4 cursor-pointer border-white/20 rounded-[2rem] md:rounded-[3rem] sm:col-span-2 lg:col-span-1">
            <Link href="/capsule" className="absolute inset-0 z-10" />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] bg-orange-soft/20 flex items-center justify-center mb-6 md:mb-8 border border-orange-soft/30 group-hover:rotate-6 transition-all">
              <Star className="w-6 h-6 md:w-8 md:h-8 text-orange-soft" />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-4 text-teal-dark dark:text-white tracking-tighter">Future Letters</h3>
            <p className="text-teal-dark/50 dark:text-white/40 leading-relaxed text-[10px] md:text-xs font-bold uppercase tracking-tight">
              Heartfelt digital letters for the future.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isContactOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-3xl bg-teal-dark/20"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass-card border-white/40 rounded-[2rem] md:rounded-[3rem] shadow-[0_0_50px_rgba(45,212,191,0.2)] p-6 md:p-12 bg-white/15 dark:bg-black/40"
            >
              <button 
                onClick={() => setIsContactOpen(false)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-teal-dark dark:text-white z-50 border border-white/30"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                <div>
                  <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-white leading-[0.9] mb-8">
                    Let's work together <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-light via-emerald-300 to-yellow-warm italic font-serif">on your next project</span>
                  </h2>
                  <p className="text-white text-base md:text-lg mb-10 leading-relaxed font-medium opacity-90">
                    Our contact experience is designed to be simple and effective. Whether you're looking for commissions or just a quick inquiry, we're here to help bring your vision to life.
                  </p>
                  
                  <div className="space-y-6">
                    <a href="mailto:srikanthchauhan010@gmail.com" className="flex items-center gap-4 group cursor-pointer decoration-none p-4 rounded-3xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                      <div className="w-14 h-14 rounded-2xl bg-teal-light/30 flex items-center justify-center border border-teal-light/50 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/20">
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-teal-light mb-1">Email Us</p>
                        <p className="text-white font-black text-lg md:text-xl">srikanthchauhan010@gmail.com</p>
                      </div>
                    </a>
                    
                    <a href="https://www.linkedin.com/in/s-srikanth-bb6189322" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer decoration-none p-4 rounded-3xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                      <div className="w-14 h-14 rounded-2xl bg-yellow-warm/30 flex items-center justify-center border border-yellow-warm/50 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20">
                        <ArrowRight className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-yellow-warm mb-1">Follow Along</p>
                        <p className="text-white font-black italic text-2xl md:text-4xl underline decoration-yellow-warm/50">S Srikanth</p>
                        <p className="text-xs md:text-sm text-white/70 lowercase mt-1 font-bold">linkedin.com/in/s-srikanth</p>
                      </div>
                    </a>

                    <a href="tel:9346532409" className="flex items-center gap-4 group cursor-pointer decoration-none p-4 rounded-3xl hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                      <div className="w-14 h-14 rounded-2xl bg-orange-soft/30 flex items-center justify-center border border-orange-soft/50 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                        <Phone className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-orange-soft mb-1">Call Us</p>
                        <p className="text-white font-black text-2xl md:text-4xl">9346532409</p>
                      </div>
                    </a>
                  </div>

                  <div className="mt-12 p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md">
                    <p className="text-base text-white italic font-medium leading-relaxed opacity-90">
                      "Connect with me on LinkedIn for the latest projects and professional updates. Let's build a stronger connection and grow our creative community together."
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 md:p-10 border-white/30 bg-white/10 dark:bg-black/20 shadow-xl rounded-[2.5rem]">
                  <form 
                    className="space-y-6" 
                    onSubmit={handleSubmit}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-[0.2em] font-black text-teal-light ml-1">Full Name</label>
                        <input 
                          type="text" 
                          name="from_name"
                          required
                          placeholder="Your Name" 
                          className="w-full bg-white/70 border border-white/60 rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-light focus:ring-4 focus:ring-teal-light/20 transition-all font-bold" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-[0.2em] font-black text-teal-light ml-1">Email Address</label>
                        <input 
                          type="email" 
                          name="reply_to"
                          required
                          placeholder="hello@example.com" 
                          className="w-full bg-white/70 border border-white/60 rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-light focus:ring-4 focus:ring-teal-light/20 transition-all font-bold" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-[0.2em] font-black text-teal-light ml-1">Subject</label>
                      <input 
                        type="text" 
                        name="subject"
                        required
                        placeholder="What's this about?" 
                        className="w-full bg-white/70 border border-white/60 rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-light focus:ring-4 focus:ring-teal-light/20 transition-all font-bold" 
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs uppercase tracking-[0.2em] font-black text-teal-light ml-1">Your Message</label>
                      <textarea 
                        name="message"
                        required
                        rows={4} 
                        placeholder="Tell us about your needs..." 
                        className="w-full bg-white/70 border border-white/60 rounded-2xl px-6 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-light focus:ring-4 focus:ring-teal-light/20 transition-all resize-none font-bold" 
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSending}
                      className="w-full bg-gradient-to-r from-teal-light via-teal-dark to-teal-dark text-white font-black uppercase tracking-[0.2em] py-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(45,212,191,0.3)] flex items-center justify-center gap-4 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? "Sending..." : "Send Message"}
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Contact Button */}
      <motion.button
        onClick={() => setIsContactOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-[90] glass-card px-8 py-5 border-white/20 rounded-full shadow-[0_20px_40px_rgba(45,212,191,0.3)] flex items-center gap-3 bg-teal-dark dark:bg-black/60 backdrop-blur-xl group cursor-pointer border border-teal-light/30"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-teal-light animate-ping" />
        <span className="text-xs font-black uppercase tracking-widest text-white">Contact Support</span>
        <ArrowRight className="w-4 h-4 text-teal-light group-hover:translate-x-1 transition-transform" />
      </motion.button>

      {/* Footer Section */}
      <footer className="w-full bg-teal-dark dark:bg-black/80 text-white py-16 px-4 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-2xl font-black">
               <Heart className="text-teal-light fill-teal-light w-6 h-6" />
               <span>MemoryNest</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Every moment deserves forever. Preserve your family's journey in a secure digital time capsule.
            </p>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-widest text-teal-light text-xs mb-6">Contact</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-2 hover:text-teal-light transition-colors cursor-pointer">
                <Mail className="w-4 h-4" /> srikanthchauhan010@gmail.com
              </li>
              <li className="flex items-center gap-2 hover:text-teal-light transition-colors cursor-pointer">
                <Phone className="w-4 h-4" /> +91 9346532409
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-teal-light text-xs mb-6">Experience</h4>
            <ul className="space-y-4 text-sm font-medium text-white/60">
              <li className="hover:text-white transition-colors cursor-pointer">Magical Gallery</li>
              <li className="hover:text-white transition-colors cursor-pointer">Future Letters</li>
              <li className="hover:text-white transition-colors cursor-pointer">Growth Timeline</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-widest text-teal-light text-xs mb-6">Legals</h4>
            <ul className="space-y-4 text-sm font-medium text-white/60">
              <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</li>
              <li className="hover:text-white transition-colors cursor-pointer">Security First</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/5 text-center text-[10px] uppercase font-bold tracking-[.3em] text-white/30">
          © 2026 MemoryNest • Built for the moments that matter most.
        </div>
      </footer>
    </div>
  );
}
