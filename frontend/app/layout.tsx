import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"; // Pastikan import dari sini
import "./globals.css";

// OPTIMASI FONT: Gunakan swap agar teks langsung muncul
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

// --- SEO METADATA (Disesuaikan dengan Branding Baru) ---
export const metadata: Metadata = {
  title: "Radit AI Studio - Magic Eraser & Smart Restorer (Gratis)",
  description:
    "Edit foto online gratis tanpa login. Hapus objek pengganggu, hapus background, dan perjelas foto buram dengan AI. Cepat, Aman, dan Tanpa Watermark.",
  icons: {
    icon: "/favicon.ico",
  },
  authors: [{ name: "Radithya Development" }],
  keywords: [
    "magic eraser online",
    "hapus background",
    "smart restorer",
    "perjelas foto",
    "video downloader",
    "radit ai",
    "gratis",
  ],
  openGraph: {
    title: "Radit AI Studio - Tools Kreatif Gratis",
    description:
      "Satu website untuk semua kebutuhan edit foto & video. Tanpa login & watermark.",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
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
          {/* 👇 UPDATE DISINI: position="top-center" */}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
