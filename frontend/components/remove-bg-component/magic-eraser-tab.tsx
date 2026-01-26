"use client";

import { useState, useRef, useEffect } from "react";
import { UploadArea } from "./upload-area";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Eraser,
  Download,
  Brush,
  ZoomIn,
  ZoomOut,
  Eye,
  Maximize,
  Loader2,
  Trash2,
  Zap,
  Triangle,
  Sparkles,
  Move,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ToolType = "brush" | "eraser" | "pan";

const LOADING_TIPS = [
  "Tip: Gunakan slider 'Detail' untuk hasil lebih tajam.",
  "Tip: Naikkan 'Power' jika objek sulit dihapus.",
  "Tip: Klik ganda untuk fit-to-screen.",
  "Tip: Gunakan mode 'Move' untuk geser gambar saat di-zoom.",
];

// --- OPTIMASI 1: IMAGE COMPRESSOR ---
// Mengecilkan gambar HD di browser sebelum dikirim ke server
// Mengurangi beban upload hingga 80% (Anti-Lag)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1500; // Batas aman untuk server gratisan
      const scaleSize = MAX_WIDTH / img.width;

      // Hanya resize jika gambar terlalu besar
      if (scaleSize < 1) {
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85)); // Convert ke JPG 85% Quality
    };
  });
};

