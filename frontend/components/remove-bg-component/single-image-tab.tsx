"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UploadArea } from "./upload-area";
import { ImagePreview } from "./image-preview";
import { ProcessingState } from "./processing-state";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Palette,
  FlipHorizontal,
  Scaling,
  MousePointer2,
  RotateCw,
  SplitSquareHorizontal,
  ChevronsLeftRight,
  Sliders,
  Settings2,
  Droplets,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";

// --- CONFIG ---
const MAX_UPLOAD_SIZE_MB = 10;
const COMPRESSION_MAX_WIDTH = 1920; // Full HD (Aman untuk server, tajam untuk user)

// --- PRESET WARNA ---
const PRESET_COLORS = [
  {
    name: "Transparan",
    value: "transparent",
    class: "bg-transparent border-dashed border-2",
  },
  { name: "Putih", value: "#ffffff", class: "bg-white border" },
  { name: "Hitam", value: "#000000", class: "bg-black border" },
  { name: "Merah", value: "#ef4444", class: "bg-red-500" },
  { name: "Biru", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Kuning", value: "#eab308", class: "bg-yellow-500" },
  { name: "Hijau", value: "#22c55e", class: "bg-green-500" },
];

// --- PRESET FILTERS ---
const FILTERS = [
  { name: "Normal", value: "none", class: "bg-gray-200" },
  { name: "B&W", value: "grayscale(100%)", class: "bg-gray-900" },
  { name: "Sepia", value: "sepia(100%)", class: "bg-amber-700" },
  {
    name: "Vintage",
    value: "sepia(50%) contrast(120%)",
    class: "bg-orange-300",
  },
  {
    name: "Cool",
    value: "hue-rotate(180deg) saturate(150%)",
    class: "bg-blue-300",
  },
];

const changeExtension = (filename: string, newExt: string) =>
  filename.replace(/\.[^/.]+$/, "") + newExt;

// --- OPTIMIZATION: CLIENT-SIDE COMPRESSOR ---
// Mengecilkan gambar SEBELUM upload agar server tidak berat
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Resize logic
      if (width > COMPRESSION_MAX_WIDTH) {
        height = Math.round((height * COMPRESSION_MAX_WIDTH) / width);
        width = COMPRESSION_MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        "image/jpeg",
        0.9,
      ); // 90% Quality JPEG (Ringan & Bagus)
    };
    img.onerror = reject;
  });
};

