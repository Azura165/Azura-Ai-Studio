"use client";

import { Suspense, useState, useEffect } from "react";
import { EditorWrapper } from "@/components/editor-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeaturesAnimation, StatCard } from "@/components/landing-client";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  Layers,
  Award,
  Video,
  ShieldCheck,
  ChevronDown,
  Image as ImageIcon,
  Clock,
  Heart,
  Github,
  Globe,
  Server,
  Store,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Coffee,
  CheckCircle2,
  XCircle,
  Loader2,
  Code2,
  Cpu,
  Database,
  Lock,
  Activity,
  Terminal,
  ArrowUp,
  Instagram,
  UploadCloud,
  Wand2,
  Download,
  FileCode,
} from "lucide-react";
import Link from "next/link";

// --- CUSTOM ICONS ---
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

const PythonLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22zM22.06 9.76l.06.12.05.24.01.15-.01.16-.06.01h-8.16v9.25h4.92l1.18.03 1.05.14.88.24.73.32.59.42.46.51.36.58.26.66.18.73.12.82.04.89-.05 1.28-.16 1.05-.24.87-.32.71-.36.57-.4.44-.42.33-.42.24-.4.16-.36.1-.32.05-.24.01h-.16l-.06-.01-1.27-.05-1.25-.13-1.09-.23-1.02-.35-.93-.46-.72-.53-.66-.66-.52-.72-.46-.93-.35-1.02-.23-1.09-.13-1.25-.05-1.27v-3.06h3.08l.21.03.28.07.32.12.35.18.36.26.36.36.35.46.32.59.28.73.21.88.14 1.05.05 1.23-.06 1.22-.16 1.04-.24.87-.32.71-.36.57-.4.44-.42.33-.42.24-.4.16-.36.1-.32.05-.24.01h-.16l-.06-.01h-8.16v.83h11.74l.01 2.75.02.37-.05.34-.11.31-.17.28-.25.26-.31.23-.38.2-.44.18-.51.15-.58.12-.64.1-.71.06-.77.04-.84.02-1.27-.05zm-5.58 8.92l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22z" />
  </svg>
);

