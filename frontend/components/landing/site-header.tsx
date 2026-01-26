"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Fitur" },
  { href: "#performance", label: "Kecepatan" },
  { href: "#donate", label: "Dukungan" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Optimasi Scroll Listener (Passive)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
            : "bg-transparent border-transparent",
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* --- LOGO & BRANDING --- */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
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
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Github className="size-5" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY (ANIMATED) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 border-b bg-background/95 backdrop-blur-xl md:hidden shadow-2xl"
          >
            <nav className="container flex flex-col gap-4 p-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-foreground hover:text-indigo-600 transition-colors flex items-center justify-between border-b border-border/50 pb-3"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <Link
                  href="https://github.com/Azura165"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground font-medium text-sm"
                >
                  <Github className="size-4" /> Star on GitHub
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
