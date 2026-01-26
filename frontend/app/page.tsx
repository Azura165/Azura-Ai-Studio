import { Metadata } from "next";
import {
  Layers,
  Award,
  Video,
  ShieldCheck,
  Image as ImageIcon,
  Activity,
  Database,
  Zap,
  Store,
  Instagram,
  GraduationCap,
  Briefcase,
  Code2,
  Cpu,
  ArrowUp,
} from "lucide-react";

// Components
import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import {
  PerformanceSection,
  HowItWorksSection,
  DonationSection,
  FaqSection,
} from "@/components/landing/info-sections";
import { FeatureCard, UseCaseCard } from "@/components/landing/shared-ui";
import { SiteFooter } from "@/components/landing/site-footer";
import { ScrollToTop } from "@/components/landing/scroll-to-top";
import { StatCard, FeaturesAnimation } from "@/components/landing-client";
import { Button } from "@/components/ui/button";

// --- SEO OPTIMIZATION (Metadata Server) ---
export const metadata: Metadata = {
  title: "Azura Remove BG - Hapus Background Otomatis & Gratis (HD)",
  description:
    "Tools AI all-in-one: Hapus background foto, Magic Eraser, dan Video Downloader tanpa watermark. Gratis, Cepat, dan Privasi Terjamin.",
  keywords: [
    "remove bg",
    "hapus background",
    "magic eraser",
    "video downloader",
    "azura remove bg",
    "edit foto online",
    "upscale image",
  ],
  authors: [{ name: "Radithya Development" }],
  openGraph: {
    title: "Azura Remove BG - AI Tools Kreatif Gratis",
    description:
      "Hapus background dan edit foto dalam hitungan detik. Tanpa daftar, tanpa bayar.",
    type: "website",
    locale: "id_ID",
  },
  alternates: {
    // Pastikan ganti URL ini nanti dengan domain production kamu (misal azura.vercel.app)
    canonical: "https://azura-remove-bg.vercel.app",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Client Component untuk Scroll */}
      <ScrollToTop />

      <SiteHeader />

      <main className="container mx-auto px-4 py-8 md:py-16 space-y-24 md:space-y-32">
        {/* HERO SECTION */}
        <HeroSection />

        {/* STATS */}
        <section className="border-y bg-card/30 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-border/50 max-w-6xl mx-auto">
            <StatCard
              icon={<Activity className="size-5 text-indigo-500" />}
              value="0.8s"
              label="Proses Cepat"
              delay={0}
            />
            <StatCard
              icon={<Database className="size-5 text-emerald-500" />}
              value="100%"
              label="Privasi Aman"
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
              label="Unlimited"
              delay={0.3}
            />
          </div>
        </section>

        <PerformanceSection />
        <HowItWorksSection />

        {/* USE CASES */}
        {/* USE CASES - Mobile Responsive Grid 2x2 */}
        <section className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Solusi Untuk Semua
            </h2>
            <p className="text-muted-foreground">
              Azura Remove BG dirancang untuk berbagai kebutuhan.
            </p>
          </div>
          {/* Ubah grid-cols-1 jadi grid-cols-2 untuk tampilan 2 kolom di HP */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <UseCaseCard
              icon={<Store className="size-5 md:size-6 text-indigo-600" />}
              title="UMKM / Seller"
              desc="Foto katalog bersih & profesional instan."
            />
            <UseCaseCard
              icon={<Instagram className="size-5 md:size-6 text-pink-600" />}
              title="Content Creator"
              desc="Bikin thumbnail & konten sosmed estetik."
            />
            <UseCaseCard
              icon={
                <GraduationCap className="size-5 md:size-6 text-blue-600" />
              }
              title="Pelajar"
              desc="Edit pas foto atau tugas sekolah."
            />
            <UseCaseCard
              icon={<Briefcase className="size-5 md:size-6 text-emerald-600" />}
              title="Desainer"
              desc="Masking otomatis, hemat waktu kerja."
            />
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="scroll-mt-24">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 md:mb-4">
              Fitur Azura
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Teknologi AI tercanggih dalam satu platform yang mudah digunakan.
            </p>
          </div>
          <FeaturesAnimation>
            {/* GRID LAYOUT:
                - grid-cols-2: Langsung 2 kolom di HP.
                - gap-3: Jarak rapat di HP biar rapi.
                - px-2: Padding samping minimalis.
            */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2">
              <FeatureCard
                icon={<Layers className="size-5 md:size-6 text-indigo-500" />}
                title="Magic Eraser"
                description="Hapus objek pengganggu dengan kuas pintar." // Teks dipersingkat
              />
              <FeatureCard
                icon={<Zap className="size-5 md:size-6 text-amber-500" />}
                title="Batch Mode"
                description="Hapus background banyak foto sekaligus."
              />
              <FeatureCard
                icon={<Video className="size-5 md:size-6 text-rose-500" />}
                title="Video DL"
                description="Download video sosmed 4K tanpa watermark."
              />
              <FeatureCard
                icon={
                  <ImageIcon className="size-5 md:size-6 text-emerald-500" />
                }
                title="AI Upscaler"
                description="Perjelas foto buram jadi tajam (HD) instan."
              />
              <FeatureCard
                icon={
                  <ShieldCheck className="size-5 md:size-6 text-cyan-500" />
                }
                title="Privasi Aman"
                description="File otomatis dihapus server dalam 30 menit."
              />
              <FeatureCard
                icon={<Award className="size-5 md:size-6 text-purple-500" />}
                title="Kualitas HD"
                description="Output PNG transparan resolusi tinggi."
              />
            </div>
          </FeaturesAnimation>
        </section>

        {/* RUNNING TEXT */}
        <section className="bg-indigo-950 text-indigo-200 py-3 overflow-hidden border-y border-indigo-800">
          {/* Class 'animate-marquee' sekarang diambil dari globals.css */}
          <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs font-bold uppercase tracking-widest select-none">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-8">
                <span>Supported:</span>
                <span className="text-white">JPG</span>
                <span className="text-white">PNG</span>
                <span className="text-white">WEBP</span>
                <span className="text-white">MP4</span>
                <span className="text-white">MP3</span>
                <span className="text-white">4K UHD</span>
                <span>•</span>
              </div>
            ))}
          </div>
        </section>

        {/* TECH STACK */}
        <section className="text-center bg-muted/20 py-12 rounded-3xl">
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-2">Powered By Open Source</h2>
            <p className="text-sm text-muted-foreground">
              Performa tinggi dengan teknologi modern.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default px-4">
            <div className="flex flex-col items-center gap-2">
              <Code2 className="size-8 text-black dark:text-white" />
              <span className="text-xs font-bold">Next.js 14</span>
            </div>
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

        <DonationSection />
        <FaqSection />

        <section className="text-center py-10">
          <h3 className="text-2xl font-bold mb-4">Mulai Sekarang?</h3>
          <a href="#editor">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 bg-indigo-600 hover:bg-indigo-700 shadow-xl"
            >
              Coba Gratis <ArrowUp className="ml-2 size-4" />
            </Button>
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
