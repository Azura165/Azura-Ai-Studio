"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Video,
  Clock,
  FileVideo,
  Loader2,
  Clipboard,
  Music,
  Youtube,
  Instagram,
  Facebook,
  History,
  Trash2,
  ExternalLink,
  X as XIcon,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- TYPES ---
interface VideoFormat {
  format_id: string;
  resolution: string;
  ext: string;
  size: string;
  note: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  source: string;
  formats: VideoFormat[];
}

interface HistoryItem {
  url: string;
  title: string;
  thumbnail: string;
  date: number;
}

// --- SECURITY: DOMAIN WHITELIST ---
// Filter di client agar server tidak capek memproses link sampah
const ALLOWED_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "vm.tiktok.com",
  "instagram.com",
  "facebook.com",
  "fb.watch",
  "twitter.com",
  "x.com",
  "threads.net",
];

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some((domain) => parsed.hostname.includes(domain));
  } catch (e) {
    return false;
  }
};

const sanitizeInput = (input: string) => {
  return input.replace(/[<>'"();]/g, "").trim();
};

// --- CUSTOM ICONS ---
const XLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

// --- MEMOIZED COMPONENTS (ANTI-LAG) ---
// Memisahkan item history agar tidak re-render berat saat input diketik
const HistoryCard = memo(
  ({ item, onClick }: { item: HistoryItem; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="flex gap-3 p-3 rounded-2xl border bg-background hover:border-indigo-500 cursor-pointer transition-all group hover:bg-muted/50 active:scale-95"
    >
      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-muted shrink-0">
        <Image
          src={item.thumbnail}
          alt="thumb"
          fill
          className="object-cover"
          sizes="100px" // Optimasi ukuran download gambar
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {item.title}
        </p>
        <p className="text-[10px] text-muted-foreground truncate mt-1">
          {new Date(item.date).toLocaleDateString()} • {item.url}
        </p>
      </div>
      <ExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 self-center transition-opacity" />
    </div>
  ),
);
HistoryCard.displayName = "HistoryCard";

export function VideoDownloadTab() {
  const [url, setUrl] = useState("");
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Load History (Lazy)
  useEffect(() => {
    const saved = localStorage.getItem("radit_dl_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = useCallback((info: VideoInfo, itemUrl: string) => {
    const newItem: HistoryItem = {
      url: itemUrl,
      title: info.title,
      thumbnail: info.thumbnail,
      date: Date.now(),
    };
    setHistory((prev) => {
      const newHistory = [
        newItem,
        ...prev.filter((h) => h.url !== itemUrl),
      ].slice(0, 10);
      localStorage.setItem("radit_dl_history", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("radit_dl_history");
    toast.success("Riwayat dihapus");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = sanitizeInput(text);
      setUrl(clean);
      toast.info("Link ditempel");
    } catch (err) {
      toast.error("Gagal membaca clipboard");
    }
  };

  const handleGetInfo = async (overrideUrl?: string) => {
    if (isLoadingInfo) return; // Prevent spam

    const rawUrl = overrideUrl || url;
    const targetUrl = sanitizeInput(rawUrl);

    // 1. Validasi Input Kosong
    if (!targetUrl) {
      toast.warning("Masukkan link video dulu ya!");
      return;
    }

    // 2. Validasi Domain (Security Check Client-Side)
    if (!isValidUrl(targetUrl)) {
      toast.error(
        "Link tidak didukung. Gunakan YouTube, TikTok, IG, FB, atau Twitter.",
      );
      return;
    }

    setIsLoadingInfo(true);
    setVideoInfo(null);
    const toastId = toast.loading("Menganalisis video...");

    // API URL Dinamis
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    try {
      const res = await fetch(`${apiUrl}/api/video-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) throw new Error("Video tidak ditemukan / Private.");

      const data = await res.json();
      setVideoInfo(data);
      saveToHistory(data, targetUrl);
      toast.success("Video ditemukan!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengambil info video", { id: toastId });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleHistoryClick = (itemUrl: string) => {
    setShowHistoryModal(false);
    setUrl(itemUrl);
    // Debounce sedikit agar modal sempat tutup
    setTimeout(() => {
      handleGetInfo(itemUrl);
    }, 100);
  };

  const handleDownload = async (formatId: string, resolution: string) => {
    if (!url || isDownloading) return; // Prevent double click

    setIsDownloading(true);
    const toastId = toast.loading(`Sedang memproses ${resolution}...`);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    try {
      const res = await fetch(`${apiUrl}/api/video-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format_id: formatId }),
      });

      if (!res.ok) throw new Error("Gagal mendownload. Coba resolusi lain.");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const ext = formatId === "mp3" ? "mp3" : "mp4";
      // Sanitasi nama file agar tidak error di OS tertentu
      const safeTitle = (videoInfo?.title || "video")
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 50);

      a.download = `RaditStudio-${safeTitle}-${resolution}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Download Berhasil! 🎉", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat download", {
        id: toastId,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative space-y-8 max-w-3xl mx-auto px-1">
      {/* HEADER BAR */}
      <div className="relative flex flex-col md:flex-row items-center justify-center min-h-[40px] gap-4 mb-2">
        <div className="flex items-center gap-5 text-muted-foreground/60 md:absolute md:left-1/2 md:-translate-x-1/2 z-0 scale-90 md:scale-100">
          <Youtube className="size-6 hover:text-red-500 transition-all hover:scale-110 cursor-pointer" />
          <Instagram className="size-6 hover:text-pink-500 transition-all hover:scale-110 cursor-pointer" />
          <div className="flex items-center justify-center size-6 font-bold text-lg hover:text-black dark:hover:text-white transition-all hover:scale-110 cursor-default">
            T
          </div>
          <XLogo className="size-5 hover:text-foreground transition-all hover:scale-110 cursor-pointer" />
          <Facebook className="size-6 hover:text-blue-600 transition-all hover:scale-110 cursor-pointer" />
        </div>
        <div className="w-full md:w-auto flex justify-end md:absolute md:right-0 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistoryModal(true)}
            className="rounded-full gap-2 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shadow-sm"
          >
            <History className="size-4 text-indigo-600" />
            <span className="text-xs font-medium">Riwayat</span>
          </Button>
        </div>
      </div>

      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck className="size-3 text-emerald-500" /> Supports 4K & No
          Watermark
        </p>
      </div>

      {/* INPUT SECTION */}
      <div className="relative group z-10">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Video className="size-5" />
            </div>
            <Input
              placeholder="Tempel link (YouTube, TikTok, IG)..."
              className="pl-12 pr-20 h-14 text-base rounded-2xl border-2 border-muted hover:border-indigo-400 focus-visible:border-indigo-600 focus-visible:ring-0 shadow-sm transition-all bg-background w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGetInfo()}
            />
            {!url && (
              <button
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:bg-muted rounded-xl sm:hidden"
                aria-label="Paste"
              >
                <Clipboard className="size-5" />
              </button>
            )}
            {!url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 text-xs font-medium text-muted-foreground hover:bg-muted rounded-xl hidden sm:flex"
              >
                <Clipboard className="size-3.5 mr-1.5" /> Paste
              </Button>
            )}
          </div>
          <Button
            size="lg"
            onClick={() => handleGetInfo()}
            disabled={isLoadingInfo || !url}
            className="h-14 sm:w-32 font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 w-full"
          >
            {isLoadingInfo ? (
              <Loader2 className="animate-spin size-5" />
            ) : (
              <Search className="size-5" />
            )}
            <span className="ml-2">Cari</span>
          </Button>
        </div>
      </div>

      {/* MODAL HISTORY */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[80vh] will-change-transform"
            >
              <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <History className="size-5 text-indigo-600" /> Riwayat
                </h3>
                <div className="flex gap-2">
                  {history.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearHistory}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Hapus Semua"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHistoryModal(false)}
                  >
                    <XIcon className="size-5" />
                  </Button>
                </div>
              </div>
              <div className="overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <History className="size-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada riwayat.</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <HistoryCard
                      key={idx}
                      item={item}
                      onClick={() => handleHistoryClick(item.url)}
                    />
                  ))
                )}
              </div>
            </motion.div>
            {/* Click Outside to Close */}
            <div
              className="absolute inset-0 -z-10"
              onClick={() => setShowHistoryModal(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* RESULT SECTION */}
      <AnimatePresence mode="wait">
        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-3xl border bg-card overflow-hidden shadow-2xl shadow-indigo-500/10 ring-1 ring-border/50 mt-6"
          >
            <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-gradient-to-br from-muted/50 to-background border-b">
              <div className="relative aspect-video w-full md:w-72 shrink-0 rounded-2xl overflow-hidden shadow-lg group ring-1 ring-black/5">
                <Image
                  src={videoInfo.thumbnail}
                  alt="Thumbnail"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  unoptimized
                />
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold shadow-sm">
                  <Clock className="size-3.5" /> {videoInfo.duration}
                </div>
              </div>
              <div className="space-y-4 py-2 flex-1">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wider">
                  {videoInfo.source}
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold leading-snug line-clamp-2 text-balance">
                  {videoInfo.title}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileVideo className="size-4" /> Tersedia dalam format MP4 &
                  MP3 Audio
                </p>
              </div>
            </div>
            <div className="p-6 md:p-8 bg-card relative">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Download className="size-4" /> Pilih Kualitas
                </h4>
                {isDownloading && (
                  <span className="text-xs font-medium text-indigo-600 animate-pulse">
                    Sedang memproses...
                  </span>
                )}
              </div>

              {/* LOADING OVERLAY (PREVENTS DOUBLE CLICK) */}
              {isDownloading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 rounded-b-3xl">
                  <div className="bg-background border p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm ring-1 ring-border">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
                      <Loader2 className="relative size-12 animate-spin text-indigo-600" />
                    </div>
                    <h5 className="font-bold text-xl text-foreground mb-2">
                      Mengunduh...
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sedang menggabungkan video & audio HD. <br />
                      Mohon tunggu...
                    </p>
                  </div>
                </div>
              )}

              {/* FORMAT GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoInfo.formats.length > 0 ? (
                  videoInfo.formats.map((format, idx) => {
                    const isMp3 = format.format_id === "mp3";
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          handleDownload(format.format_id, format.resolution)
                        }
                        disabled={isDownloading}
                        className={cn(
                          "group relative flex flex-col p-4 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95 text-left",
                          isMp3
                            ? "border-pink-100 bg-pink-50/50 hover:border-pink-500 hover:bg-pink-50 dark:border-pink-900/20 dark:bg-pink-900/10 dark:hover:border-pink-500/50"
                            : "border-muted/60 bg-card hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10",
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <div
                            className={cn(
                              "flex size-10 items-center justify-center rounded-full transition-colors",
                              isMp3
                                ? "bg-pink-200 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300"
                                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
                            )}
                          >
                            {isMp3 ? (
                              <Music className="size-5" />
                            ) : (
                              <FileVideo className="size-5" />
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider",
                                isMp3
                                  ? "bg-pink-200/50 text-pink-800 dark:text-pink-300"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {format.size}
                            </span>
                          </div>
                        </div>
                        <div className="w-full">
                          <p className="font-extrabold text-lg text-foreground mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {format.resolution}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="uppercase font-medium">
                              {format.ext}
                            </span>
                            <Download className="size-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-indigo-600" />
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    <AlertCircle className="size-10 mx-auto mb-2 opacity-20" />
                    <p>Format tidak ditemukan atau video private.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
