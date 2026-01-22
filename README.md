# Radit AI Studio 🎨✨

**Next-Gen AI Tools for Creative Perfection.**

Platform web modern _all-in-one_ untuk kebutuhan kreatif digital. Menghapus background, menghilangkan objek foto, memperjelas gambar, dan download video sosial media menggunakan kecerdasan buatan (AI) & Python FastAPI.

Dibuat dengan fokus pada **Kecepatan**, **Privasi**, dan **Kemudahan Penggunaan**.

![Radit AI Banner](https://via.placeholder.com/1200x600.png?text=Radit+AI+Studio+v3.0)

## 🚀 Fitur Unggulan

- **Magic Eraser 2.0**: Hapus orang, teks, atau objek mengganggu dari foto dengan teknologi _Inpainting_ (OpenCV & Telea).
- **Background Remover**: Hapus latar belakang otomatis dalam 0.8 detik (Powered by U2Net & ONNX Runtime).
- **Universal Video Downloader**: Unduh video dari YouTube, TikTok, IG, Twitter tanpa watermark (Support 4K & MP3).
- **Smart Restorer**: Perbaiki foto buram/pecah menjadi tajam dan layak cetak (AI Upscaling).
- **Privacy First**: Menggunakan sistem _Ephemeral Storage_. File otomatis dihapus permanen dari server setiap 30 menit.

## 🛠️ Teknologi (Tech Stack)

Project ini dibangun menggunakan arsitektur _Microservices_ modern:

### **Frontend**

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Styling**: Tailwind CSS & Shadcn UI
- **Animation**: Framer Motion
- **Icons**: Lucide React

### **Backend**

- **Server**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous Python)
- **AI Engine**: Rembg (U2Net), OpenCV, NumPy
- **Video Engine**: yt-dlp & FFmpeg
- **Image Processing**: Pillow (PIL)

---

## 📦 Cara Install (Localhost)

Ikuti langkah berikut untuk menjalankan aplikasi di komputer Anda.

### Prasyarat

- **Node.js 18+** (Wajib)
- **Python 3.10+** (Wajib)
- **FFmpeg** (Wajib untuk Video Downloader)
  - _Windows_: `winget install ffmpeg`
  - _Linux_: `sudo apt install ffmpeg`
  - _Mac_: `brew install ffmpeg`

### 1. Setup Backend (Python)

Buka terminal dan arahkan ke folder `backend`:

```bash
cd backend

# 1. Buat Virtual Environment
python -m venv env

# 2. Aktifkan Environment
# Untuk Windows:
.\env\Scripts\activate
# Untuk Mac/Linux:
source env/bin/activate

# 3. Install Dependencies
pip install -r requirements.txt

# 4. Jalankan Server FastAPI
uvicorn main:app --reload --port 5000
Server backend akan berjalan di: http://localhost:5000 (Cek dokumentasi API di /docs)

2. Setup Frontend (Next.js)
Buka terminal baru (biarkan terminal backend tetap jalan), lalu arahkan ke folder frontend:

Bash
cd frontend

# 1. Install Dependencies
npm install

# 2. Jalankan Mode Development
npm run dev
Buka browser dan akses aplikasi di: http://localhost:3000

🤝 Kontribusi & Donasi
Project ini 100% Gratis & Open Source. Biaya operasional server GPU cukup tinggi. Jika alat ini membantu pekerjaan atau tugas Anda, dukungan sukarela sangat kami hargai!

☕ Traktir Kopi: Saweria Radithya ⭐ Dukung Kode: Beri Bintang di GitHub Repo

🛡️ Disclaimer
Aplikasi ini tidak menyimpan data pengguna secara permanen. Semua file yang diunggah akan dihapus secara otomatis oleh sistem pembersih server dalam 30 menit.

## 🌟 Acknowledgements (Kredit)

Proyek ini tidak akan terwujud tanpa library open-source luar biasa berikut:

- **AI Engine**: [Rembg](https://github.com/danielgatis/rembg) oleh Daniel Gatis (untuk Hapus Background).
- **Video Engine**: [yt-dlp](https://github.com/yt-dlp/yt-dlp) (untuk Video Downloader).
- **Image Processing**: [OpenCV](https://opencv.org/) & [Pillow](https://python-pillow.org/).
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) & [Next.js](https://nextjs.org/).

---

## 📜 License

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

© 2026 Radithya Development. Dibuat dengan ❤️ dan ☕ di Indonesia.
```
