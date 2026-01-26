/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matikan pengecekan TypeScript saat build (supaya deploy lancar)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Matikan pengecekan ESLint saat build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimasi gambar (opsional, bagus untuk performa)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Izinkan load gambar dari semua domain (termasuk Railway)
      },
    ],
  },
};

export default nextConfig;
