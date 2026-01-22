"use client";

import { useState, useCallback, useRef, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Wand2,
  RotateCcw,
  Download,
  X,
  Check,
  Loader2,
  Palette,
  Upload,
  Trash2,
  Layers,
  MousePointer2,
  Settings2,
  Scaling,
  FlipHorizontal,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { UploadArea } from "./upload-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";

// --- SECURITY & CONFIG ---
const MAX_FILES_LIMIT = 50;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// --- TYPES ---
interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: "idle" | "uploading" | "success" | "error";
  processedUrl?: string;
  originalName: string;
  bgColor: string;
  bgImage: string | null;
  bgFit: "cover" | "contain";
  isFlipped: boolean;
}

const PRESET_COLORS = [
  {
    name: "Transparent",
    value: "transparent",
    class: "bg-transparent border-dashed border-2",
  },
  { name: "White", value: "#ffffff", class: "bg-white border" },
  { name: "Black", value: "#000000", class: "bg-black border" },
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Yellow", value: "#eab308", class: "bg-yellow-500" },
  { name: "Green", value: "#22c55e", class: "bg-green-500" },
];

// Sanitasi nama file (Security)
const cleanFileName = (filename: string) => {
  return filename.replace(/[^a-z0-9.]/gi, "_").replace(/_{2,}/g, "_");
};

const changeExtension = (filename: string, newExt: string) =>
  filename.replace(/\.[^/.]+$/, "") + newExt;

// --- CANVAS HELPER (Optimized) ---
const downloadCompositeImage = async (
  fgUrl: string,
  bgUrl: string | null,
  bgColor: string,
  filename: string,
  quality: number,
  bgFit: "cover" | "contain",
  isFlipped: boolean,
  format: "auto" | "png" | "jpg" | "webp",
) => {
  return new Promise<void>((resolve, reject) => {
    const imgFg = new window.Image();
    imgFg.crossOrigin = "anonymous";
    imgFg.src = fgUrl;
    imgFg.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imgFg.width;
      canvas.height = imgFg.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject();
        return;
      }

      let finalFormat = format;
      const isActuallyTransparent = !bgUrl && bgColor === "transparent";

      if (format === "auto")
        finalFormat = isActuallyTransparent ? "png" : "jpg";

      if (finalFormat === "jpg" && isActuallyTransparent) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (
        !isActuallyTransparent &&
        bgColor &&
        bgColor !== "transparent"
      ) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const drawForeground = () => {
        ctx.save();
        if (isFlipped) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(imgFg, 0, 0);
        ctx.restore();
        saveCanvas();
      };

      const saveCanvas = () => {
        const link = document.createElement("a");
        const extMap = {
          png: ".png",
          jpg: ".jpg",
          webp: ".webp",
          auto: ".png",
        };
        const mimeMap = {
          png: "image/png",
          jpg: "image/jpeg",
          webp: "image/webp",
          auto: "image/png",
        };
        const qLabel =
          quality === 1.0 ? "_HD" : quality === 0.8 ? "_MED" : "_LOW";

        const safeName = cleanFileName(filename);
        link.download = `${changeExtension(safeName, "")}${qLabel}${extMap[finalFormat]}`;
        link.href = canvas.toDataURL(
          mimeMap[finalFormat],
          finalFormat === "png" ? 1.0 : quality,
        );
        link.click();
        resolve();
      };

      if (bgUrl) {
        const imgBg = new window.Image();
        imgBg.crossOrigin = "anonymous";
        imgBg.src = bgUrl;
        imgBg.onload = () => {
          if (bgFit === "cover") {
            const scale = Math.max(
              canvas.width / imgBg.width,
              canvas.height / imgBg.height,
            );
            const x = canvas.width / 2 - (imgBg.width / 2) * scale;
            const y = canvas.height / 2 - (imgBg.height / 2) * scale;
            ctx.drawImage(
              imgBg,
              x,
              y,
              imgBg.width * scale,
              imgBg.height * scale,
            );
          } else {
            const scale = Math.min(
              canvas.width / imgBg.width,
              canvas.height / imgBg.height,
            );
            const x = canvas.width / 2 - (imgBg.width / 2) * scale;
            const y = canvas.height / 2 - (imgBg.height / 2) * scale;
            ctx.drawImage(
              imgBg,
              x,
              y,
              imgBg.width * scale,
              imgBg.height * scale,
            );
          }
          drawForeground();
        };
        imgBg.onerror = () => drawForeground();
      } else {
        drawForeground();
      }
    };
    imgFg.onerror = reject;
  });
};

