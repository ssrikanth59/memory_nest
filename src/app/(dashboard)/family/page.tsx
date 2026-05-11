"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Maximize2, Download, Trash2, Loader2, X, UploadCloud, Heart } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import BlurText from "@/components/BlurText";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function FamilyPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const fetchFamilyMemories = async () => {
    try {
      setLoading(true);
      // Fetch all memories and filter for family tag
      const res = await fetch("/api/memories");
      const data = await res.json();
      if (data.memories) {
        // Filter by the #family description tag we added during upload
        const familyMemories = data.memories.filter((m: any) => 
          m.description && m.description.includes("#family")
        );
        setImages(familyMemories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyMemories();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);
        
        // Determine type based on file type
        if (file.type.startsWith("video/")) {
          formData.append("type", "video");
        } else {
          formData.append("type", "photo");
        }
        
        // Add family tag for filtering
        formData.append("description", "#family"); 
        formData.append("date", new Date().toISOString());

        const res = await fetch("/api/memories", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          fetchFamilyMemories();
        } else {
          const errData = await res.json();
          alert(`Upload failed: ${errData.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert("An error occurred during upload.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this family memory?")) return;
    try {
      const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setImages(prev => prev.filter((img) => img._id !== id));
        if (selectedImage?._id === id) setSelectedImage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = blobUrl;
      link.download = filename;
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
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
                text="Family Album"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-5xl md:text-7xl font-heading font-black tracking-tighter font-attract text-gradient"
              />
              <Users className="text-royal-gold w-12 h-12 animate-pulse" />
          </div>
          <p className="text-muted text-xl font-medium tracking-tight border-l-4 border-royal-gold pl-4">
            "Generations of love, <span className="text-emerald font-bold">captured forever.</span>"
          </p>
        </motion.div>

        <label className="glass-card px-10 py-4 rounded-2xl bg-gradient-to-r from-royal-gold to-emerald text-black font-black uppercase tracking-widest text-xs cursor-pointer hover:scale-105 transition-all shadow-xl flex items-center gap-3">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
          Add Photos/Videos
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
           <div className="relative">
             <div className="w-20 h-20 rounded-full border-4 border-royal-gold/20 border-t-royal-gold animate-spin" />
             <Users className="absolute inset-0 m-auto text-royal-gold w-8 h-8 animate-pulse" />
           </div>
           <p className="text-royal-gold font-black uppercase tracking-widest animate-pulse font-attract">Opening the album...</p>
        </div>
      ) : images.length === 0 ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-16 text-center rounded-[3rem] border-dashed border-2 border-royal-gold/30 bg-white/40 shadow-2xl"
        >
          <Users className="w-16 h-16 text-royal-gold/30 mx-auto mb-6" />
          <h2 className="text-3xl font-heading font-black mb-4 font-attract">Empty Album</h2>
          <p className="text-muted text-lg max-w-md mx-auto">Upload your first family photo to start the collection!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {images.map((img, index) => (
              <motion.div
                key={img._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative glass-card rounded-[2.5rem] overflow-hidden aspect-square cursor-pointer shadow-xl border-white/20"
              >
                {img.type === "video" ? (
                  <video 
                    src={img.mediaUrl} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                ) : (
                  <img 
                    src={img.mediaUrl} 
                    alt={img.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                  <h3 className="text-white font-black text-xl mb-4 font-attract truncate">{img.title}</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(img); }}
                      className="p-3 bg-white/20 hover:bg-white/40 rounded-xl backdrop-blur-md transition-colors"
                    >
                      <Maximize2 className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownload(img.mediaUrl, img.title); }}
                      className="p-3 bg-white/20 hover:bg-white/40 rounded-xl backdrop-blur-md transition-colors"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(img._id); }}
                      className="p-3 bg-red-500/40 hover:bg-red-500/60 rounded-xl backdrop-blur-md transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all group z-10">
              <X className="w-8 h-8 text-white group-hover:rotate-90 transition-transform" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full h-full bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
                {selectedImage.type === "video" ? (
                  <video 
                    src={selectedImage.mediaUrl} 
                    controls 
                    autoPlay
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <img 
                    src={selectedImage.mediaUrl} 
                    alt={selectedImage.title} 
                    className="max-w-full max-h-full object-contain" 
                    onDoubleClick={() => handleDownload(selectedImage.mediaUrl, selectedImage.title)}
                  />
                )}
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-4xl font-heading font-black text-white font-attract mb-2">{selectedImage.title}</h2>
                <p className="text-zinc-400 font-medium">Double-click image to download preservation copy</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}