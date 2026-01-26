import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// --- SEO METADATA FINAL ---
export const metadata: Metadata = {
  // PENTING: Ganti URL ini dengan domain Vercel kamu nanti (misal: https://azura-remove.vercel.app)
  // Ini mencegah error "metadataBase is missing" saat deploy
  metadataBase: new URL("https://azura-remove-bg.vercel.app"),

  title: "Azura Remove BG - Hapus Background Otomatis (Gratis & HD)",
  description:
    "Tools AI hapus background, magic eraser, dan video downloader gratis tanpa login. Privasi aman, proses cepat, dan kualitas HD.",
  icons: {
    icon: "/favicon.ico",
  },
  authors: [{ name: "Radithya Development" }],
  keywords: [
    "remove bg",
    "hapus background",
    "magic eraser",
    "video downloader",
    "azura ai",
    "edit foto online",
  ],
  openGraph: {
    title: "Azura Remove BG - Tools Kreatif Gratis",
    description:
      "Hapus background foto dan edit media dalam hitungan detik. Gratis & Aman.",
    type: "website",
    locale: "id_ID",
    siteName: "Azura AI Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Azura Remove BG",
    description: "Edit foto pakai AI, gratis tanpa watermark.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mencegah zoom in tidak sengaja di input form HP
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Posisi Toast di atas tengah agar terlihat jelas di HP */}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
