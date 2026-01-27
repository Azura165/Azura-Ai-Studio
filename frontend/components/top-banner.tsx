"use client";

import { Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react"; // Pastikan motion v12 installed

export function TopBanner() {
  const [isVisible, setIsVisible] = useState(false); // Default false dulu biar ga flickering (Hydration)

  useEffect(() => {
    // Cek apakah user pernah close banner ini
    const isClosed = localStorage.getItem("azura-banner-closed");
    if (!isClosed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("azura-banner-closed", "true"); // Simpan state biar ga muncul lagi
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-b border-blue-100 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 dark:border-blue-900/50"
        >
          <div className="container relative mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3 md:items-center justify-between">
              {/* Content Wrapper */}
              <div className="flex flex-1 items-start gap-3 md:items-center pr-8">
                {/* Icon Badge */}
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 md:mt-0">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>

                {/* Text Content */}
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 md:text-sm leading-relaxed">
                  <span className="font-bold text-blue-700 dark:text-blue-400 block md:inline mb-0.5 md:mb-0 md:mr-1.5">
                    Mode Demo (Beta):
                  </span>
                  Server Free Tier.
                  <span className="hidden sm:inline">
                    {" "}
                    Resolusi max 360p &{" "}
                  </span>
                  <span className="sm:hidden"> Limit 360p. </span>
                  Delay 10-30s di awal request.
                </div>
              </div>

              {/* Close Button - Absolute di mobile biar ga makan tempat */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 md:relative md:top-auto md:right-auto p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label="Tutup banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
