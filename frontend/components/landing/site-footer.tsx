import Link from "next/link";
import { Sparkles, Heart, Github, Globe, MapPin } from "lucide-react";

// X Logo (SVG Icon)
const XLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function SiteFooter() {
  return (
    // OPTIMASI: Hapus 'backdrop-blur' dan ganti bg jadi solid ringan agar tidak berat di HP
    <footer className="border-t bg-muted/20 mt-20 pt-12 pb-8">
      <div className="container mx-auto px-4">
        {/* GRID LAYOUT: Mobile (1 Col) -> Tablet (2 Col) -> Desktop (4 Col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* 1. BRAND & MISSION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
                <Sparkles className="size-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Azura Remove BG
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Platform AI kreatif Indonesia. Hapus background, edit foto, dan
              download video tanpa batas.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://github.com/Azura165"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X / Twitter"
              >
                <XLogo className="size-5" />
              </a>
            </div>
          </div>

          {/* 2. PRODUCT LINKS */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-foreground">
              Fitur
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/?tool=single#editor"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Hapus Background
                </Link>
              </li>
              <li>
                <Link
                  href="/?tool=eraser#editor"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Magic Eraser
                </Link>
              </li>
              <li>
                <Link
                  href="/?tool=video#editor"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Video Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. LEGAL / RESOURCES */}
          <div>
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-foreground">
              Info
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="https://github.com/Azura165"
                  target="_blank"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Source Code
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Status Server
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. DEVELOPER CARD (Optimized for Mobile) */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
              Developer
            </h3>
            <div className="p-3 rounded-xl bg-background border border-border/60 shadow-sm hover:border-indigo-500/30 transition-colors group">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                  RD
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground group-hover:text-indigo-600 transition-colors">
                    Radithya Dev
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-2.5" /> Indonesia
                  </p>
                </div>
              </div>
              <a
                href="https://portofolio-radithya.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-muted/50 hover:bg-muted text-foreground text-[10px] font-bold py-2 rounded-lg transition-colors"
              >
                <Globe className="size-3" /> Lihat Portofolio
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR (Clean & Lightweight) */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Azura Remove BG. Open Source
            Project.
          </p>
          <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border border-border/30">
            <span>Code with</span>
            <Heart className="size-3 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://github.com/Azura165"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-foreground hover:text-indigo-600 transition-colors"
            >
              Azura Dev
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
