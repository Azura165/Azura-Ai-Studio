"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Logic: Tampilkan jika scroll > 300px
          // Menggunakan requestAnimationFrame agar sinkron dengan refresh rate layar (60Hz/120Hz)
          setIsVisible(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Optimization: Passive listener wajib untuk scroll performance di Mobile
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 transition-all duration-500 ease-in-out hover:bg-indigo-700 hover:scale-110 active:scale-95 md:bottom-10 md:right-10",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0 pointer-events-none",
      )}
      aria-label="Scroll to top"
      aria-hidden={!isVisible} // A11y: Sembunyikan dari screen reader jika tidak visible
    >
      <ArrowUp className="size-5 md:size-6" />
    </Button>
  );
}