export default function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* SCROLL TO TOP BUTTON */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-indigo-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-indigo-700 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="size-5" />
      </button>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-all">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform">
              <Sparkles className="size-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight tracking-tight">
                Azura AI Studio
              </span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                  Systems Online v3.0
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
              <Link
                href="#features"
                className="hover:text-indigo-600 transition-colors"
              >
                Fitur
              </Link>
              <Link
                href="#performance"
                className="hover:text-indigo-600 transition-colors"
              >
                Benchmark
              </Link>
              <Link
                href="#donate"
                className="hover:text-indigo-600 transition-colors"
              >
                Dukungan
              </Link>
            </nav>
            <div className="h-6 w-px bg-border hidden md:block"></div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto px-4 py-8 md:py-16 space-y-24 md:space-y-32">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-5xl text-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 cursor-default shadow-sm hover:bg-indigo-500/20 transition-colors">
            <Zap className="mr-1.5 size-3.5 fill-current" />
            New Engine: Python FastAPI Turbo
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-foreground text-balance leading-tight">
            Advanced AI Media Tools <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Zero Latency. Total Privacy.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground text-pretty px-4 leading-relaxed">
            Platform All-in-One untuk kebutuhan kreatif digital. Hapus
            background HD, hilangkan objek mengganggu, dan download video sosial
            media tanpa watermark.
            <span className="block mt-2 font-semibold text-foreground">
              Didukung oleh GPU Acceleration & Smart Caching.
            </span>
          </p>

          {/* EDITOR WRAPPER */}
          <div
            id="editor"
            className="mx-auto mt-8 md:mt-12 max-w-4xl relative z-10 scroll-mt-24"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40 opacity-30 blur-3xl -z-10 animate-pulse" />

            <div className="relative bg-card rounded-3xl shadow-2xl ring-1 ring-border/50 overflow-hidden border border-white/10">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

              <Suspense
                fallback={
                  <div className="h-[500px] flex items-center justify-center flex-col gap-4">
                    <Loader2 className="size-10 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Memuat Modul AI...
                    </p>
                  </div>
                }
              >
                <EditorWrapper />
              </Suspense>
            </div>

            <p className="text-[10px] md:text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2 opacity-80">
              <ShieldCheck className="size-3 text-emerald-500" />
              <span>
                Enkripsi SSL 256-bit aktif. File otomatis dihapus dalam 30
                menit.
              </span>
            </p>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="border-y bg-card/30 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-border/50 max-w-6xl mx-auto">
            <StatCard
              icon={<Activity className="size-5 text-indigo-500" />}
              value="0.8s"
              label="Rata-rata Proses"
              delay={0}
            />
            <StatCard
              icon={<Database className="size-5 text-emerald-500" />}
              value="100%"
              label="Privasi Data"
              delay={0.1}
            />
            <StatCard
              icon={<Video className="size-5 text-blue-500" />}
              value="4K"
              label="Support Video"
              delay={0.2}
            />
            <StatCard
              icon={<Award className="size-5 text-amber-500" />}
              value="Gratis"
              label="Tanpa Batas Harian"
              delay={0.3}
            />
          </div>
        </section>

        {/* --- PERFORMANCE BENCHMARK --- */}
        <section id="performance" className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Real-World Performance
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami mengganti mesin lama (Node.js) dengan{" "}
              <strong>Python FastAPI</strong> yang dijalankan secara
              Asynchronous. Hasilnya adalah peningkatan kecepatan yang drastis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {/* Chart Lama */}
              <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <h4 className="font-bold text-muted-foreground mb-2 flex items-center gap-2">
                  <Server className="size-4" /> Versi Lama (v1.0)
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Remove BG (HD)</span>
                      <span>4.5 detik</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 w-[70%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Video Parsing</span>
                      <span>2.1 detik</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 w-[40%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Baru */}
              <div className="bg-card border border-indigo-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden ring-2 ring-indigo-500/10">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Zap className="size-4 text-indigo-500" /> Versi Sekarang
                  (v3.0)
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold text-indigo-600">
                      <span>Remove BG (HD)</span>
                      <span>0.8 detik</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[15%] animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold text-indigo-600">
                      <span>Video Parsing</span>
                      <span>0.3 detik</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[5%] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pl-0 md:pl-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Terminal className="size-5 text-indigo-500" />
                Teknologi di Balik Layar
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <li className="flex gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                  <span>
                    <strong>Multithreading:</strong> Server memproses download
                    video dan edit foto secara bersamaan tanpa saling tunggu
                    (Non-blocking).
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                  <span>
                    <strong>Smart Caching:</strong> Gambar yang sama tidak akan
                    diproses dua kali, menghemat waktu hingga 90%.
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                  <span>
                    <strong>FFmpeg Engine:</strong> Penggabungan video & audio
                    kualitas tertinggi dilakukan di sisi server dengan kompresi
                    lossless.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS (NEW SECTION) --- */}
        <section className="bg-muted/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">
              Cara Kerja Otomatis
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-4 group">
                <div className="size-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shadow-md group-hover:scale-110 transition-transform">
                  <UploadCloud className="size-8" />
                </div>
                <h3 className="font-bold text-lg">1. Upload Media</h3>
                <p className="text-sm text-muted-foreground">
                  Pilih foto atau tempel link video yang ingin Anda proses.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 group">
                <div className="size-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shadow-md group-hover:scale-110 transition-transform">
                  <Wand2 className="size-8" />
                </div>
                <h3 className="font-bold text-lg">2. AI Memproses</h3>
                <p className="text-sm text-muted-foreground">
                  Mesin Python kami mendeteksi subjek, menghapus background,
                  atau mengambil video HD.
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 group">
                <div className="size-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shadow-md group-hover:scale-110 transition-transform">
                  <Download className="size-8" />
                </div>
                <h3 className="font-bold text-lg">3. Download Hasil</h3>
                <p className="text-sm text-muted-foreground">
                  Simpan hasil edit kualitas tinggi ke perangkat Anda secara
                  gratis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- USE CASES --- */}
        <section className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Siapa yang Butuh Tools Ini?
            </h2>
            <p className="text-muted-foreground">
              Dirancang untuk berbagai kebutuhan profesional dan harian.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UseCaseCard
              icon={<Store className="size-6 text-indigo-600" />}
              title="UMKM / Shop"
              desc="Foto produk profesional background putih instan."
            />
            <UseCaseCard
              icon={<Instagram className="size-6 text-pink-600" />}
              title="Content Creator"
              desc="Repurpose video tanpa watermark untuk konten baru."
            />
            <UseCaseCard
              icon={<GraduationCap className="size-6 text-blue-600" />}
              title="Pelajar"
              desc="Edit pas foto sekolah atau presentasi tugas."
            />
            <UseCaseCard
              icon={<Briefcase className="size-6 text-emerald-600" />}
              title="Desainer"
              desc="Percepat workflow masking yang membosankan."
            />
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto px-4">
              Semua alat yang Anda butuhkan dalam satu platform terintegrasi.
            </p>
          </div>

          <FeaturesAnimation>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-2">
              <FeatureCard
                icon={<Layers className="size-6 text-indigo-500" />}
                title="Magic Eraser v2"
                description="Hapus objek, orang, atau teks dari foto dengan kuas pintar. Hasil mulus berkat Inpainting AI terbaru."
              />
              <FeatureCard
                icon={<Zap className="size-6 text-amber-500" />}
                title="Batch Processor"
                description="Edit banyak foto sekaligus. Ganti background untuk 50 foto produk hanya dalam sekali klik."
              />
              <FeatureCard
                icon={<Video className="size-6 text-rose-500" />}
                title="Video DL Universal"
                description="Download dari YouTube, TikTok, IG, Twitter. Pilih resolusi 4K, 1080p, atau ambil audionya saja (MP3)."
              />
              <FeatureCard
                icon={<ImageIcon className="size-6 text-emerald-500" />}
                title="Smart Upscaler"
                description="Foto pecah jadi tajam. Tingkatkan resolusi foto lama Anda hingga 2x atau 4x tanpa blur."
              />
              <FeatureCard
                icon={<ShieldCheck className="size-6 text-cyan-500" />}
                title="Auto-Wipe Privacy"
                description="Tidak ada database pengguna. File Anda otomatis dimusnahkan server setiap 30 menit."
              />
              <FeatureCard
                icon={<Award className="size-6 text-purple-500" />}
                title="Professional Grade"
                description="Output file PNG transparan berkualitas tinggi (HD) yang siap untuk desain grafis atau e-commerce."
              />
            </div>
          </FeaturesAnimation>
        </section>

        {/* --- RUNNING TEXT MARQUEE (NEW FEATURE) --- */}
        <section className="bg-indigo-950 text-indigo-200 py-3 overflow-hidden border-y border-indigo-800">
          <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs font-bold uppercase tracking-widest">
            <span>Supported Formats:</span>
            <span className="text-white">JPG</span>
            <span className="text-white">PNG</span>
            <span className="text-white">WEBP</span>
            <span className="text-white">MP4</span>
            <span className="text-white">MP3</span>
            <span className="text-white">MKV</span>
            <span className="text-white">4K ULTRA HD</span>
            <span className="text-white">1080P FHD</span>
            <span>•</span>
            <span>Supported Formats:</span>
            <span className="text-white">JPG</span>
            <span className="text-white">PNG</span>
            <span className="text-white">WEBP</span>
            <span className="text-white">MP4</span>
            <span className="text-white">MP3</span>
            <span className="text-white">MKV</span>
            <span className="text-white">4K ULTRA HD</span>
            <span className="text-white">1080P FHD</span>
          </div>
        </section>

        {/* --- TECH STACK --- */}
        <section className="text-center bg-muted/20 py-12 rounded-3xl">
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-2">Powered By Open Source</h2>
            <p className="text-sm text-muted-foreground">
              Dibangun di atas raksasa teknologi modern.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
            <div className="flex flex-col items-center gap-2">
              <Code2 className="size-8 text-black dark:text-white" />
              <span className="text-xs font-bold">Next.js 14</span>
            </div>
            {/* LOGO FASTAPI (ZAP ICON - CORRECT REPRESENTATION) */}
            <div className="flex flex-col items-center gap-2">
              <Zap className="size-8 text-emerald-500 fill-emerald-500/20" />
              <span className="text-xs font-bold">FastAPI</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Cpu className="size-8 text-blue-500" />
              <span className="text-xs font-bold">ONNX Runtime</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Video className="size-8 text-green-600" />
              <span className="text-xs font-bold">FFmpeg</span>
            </div>
          </div>
        </section>

        {/* DONATION SECTION */}
        <section
          id="donate"
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 text-white py-20 px-6 text-center shadow-2xl mx-2 md:mx-0"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full mb-2 backdrop-blur-md ring-1 ring-white/10 shadow-lg">
              <Coffee className="size-8 text-yellow-400" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Support Our Development
            </h2>

            <div className="space-y-4 text-indigo-100 text-base md:text-lg leading-relaxed max-w-lg mx-auto font-light">
              <p>
                Menyediakan layanan GPU server gratis memerlukan biaya yang
                tidak sedikit setiap bulannya.
              </p>
              <p>
                Jika tools ini membantu pekerjaan Anda, traktir kami kopi agar
                server tetap menyala 24/7.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button className="inline-flex items-center justify-center gap-2 bg-white text-indigo-950 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg active:scale-95">
                <Heart className="size-5 text-red-500 fill-red-500" />
                Donate via Saweria
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-transparent text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/20 active:scale-95">
                <Github className="size-5" />
                Star on GitHub
              </button>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="max-w-3xl mx-auto px-2">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Pertanyaan Umum (FAQ)</h2>
            <p className="text-muted-foreground">
              Jawaban cepat untuk rasa penasaran Anda.
            </p>
          </div>
          <div className="space-y-4">
            <DetailsItem question="Apakah benar-benar gratis?">
              Ya, 100%. Tidak ada fitur yang dikunci (Paywall), tidak ada
              watermark, dan tidak perlu mendaftar akun. Kami hidup dari donasi
              komunitas.
            </DetailsItem>
            <DetailsItem question="Berapa lama file saya disimpan?">
              Sistem kami menjalankan Cleanup Script otomatis. Setiap file yang
              diupload atau dihasilkan akan dihapus permanen dari server dalam
              waktu maksimal 30 menit.
            </DetailsItem>
            <DetailsItem question="Apakah mendukung video 4K?">
              Ya! Fitur Video Downloader kami mendukung resolusi hingga 4K
              (2160p) jika sumber aslinya menyediakannya.
            </DetailsItem>
            <DetailsItem question="Kenapa prosesnya cepat sekali?">
              Kami menggunakan teknologi Asynchronous Processing dengan Python
              FastAPI. Ini memungkinkan server menangani banyak permintaan
              sekaligus tanpa antrian panjang.
            </DetailsItem>
          </div>
        </section>

        {/* --- FINAL CTA (NEW) --- */}
        <section className="text-center py-10">
          <h3 className="text-2xl font-bold mb-4">Siap Mencoba?</h3>
          <Button
            size="lg"
            onClick={scrollToTop}
            className="rounded-full px-8 h-12 bg-indigo-600 hover:bg-indigo-700 shadow-xl"
          >
            Mulai Edit Sekarang <ArrowUp className="ml-2 size-4" />
          </Button>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t bg-card pt-16 pb-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="space-y-4 col-span-1 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
                  <Sparkles className="size-4 text-white" />
                </div>
                <span className="text-lg font-bold">Radit AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Platform teknologi kreatif Indonesia yang berfokus pada
                kecepatan, privasi, dan aksesibilitas untuk semua.
              </p>
              <div className="flex gap-4 pt-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-indigo-500 transition-colors"
                >
                  <XLogo className="size-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-indigo-500 transition-colors"
                >
                  <Github className="size-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-indigo-500 transition-colors"
                >
                  <Globe className="size-5" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-foreground">Tools</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/?tool=single#editor"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    Background Remover
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?tool=eraser#editor"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    Magic Eraser
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?tool=video#editor"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    Video Downloader
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?tool=single#editor"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    Image Upscaler
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-foreground">Legal & Info</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    Status Server
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-indigo-500 transition-colors"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-foreground">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dapatkan info update fitur terbaru langsung di email Anda.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="bg-background border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  Join
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Azura AI Studio. All rights
              reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                Made with <Heart className="size-3 text-red-500 fill-red-500" />{" "}
                in Indonesia
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* GLOBAL CSS FOR MARQUEE ANIMATION */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

// --- SUB COMPONENTS ---

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card/50 p-6 hover:bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default h-full">
      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-background p-3 ring-1 ring-border group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function UseCaseCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border rounded-2xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-md group">
      <div className="size-12 bg-muted rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function DetailsItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border rounded-xl bg-card p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer transition-all hover:bg-muted/50 open:bg-muted/30 open:ring-1 open:ring-indigo-500/20">
      <summary className="flex items-center justify-between font-medium text-foreground text-lg select-none">
        {question}
        <ChevronDown className="size-5 transition-transform duration-300 group-open:rotate-180 text-muted-foreground" />
      </summary>
      <div className="mt-4 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 text-sm">
        {children}
      </div>
    </details>
  );
}
