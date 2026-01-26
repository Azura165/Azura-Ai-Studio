import {
  Coffee,
  Heart,
  Github,
  Server,
  Zap,
  CheckCircle2,
  Terminal,
  UploadCloud,
  Wand2,
  Download,
  HelpCircle,
} from "lucide-react";
// Kita tidak butuh import DetailsItem dari shared-ui jika ingin full server component
// Kita buat inline HTML5 details agar lebih cepat

// --- PERFORMANCE SECTION ---
export function PerformanceSection() {
  return (
    <section
      id="performance"
      className="max-w-5xl mx-auto px-4 py-12 scroll-mt-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Performa Tanpa Kompromi
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Kami mengganti mesin lama (Node.js) dengan{" "}
          <strong className="text-indigo-600 dark:text-indigo-400">
            Python FastAPI
          </strong>{" "}
          yang dijalankan secara Asynchronous.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Chart Visualizer */}
        <div className="space-y-6">
          {/* Old Version */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden opacity-70 grayscale hover:grayscale-0 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h4 className="font-bold text-muted-foreground mb-2 flex items-center gap-2 text-sm">
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
            </div>
          </div>

          {/* New Version */}
          <div className="bg-card border border-indigo-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden ring-1 ring-indigo-500/20">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm">
              <Zap className="size-4 text-indigo-500" /> Azura Engine (v3.1)
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
            </div>
          </div>
        </div>

        {/* Tech Details */}
        <div className="space-y-6 pl-0 md:pl-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Terminal className="size-5 text-indigo-500" />
            Teknologi di Balik Layar
          </h3>
          <ul className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
              <span>
                <strong>Multithreading:</strong> Proses paralel tanpa antrian
                panjang. Server tidak akan hang meski banyak user.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
              <span>
                <strong>JIT Compression:</strong> Gambar dikompresi di browser
                Anda sebelum dikirim, menghemat kuota & mempercepat upload
                hingga 10x.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
              <span>
                <strong>Smart Caching:</strong> Sistem mengingat gambar yang
                pernah diproses (disimpan sementara 30 menit) agar tidak perlu
                proses ulang.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

// --- HOW IT WORKS SECTION (Mobile Optimized) ---
export function HowItWorksSection() {
  return (
    <section className="bg-muted/30 py-12 md:py-16 border-y border-border/50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 tracking-tight">
          Cara Kerja Otomatis
        </h2>

        {/* Layout: Stack 1 Kolom di HP (Horizontal Card), Grid 3 Kolom di Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-row md:flex-col items-center gap-4 bg-background p-4 rounded-2xl border shadow-sm md:bg-transparent md:border-none md:shadow-none text-left md:text-center group hover:border-indigo-500/30 transition-all">
            <div className="size-12 md:size-16 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
              <UploadCloud className="size-6 md:size-8" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                1. Upload Media
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                Pilih foto atau tempel link video yang ingin Anda proses.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-row md:flex-col items-center gap-4 bg-background p-4 rounded-2xl border shadow-sm md:bg-transparent md:border-none md:shadow-none text-left md:text-center group hover:border-purple-500/30 transition-all">
            <div className="size-12 md:size-16 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-110 transition-transform">
              <Wand2 className="size-6 md:size-8" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                2. AI Memproses
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                Azura Engine mendeteksi subjek dan menghapus background secara
                presisi.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-row md:flex-col items-center gap-4 bg-background p-4 rounded-2xl border shadow-sm md:bg-transparent md:border-none md:shadow-none text-left md:text-center group hover:border-emerald-500/30 transition-all">
            <div className="size-12 md:size-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
              <Download className="size-6 md:size-8" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                3. Download Hasil
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                Simpan hasil edit kualitas tinggi (HD) secara gratis & aman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- DONATION SECTION (Optimized Background) ---
export function DonationSection() {
  return (
    <section
      id="donate"
      className="mx-4 md:mx-auto max-w-5xl my-16 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative shadow-2xl"
    >
      {/* CSS Pattern Replacement (Lightweight) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative z-10 py-16 px-6 text-center space-y-8">
        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-2 backdrop-blur-md ring-1 ring-white/10 shadow-lg">
          <Coffee className="size-6 text-yellow-400" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Dukung Pengembangan Azura
        </h2>

        <div className="space-y-4 text-indigo-100 text-base leading-relaxed max-w-xl mx-auto font-light">
          <p>
            Menyediakan layanan GPU server gratis memerlukan biaya operasional
            bulanan.
          </p>
          <p>
            Jika tools ini membantu pekerjaan Anda, dukungan sukarela sangat
            kami hargai agar server tetap online 24/7.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href="https://saweria.co/radithyadev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-indigo-950 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg active:scale-95"
          >
            <Heart className="size-5 text-red-500 fill-red-500" />
            Traktir Kopi
          </a>
          <a
            href="https://github.com/Azura165"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-transform hover:scale-105 border border-white/20 active:scale-95"
          >
            <Github className="size-5" />
            Follow GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

// --- FAQ SECTION (HTML5 Native - No JS) ---
export function FaqSection() {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 pb-20 scroll-mt-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <HelpCircle className="size-6 text-indigo-500" /> FAQ
        </h2>
        <p className="text-muted-foreground">
          Jawaban cepat untuk pertanyaan umum.
        </p>
      </div>

      <div className="space-y-4">
        {/* Item 1 */}
        <details className="group border rounded-xl bg-card [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 font-medium text-foreground hover:bg-muted/50 transition-colors rounded-xl">
            <span className="text-left">
              Apakah layanan ini benar-benar gratis?
            </span>
            <span className="shrink-0 transition duration-300 group-open:-rotate-180">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </summary>
          <div className="p-4 pt-0 text-sm leading-relaxed text-muted-foreground animate-in slide-in-from-top-2 fade-in duration-200">
            Ya, 100% Gratis. Azura Remove BG adalah proyek open-source. Tidak
            ada watermark, tidak ada fitur berbayar, dan tidak perlu mendaftar
            akun untuk menggunakannya.
          </div>
        </details>

        {/* Item 2 */}
        <details className="group border rounded-xl bg-card [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 font-medium text-foreground hover:bg-muted/50 transition-colors rounded-xl">
            <span className="text-left">Apakah file saya aman? (Privasi)</span>
            <span className="shrink-0 transition duration-300 group-open:-rotate-180">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </summary>
          <div className="p-4 pt-0 text-sm leading-relaxed text-muted-foreground animate-in slide-in-from-top-2 fade-in duration-200">
            Sangat aman. Kami menggunakan sistem{" "}
            <strong>Ephemeral Storage</strong>. File yang Anda upload hanya
            diproses di RAM server dan akan dihapus secara otomatis oleh sistem
            pembersih dalam waktu 30-60 menit. Kami tidak menyimpan database
            foto pengguna.
          </div>
        </details>

        {/* Item 3 */}
        <details className="group border rounded-xl bg-card [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 font-medium text-foreground hover:bg-muted/50 transition-colors rounded-xl">
            <span className="text-left">
              Apakah mendukung resolusi tinggi (4K)?
            </span>
            <span className="shrink-0 transition duration-300 group-open:-rotate-180">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </summary>
          <div className="p-4 pt-0 text-sm leading-relaxed text-muted-foreground animate-in slide-in-from-top-2 fade-in duration-200">
            Ya! Untuk fitur <strong>Video Downloader</strong>, kami mendukung
            hingga resolusi 4K (2160p). Untuk <strong>Remove Background</strong>
            , kami mendukung output HD (hingga 1080p-2K tergantung sumber).
          </div>
        </details>
      </div>
    </section>
  );
}
