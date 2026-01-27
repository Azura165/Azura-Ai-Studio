"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; // Pastikan path ini benar
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // Ganti 'motion/react' ke 'framer-motion' atau 'motion/react' sesuai versi
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Fitur" },
  { href: "#performance", label: "Kecepatan" },
  { href: "#donate", label: "Dukungan" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Optimasi: Event Listener Passive biar scroll ga berat
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
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
            : "bg-transparent border-transparent",
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* LOGO AREA */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Azura<span className="text-primary">.AI</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
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
            <Link href="#editor">
              <Button size="sm" className="rounded-full px-5 font-semibold">
                Mulai Edit
              </Button>
            </Link>
          </div>

          {/* MOBILE BURGER BUTTON */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY (FIXED & ANIMATED) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-x-0 top-16 z-40 border-b bg-background/95 backdrop-blur-xl shadow-2xl md:hidden overflow-hidden"
          >
            <nav className="container flex flex-col gap-2 p-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-md p-3 text-base font-medium hover:bg-muted transition-colors"
                >
                  {link.label}
                  <span className="text-muted-foreground">→</span>
                </Link>
              ))}

              <div className="my-2 h-px bg-border/50" />

              <Link
                href="https://github.com/Azura165"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md p-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Github className="size-5" />
                Star on GitHub
              </Link>

              <Link
                href="#editor"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2"
              >
                <Button className="w-full rounded-full" size="lg">
                  Mulai Edit Sekarang
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