// --- HELPER CANVAS ---
const downloadCompositeImage = async (
  fgUrl: string,
  bgUrl: string | null,
  bgColor: string,
  filename: string,
  quality: number,
  bgFit: "cover" | "contain",
  isFlipped: boolean,
  rotation: number,
  brightness: number,
  contrast: number,
  blurAmount: number,
  activeFilter: string,
  fgPos: { x: number; y: number },
  fgScale: number,
  format: "auto" | "png" | "jpg" | "webp",
) => {
  return new Promise<void>((resolve, reject) => {
    const imgFg = new window.Image();
    imgFg.crossOrigin = "anonymous";
    imgFg.src = fgUrl;
    imgFg.onload = () => {
      const canvas = document.createElement("canvas");
      // Handle Rotation Dimensions
      if (Math.abs(rotation) % 180 === 90) {
        canvas.width = imgFg.height;
        canvas.height = imgFg.width;
      } else {
        canvas.width = imgFg.width;
        canvas.height = imgFg.height;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject();
        return;
      }

      let finalFormat = format;
      const isActuallyTransparent = !bgUrl && bgColor === "transparent";
      if (format === "auto")
        finalFormat = isActuallyTransparent ? "png" : "jpg";

      ctx.save();

      // Background
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

      // Draw BG Image
      const drawBG = () => {
        if (bgUrl) {
          if (blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`;
          const imgBg = new window.Image();
          imgBg.crossOrigin = "anonymous";
          imgBg.src = bgUrl;
          imgBg.onload = () => {
            if (bgFit === "cover") {
              // Cover Logic Simplified for brevity but functional
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
              const x = (canvas.width - imgBg.width * scale) / 2;
              const y = (canvas.height - imgBg.height * scale) / 2;
              ctx.drawImage(
                imgBg,
                x,
                y,
                imgBg.width * scale,
                imgBg.height * scale,
              );
            }
            ctx.restore();
            drawFG();
          };
          imgBg.onerror = () => {
            ctx.restore();
            drawFG();
          };
        } else {
          ctx.restore();
          drawFG();
        }
      };

      const drawFG = () => {
        ctx!.save();
        ctx!.translate(canvas.width / 2, canvas.height / 2);
        ctx!.translate(fgPos.x * canvas.width, fgPos.y * canvas.height);
        ctx!.rotate((rotation * Math.PI) / 180);
        ctx!.scale(fgScale, fgScale);
        if (isFlipped) ctx!.scale(-1, 1);

        const filterString = `brightness(${brightness}%) contrast(${contrast}%) ${activeFilter !== "none" ? activeFilter : ""}`;
        ctx!.filter = filterString.trim();

        ctx!.drawImage(imgFg, -imgFg.width / 2, -imgFg.height / 2);
        ctx!.restore();
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

        link.download = `${changeExtension(filename, "")}${qLabel}${extMap[finalFormat]}`;
        link.href = canvas.toDataURL(
          mimeMap[finalFormat],
          finalFormat === "png" ? 1.0 : quality,
        );
        link.click();
        resolve();
      };

      drawBG();
    };
    imgFg.onerror = reject;
  });
};

export function SingleImageTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Background State
  const [bgColor, setBgColor] = useState("transparent");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgFit, setBgFit] = useState<"cover" | "contain">("cover");

  // Transform State
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [fgPos, setFgPos] = useState({ x: 0, y: 0 });
  const [fgScale, setFgScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Adjustments State
  const [showSlider, setShowSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [viewZoom, setViewZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [blurAmount, setBlurAmount] = useState(0);
  const [activeFilter, setActiveFilter] = useState("none");
  const [activeTab, setActiveTab] = useState<
    "bg" | "adjust" | "filters" | "export"
  >("bg");

  const [downloadQuality, setDownloadQuality] = useState(0.9);
  const [downloadFormat, setDownloadFormat] = useState<
    "auto" | "png" | "jpg" | "webp"
  >("auto");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef({ x: 0, scale: 1 });

  // --- KEYBOARD & DRAG LOGIC ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!processedImage) return;
      const step = 0.01;
      if (e.key === "ArrowUp") setFgPos((p) => ({ ...p, y: p.y - step }));
      if (e.key === "ArrowDown") setFgPos((p) => ({ ...p, y: p.y + step }));
      if (e.key === "ArrowLeft") setFgPos((p) => ({ ...p, x: p.x - step }));
      if (e.key === "ArrowRight") setFgPos((p) => ({ ...p, x: p.x + step }));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [processedImage]);

  const handleDragMove = (e: React.PointerEvent) => {
    if (showSlider || isResizing || !isDragging || !containerRef.current)
      return;
    e.preventDefault();
    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    const deltaX = e.movementX / (width * viewZoom);
    const deltaY = e.movementY / (height * viewZoom);
    setFgPos((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, scale: fgScale };
  };

  const handleResizeMove = useCallback(
    (e: PointerEvent) => {
      if (!isResizing) return;
      const deltaX = e.clientX - resizeStartRef.current.x;
      const newScale = Math.max(
        0.2,
        resizeStartRef.current.scale + deltaX * 0.005,
      );
      setFgScale(newScale);
    },
    [isResizing],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("pointermove", handleResizeMove);
      window.addEventListener("pointerup", handlePointerUp);
    } else {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizing, handleResizeMove, handlePointerUp]);

  // --- ACTIONS (OPTIMIZED) ---
  const handleFileSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];

      // 1. Security Check (Tipe File)
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya support file gambar (JPG, PNG, WEBP)");
        return;
      }
      // 2. Security Check (Ukuran Awal)
      if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        toast.error(`Ukuran file maksimal ${MAX_UPLOAD_SIZE_MB}MB`);
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Reset States
      setProcessedImage(null);
      setProgress(0);
      setBgColor("transparent");
      setBgImage(null);
      setIsFlipped(false);
      setRotation(0);
      setFgPos({ x: 0, y: 0 });
      setFgScale(1);
      setBrightness(100);
      setContrast(100);
      setBlurAmount(0);
      setActiveFilter("none");
      setShowSlider(false);
      setActiveTab("bg");
      setViewZoom(1);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (bgImage && !bgImage.startsWith("http")) URL.revokeObjectURL(bgImage);
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedImage(null);
    setBgColor("transparent");
    setBgImage(null);
    setProgress(0);
  }, [previewUrl, bgImage]);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Background max 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setBgImage(url);
      toast.success("Background diganti");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(10);
    const toastId = toast.loading("Mengoptimalkan & menghapus background...");

    // API URL Dynamic
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    try {
      // 3. Compression Process (Client Side)
      // Ini bagian paling penting agar server tidak berat
      setProgress(20);
      const compressedBlob = await compressImage(selectedFile);

      const formData = new FormData();
      formData.append("file", compressedBlob, selectedFile.name);

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 10 : prev));
      }, 500);

      const res = await fetch(`${apiUrl}/api/remove-bg`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(90);

      if (!res.ok) throw new Error("Gagal memproses gambar");
      const data = await res.json();

      setProcessedImage(data.url);
      setProgress(100);
      toast.success("Selesai! ✨", { id: toastId });
    } catch (error) {
      toast.error("Gagal memproses. Coba gambar lain.", { id: toastId });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!processedImage) return;
    const toastId = toast.loading("Merender hasil akhir...");
    try {
      await downloadCompositeImage(
        processedImage,
        bgImage,
        bgColor,
        `radit-studio-${selectedFile?.name}`,
        downloadQuality,
        bgFit,
        isFlipped,
        rotation,
        brightness,
        contrast,
        blurAmount,
        activeFilter,
        fgPos,
        fgScale,
        downloadFormat,
      );
      toast.success("Disimpan ke Galeri", { id: toastId });
    } catch (error) {
      toast.error("Gagal download", { id: toastId });
    }
  };

  const handleDoubleClick = () => {
    setFgPos({ x: 0, y: 0 });
    setFgScale(1);
    toast.info("Posisi direset");
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!selectedFile && !processedImage && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <UploadArea onFilesSelected={handleFileSelected} multiple={false} />
            <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <Sparkles className="size-3 text-indigo-500" /> Auto-Optimized for
              High Speed
            </p>
          </motion.div>
        )}
        {selectedFile && !isProcessing && !processedImage && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border-4 border-indigo-50 bg-card shadow-2xl ring-1 ring-border/50">
              <div className="relative p-2 bg-muted/20">
                <ImagePreview
                  src={previewUrl! || "/placeholder.svg"}
                  filename={selectedFile.name}
                  onRemove={handleRemoveImage}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRemoveImage}
                className="w-full sm:w-auto h-12 rounded-2xl border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
              >
                <Trash2 className="mr-2 size-4" /> Ganti Foto
              </Button>
              <Button
                size="lg"
                onClick={handleProcess}
                className="w-full sm:w-auto h-12 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all"
              >
                <Wand2 className="mr-2 size-5" /> Hapus Background
              </Button>
            </div>
          </motion.div>
        )}
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProcessingState progress={progress} />
          </motion.div>
        )}
        {processedImage && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* --- INTERACTIVE CANVAS AREA (TOUCH OPTIMIZED) --- */}
            <div
              className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border-2 shadow-2xl bg-card group touch-none select-none"
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onDoubleClick={handleDoubleClick}
              style={{ touchAction: "none" }} // Fix Scroll Mobile
            >
              {/* Controls Overlay */}
              <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2">
                  <button
                    onClick={() => setShowSlider(!showSlider)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all border",
                      showSlider
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-white/90 backdrop-blur-md text-indigo-900 hover:bg-white",
                    )}
                  >
                    {showSlider ? (
                      <ChevronsLeftRight className="size-3.5" />
                    ) : (
                      <SplitSquareHorizontal className="size-3.5" />
                    )}
                    {showSlider ? "Geser" : "Bandingkan"}
                  </button>
                  <div className="flex bg-white/90 backdrop-blur-md rounded-full border shadow-sm p-0.5">
                    <button
                      onClick={() => setViewZoom(Math.max(1, viewZoom - 0.5))}
                      className="p-1 hover:bg-muted rounded-full"
                    >
                      <ZoomOut className="size-3.5 text-indigo-900" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-black px-1 flex items-center w-8 justify-center">
                      {viewZoom}x
                    </span>
                    <button
                      onClick={() => setViewZoom(Math.min(3, viewZoom + 0.5))}
                      className="p-1 hover:bg-muted rounded-full"
                    >
                      <ZoomIn className="size-3.5 text-indigo-900" />
                    </button>
                  </div>
                </div>
                <div className="pointer-events-auto bg-white/90 backdrop-blur-md text-black font-bold text-[10px] px-2 py-1 rounded-md shadow-sm font-mono uppercase border flex items-center gap-2">
                  <MousePointer2 className="size-3 text-muted-foreground" />
                  {downloadFormat} • {(downloadQuality * 100).toFixed(0)}%
                </div>
              </div>

              {/* Display Area */}
              <div
                ref={containerRef}
                className={cn(
                  "relative w-full checkerboard-bg overflow-hidden",
                  !showSlider && "cursor-move",
                )}
                style={{ aspectRatio: "4/3", touchAction: "none" }}
                onPointerDown={() => !showSlider && setIsDragging(true)}
                onPointerMove={handleDragMove}
              >
                <div
                  className="absolute inset-0 w-full h-full transition-transform duration-200 origin-center ease-out will-change-transform"
                  style={{ transform: `scale(${viewZoom})` }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <div
                      className={cn(
                        "w-full h-full bg-no-repeat bg-center transition-all duration-300",
                        bgFit === "cover" ? "bg-cover" : "bg-contain",
                      )}
                      style={{
                        backgroundColor: bgColor,
                        backgroundImage: bgImage ? `url(${bgImage})` : "none",
                        filter: `blur(${blurAmount}px)`,
                        transform: "scale(1.05)",
                      }}
                    />
                  </div>
                  <div
                    className={cn(
                      "relative w-full h-full transition-transform duration-75 will-change-transform",
                      isFlipped && "-scale-x-100",
                    )}
                    style={{
                      transform: `translate(${fgPos.x * 100}%, ${fgPos.y * 100}%) rotate(${rotation}deg) scale(${fgScale}) ${isFlipped ? "scaleX(-1)" : ""}`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%) ${activeFilter !== "none" ? activeFilter : ""}`,
                    }}
                  >
                    <img
                      src={processedImage}
                      alt="Result"
                      className="w-full h-full object-contain p-4 pointer-events-none select-none"
                      draggable={false}
                    />
                    {!showSlider && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full border-2 border-transparent group-hover:border-indigo-500/20 transition-colors" />
                        <div
                          className="absolute bottom-[10%] right-[10%] w-6 h-6 bg-white border-2 border-indigo-600 rounded-full shadow-lg cursor-nwse-resize flex items-center justify-center z-50 pointer-events-auto hover:scale-125 transition-transform active:scale-95"
                          onPointerDown={handleResizeStart}
                        >
                          <Scaling className="size-3 text-indigo-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slider Overlay */}
                {showSlider && (
                  <div className="absolute inset-0 w-full h-full z-40 touch-none">
                    <div
                      className="absolute inset-0 bg-muted/50 overflow-hidden border-r-[3px] border-indigo-500 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                      style={{ width: `${sliderValue}%` }}
                    >
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl!}
                          alt="Original"
                          className="w-full h-full object-contain p-4 opacity-80 grayscale"
                        />
                        <div className="absolute bottom-4 left-4 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md shadow-md">
                          Original
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize touch-none z-50"
                    />
                    <div
                      className="absolute top-1/2 -mt-5 -ml-5 pointer-events-none z-40 shadow-xl"
                      style={{ left: `${sliderValue}%` }}
                    >
                      <div className="size-10 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white text-white">
                        <ChevronsLeftRight className="size-5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar snap-x gap-1">
                {[
                  { id: "bg", icon: Palette, label: "BG" },
                  { id: "filters", icon: Sparkles, label: "Filters" },
                  { id: "adjust", icon: Sliders, label: "Adjust" },
                  { id: "export", icon: Settings2, label: "Export" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "snap-start flex-1 min-w-20 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                      activeTab === tab.id
                        ? "bg-white shadow text-indigo-600"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                    )}
                  >
                    {" "}
                    <tab.icon className="size-3.5" /> {tab.label}{" "}
                  </button>
                ))}
              </div>
              <div className="bg-card border rounded-2xl p-4 shadow-sm min-h-35 relative">
                {activeTab === "bg" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-3 overflow-x-auto pb-4 px-2 no-scrollbar snap-x items-center">
                      <div className="snap-start shrink-0">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleBgUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "rounded-full h-10 px-4 border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-xs font-medium",
                            bgImage &&
                              "border-indigo-500 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200",
                          )}
                        >
                          {" "}
                          <Upload className="mr-2 size-3.5" />{" "}
                          {bgImage ? "Ganti" : "Upload"}{" "}
                        </Button>
                      </div>
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            setBgColor(color.value);
                            if (color.value !== "transparent") setBgImage(null);
                          }}
                          className={cn(
                            "snap-start shrink-0 size-10 rounded-full shadow-sm transition-all focus:outline-none ring-1 ring-black/5 hover:scale-110",
                            color.class,
                            !bgImage &&
                              bgColor === color.value &&
                              "ring-4 ring-indigo-500/20 scale-110 border-indigo-500",
                          )}
                          title={color.name}
                        />
                      ))}
                      <div className="snap-start shrink-0 relative">
                        <button
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className={cn(
                            "size-10 rounded-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm transition-transform hover:scale-110",
                            showColorPicker && "ring-4 ring-indigo-500/20",
                          )}
                        >
                          <Palette className="size-5 text-white" />
                        </button>
                      </div>
                    </div>
                    {/* RGB PICKER */}
                    <AnimatePresence>
                      {showColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-card p-3 rounded-2xl shadow-2xl border ring-1 ring-black/5 w-64"
                        >
                          <HexColorPicker
                            color={
                              bgColor === "transparent" ? "#ffffff" : bgColor
                            }
                            onChange={(c) => {
                              setBgColor(c);
                              setBgImage(null);
                            }}
                          />
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 text-[10px] w-full"
                              onClick={() => setShowColorPicker(false)}
                            >
                              {" "}
                              Tutup{" "}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {/* Other tabs remain similar but simplified logic above handles them */}
                {activeTab === "filters" && (
                  <div className="flex gap-3 overflow-x-auto pb-4 px-2 no-scrollbar">
                    {FILTERS.map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setActiveFilter(f.value)}
                        className={cn(
                          "snap-start shrink-0 flex flex-col items-center gap-2 group",
                        )}
                      >
                        <div
                          className={cn(
                            "size-14 rounded-full border-2 transition-all overflow-hidden relative",
                            activeFilter === f.value
                              ? "border-indigo-500 ring-2 ring-indigo-500/20 scale-105"
                              : "border-transparent",
                          )}
                        >
                          <div className={cn("absolute inset-0", f.class)} />
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80 bg-black/10 backdrop-blur-[1px]">
                            {f.name}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {activeTab === "adjust" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <Move className="size-3.5" /> Object Size
                        </span>
                        <span>{fgScale.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={fgScale}
                        onChange={(e) => setFgScale(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsFlipped(!isFlipped)}
                          className={cn(
                            "size-8 rounded-full",
                            isFlipped && "bg-indigo-100 text-indigo-600",
                          )}
                          title="Flip Horizontal"
                        >
                          <FlipHorizontal className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          className="size-8 rounded-full"
                          title="Rotate"
                        >
                          <RotateCw className="size-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setBlurAmount(0);
                          setIsFlipped(false);
                          setRotation(0);
                          setActiveFilter("none");
                          setFgPos({ x: 0, y: 0 });
                          setFgScale(1);
                        }}
                        className="h-8 text-xs text-red-500"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === "export" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground block">
                        Format File
                      </label>
                      <div className="flex gap-2">
                        {["auto", "png", "jpg", "webp"].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setDownloadFormat(fmt as any)}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border",
                              downloadFormat === fmt
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-background hover:bg-muted",
                            )}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={handleDownload}
                className="w-full sm:w-auto h-14 rounded-2xl font-bold shadow-xl bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all order-1 sm:order-2"
              >
                <Download className="mr-2 size-5" /> Download
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleRemoveImage}
                className="w-full sm:w-auto h-14 rounded-2xl text-muted-foreground hover:bg-muted font-medium order-2 sm:order-1"
              >
                <RotateCcw className="mr-2 size-4" /> Edit Baru
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
