import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTop } from "@/components/landing/scroll-to-top";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { TopBanner } from "@/components/top-banner";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

// --- VIEWPORT OPTIMIZATION ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Aksesibilitas: User boleh zoom
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
};

// --- SEO METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL("https://azura-ai-studio.vercel.app"),
  title: {
    default: "Azura AI Studio - Edit Foto & Video dengan AI",
    template: "%s | Azura AI Studio",
  },
  description:
    "Platform AI all-in-one: Hapus background foto otomatis, Magic Eraser, dan Video Downloader tanpa watermark. Gratis dan Cepat.",
  keywords: [
    "Azura AI",
    "Background Remover",
    "Hapus Background",
    "Video Downloader",
    "AI Tools",
    "Gratis",
  ],
  authors: [{ name: "Azura Team", url: "https://github.com/Azura165" }],
  creator: "Azura Team",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://azura-ai-studio.vercel.app",
    title: "Azura AI Studio",
    description: "Hapus background & download video dengan AI.",
    siteName: "Azura AI Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Azura AI Studio",
    description: "Edit Foto & Video dengan kekuatan AI.",
    creator: "@Azura165",
  },
  verification: {
    google: "0KfgukOS6CLnaG8QQeK3au5rLfiUVGHX0fq2F7Kfs64",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${outfit.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Wrapper utama dengan relative positioning yang aman */}
          <div className="relative flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
            {/* TopBanner Global */}
            <TopBanner />

            {/* Main Content */}
            <main className="flex-1 w-full relative z-0">{children}</main>
          </div>

          <Toaster />
          <ScrollToTop />
        </ThemeProvider>

        {/* Analytics - Non Blocking */}
        <GoogleAnalytics gaId="G-XYZ123456" />
        <Analytics />
      </body>
    </html>
  );
}
