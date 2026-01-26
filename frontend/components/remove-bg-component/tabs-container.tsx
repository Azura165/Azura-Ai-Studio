"use client";

import { useState, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Layers, Video, Eraser, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// --- LOADING SKELETON (Optimized Style) ---
function TabSkeleton() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center flex-col gap-4 text-muted-foreground/50 animate-pulse bg-muted/5 rounded-2xl border-2 border-dashed border-muted">
      <Loader2 className="size-10 animate-spin text-indigo-500" />
      <p className="text-sm font-medium">Memuat Modul AI...</p>
    </div>
  );
}

// --- DYNAMIC IMPORTS (Code Splitting) ---
// Memecah bundle JS agar loading awal sangat cepat
const SingleImageTab = dynamic(
  () => import("./single-image-tab").then((mod) => mod.SingleImageTab),
  { loading: () => <TabSkeleton />, ssr: false },
);

const MultipleImagesTab = dynamic(
  () => import("./multiple-images-tab").then((mod) => mod.MultipleImagesTab),
  { loading: () => <TabSkeleton />, ssr: false },
);

const MagicEraserTab = dynamic(
  () => import("./magic-eraser-tab").then((mod) => mod.MagicEraserTab),
  { loading: () => <TabSkeleton />, ssr: false },
);

// Import dari folder parent (luar folder ini)
const VideoDownloader = dynamic(
  () => import("../video-downloader").then((mod) => mod.VideoDownloader),
  { loading: () => <TabSkeleton />, ssr: false },
);

// --- CONFIG ---
const TABS = [
  { id: "single", label: "Remover", icon: ImageIcon },
  { id: "batch", label: "Batch Mode", icon: Layers },
  { id: "eraser", label: "Magic Eraser", icon: Eraser },
  { id: "video", label: "Video DL", icon: Video },
];

export function TabsContainer() {
  const [activeTab, setActiveTab] = useState("single");
  // Keep-Alive Mechanism: Tab yang sudah dibuka tidak akan di-unmount (agar data tidak hilang)
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(
    new Set(["single"]),
  );
  // React 18 Concurrent Mode: Membuat UI tetap responsif saat switching
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoadedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.add(activeTab);
      return newSet;
    });
  }, [activeTab]);

  const handleTabChange = (id: string) => {
    // Start Transition: Memprioritaskan responsivitas UI (klik) dibanding render konten berat
    startTransition(() => {
      setActiveTab(id);
    });
  };

  return (
    <div className="w-full">
      {/* HEADER TABS (Scrollable & Hide Scrollbar) */}
      <div className="border-b bg-muted/30 px-2 pt-2">
        <div
          className="flex w-full items-center gap-2 overflow-x-auto pb-1 
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              // touch-manipulation: Menghilangkan delay tap di mobile
              className={cn(
                "relative flex-shrink-0 flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-bold transition-all select-none touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                activeTab === tab.id
                  ? "bg-card text-indigo-600 shadow-sm ring-1 ring-border/50 z-10"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <tab.icon className="size-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA (Smart Keep-Alive) */}
      <div className="bg-card p-4 md:p-6 min-h-[500px]">
        {/* Optimasi Render:
            Menggunakan class 'hidden' daripada conditional rendering (&&) 
            agar komponen tidak di-reset state-nya saat ganti tab.
            Ditambah animasi halus saat muncul.
        */}
        {loadedTabs.has("single") && (
          <div
            className={cn(
              activeTab === "single"
                ? "animate-in fade-in zoom-in-95 duration-200"
                : "hidden",
            )}
          >
            <SingleImageTab />
          </div>
        )}

        {loadedTabs.has("batch") && (
          <div
            className={cn(
              activeTab === "batch"
                ? "animate-in fade-in zoom-in-95 duration-200"
                : "hidden",
            )}
          >
            <MultipleImagesTab />
          </div>
        )}

        {loadedTabs.has("eraser") && (
          <div
            className={cn(
              activeTab === "eraser"
                ? "animate-in fade-in zoom-in-95 duration-200"
                : "hidden",
            )}
          >
            <MagicEraserTab />
          </div>
        )}

        {loadedTabs.has("video") && (
          <div
            className={cn(
              activeTab === "video"
                ? "animate-in fade-in zoom-in-95 duration-200"
                : "hidden",
            )}
          >
            <VideoDownloader />
          </div>
        )}
      </div>
    </div>
  );
}
