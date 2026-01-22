"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { UnfoldHorizontal } from "lucide-react";

interface CompareSliderProps {
  original: string;
  processed: string;
  background: string; // Tambahan: nerima kode warna
  customImage: string | null; // Tambahan: nerima gambar custom
}

export function CompareSlider({
  original,
  processed,
  background,
  customImage,
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  useEffect(() => {
    // Biar pas dilepas di luar area slider, resize berhenti
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square overflow-hidden rounded-xl border select-none cursor-col-resize group touch-none" // touch-none biar ga scroll pas di HP
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* --- LAPISAN BELAKANG (AFTER / HASIL) --- */}
      <div className="absolute inset-0">
        {/* Logic Background: Custom Image vs Warna vs Transparan */}
        {background === "custom" && customImage ? (
          <Image
            src={customImage}
            alt="Custom BG"
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                background === "transparent" ? "transparent" : background,
              backgroundImage:
                background === "transparent"
                  ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                  : "none",
              backgroundSize: "20px 20px",
            }}
          />
        )}

        {/* Gambar Hasil (PNG Transparan) */}
        <Image
          src={processed}
          alt="After"
          fill
          className="object-contain p-4 z-10 relative" // z-10 biar di atas background
          draggable={false}
          unoptimized
        />

        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] md:text-xs px-2 py-1 rounded z-20">
          Result
        </div>
      </div>

      {/* --- LAPISAN DEPAN (BEFORE / ORIGINAL) --- */}
      <div
        className="absolute inset-0 border-r-2 border-white bg-background/5"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, // Ini magic-nya slider
        }}
      >
        {/* Gambar Asli biasanya full, jadi nutupin background di belakangnya */}
        <Image
          src={original}
          alt="Before"
          fill
          className="object-contain p-4 bg-gray-900/10 backdrop-blur-[1px]" // Sedikit gelap biar beda
          draggable={false}
        />
        <div className="absolute bottom-4 left-4 bg-indigo-600/80 text-white text-[10px] md:text-xs px-2 py-1 rounded shadow-lg">
          Original
        </div>
      </div>

      {/* --- PEGANGAN SLIDER (HANDLE) --- */}
      <div
        className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-col-resize z-30 flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="size-8 md:size-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-indigo-100">
          <UnfoldHorizontal className="size-4 md:size-5 text-indigo-600" />
        </div>
      </div>
    </div>
  );
}
