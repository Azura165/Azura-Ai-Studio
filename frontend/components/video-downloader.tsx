"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Loader2,
  Youtube,
  Music,
  Video as VideoIcon,
  Clipboard,
  History,
  Trash2,
  Instagram,
  Facebook,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Clock,
  Zap,
  Copy,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

// --- CUSTOM ICON ---
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

// --- TIPE DATA ---
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
  source: string;
}

// --- UTILS ---
const getRelativeTime = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

const ALLOWED_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "fb.watch",
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

const BadgeItem = memo(
  ({
    icon: Icon,
    label,
    className,
  }: {
    icon: any;
    label: string;
    className?: string;
  }) => (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm select-none",
        className,
      )}
    >
      <Icon className="size-3" /> {label}
    </div>
  ),
);
BadgeItem.displayName = "BadgeItem";

export function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [suggestedLink, setSuggestedLink] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("radit_dl_history");
    if (saved) setHistory(JSON.parse(saved));

    const checkClipboard = async () => {
      try {
        if (document.hasFocus()) {
          const text = await navigator.clipboard.readText();
          if (text && isValidUrl(text) && text !== url) {
            setSuggestedLink(text);
          }
        }
      } catch (e) {
        /* Silent */
      }
    };
    checkClipboard();
  }, []);

  const saveToHistory = useCallback((info: VideoInfo, itemUrl: string) => {
    const newItem: HistoryItem = {
      url: itemUrl,
      title: info.title,
      thumbnail: info.thumbnail,
      date: Date.now(),
      source: info.source,
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

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("radit_dl_history");
    toast.success("Riwayat dihapus");
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanText = sanitizeInput(text);
      if (cleanText) {
        setUrl(cleanText);
        setSuggestedLink("");
        if (isValidUrl(cleanText)) {
          toast.success("Link ditempel!");
        } else {
          toast.error("Link tidak dikenali.");
        }
      }
    } catch (err) {
      toast.error("Gagal baca clipboard");
    }
  };

  const handleGetInfo = async (overrideUrl?: string) => {
    if (isLoadingInfo) return;

    const rawUrl = overrideUrl || url;
    const targetUrl = sanitizeInput(rawUrl);

    if (!targetUrl) {
      toast.warning("Masukkan link dulu!");
      return;
    }
    if (!isValidUrl(targetUrl)) {
      toast.error("Domain tidak didukung.");
      return;
    }

    setIsLoadingInfo(true);
    setVideoInfo(null);
    const toastId = toast.loading("Menganalisis video...");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    try {
      const res = await fetch(`${apiUrl}/api/video-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) throw new Error("Video tidak ditemukan / Private");

      const data: VideoInfo = await res.json();
      setVideoInfo(data);
      saveToHistory(data, targetUrl);
      setSuggestedLink("");
      toast.success("Video ditemukan!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengambil info", { id: toastId });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleDownload = async (formatId: string, ext: string) => {
    if (!url || isDownloading) return;
    setIsDownloading(true);
    const toastId = toast.loading(
      `Memproses ${ext.toUpperCase()} (Tunggu sebentar...)`,
    );
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    try {
      const res = await fetch(`${apiUrl}/api/video-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format_id: formatId }),
      });

      if (!res.ok) throw new Error("Gagal download.");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const safeTitle =
        videoInfo?.title.replace(/[^a-z0-9]/gi, "_").substring(0, 30) ||
        "video";
      a.download = `RaditStudio_${safeTitle}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Download Selesai!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Gagal download file", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const copyTitle = () => {
    if (videoInfo?.title) {
      navigator.clipboard.writeText(videoInfo.title);
      toast.success("Judul disalin!");
    }
  };

  const getQualityStyle = useCallback((res: string, ext: string) => {
    if (res.includes("2160p") || res.includes("4K"))
      return {
        label: "4K ULTRA",
        bg: "bg-purple-600",
        text: "text-white",
        glow: "shadow-purple-500/50",
      };
    if (res.includes("1440p") || res.includes("2K"))
      return {
        label: "2K QHD",
        bg: "bg-indigo-600",
        text: "text-white",
        glow: "shadow-indigo-500/50",
      };
    if (res.includes("1080p"))
      return {
        label: "FULL HD",
        bg: "bg-blue-600",
        text: "text-white",
        glow: "shadow-blue-500/50",
        recommend: true,
      };
    if (res.includes("720p"))
      return {
        label: "HD READY",
        bg: "bg-emerald-600",
        text: "text-white",
        glow: "shadow-emerald-500/50",
      };
    if (ext === "mp3")
      return {
        label: "AUDIO HQ",
        bg: "bg-pink-600",
        text: "text-white",
        glow: "shadow-pink-500/50",
        recommend: true,
      };
    return {
      label: "SD",
      bg: "bg-muted",
      text: "text-muted-foreground",
      glow: "",
    };
  }, []);

  const getSourceIcon = useCallback((source: string) => {
    const s = source.toLowerCase();
    if (s.includes("youtube"))
      return { icon: Youtube, color: "text-[#FF0000]", bg: "bg-white" };
    if (s.includes("instagram"))
      return { icon: Instagram, color: "text-pink-600", bg: "bg-white" };
    if (s.includes("facebook"))
      return { icon: Facebook, color: "text-[#1877F2]", bg: "bg-white" };
    if (s.includes("twitter") || s.includes("x"))
      return { icon: XLogo, color: "text-black", bg: "bg-white" };
    return { icon: VideoIcon, color: "text-indigo-600", bg: "bg-white" };
  }, []);

  return (
    <div className="relative space-y-10 max-w-5xl mx-auto px-2 min-h-[600px] py-4">
      {!videoInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-8 mb-12"
        >
          <div className="flex justify-center gap-6">
            {[
              {
                Icon: Youtube,
                color: "text-red-500",
                bg: "bg-red-500/5 hover:bg-red-500/10",
              },
              {
                Icon: Instagram,
                color: "text-pink-500",
                bg: "bg-pink-500/5 hover:bg-pink-500/10",
              },
              {
                Icon: Facebook,
                color: "text-blue-600",
                bg: "bg-blue-600/5 hover:bg-blue-600/10",
              },
              {
                Icon: XLogo,
                color: "text-foreground",
                bg: "bg-foreground/5 hover:bg-foreground/10",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-3xl transition-all duration-300 hover:scale-105 cursor-default shadow-sm border border-transparent hover:border-border/30",
                  item.bg,
                )}
              >
                <item.Icon className={cn("size-6 sm:size-8", item.color)} />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Universal Video Downloader
            </h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Download video{" "}
              <span className="font-bold text-foreground">tanpa watermark</span>{" "}
              dari berbagai platform. Tempel link, pilih format, simpan.
            </p>
          </div>
        </motion.div>
      )}

      {/* INPUT AREA */}
      <div className="relative group z-20 max-w-2xl mx-auto">
        <div className="relative flex gap-2 bg-background/90 backdrop-blur-xl p-2 rounded-2xl border shadow-xl ring-1 ring-border/50 transition-all focus-within:ring-indigo-500/50">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <VideoIcon className="size-5" />
            </div>
            <input
              type="text"
              placeholder="Tempel link video (YouTube, TikTok, IG)..."
              className="w-full h-14 rounded-xl bg-transparent pl-12 pr-12 text-base focus:outline-none placeholder:text-muted-foreground/50 font-medium truncate"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGetInfo()}
            />
            {url ? (
              <button
                onClick={() => setUrl("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
              >
                <Trash2 className="size-4" />
              </button>
            ) : (
              <button
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-indigo-600 transition-all"
                title="Paste"
              >
                <Clipboard className="size-4" />
              </button>
            )}
          </div>
          <Button
            size="lg"
            className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 shrink-0 transition-all active:scale-95 text-base font-semibold"
            onClick={() => handleGetInfo()}
            disabled={isLoadingInfo || !url}
          >
            {isLoadingInfo ? (
              <Loader2 className="animate-spin size-5" />
            ) : (
              <Search className="size-5" />
            )}
            <span className="hidden sm:inline ml-2">Cari</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {suggestedLink && !url && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={() => {
                setUrl(suggestedLink);
                handleGetInfo(suggestedLink);
              }}
              className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/80 backdrop-blur-sm hover:bg-indigo-100 px-5 py-2.5 rounded-full border border-indigo-200 transition-all shadow-sm animate-pulse hover:animate-none"
            >
              <Clipboard className="size-3.5" /> Link terdeteksi:{" "}
              <span className="font-bold truncate max-w-[200px]">
                {suggestedLink}
              </span>
              <ArrowRight className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {videoInfo ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="rounded-[2rem] border border-border/50 bg-card/90 backdrop-blur-sm overflow-hidden shadow-2xl relative ring-1 ring-black/5"
          >
            <div className="flex flex-col lg:flex-row relative z-10">
              <div className="p-6 lg:p-8 lg:w-5/12 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-border/50 bg-muted/20">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-lg group ring-1 ring-black/10">
                  <Image
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-md">
                    <Clock className="size-3" /> {videoInfo.duration}
                  </div>

                  <div className="absolute top-3 left-3">
                    {(() => {
                      const {
                        icon: Icon,
                        color,
                        bg,
                      } = getSourceIcon(videoInfo.source);
                      return (
                        <div
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-xl ring-2 ring-black/10",
                            bg,
                          )}
                        >
                          <Icon
                            className={cn("size-3.5 fill-current", color)}
                          />
                          <span
                            className={cn(
                              "text-[10px] font-extrabold uppercase tracking-wide",
                              "text-black",
                            )}
                          >
                            {videoInfo.source}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3
                      className="font-bold text-lg leading-snug line-clamp-2 text-foreground tracking-tight"
                      title={videoInfo.title}
                    >
                      {videoInfo.title}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-muted"
                        onClick={copyTitle}
                        title="Copy Title"
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-muted"
                        onClick={() =>
                          window.open(url, "_blank", "noopener,noreferrer")
                        }
                        title="Open Original"
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <BadgeItem
                      icon={Lock}
                      label="Secure"
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                    />
                    <BadgeItem
                      icon={Sparkles}
                      label="No Watermark"
                      className="bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800"
                    />
                    <BadgeItem
                      icon={Zap}
                      label="Fast"
                      className="bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVideoInfo(null);
                      setUrl("");
                    }}
                    className="w-full text-xs font-medium rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all h-9"
                  >
                    Ganti Video
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 lg:p-8 bg-background">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Download className="size-3.5" /> Pilih Format
                  </p>
                  <div className="text-[10px] font-bold text-muted-foreground bg-muted border px-2 py-1 rounded-md">
                    {videoInfo.formats?.length || 0} Opsi
                  </div>
                </div>

                <div className="relative min-h-[300px]">
                  {isDownloading && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center animate-in fade-in rounded-2xl border border-indigo-500/20">
                      <div className="p-6">
                        <Loader2 className="size-10 animate-spin text-indigo-600 mb-4 mx-auto" />
                        <p className="font-bold text-lg text-foreground">
                          Sedang Memproses...
                        </p>
                        <p className="text-xs text-muted-foreground max-w-[200px] mt-2 leading-relaxed mx-auto">
                          Menggabungkan Video & Audio HD. <br />
                          Mohon tunggu sebentar.
                        </p>
                      </div>
                    </div>
                  )}

                  {videoInfo.formats && videoInfo.formats.length > 0 ? (
                    <div
                      className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar will-change-transform"
                      style={{ contain: "content" }}
                    >
                      {videoInfo.formats.map((fmt, i) => {
                        const style = getQualityStyle(fmt.resolution, fmt.ext);
                        return (
                          <button
                            key={i}
                            onClick={() =>
                              handleDownload(fmt.format_id, fmt.ext)
                            }
                            disabled={isDownloading}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted/50 hover:border-indigo-500/30 transition-all group text-left relative overflow-hidden active:scale-[0.98]",
                              style.recommend &&
                                "ring-1 ring-indigo-500/30 bg-indigo-50/10",
                            )}
                          >
                            <div className="relative z-10 flex items-center gap-4">
                              <div
                                className={cn(
                                  "size-10 rounded-lg flex items-center justify-center shadow-sm text-white shrink-0 font-bold text-[10px]",
                                  fmt.ext === "mp3"
                                    ? "bg-gradient-to-br from-pink-500 to-rose-600"
                                    : "bg-gradient-to-br from-blue-500 to-indigo-600",
                                )}
                              >
                                {fmt.ext === "mp3" ? (
                                  <Music className="size-5" />
                                ) : (
                                  <span className="uppercase">{fmt.ext}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-extrabold text-sm text-foreground">
                                    {fmt.resolution}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wide shadow-sm",
                                      style.bg,
                                      style.text,
                                    )}
                                  >
                                    {style.label}
                                  </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                                  <span>{fmt.size || "Unknown Size"}</span>
                                  {fmt.note && (
                                    <span className="opacity-60 truncate max-w-[120px] hidden sm:inline border-l pl-1.5 border-border">
                                      {fmt.note}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="relative z-10 size-9 rounded-full bg-muted border flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-colors duration-200">
                              <Download className="size-4" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
                      <AlertCircle className="size-10 mb-2 opacity-20" />
                      <p>Format tidak ditemukan atau video private.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          history.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-12 pt-8 border-t border-dashed border-border/60"
            >
              <div className="flex items-center justify-between px-1 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <History className="size-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Riwayat Terakhir
                  </span>
                </div>
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-red-100"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setUrl(item.url);
                      handleGetInfo(item.url);
                    }}
                    className="flex gap-4 items-center p-3 rounded-2xl border border-border/50 bg-card/40 hover:bg-card hover:shadow-lg hover:border-indigo-500/30 cursor-pointer group transition-all"
                  >
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black shrink-0 shadow-sm border border-white/10">
                      <Image
                        src={item.thumbnail}
                        alt=""
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        unoptimized
                        sizes="100px"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/60 p-0.5 rounded-md backdrop-blur-sm">
                        {item.source.includes("youtube") ? (
                          <Youtube className="size-2.5 text-white" />
                        ) : item.source.includes("instagram") ? (
                          <Instagram className="size-2.5 text-white" />
                        ) : (
                          <VideoIcon className="size-2.5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 z-10">
                      <p className="text-sm font-semibold truncate group-hover:text-indigo-600 transition-colors pr-4">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border">
                          {getRelativeTime(item.date)}
                        </span>
                        <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-1 group-hover:underline">
                          Download Lagi <ExternalLink className="size-2.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #cbd5e1;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
        }
        .dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #444;
        }
      `}</style>
    </div>
  );
}
