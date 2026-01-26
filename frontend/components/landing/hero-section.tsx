import { Suspense } from "react";
import { Zap, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { EditorWrapper } from "@/components/editor-wrapper"; // Pastikan path ini benar
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pt-4 sm:pt-10">
      {/* --- BADGE (Glass Style & Pulsing Dot) --- */}
      <div className="inline-flex items-center justify-center">
        <div className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 mb-4 cursor-default shadow-sm hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300">
          <span className="relative flex h-2 w-2 mr-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="uppercase tracking-widest text-[10px] font-bold">
            Azura Engine v3.1 Online
          </span>
        </div>
      </div>

      {/* --- H1 TITLE (SEO & Mobile Optimized) --- */}
      <div className="space-y-4 px-2">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-foreground text-balance leading-[1.1] sm:leading-[1.15]">
          Hapus Background <br className="hidden sm:block" />
          {/* Class animate-gradient sekarang diambil dari globals.css */}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
            Cepat, Gratis & Otomatis.
          </span>
        </h1>

        {/* --- SUBTITLE --- */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-muted-foreground text-pretty px-4 leading-relaxed">
          Upload foto, dan biarkan AI <b>Azura Remove BG</b> bekerja dalam
          hitungan detik. Tanpa daftar, tanpa watermark, kualitas HD.
        </p>
      </div>

      {/* --- TRUST BADGES (Mobile Stack) --- */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-8 text-xs sm:text-sm font-medium text-muted-foreground/80 pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10">
          <Zap className="size-3.5 text-amber-500 fill-amber-500/20" /> 0.8
          Detik
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <CheckCircle2 className="size-3.5 text-emerald-500" /> Resolusi HD
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10">
          <ShieldCheck className="size-3.5 text-blue-500" /> Auto-Delete Data
        </div>
      </div>

      {/* --- EDITOR WRAPPER (Lazy Load) --- */}
      <div
        id="editor"
        className="mx-auto mt-10 md:mt-16 max-w-5xl relative z-10 scroll-mt-24 px-2 sm:px-0"
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 opacity-40 blur-3xl -z-10 animate-pulse" />

        <div className="relative bg-card rounded-3xl shadow-2xl ring-1 ring-border/50 overflow-hidden border border-white/10 min-h-[500px]">
          {/* Top Bar Decoration */}
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <Suspense
            fallback={
              <div className="h-[500px] flex items-center justify-center flex-col gap-4 bg-muted/5 animate-pulse">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                  <Loader2 className="relative size-12 animate-spin text-indigo-500" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                  Memuat Studio AI...
                </p>
              </div>
            }
          >
            <EditorWrapper />
          </Suspense>
        </div>

        {/* Security Note */}
        <p className="text-[10px] md:text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2 opacity-70 hover:opacity-100 transition-opacity select-none cursor-default">
          <ShieldCheck className="size-3 text-emerald-500" />
          <span>
            Server aman. File Anda bersifat privat dan dihapus otomatis.
          </span>
        </p>
      </div>
    </section>
  );
}
