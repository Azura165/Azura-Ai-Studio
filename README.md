💎 Azura AI Studio

<div align="center">
Next-Gen AI Creative Suite for the Modern Web.

https://img.shields.io/badge/License-MIT-yellow.svg
https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white
https://img.shields.io/badge/FastAPI-High_Performance-009688?logo=fastapi&logoColor=white
https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white
https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white

<br /> <p align="center"> <b>Hapus Background • Magic Eraser • Video Downloader • AI Upscaler</b> <br /> <i>Ditenagai oleh Python FastAPI (Asynchronous) & GPU Acceleration.</i> </p></div>
📖 Tentang Project
Azura AI Studio adalah platform web all-in-one yang menggabungkan kekuatan Artificial Intelligence dengan antarmuka web modern yang responsif. Project ini dibuat untuk mendemonstrasikan bagaimana Next.js 14 (Frontend) dan FastAPI (Backend) dapat bekerja secara harmonis untuk memproses media berat secara real-time.

Fokus utama pengembangan: Kecepatan (Performance), Privasi (Privacy), dan Kemudahan (UX).

✨ Fitur Unggulan
Fitur Deskripsi Teknologi
🪄 Magic Eraser v2 Hapus objek, orang, atau teks mengganggu dari foto. OpenCV + Inpainting Telea
🎭 Background Remover Hapus latar belakang foto HD dalam 0.8 detik. Rembg (U2Net) + ONNX
🎬 Universal Video DL Download video 4K dari YT, TikTok, IG tanpa watermark. yt-dlp + FFmpeg
🔍 Smart Upscaler Perjelas foto buram menjadi tajam (2x/4x Scale). Pillow + Lanczos
🛡️ Auto-Wipe Privacy File otomatis dihapus dari server setiap 30 menit. BackgroundTasks
🛠️ Tech Stack (Teknologi)
Project ini dibangun menggunakan arsitektur Microservices (Frontend & Backend terpisah):

Frontend (Client-Side)
Framework: Next.js 14 (App Router)

UI Library: Shadcn/ui + Tailwind CSS

Animation: Framer Motion

State: React Hooks + Server Actions

Backend (Server-Side)
Core: Python FastAPI (Async/Await)

AI Engine: PyTorch / ONNX Runtime

Media Processing: FFmpeg & OpenCV

Task Queue: Built-in Background Tasks

📦 Instalasi & Cara Pakai
Pastikan Anda sudah menginstall:

Node.js 18+

Python 3.10+

FFmpeg (Wajib untuk fitur video)

1. Clone Repository
   bash
   git clone https://github.com/Azura165/Azura-AI-Studio.git
   cd Azura-AI-Studio
2. Setup Backend (Python)
   Buka terminal baru, masuk ke folder backend:

bash
cd backend

# Buat Virtual Environment

python -m venv env

# Aktifkan Environment

# Windows:

.\env\Scripts\activate

# Mac/Linux:

source env/bin/activate

# Install Library

pip install -r requirements.txt

# Jalankan Server (Port 5000)

uvicorn main:app --reload --port 5000
Server backend aktif di: http://localhost:5000

3. Setup Frontend (Next.js)
   Buka terminal baru lagi, masuk ke folder frontend:

bash
cd frontend

# Install Library Node.js

npm install

# Jalankan Frontend (Port 3000)

npm run dev
Buka browser dan akses: http://localhost:3000

🤝 Berkontribusi
Ingin menambahkan fitur baru? Kami sangat terbuka untuk kolaborasi!

Fork repository ini.

Buat branch fitur baru (git checkout -b fitur-keren).

Commit perubahan Anda (git commit -m 'Menambah fitur keren').

Push ke branch (git push origin fitur-keren).

Buat Pull Request di GitHub.

🌟 Acknowledgements (Kredit)
Terima kasih kepada pengembang library open-source yang menjadi fondasi project ini:

Rembg oleh Daniel Gatis (Core AI Remove BG)

yt-dlp (Engine Video Downloader)

Shadcn UI (Komponen Desain)

📜 Lisensi
Didistribusikan di bawah Lisensi MIT. Lihat file LICENSE untuk detail lebih lanjut.

<div align="center"> <p><b>Suka project ini? Jangan lupa kasih bintang! ⭐</b></p><a href="https://github.com/Azura165/Azura-AI-Studio"> <img src="https://img.shields.io/github/stars/Azura165/Azura-AI-Studio?style=social" alt="GitHub stars"> </a>

<p>Made with ❤️, ☕, and 🐍 by <b>Radithya Development (Azura)</b>.<br /> <i>Software Engineering Technology Student • Indonesia 🇮🇩</i></p> </div>
