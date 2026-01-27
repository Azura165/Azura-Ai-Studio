"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Fitur" },
  { href: "#performance", label: "Kecepatan" },
  { href: "#donate", label: "Dukungan" },
];

// --- SUB-COMPONENT OPTIMIZED (ISOLATED RENDER) ---
// Kita pisah ini biar ringan. Kalau Header re-render karena scroll,
// komponen ini GAK IKUT re-render kecuali props-nya berubah.
const MobileMenuContent = memo(({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15, ease: "easeOut" }} // Durasi super cepet
      className="absolute top-full left-0 w-full bg-background border-b border-border/20 shadow-xl md:hidden overflow-hidden will-change-transform"
    >
      <nav className="container flex flex-col gap-1 p-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center justify-between rounded-lg p-3 text-base font-medium hover:bg-muted/50 transition-colors active:bg-muted touch-manipulation"
          >
            {link.label}
            <span className="text-muted-foreground text-sm">→</span>
          </Link>
        ))}

        <div className="my-2 h-px bg-border/50" />

        <div className="flex flex-col gap-2">
          <Link
            href="https://github.com/Azura165"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium text-muted-foreground bg-muted/30 hover:bg-muted transition-colors touch-manipulation"
          >
            <Github className="size-4" />
            Star on GitHub
          </Link>
          <Link href="#editor" onClick={onClose} className="w-full">
            <Button
              className="w-full font-bold shadow-sm touch-manipulation"
              size="lg"
            >
              Mulai Edit Sekarang
            </Button>
          </Link>
        </div>
      </nav>
    </motion.div>
  );
});

// Kasih display name buat debugging
MobileMenuContent.displayName = "MobileMenuContent";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- 1. SUPER OPTIMIZED SCROLL LISTENER ---
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const shouldScroll = window.scrollY > 15;
          // Cuma update state kalau nilainya BERUBAH. Hemat render!
          setIsScrolled((prev) =>
            prev !== shouldScroll ? shouldScroll : prev,
          );
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-200 ease-in-out",
        isScrolled || isMobileMenuOpen
          ? "bg-background border-border/50 shadow-sm"
          : "bg-transparent border-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        {/* --- LOGO --- */}
        <div className="flex items-center gap-3 z-50">
          <Link
            href="/"
            className="flex items-center gap-2 group touch-manipulation"
            onClick={handleLinkClick}
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="size-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight tracking-tight">
                Azura Remove BG
              </span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                  Online v3.1
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* --- DESKTOP NAV --- */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="h-6 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/Azura165"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
              >
                <Github className="size-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* --- MOBILE TOGGLE (OPTIMIZED) --- */}
        <div className="flex items-center gap-2 md:hidden z-50">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            // Toggle logic sederhana
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            // touch-manipulation: Hapus delay 300ms di browser mobile
            className="rounded-full active:bg-muted touch-manipulation"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </Button>
        </div>

        {/* --- MOBILE MENU RENDER --- */}
        <AnimatePresence>
          {isMobileMenuOpen && <MobileMenuContent onClose={handleLinkClick} />}
        </AnimatePresence>
      </div>
    </header>
  );
}