// --- FILE CARD (MEMOIZED & OPTIMIZED) ---
const FileCard = memo(
  ({
    item,
    isSelected,
    onSelect,
    onDelete,
    downloadQuality,
    downloadFormat,
  }: {
    item: FileItem;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    downloadQuality: number;
    downloadFormat: "auto" | "png" | "jpg" | "webp";
  }) => {
    const handleDownload = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!item.processedUrl) return;
      try {
        const isPureTransparent =
          !item.bgImage &&
          item.bgColor === "transparent" &&
          !item.isFlipped &&
          (downloadFormat === "auto" || downloadFormat === "png");

        if (isPureTransparent) {
          const response = await fetch(item.processedUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const safeName = cleanFileName(
            item.originalName.replace(/\.[^/.]+$/, ""),
          );
          a.download = `radit-no-bg-${safeName}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          await downloadCompositeImage(
            item.processedUrl,
            item.bgImage,
            item.bgColor,
            `radit-edit-${item.originalName}`,
            downloadQuality,
            item.bgFit,
            item.isFlipped,
            downloadFormat,
          );
        }
        toast.success("Saved!");
      } catch (error) {
        toast.error("Failed");
      }
    };

    return (
      <motion.div
        layout="position"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        onClick={() => onSelect(item.id)}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 transition-all duration-200 cursor-pointer group bg-card will-change-transform",
          isSelected
            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg z-10"
            : "border-border hover:border-indigo-300",
          item.status === "error" && "border-destructive/50",
        )}
      >
        {item.status === "uploading" && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <Loader2 className="size-8 text-white animate-spin drop-shadow-md" />
          </div>
        )}

        <div
          className={cn(
            "absolute top-2 right-2 z-30 transition-all",
            isSelected
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100",
          )}
        >
          <div
            className={cn(
              "size-6 rounded-full flex items-center justify-center shadow-md border border-white/20",
              isSelected
                ? "bg-indigo-600 text-white"
                : "bg-black/40 text-white",
            )}
          >
            {isSelected ? (
              <Check className="size-3.5 stroke-[3]" />
            ) : (
              <MousePointer2 className="size-3" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-muted/20 pointer-events-none">
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <div className="absolute top-1 left-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-md">
              Original
            </div>
            <Image
              src={item.preview}
              alt="Original"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100px, 150px"
            />
          </div>
          <div className="relative aspect-square overflow-hidden checkerboard-bg">
            <div
              className={cn(
                "absolute inset-0 bg-no-repeat bg-center transition-all duration-300",
                item.bgFit === "cover" ? "bg-cover" : "bg-contain",
              )}
              style={{
                backgroundColor:
                  item.status === "success" ? item.bgColor : "transparent",
                backgroundImage:
                  item.status === "success" && item.bgImage
                    ? `url(${item.bgImage})`
                    : "none",
              }}
            />
            {item.status === "success" && item.processedUrl ? (
              <Image
                src={item.processedUrl}
                alt="Result"
                fill
                className={cn(
                  "relative z-10 object-contain p-1 transition-transform duration-500",
                  item.isFlipped && "-scale-x-100",
                )}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/20">
                <Wand2 className="size-6" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between p-2 border-t bg-card/80 backdrop-blur-sm">
          <p className="max-w-[100px] truncate text-[10px] font-medium text-foreground/80">
            {item.originalName}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => onDelete(item.id, e)}
              className="size-6 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="size-3" />
            </Button>
            {item.status === "success" && (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleDownload}
                className="size-6 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              >
                <Download className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
);
FileCard.displayName = "FileCard";

// --- MAIN COMPONENT ---
export function MultipleImagesTab() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState("Ready");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState(0.9);
  const [downloadFormat, setDownloadFormat] = useState<
    "auto" | "png" | "jpg" | "webp"
  >("auto");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () =>
      files.forEach((f) => {
        URL.revokeObjectURL(f.preview);
        if (f.processedUrl) URL.revokeObjectURL(f.processedUrl);
      });
  }, []);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > MAX_FILES_LIMIT) {
      toast.error(`Limit ${MAX_FILES_LIMIT} files max.`);
      return;
    }
    // Security Check: Validate MIME type
    const validFiles = newFiles.filter((f) => ALLOWED_TYPES.includes(f.type));
    if (validFiles.length < newFiles.length) {
      toast.warning("Beberapa file bukan gambar dan dilewati.");
    }

    const newItems: FileItem[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      originalName: file.name,
      preview: URL.createObjectURL(file),
      status: "idle",
      bgColor: "transparent",
      bgImage: null,
      bgFit: "cover",
      isFlipped: false,
    }));

    setFiles((prev) => [...prev, ...newItems]);
    if (newItems.length > 0) setSelectedId(newItems[0].id);
    toast.info(`${newItems.length} images added`);
  }, []);

  const handleSelect = useCallback(
    (id: string) => setSelectedId((prev) => (prev === id ? null : id)),
    [],
  );

  const handleDeleteItem = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const updateItem = useCallback(
    (key: keyof FileItem, value: any) => {
      setFiles((prev) =>
        prev.map((f) => {
          const isTarget = selectedId ? f.id === selectedId : true;
          if (isTarget)
            return {
              ...f,
              [key]: value,
              ...(key === "bgImage"
                ? { bgColor: "transparent" }
                : key === "bgColor"
                  ? { bgImage: null }
                  : {}),
            };
          return f;
        }),
      );
    },
    [selectedId],
  );

  const applyColor = (color: string) => updateItem("bgColor", color);

  const handleColorChange = (color: string) => {
    if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    colorDebounceRef.current = setTimeout(() => {
      applyColor(color);
    }, 50);
  };

  const toggleBgFit = () => {
    const current = files.find((f) => f.id === selectedId)?.bgFit || "cover";
    updateItem("bgFit", current === "cover" ? "contain" : "cover");
  };
  const toggleFlip = () => {
    const current = files.find((f) => f.id === selectedId)?.isFlipped || false;
    updateItem("isFlipped", !current);
  };

  const applyBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateItem("bgImage", url);
      toast.success("BG Updated");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleApplyToAll = () => {
    const currentItem = files.find((f) => f.id === selectedId);
    if (!currentItem) return;
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        bgColor: currentItem.bgColor,
        bgImage: currentItem.bgImage,
        bgFit: currentItem.bgFit,
        isFlipped: currentItem.isFlipped,
      })),
    );
    setSelectedId(null);
    toast.success("Applied to all");
  };

  const processAllImages = async () => {
    setIsProcessing(true);
    const queue = files.filter((f) => f.status === "idle");
    let successCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      setLoadingText(`Processing ${i + 1}/${queue.length}...`);

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f)),
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("quality", "HD");

        const res = await fetch("http://127.0.0.1:5000/api/remove-bg", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "success", processedUrl: data.url }
              : f,
          ),
        );
        successCount++;
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f)),
        );
      }
    }
    setIsProcessing(false);
    toast.success(`Done! ${successCount} images processed.`);
  };

  const handleDownloadAll = async () => {
    const successFiles = files.filter(
      (f) => f.status === "success" && f.processedUrl,
    );
    if (successFiles.length === 0) return;
    toast.info(`Downloading...`);
    for (const file of successFiles) {
      if (file.processedUrl) {
        await downloadCompositeImage(
          file.processedUrl,
          file.bgImage,
          file.bgColor,
          `radit-batch-${file.originalName}`,
          downloadQuality,
          file.bgFit,
          file.isFlipped,
          downloadFormat,
        );
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    toast.success("Completed!");
  };

  const handleReset = () => {
    setFiles([]);
    setSelectedId(null);
    toast.info("Cleared");
  };
  const hasFiles = files.length > 0;
  const isAllDone =
    hasFiles &&
    files.every((f) => f.status === "success" || f.status === "error");
  const activeItem = files.find((f) => f.id === selectedId);
  const activeBgColor = activeItem ? activeItem.bgColor : "transparent";
  const activeBgImage = activeItem ? activeItem.bgImage : null;

  return (
    <div className="space-y-6 pb-4 relative">
      {/* BACKDROP UNTUK MENUTUP POPUP (FULL SCREEN Z-40) */}
      {showColorPicker && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowColorPicker(false)}
        />
      )}

      <UploadArea
        onFilesSelected={handleFilesSelected}
        multiple
        disabled={isProcessing}
      />

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-indigo-600" />
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span>Processing...</span>
                <span>{loadingText}</span>
              </div>
              <Progress
                value={
                  (files.filter((f) => f.status !== "idle").length /
                    files.length) *
                  100
                }
                className="h-2"
              />
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isAllDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            // CLASS PENTING: overflow-visible agar popover bisa keluar
            className="rounded-2xl border bg-muted/30 p-4 sm:p-5 space-y-4 overflow-visible shadow-sm z-20 backdrop-blur-sm relative"
          >
            {/* TOP ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <div className="p-1.5 bg-background rounded-md shadow-sm border">
                  <Settings2 className="size-4 text-indigo-600" />
                </div>
                {selectedId ? "Edit Selected" : "Batch Settings"}
              </div>
              <div className="flex gap-2">
                {selectedId && (
                  <Button
                    size="sm"
                    onClick={handleApplyToAll}
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    <Layers className="mr-1.5 size-3" /> Apply All
                  </Button>
                )}
                {(activeBgImage ||
                  activeBgColor !== "transparent" ||
                  activeItem?.isFlipped) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      applyColor("transparent");
                      if (activeItem) updateItem("isFlipped", false);
                    }}
                    className="h-8 text-xs text-red-500 hover:bg-red-50 border border-red-200"
                  >
                    <RotateCcw className="mr-1.5 size-3" /> Reset
                  </Button>
                )}
              </div>
            </div>

            {/* MIDDLE ROW: TOOLS & COLOR */}
            <div className="flex flex-wrap items-center gap-3 relative">
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={applyBgImage}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "h-10 px-3 text-xs rounded-xl",
                    activeBgImage &&
                      "border-indigo-500 bg-indigo-50 text-indigo-600",
                  )}
                >
                  <Upload className="mr-1.5 size-3.5" /> Upload BG
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFlip}
                className={cn(
                  "size-10 rounded-xl bg-background border transition-colors",
                  activeItem?.isFlipped &&
                    "bg-indigo-100 border-indigo-500 text-indigo-600",
                )}
                title="Flip"
              >
                <FlipHorizontal className="size-4" />
              </Button>
              {activeBgImage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleBgFit}
                  className="size-10 rounded-xl bg-background border"
                  title="Fit/Cover"
                >
                  <Scaling className="size-4 text-muted-foreground" />
                </Button>
              )}

              <div className="w-px h-8 bg-border mx-1 hidden sm:block" />

              {PRESET_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => applyColor(color.value)}
                  className={cn(
                    "size-9 rounded-full shadow-sm transition-all focus:outline-none ring-1 ring-black/5 hover:scale-110",
                    color.class,
                    !activeBgImage &&
                      activeBgColor === color.value &&
                      "ring-2 ring-indigo-500 ring-offset-2",
                  )}
                  title={color.name}
                />
              ))}

              {/* BUTTON WRAPPER - FIX STACKING CONTEXT */}
              <div
                className={cn(
                  "relative transition-all",
                  showColorPicker ? "z-50" : "z-auto",
                )}
              >
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={cn(
                    "size-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm hover:scale-110 transition-transform",
                    showColorPicker && "ring-2 ring-indigo-500 ring-offset-2",
                  )}
                >
                  <Palette className="size-4 text-white" />
                </button>

                {/* FLOATING POPOVER (ABSOLUTE) */}
                <AnimatePresence>
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      // Positioning: Centered on mobile, aligned on desktop
                      className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-[60] bg-card p-3 rounded-2xl shadow-2xl border ring-1 ring-black/5 w-[220px]"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                        Pilih Warna Custom
                      </div>
                      <div className="w-full flex justify-center">
                        <HexColorPicker
                          color={
                            activeBgColor === "transparent"
                              ? "#ffffff"
                              : activeBgColor
                          }
                          onChange={handleColorChange}
                          style={{ width: "100%", height: "140px" }}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowColorPicker(false)}
                        className="w-full mt-3 h-8 text-xs font-bold"
                      >
                        <ChevronUp className="mr-1 size-3" /> Tutup
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                  Quality:
                </span>
                <div className="flex bg-background border rounded-lg p-1">
                  {[0.6, 0.8, 1.0].map((q) => (
                    <button
                      key={q}
                      onClick={() => setDownloadQuality(q)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all",
                        downloadQuality === q
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "hover:bg-muted text-muted-foreground",
                      )}
                    >
                      {q === 1.0 ? "HD" : q === 0.8 ? "MED" : "LOW"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden md:block w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                  Format:
                </span>
                <div className="flex bg-background border rounded-lg p-1 flex-wrap">
                  {["auto", "png", "jpg", "webp"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setDownloadFormat(fmt as any)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                        downloadFormat === fmt
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "hover:bg-muted text-muted-foreground",
                      )}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasFiles && (
        <LayoutGroup>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {files.length} Images in Queue
              </p>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 text-xs text-red-500 hover:bg-red-50"
                >
                  <X className="mr-1 size-3" /> Clear All
                </Button>
              )}
            </div>
            {/* GRID HAS Z-INDEX 0 by default, so Picker Z-50 wins */}
            <motion.div
              layout
              className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {files.map((item) => (
                  <FileCard
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onSelect={handleSelect}
                    onDelete={handleDeleteItem}
                    downloadQuality={downloadQuality}
                    downloadFormat={downloadFormat}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </LayoutGroup>
      )}

      {hasFiles && (
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6 border-t mt-4">
          {!isAllDone && !isProcessing && (
            <Button
              onClick={processAllImages}
              size="lg"
              className="w-full sm:w-auto font-bold shadow-lg bg-indigo-600 hover:bg-indigo-700 min-w-40 h-11 rounded-xl"
            >
              <Wand2 className="mr-2 size-4" /> Process All (
              {files.filter((f) => f.status === "idle").length})
            </Button>
          )}
          {isAllDone && (
            <>
              <Button
                onClick={handleDownloadAll}
                size="lg"
                className="w-full sm:w-auto font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg h-11 rounded-xl order-1 sm:order-2"
              >
                <Download className="mr-2 size-4" /> Download All
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full sm:w-auto border h-11 rounded-xl order-2 sm:order-1"
              >
                <RotateCcw className="mr-2 size-4" /> Start New
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
