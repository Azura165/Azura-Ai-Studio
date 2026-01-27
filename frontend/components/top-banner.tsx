"use client";

import { Sparkles, X, Info } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // Fungsi close simpel tanpa logic storage yang berat
  // (Pas refresh akan muncul lagi sesuai request sebelumnya)
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          // ANIMASI OPTIMIZED:
          // Kita cuma main height di awal, sisanya opacity.
          // Exit animation cuma fade out biar cepet.
          initial={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-[60] bg-indigo-50/95 border-b border-indigo-100 dark:bg-slate-900/95 dark:border-indigo-900/30 overflow-hidden"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-start gap-3 pr-8">
              {/* Icon Ringan */}
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                <Info className="h-3.5 w-3.5" />
              </div>

              {/* TEXT CONTENT UPDATE */}
              {/* Menggunakan font system biar rendering teks kilat */}
              <div className="text-xs text-slate-700 dark:text-slate-300 md:text-sm leading-relaxed font-medium">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 mr-1">
                  Mode Demo (Beta):
                </span>
                Aplikasi ini berjalan di server Free Tier. Mungkin terjadi
                <span className="font-bold text-foreground mx-1">
                  Cold Start (delay 10-30 detik)
                </span>
                pada penggunaan pertama. Resolusi video dibatasi max 360p.
              </div>

              {/* Close Button Optimized Area */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-90"
                aria-label="Tutup banner"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
