"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Download,
  Check,
  Image as ImageIcon,
  Upload,
  X,
  ScanLine,
  Columns,
  History,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CompareSlider } from "./compare-slider";

interface ResultPreviewProps {
  original: string;
  processed: string;
  filename: string;
}

const BACKGROUND_OPTIONS = [
  {
    name: "Transparent",
    value: "transparent",
    class: "bg-gray-100 ring-gray-300",
  },
  { name: "Merah", value: "#db1514", class: "bg-[#db1514] ring-red-400" },
  { name: "Biru", value: "#0b0bba", class: "bg-[#0b0bba] ring-blue-400" },
  { name: "Putih", value: "#ffffff", class: "bg-white ring-gray-200" },
  { name: "Hitam", value: "#000000", class: "bg-black ring-gray-600" },
  { name: "Kuning", value: "#facc15", class: "bg-yellow-400 ring-yellow-300" },
  { name: "Abu-abu", value: "#6b7280", class: "bg-gray-500 ring-gray-400" },
  { name: "Hijau", value: "#00ff00", class: "bg-[#00ff00] ring-green-400" },
];

export function ResultPreview({
  original,
  processed,
  filename,
}: ResultPreviewProps) {
  const [selectedBg, setSelectedBg] = useState("transparent");
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"side-by-side" | "slider">(
    "side-by-side"
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCustomBgImage(imageUrl);
      setSelectedBg("custom");
    }
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const foregroundImg = new window.Image();
    foregroundImg.crossOrigin = "anonymous";
    foregroundImg.src = processed;

    foregroundImg.onload = () => {
      canvas.width = foregroundImg.naturalWidth;
      canvas.height = foregroundImg.naturalHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const processDownload = () => {
        ctx.drawImage(foregroundImg, 0, 0);
        const link = document.createElement("a");
        const isPng = selectedBg === "transparent";
        const ext = isPng ? "png" : "jpg";
        link.download = `RaditStudio-${filename.split(".")[0]}-${isPng ? "nobg" : "edit"}.${ext}`;
        link.href = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 1.0);
        link.click();
      };

      if (selectedBg === "custom" && customBgImage) {
        const bgImg = new window.Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = customBgImage;
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          processDownload();
        };
      } else if (selectedBg === "transparent") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        processDownload();
      } else {
        ctx.fillStyle = selectedBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        processDownload();
      }
    };
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          Preview Result
        </h3>

        <div className="flex bg-muted rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              viewMode === "side-by-side"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Columns className="size-3.5" />{" "}
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            onClick={() => setViewMode("slider")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              viewMode === "slider"
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ScanLine className="size-3.5" /> Slider
          </button>
        </div>
      </div>

      {/* VIEW AREA */}
      {viewMode === "slider" ? (
        <div className="w-full max-w-2xl mx-auto border rounded-2xl shadow-sm bg-card p-1">
          <CompareSlider
            original={original}
            processed={processed}
            background={selectedBg}
            customImage={customBgImage}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {/* Original */}
          <div className="space-y-2">
            <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/30">
              <Image
                src={original}
                alt="Original"
                fill
                className="object-contain p-2"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                Original
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-2">
            <div className="relative aspect-square overflow-hidden rounded-xl border shadow-sm transition-all duration-300 group">
              <div className="absolute inset-0 transition-colors duration-300">
                {selectedBg === "custom" && customBgImage ? (
                  <Image
                    src={customBgImage}
                    alt="Custom BG"
                    fill
                    className="object-cover opacity-90"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundColor:
                        selectedBg === "transparent"
                          ? "transparent"
                          : selectedBg,
                      backgroundImage:
                        selectedBg === "transparent"
                          ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                          : "none",
                      backgroundSize: "20px 20px",
                    }}
                  />
                )}
              </div>
              <Image
                src={processed}
                alt="Processed"
                fill
                className="object-contain z-10 p-2"
                unoptimized
              />
              <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                Ai Result
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTROL PANEL UTAMA (DESAIN BARU) */}
      <div className="rounded-2xl border bg-card p-5 md:p-6 shadow-sm ring-1 ring-border/50">
        <div className="flex flex-col gap-6">
          {/* Section Pilih Background */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Palette className="size-4 text-indigo-500" />
                Pilih Background
              </p>
              <span className="text-xs text-muted-foreground">
                {selectedBg === "custom"
                  ? "Custom Image"
                  : selectedBg === "transparent"
                    ? "Transparan"
                    : "Warna Solid"}
              </span>
            </div>

            {/* Scrollable Container dengan Padding Biar Gak Kepotong */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Tombol Upload Custom - Lebih Besar */}
              <div className="relative shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCustomBgUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className={cn(
                    "size-12 rounded-full border-2 border-dashed border-indigo-300 transition-all hover:border-indigo-600 hover:bg-indigo-50 p-0",
                    selectedBg === "custom" &&
                      "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Background Sendiri"
                >
                  {selectedBg === "custom" ? (
                    <ImageIcon className="size-5 text-indigo-600" />
                  ) : (
                    <Upload className="size-5 text-muted-foreground" />
                  )}
                </Button>
                {selectedBg === "custom" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBg("transparent");
                      setCustomBgImage(null);
                    }}
                    className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <div className="h-8 w-px bg-border mx-2 shrink-0 hidden sm:block" />

              {/* Loop Warna - Ukuran Lebih Besar (size-12) */}
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => {
                    setSelectedBg(bg.value);
                    setCustomBgImage(null);
                  }}
                  className={cn(
                    "group relative size-12 rounded-full border-2 transition-all hover:scale-110 shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    bg.class,
                    selectedBg === bg.value
                      ? "scale-110 shadow-lg ring-2 ring-offset-2 border-white/50"
                      : "border-transparent opacity-90 hover:opacity-100"
                  )}
                  title={bg.name}
                >
                  {selectedBg === bg.value && (
                    <span className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                      <Check
                        className={cn(
                          "size-6 shadow-sm",
                          ["#ffffff", "transparent", "#facc15"].includes(
                            bg.value
                          )
                            ? "text-black"
                            : "text-white"
                        )}
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          {/* Tombol Download */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground hidden sm:block">
              *Hasil download akan menyesuaikan background yang dipilih.
            </p>
            <Button
              onClick={handleDownload}
              size="lg"
              className="w-full sm:w-auto min-w-[200px] font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
              <Download className="mr-2 size-5" />
              Download {selectedBg === "transparent" ? "PNG" : "JPG"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
