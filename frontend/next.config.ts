/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com", // Izin buat YouTube Thumbnail
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Izinkan Unsplash
      },
      {
        protocol: "https",
        hostname: "img.youtube.com", // YouTube versi lama
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn.com", // Izin buat TikTok (Wildcard)
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net", // Izin buat Facebook/IG
      },
      {
        protocol: "https",
        hostname: "*.instagram.com", // Izin buat Instagram
      },
    ],
  },
};

export default nextConfig;
