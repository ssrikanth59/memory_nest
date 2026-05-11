"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Maximize2, Download, Heart, Trash2, Loader2, X, Lock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSearch } from "@/components/providers/SearchProvider";
import BlurText from "@/components/BlurText";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function GalleryPage() {
  const { searchQuery } = useSearch();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [filter, setFilter] = useState("All");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      let url = "/api/memories";
      if (filter === "Photos") url += "?type=photo";
      else if (filter === "Videos") url += "?type=video";
      else if (filter === "Favorites") url += "?type=favorite";
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.memories) {
        setImages(data.memories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [filter]);

  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/memories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFavorite: !currentStatus }),
      });
      if (res.ok) {
        setImages(images.map((img) => 
          img._id === id ? { ...img, isFavorite: !currentStatus } : img
        ));
        // If we are in favorites filter, remove it from view
        if (filter === "Favorites") {
            setImages(images.filter(img => img._id !== id));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      alert("Invalid Memory ID");
      return;
    }
    if (!confirm("Are you sure you want to delete this memory?")) return;
    try {
      console.log("Attempting to delete memory with ID:", id);
      const res = await fetch(`/api/memories/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("Delete response status:", res.status);
      if (res.ok) {
        setImages(prev => prev.filter((img) => img._id !== id));
      } else {
        const error = await res.json();
        console.error("Delete failed:", error);
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error("Delete error:", e);
      alert("An error occurred while deleting the memory.");
    }
  };

  const handleOpenImage = (image: any) => {
    if (image.pin) {
      setSelectedImage(image);
      setIsUnlocked(false);
      setPinInput("");
      setPinError(false);
    } else {
      setSelectedImage(image);
      setIsUnlocked(true);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'memory';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed", e);
      // Fallback: try opening in new tab
      window.open(url, '_blank');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === selectedImage.pin) {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  return (
    <motion.div 
      className="pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
           initial={{ x: -20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-3">
             <BlurText
                text="ULTRA Gallery"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-5xl md:text-7xl font-heading font-black tracking-tighter font-attract text-gradient"
              />
              <ImageIcon className="text-royal-gold w-12 h-12 animate-pulse" />
          </div>
          <p className="text-muted text-xl font-medium tracking-tight border-l-4 border-royal-gold pl-4">
            "Your life is a cinematic masterpiece. <span className="text-emerald font-bold drop-shadow-[0_0_5px_rgba(16,185,123,0.5)]">Watch it here.</span>"
          </p>
        </motion.div>
        <div className="flex gap-4 flex-wrap">
          {["All", "Photos", "Videos", "Favorites"].map((item, index) => (
            <motion.button 
              key={item} 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.1, backgroundColor: "#ffcc33", color: "#000", boxShadow: "0 0 20px rgba(255,204,51,0.5)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setFilter(item)}
              className={cn(
                "glass-card px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-xl border-white/20 dark:border-white/5 font-attract",
                filter === item 
                  ? "bg-royal-gold text-black border-transparent shadow-[0_0_15px_rgba(255,215,0,0.4)]" 
                  : "bg-white/10 dark:bg-white/5 text-zinc-900 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              )}
            >
              {item}
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
           <div className="relative">
             <div className="w-20 h-20 rounded-full border-4 border-royal-gold/20 border-t-royal-gold animate-spin" />
             <Heart className="absolute inset-0 m-auto text-royal-gold w-8 h-8 animate-pulse" />
           </div>
           <p className="text-royal-gold font-black uppercase tracking-widest animate-pulse font-attract">Reliving your memories...</p>
        </div>
      ) : images.length === 0 ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-16 text-center rounded-[3rem] border-dashed border-2 border-royal-gold/30 dark:border-royal-gold/20 bg-white/40 shadow-2xl"
        >
          <div className="bg-gradient-to-tr from-royal-gold to-ruby-rose w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <ImageIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-heading font-black mb-4 font-attract">No Memories Yet</h2>
          <p className="text-muted text-xl max-w-md mx-auto font-medium">
            Your magical journey starts here. Head to the <span className="text-ruby-rose font-black italic">Upload</span> section to add your first precious moment!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 bg-white/10 dark:bg-zinc-900/10 rounded-[2.5rem]">
          {images
            .filter(image => 
              (image.title && image.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (image.description && image.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
              new Date(image.createdAt).toLocaleDateString().includes(searchQuery)
            )
            .map((image, i) => (
            <motion.div 
              key={image._id}
              initial={{ scale: 0.9, opacity: 0, rotate: i % 2 === 0 ? -2 : 2 }}
              animate={{ scale: 1, opacity: 1, rotate: i % 2 === 0 ? -1 : 1 }}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 10, transition: { duration: 0.2 } }}
              className="polaroid-frame group relative max-w-[280px] mx-auto overflow-visible"
            >
              <div className="relative overflow-hidden aspect-[1/1] bg-zinc-100 rounded-sm">
                {image.type === 'video' ? (
                  <video 
                    src={image.mediaUrl} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    muted
                    loop
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                ) : (
                  <img 
                    src={image.mediaUrl || image.imageUrl} 
                    alt={image.title} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                  />
                )}
                
                {/* AI Scrapbook Elements */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-white/80 backdrop-blur-md rounded text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  Memory #{i + 1}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center z-50 pointer-events-none">
                  <div className="flex gap-4 p-4 pointer-events-auto">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenImage(image);
                      }}
                      className="p-4 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-full text-white transition-all transform hover:scale-110 active:scale-95 border border-white/30"
                      title="View"
                    >
                      {image.pin ? <Lock className="w-6 h-6 text-royal-gold" /> : <Maximize2 className="w-6 h-6" />}
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.mediaUrl || image.imageUrl, image.title || "memory");
                      }}
                      className="p-4 bg-emerald/30 hover:bg-emerald/50 backdrop-blur-xl rounded-full text-white transition-all transform hover:scale-110 active:scale-95 border border-white/30"
                      title="Download"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("CRITICAL: Delete button clicked for ID:", image._id);
                        handleDelete(image._id);
                      }}
                      className="p-4 bg-red-600/40 hover:bg-red-600/60 backdrop-blur-xl rounded-full text-white transition-all transform hover:scale-110 active:scale-95 border border-white/30 shadow-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 pb-2 text-center">
                <h3 className="font-attract text-xl text-zinc-800 dark:text-zinc-200 truncate px-2">{image.title || "Untitled Memory"}</h3>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1">
                  {new Date(image.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {/* Decorative Scrapbook Icon */}
                <button 
                  onClick={() => handleToggleFavorite(image._id, image.isFavorite)}
                  className="mt-4 opacity-70 hover:opacity-100 transition-opacity"
                >
                   <Heart className={cn("w-6 h-6 mx-auto transition-all", image.isFavorite ? "text-ruby-rose fill-ruby-rose scale-125" : "text-zinc-300 hover:text-ruby-rose")} />
                </button>
              </div>

              {/* Tape Effect */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 backdrop-blur-sm -rotate-2 border border-white/20 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Full Resolution Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-xl z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-full min-w-[300px]"
              onClick={(e) => e.stopPropagation()}
            >
              {!isUnlocked ? (
                <div className="glass-card p-12 rounded-[3rem] text-center border-2 border-royal-gold/30 bg-white/10 dark:bg-black/40 backdrop-blur-2xl">
                  <div className="w-20 h-20 bg-gradient-to-tr from-royal-gold to-ruby-rose rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <Lock className="w-10 h-10 text-white animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-6 font-attract">Locked Memory</h2>
                  <p className="text-zinc-400 mb-8 font-bold">This moment is protected by a PIN.</p>
                  
                  <form onSubmit={handlePinSubmit} className="space-y-6">
                    <input 
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="ENTER PIN"
                      autoFocus
                      className={cn(
                        "w-full bg-white/10 border-2 rounded-2xl px-6 py-4 text-center text-4xl font-black tracking-[1em] text-white outline-none transition-all",
                        pinError ? "border-red-500 animate-shake" : "border-royal-gold/50 focus:border-royal-gold"
                      )}
                    />
                    {pinError && <p className="text-red-500 text-xs font-black uppercase tracking-widest animate-pulse">Access Denied</p>}
                    <button 
                      type="submit"
                      className="w-full bg-royal-gold hover:bg-gold-leaf text-black font-black py-4 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest"
                    >
                      Unlock Moment
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {selectedImage.type === 'video' ? (
                    <video 
                      src={selectedImage.mediaUrl} 
                      controls 
                      autoPlay
                      className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(255,204,51,0.2)] border border-white/10"
                    />
                  ) : (
                    <img 
                      src={selectedImage.mediaUrl || selectedImage.imageUrl} 
                      alt={selectedImage.title} 
                      className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(255,204,51,0.2)] border border-white/10"
                    />
                  )}
                  <div className="mt-8 text-center flex flex-col items-center gap-4">
                    <h2 className="text-3xl font-black text-white mb-2 font-attract tracking-tighter">{selectedImage.title}</h2>
                    <div className="flex items-center justify-center gap-6">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(selectedImage._id, selectedImage.isFavorite);
                          setSelectedImage({ ...selectedImage, isFavorite: !selectedImage.isFavorite });
                        }}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                      >
                        <Heart className={cn("w-6 h-6 transition-all", selectedImage.isFavorite ? "text-ruby-rose fill-ruby-rose" : "text-white")} />
                      </button>
                      <span className="text-royal-gold text-xs font-black uppercase tracking-[0.3em] bg-white/5 px-4 py-2 rounded-full border border-royal-gold/20">
                        {new Date(selectedImage.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <a 
                        href={selectedImage.mediaUrl || selectedImage.imageUrl} 
                        download={selectedImage.title}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-royal-gold hover:bg-gold-leaf text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                        Download Original
                      </a>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}