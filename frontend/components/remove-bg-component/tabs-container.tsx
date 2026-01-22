"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Layers, Video, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

// Direct Imports
import { SingleImageTab } from "./single-image-tab";
import { MultipleImagesTab } from "./multiple-images-tab";
import { MagicEraserTab } from "./magic-eraser-tab";
import { VideoDownloader } from "../video-downloader";

// Config (Full English for Pro look)
const TABS = [
  { id: "single", label: "Remover", icon: ImageIcon },
  { id: "batch", label: "Batch Mode", icon: Layers },
  { id: "eraser", label: "Magic Eraser", icon: Eraser },
  { id: "video", label: "Video DL", icon: Video },
];

export function TabsContainer() {
  const [activeTab, setActiveTab] = useState("single");

  return (
    <div className="w-full">
      {/* HEADER TABS */}
      <div className="border-b bg-muted/30 px-2 pt-2">
        <div className="flex w-full items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-shrink-0 flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-bold transition-all select-none",
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
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA (Optimized: Keep-Alive) */}
      <div className="bg-card p-4 md:p-6 min-h-[500px]">
        {/* TEKNIK OPTIMASI: 
           Render semua tab tapi sembunyikan yang tidak aktif.
           Ini mencegah "Mounting Delay" (loading ulang) saat ganti tab.
           Hasilnya: INSTANT SWITCH.
        */}

        <div
          className={cn(
            "transition-opacity duration-300",
            activeTab === "single"
              ? "opacity-100 block"
              : "opacity-0 hidden h-0 overflow-hidden",
          )}
        >
          <SingleImageTab />
        </div>

        <div
          className={cn(
            "transition-opacity duration-300",
            activeTab === "batch"
              ? "opacity-100 block"
              : "opacity-0 hidden h-0 overflow-hidden",
          )}
        >
          <MultipleImagesTab />
        </div>

        <div
          className={cn(
            "transition-opacity duration-300",
            activeTab === "eraser"
              ? "opacity-100 block"
              : "opacity-0 hidden h-0 overflow-hidden",
          )}
        >
          <MagicEraserTab />
        </div>

        <div
          className={cn(
            "transition-opacity duration-300",
            activeTab === "video"
              ? "opacity-100 block"
              : "opacity-0 hidden h-0 overflow-hidden",
          )}
        >
          <VideoDownloader />
        </div>
      </div>
    </div>
  );
}