export function MagicEraserTab() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);

  // Tools Config
  const [activeTool, setActiveTool] = useState<ToolType>("brush");
  const [brushSize, setBrushSize] = useState(40);
  const [eraserStrength, setEraserStrength] = useState(5);
  const [detailLevel, setDetailLevel] = useState(2);
  const [quality, setQuality] = useState<"HD" | "MED">("HD");
  const [showGrid, setShowGrid] = useState(false);

  // Viewport State
  const [scale, setScale] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const [imageDims, setImageDims] = useState({ w: 0, h: 0 });
  const [showBrushPreview, setShowBrushPreview] = useState(false);

  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastTapRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const updateTransform = () => {
    if (contentRef.current) {
      const { x, y } = positionRef.current;
      contentRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
  };

  useEffect(() => {
    updateTransform();
  }, [scale]);

  const handleFile = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];

      // --- KEAMANAN 1: Validasi Tipe File ---
      if (!file.type.startsWith("image/")) {
        toast.error("Format file tidak didukung! Gunakan JPG/PNG.");
        return;
      }

      // --- KEAMANAN 2: Batas Ukuran Awal (10MB) ---
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar (Max 10MB)");
        return;
      }

      const toastId = toast.loading("Mengoptimalkan gambar...");
      try {
        const compressedUrl = await compressImage(file);
        setImageSrc(compressedUrl);
        setResultSrc(null);
        setScale(1);
        positionRef.current = { x: 0, y: 0 };
        setActiveTool("brush");
        toast.dismiss(toastId);
      } catch (e) {
        toast.error("Gagal memuat gambar", { id: toastId });
      }
    }
  };

  const fitToScreen = () => {
    if (!imageDims.w || !containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const padding = 20;
    const scaleX = (container.width - padding) / imageDims.w;
    const scaleY = (container.height - padding) / imageDims.h;
    setScale(Math.min(scaleX, scaleY, 1));
    positionRef.current = { x: 0, y: 0 };
    updateTransform();
  };

  useEffect(() => {
    if (imageSrc && canvasRef.current && !resultSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
          setTimeout(fitToScreen, 100);

          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      };
    }
  }, [imageSrc, resultSrc]);

  // DRAWING LOGIC (Sama seperti sebelumnya)
  const getCoordinates = (e: React.PointerEvent) => {
    if (!canvasRef.current || !containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const imgX =
      (mouseX - centerX - positionRef.current.x) / scale + imageDims.w / 2;
    const imgY =
      (mouseY - centerY - positionRef.current.y) / scale + imageDims.h / 2;
    return { x: imgX, y: imgY };
  };

  const startDrawing = (e: React.PointerEvent) => {
    if (resultSrc || activeTool === "pan") return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      const { x, y } = getCoordinates(e);
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !canvasRef.current || activeTool === "pan") return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.lineWidth = brushSize / scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (activeTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `rgba(255, 50, 50, 0.6)`;
      }
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current?.getContext("2d");
      ctx?.closePath();
      if (ctx) ctx.globalCompositeOperation = "source-over";
    }
  };

  const performClearMask = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      toast.info("Masking dihapus");
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      fitToScreen();
    }
    lastTapRef.current = now;

    if (activeTool === "pan") {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX - positionRef.current.x,
        y: e.clientY - positionRef.current.y,
      };
    } else {
      startDrawing(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeTool === "pan" && isDraggingRef.current) {
      positionRef.current = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
      updateTransform();
    } else {
      draw(e);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    stopDrawing();
  };

  // --- OPTIMASI 2: PROCESS REQUEST ---
  const processEraser = async () => {
    if (!imageSrc || !canvasRef.current) return;
    setIsProcessing(true);
    setLoadingTip(
      LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)],
    );

    // URL API Dinamis (Siap Deploy)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

    try {
      // ImageSrc sudah compressed, jadi aman langsung dikirim
      const base64Mask = canvasRef.current?.toDataURL("image/png");

      const res = await fetch(`${apiUrl}/api/erase-object`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSrc, // Kirim gambar yg sudah di-resize
          mask: base64Mask,
          quality,
          strength: eraserStrength,
          detail: detailLevel,
        }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResultSrc(data.url);
      toast.success("Berhasil dihapus!", { icon: "✨" });
    } catch (e) {
      toast.error("Gagal memproses. Coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultSrc) return;
    const toastId = toast.loading("Menyimpan...");
    try {
      const response = await fetch(resultSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      const ext = quality === "HD" ? ".png" : ".jpg";
      a.download = `Radit-Magic-${Date.now()}${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Disimpan ke Galeri", { id: toastId });
    } catch {
      toast.error("Gagal download", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 pb-8 select-none flex flex-col items-center">
      {!imageSrc ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-2xl"
        >
          <UploadArea onFilesSelected={handleFile} multiple={false} />
          <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-indigo-500" /> Auto-Resize (Max
              1500px)
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col gap-4">
          {/* --- TOP TOOLBAR --- */}
          <div className="flex flex-wrap justify-between items-center bg-card border rounded-2xl p-2 shadow-sm gap-2 sticky top-20 z-30">
            <div className="flex items-center gap-1">
              <div className="flex bg-muted/50 p-1 rounded-xl border">
                <button
                  onClick={() => setActiveTool("brush")}
                  className={cn(
                    "p-2 rounded-lg transition-all flex items-center gap-2",
                    activeTool === "brush"
                      ? "bg-white shadow text-red-500 font-bold"
                      : "text-muted-foreground hover:bg-white/50",
                  )}
                  title="Brush (Mask)"
                >
                  <Brush className="size-4" />{" "}
                  <span className="text-xs hidden sm:inline">Mark</span>
                </button>
                <div className="w-px h-6 bg-border/50 my-auto mx-1"></div>
                <button
                  onClick={() => setActiveTool("eraser")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    activeTool === "eraser"
                      ? "bg-white shadow text-indigo-600"
                      : "text-muted-foreground hover:bg-white/50",
                  )}
                  title="Eraser (Unmask)"
                >
                  <Eraser className="size-4" />
                </button>
                <button
                  onClick={() => setActiveTool("pan")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    activeTool === "pan"
                      ? "bg-white shadow text-indigo-600"
                      : "text-muted-foreground hover:bg-white/50",
                  )}
                  title="Move / Pan"
                >
                  <Move className="size-4" />
                </button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl"
                onClick={performClearMask}
                title="Clear Mask"
              >
                <Undo2 className="size-4" />
              </Button>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => setShowGrid(!showGrid)}
              >
                <div
                  className={cn(
                    "size-4 border border-current grid grid-cols-2 grid-rows-2 gap-px",
                    showGrid ? "text-indigo-600" : "text-muted-foreground",
                  )}
                ></div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={fitToScreen}
              >
                <Maximize className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => {
                  setImageSrc(null);
                  setResultSrc(null);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {/* --- MAIN CANVAS VIEWPORT --- */}
          <div
            ref={containerRef}
            className="relative w-full rounded-2xl overflow-hidden border-2 border-indigo-500/10 bg-black/5 shadow-inner touch-none cursor-crosshair h-[60vh] md:h-[65vh]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://transparenttextures.com/patterns/stardust.png')]" />

            <div
              ref={contentRef}
              className="w-full h-full flex items-center justify-center origin-center will-change-transform"
              style={{ transform: `translate(0px, 0px) scale(1)` }}
            >
              <div className="relative shadow-2xl">
                <img
                  src={isComparing ? imageSrc : resultSrc || imageSrc}
                  alt="Work"
                  className="max-w-none pointer-events-none select-none"
                  style={{ width: imageDims.w, height: imageDims.h }}
                />

                {showGrid && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-white/20"></div>
                    ))}
                  </div>
                )}

                {!resultSrc && !isComparing && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full z-10 opacity-70"
                  />
                )}

                {showBrushPreview && !resultSrc && activeTool === "brush" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <div
                      className="rounded-full border-2 border-white bg-red-500/30 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-75"
                      style={{ width: brushSize, height: brushSize }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 z-30 pointer-events-auto">
              <div className="flex flex-col bg-black/50 backdrop-blur-md rounded-xl border border-white/10 shadow-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-white hover:bg-white/20"
                  onClick={() => setScale((s) => Math.min(5, s + 0.2))}
                >
                  <ZoomIn className="size-4" />
                </Button>
                <div className="h-px bg-white/20 mx-2"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg text-white hover:bg-white/20"
                  onClick={() => setScale((s) => Math.max(0.1, s - 0.2))}
                >
                  <ZoomOut className="size-4" />
                </Button>
              </div>
              <div className="bg-black/50 backdrop-blur-md text-white text-[9px] font-mono px-2 py-1 rounded-md text-center border border-white/10">
                {(scale * 100).toFixed(0)}%
              </div>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in">
                <Loader2 className="size-12 animate-spin mb-4 text-indigo-500" />
                <p className="font-bold tracking-wider text-lg animate-pulse">
                  MAGIC WORKING...
                </p>
                <p className="text-xs text-white/60 mt-2 max-w-xs">
                  {loadingTip}
                </p>
              </div>
            )}
          </div>

          <div className="w-full">
            {!resultSrc ? (
              <div className="bg-card border p-4 rounded-2xl shadow-sm flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Brush className="size-3" /> Ukuran Kuas
                      </span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="200"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      onTouchStart={() => setShowBrushPreview(true)}
                      onTouchEnd={() => setShowBrushPreview(false)}
                      onMouseDown={() => setShowBrushPreview(true)}
                      onMouseUp={() => setShowBrushPreview(false)}
                      className="w-full h-2 bg-muted rounded-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Zap className="size-3" /> Kekuatan Hapus
                      </span>
                      <span>{eraserStrength}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={eraserStrength}
                      onChange={(e) =>
                        setEraserStrength(Number(e.target.value))
                      }
                      className="w-full h-2 bg-muted rounded-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Triangle className="size-3" /> Level Detail (AI)
                      </span>
                      <span>{detailLevel}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={detailLevel}
                      onChange={(e) => setDetailLevel(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="h-px bg-border"></div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex bg-muted rounded-lg p-1 shrink-0 self-start sm:self-auto">
                    {["HD", "MED"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q as "HD" | "MED")}
                        className={cn(
                          "px-4 py-2 text-xs font-bold rounded-md transition-all flex-1 sm:flex-none",
                          quality === q
                            ? "bg-white shadow text-indigo-600"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {q === "HD" ? "Ultra HD" : "Web Fast"}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={processEraser}
                    disabled={isProcessing}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg h-12 text-sm rounded-xl transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="mr-2 size-4" /> Hapus Objek Sekarang
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card border p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 animate-in slide-in-from-bottom-4">
                <Button
                  variant="outline"
                  className="flex-1 font-medium h-12 rounded-xl border-2"
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                >
                  <Eye className="mr-2 size-4" /> Tahan untuk Bandingkan
                </Button>
                <Button
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg h-12 rounded-xl"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 size-4" /> Download {quality} Result
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
