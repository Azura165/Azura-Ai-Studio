"use client";

import { useState } from "react";
import { UploadArea } from "./upload-area";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  RotateCcw,
  ScanFace,
  ChevronsLeftRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function UpscalerTab() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  const handleFile = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setOriginalUrl(URL.createObjectURL(files[0]));
      setResultUrl(null);
    }
  };

  const processUpscale = async () => {
    if (!file) return;
    setIsProcessing(true);
    // Info ke user kalau ini butuh waktu
    const toastId = toast.loading(
      "Processing AI Upscale... (Might take 1-3 mins)",
    );

    try {
      const formData = new FormData();
      formData.append("file", file);

      const controller = new AbortController();
      // TIMEOUT DIPERPANJANG JADI 5 MENIT (300.000 ms)
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const res = await fetch("http://127.0.0.1:5000/api/upscale", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 503)
        throw new Error("Server is downloading AI models, please wait 1 min.");
      if (!res.ok) throw new Error("Failed to upscale image.");

      const data = await res.json();
      setResultUrl(data.url);
      toast.success("Upscale Success! ✨", { id: toastId });
    } catch (e: any) {
      if (e.name === "AbortError") {
        toast.error("Process timeout! Image too complex or server busy.", {
          id: toastId,
        });
      } else {
        toast.error(e.message || "Processing failed.", { id: toastId });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <UploadArea onFilesSelected={handleFile} multiple={false} />
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 py-2 rounded-lg border border-dashed">
              <ScanFace className="size-4 text-indigo-500" />
              <span>Best for: Anime, Old Photos (Max 5 mins processing)</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="relative mx-auto w-full max-w-xl aspect-[3/4] md:aspect-video rounded-3xl overflow-hidden border-2 shadow-2xl bg-black/5 group select-none touch-none">
              {!resultUrl && !isProcessing && (
                <Image
                  src={originalUrl!}
                  alt="Original"
                  fill
                  className="object-contain"
                  unoptimized
                />
              )}

              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white z-50 px-4 text-center">
                  <Loader2 className="size-12 animate-spin text-indigo-500 mb-4" />
                  <p className="text-sm font-medium animate-pulse">
                    Running Neural Network (EDSR)...
                  </p>
                  <p className="text-xs text-white/50 mt-2">
                    Please wait, check terminal for progress.
                  </p>
                </div>
              )}

              {resultUrl && (
                <>
                  <div className="absolute inset-0">
                    <Image
                      src={resultUrl}
                      alt="HD"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div
                    className="absolute inset-0 overflow-hidden border-r-2 border-white/80 shadow-2xl"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src={originalUrl!}
                        alt="Original"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md">
                      BEFORE
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-lg">
                    AFTER (4K)
                  </div>

                  <div
                    className="absolute inset-0 z-20 cursor-ew-resize"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSliderPos(
                        ((e.clientX - rect.left) / rect.width) * 100,
                      );
                    }}
                    onTouchMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const touch = e.touches[0];
                      setSliderPos(
                        ((touch.clientX - rect.left) / rect.width) * 100,
                      );
                    }}
                  />

                  <div
                    className="absolute top-1/2 -translate-y-1/2 -ml-5 pointer-events-none z-30"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="size-10 bg-white rounded-full shadow-2xl flex items-center justify-center text-indigo-600 border-4 border-indigo-50">
                      <ChevronsLeftRight className="size-5" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!resultUrl && !isProcessing && (
                <Button
                  size="lg"
                  onClick={processUpscale}
                  className="w-full max-w-xs h-12 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl active:scale-95 transition-all"
                >
                  <Sparkles className="mr-2 size-5" /> Upscale 4x (AI)
                </Button>
              )}

              {resultUrl && (
                <>
                  <a
                    href={resultUrl}
                    download={`Radit-HD-${file?.name}`}
                    className="contents"
                  >
                    <Button
                      size="lg"
                      className="flex-1 h-12 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl active:scale-95 transition-all"
                    >
                      <Download className="mr-2 size-5" /> Save HD
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setFile(null);
                      setResultUrl(null);
                    }}
                    className="flex-1 h-12 rounded-2xl border-2 active:scale-95 transition-all"
                  >
                    <RotateCcw className="mr-2 size-5" /> New Image
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
