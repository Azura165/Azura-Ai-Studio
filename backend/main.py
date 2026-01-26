import os
import uuid
import time
import logging
import io
import gc
import numpy as np
import base64
import yt_dlp
from contextlib import asynccontextmanager
from typing import Optional
from urllib.parse import urlparse

# Library FastAPI
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# AI Libraries
from rembg import remove, new_session
from PIL import Image, ImageEnhance, ImageOps, ImageFilter

# --- CONFIGURATION & LOGGING ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- IMPORT OPTIONAL: cv2 (OpenCV) ---
# Railway mungkin tidak support penuh OpenCV, jadi kita buat optional
# Dengan fallback ke PIL jika cv2 tidak tersedia
CV2_AVAILABLE = False
cv2 = None
try:
    import cv2
    CV2_AVAILABLE = True
    logger.info("✅ OpenCV tersedia")
except ImportError as e:
    logger.warning(f"⚠️ OpenCV tidak tersedia: {e}. Beberapa fitur akan menggunakan PIL sebagai fallback")

# --- Folder Config dan kode selanjutnya tetap sama ---
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
MODELS_FOLDER = 'models'

# ... kode selanjutnya tetap sama ...
# LIMITS (Penting untuk Railway Free Tier)
SERVER_MAX_DIMENSION = 1024  # Lebih rendah lagi untuk Railway Free Tier (512MB RAM)
MAX_VIDEO_SIZE_MB = 100      # Batas max download video (100MB)
MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB max per request

for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER, MODELS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# --- GLOBAL VARIABLES ---
rembg_session = None
request_history = {}
app_start_time = time.time()

# --- LIFESPAN (OPTIMIZED MODEL) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global rembg_session
    try:
        logger.info("⏳ [STARTUP] Loading AI Models...")
        
        # OPTIMASI: Ganti ke model yang lebih ringan untuk Railway
        # Pilihan berdasarkan ukuran model:
        # 1. u2netp: 4.7MB (Sangat Ringan)
        # 2. u2net_human_seg: 9.6MB (Spesifik manusia)
        # 3. isnet-anime: 10MB (Untuk anime)
        # 4. silueta: 5.4MB (Quick silhouette)
        
        # Untuk Railway Free Tier, gunakan yang paling ringan
        model_name = os.environ.get('RMBG_MODEL', 'u2netp')
        logger.info(f"📦 Menggunakan model: {model_name}")
        
        try:
            rembg_session = new_session(model_name)
            logger.info(f"✅ [STARTUP] Model {model_name} loaded!")
        except Exception as model_error:
            logger.error(f"❌ Gagal load model {model_name}: {model_error}")
            # Fallback ke u2netp
            rembg_session = new_session("u2netp")
            logger.info("✅ [STARTUP] Fallback ke model u2netp")
        
    except Exception as e:
        logger.error(f"⚠️ Model load failed: {e}")
        # Jangan crash aplikasi, biarkan rembg_session = None
        # Aplikasi tetap bisa berjalan untuk endpoint non-AI
        rembg_session = None
    yield
    logger.info("🛑 [SHUTDOWN] Cleaning up resources...")
    rembg_session = None
    gc.collect()

# --- INIT APP ---
app = FastAPI(
    title="Azura Engine API",
    description="Backend AI High-Performance (FastAPI) - Railway Optimized",
    version="3.2.0-railway",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# --- SECURITY: CORS ---
app.add_middleware(
    CORSMiddleware,
    # Di Railway, frontend di Vercel akan beda domain
    allow_origins=["*"],  # Untuk development, ganti dengan domain asli saat production
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Mount static files jika folder ada
if os.path.exists(OUTPUT_FOLDER):
    app.mount("/outputs", StaticFiles(directory=OUTPUT_FOLDER), name="outputs")

# --- DATA MODELS ---
class EraseRequest(BaseModel):
    image: str
    mask: str
    strength: int = 5
    detail: int = 2
    quality: str = "Medium"  # Default ke Medium untuk Railway

class VideoRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format_id: str

# --- HELPER FUNCTIONS ---

def check_rate_limit(ip_address: str) -> bool:
    """Rate limiting yang lebih longgar untuk Railway"""
    now = time.time()
    
    # Reset history jika terlalu lama
    if ip_address in request_history and now - request_history[ip_address] > 3600:
        del request_history[ip_address]
    
    # Rate limit: 10 request per menit per IP
    request_count = sum(1 for t in request_history.values() if now - t < 60)
    if request_count > 10:
        return False
    
    request_history[ip_address] = now
    return True

def validate_image_header(file_content: bytes) -> bool:
    """Validasi file image dengan magic bytes"""
    try:
        if len(file_content) < 12:
            return False
            
        # JPEG
        if file_content.startswith(b'\xFF\xD8\xFF'):
            return True
        # PNG
        if file_content.startswith(b'\x89PNG\r\n\x1a\n'):
            return True
        # WEBP
        if file_content.startswith(b'RIFF') and file_content[8:12] == b'WEBP':
            return True
        return False
    except:
        return False

def initial_resize(image: Image.Image) -> Image.Image:
    """Resize gambar untuk menghemat memory Railway"""
    w, h = image.size
    
    # Railway Free Tier punya RAM terbatas, resize lebih agresif
    if max(w, h) > SERVER_MAX_DIMENSION:
        ratio = SERVER_MAX_DIMENSION / max(w, h)
        new_size = (int(w * ratio), int(h * ratio))
        logger.info(f"📏 Resize dari {w}x{h} ke {new_size[0]}x{new_size[1]}")
        return image.resize(new_size, Image.LANCZOS)
    
    return image

def cleanup_resources():
    """Cleanup resources untuk Railway Free Tier"""
    try:
        now = time.time()
        deleted_files = 0
        
        # Hapus file lama (>15 menit) untuk menghemat disk space
        for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
            if os.path.exists(folder):
                for f in os.listdir(folder):
                    path = os.path.join(folder, f)
                    if os.path.isfile(path):
                        try:
                            file_age = now - os.path.getmtime(path)
                            if file_age > 900:  # 15 menit
                                os.remove(path)
                                deleted_files += 1
                        except:
                            pass
        
        # Bersihkan rate limit history
        keys_to_del = [k for k, v in request_history.items() if now - v > 3600]
        for k in keys_to_del:
            del request_history[k]
        
        # Paksa garbage collection
        collected = gc.collect()
        
        if deleted_files > 0 or collected > 0:
            logger.info(f"🧹 Cleanup: {deleted_files} file dihapus, {collected} objects collected")
            
    except Exception as e:
        logger.error(f"Cleanup error: {e}")

def save_image_smart(image_obj, path, quality_mode="Medium", is_cv2=False):
    """Save image dengan optimasi untuk Railway"""
    try:
        # Convert dari cv2 ke PIL jika perlu
        if is_cv2 and CV2_AVAILABLE:
            try:
                image_obj = Image.fromarray(cv2.cvtColor(image_obj, cv2.COLOR_BGR2RGB))
            except:
                # Fallback jika cv2 error
                image_obj = Image.fromarray(image_obj)
        
        # Hilangkan metadata untuk privacy
        data = list(image_obj.getdata())
        clean_image = Image.new(image_obj.mode, image_obj.size)
        clean_image.putdata(data)
        image_obj = clean_image
        
        # Optimasi quality untuk Railway
        target_max_dim = 1024
        q_val = 85
        
        if quality_mode == "High":
            target_max_dim = 2048
            q_val = 90
        elif quality_mode == "Low":
            target_max_dim = 640
            q_val = 75
        
        # Resize jika terlalu besar
        w, h = image_obj.size
        if max(w, h) > target_max_dim:
            ratio = target_max_dim / max(w, h)
            new_size = (int(w * ratio), int(h * ratio))
            image_obj = image_obj.resize(new_size, Image.LANCZOS)
        
        # Save dengan format yang sesuai
        ext = os.path.splitext(path)[1].lower()
        if ext in ['.jpg', '.jpeg']:
            image_obj.save(path, "JPEG", quality=q_val, optimize=True)
        else:
            # PNG dengan kompresi
            image_obj.save(path, "PNG", optimize=True, compress_level=6)
        
        return True
    except Exception as e:
        logger.error(f"❌ Save Failed: {e}")
        return False

def pil_inpaint(image_pil, mask_pil, strength=5):
    """Inpainting menggunakan PIL (fallback jika cv2 tidak tersedia)"""
    try:
        # Convert ke array numpy
        img_array = np.array(image_pil)
        mask_array = np.array(mask_pil.convert('L'))  # Convert ke grayscale
        
        # Threshold mask
        _, mask_binary = cv2.threshold(mask_array, 10, 255, cv2.THRESH_BINARY) if CV2_AVAILABLE else (None, mask_array > 10)
        
        if CV2_AVAILABLE:
            # Use cv2 inpainting jika tersedia
            kernel_size = max(3, int(min(img_array.shape[:2]) * 0.005) * strength)
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
            mask_dilated = cv2.dilate(mask_binary, kernel, iterations=2)
            inpaint_radius = max(3, int(min(img_array.shape[:2]) * 0.01))
            result = cv2.inpaint(img_array, mask_dilated, inpaint_radius, cv2.INPAINT_TELEA)
            return Image.fromarray(result)
        else:
            # Fallback: simple blur/overpaint dengan PIL
            logger.warning("⚠️ Menggunakan fallback inpainting (PIL)")
            
            # Buat copy image
            result = image_pil.copy()
            
            # Dapatkan area yang perlu diinpaint
            mask_data = mask_array > 10
            
            if mask_data.any():
                # Untuk area kecil, gunakan blur
                for i in range(strength):
                    # Ambil region sekitar mask
                    blurred = image_pil.filter(ImageFilter.GaussianBlur(radius=strength))
                    # Composite hanya di area mask
                    mask_img = Image.fromarray((mask_array * (255//(i+1))).astype(np.uint8))
                    result = Image.composite(blurred, result, mask_img)
            
            return result
    except Exception as e:
        logger.error(f"❌ Inpainting error: {e}")
        raise

def format_bytes(size):
    """Format bytes ke readable format"""
    if not size:
        return "UNK"
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f}{unit}"
        size /= 1024.0
    return f"{size:.1f}TB"

# --- API ROUTES ---

@app.get("/")
async def read_root():
    """Root endpoint untuk health check"""
    uptime = time.time() - app_start_time
    return {
        "status": "Azura Engine v3.2 Ready 🚀",
        "model": "railway-optimized",
        "cv2_available": CV2_AVAILABLE,
        "uptime_seconds": int(uptime),
        "memory_usage": format_bytes(gc.get_stats()[0]['collected']),
        "message": "Backend berjalan di Railway Free Tier"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint untuk Railway"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "model_loaded": rembg_session is not None
    }

# 1. REMOVE BG
@app.post("/api/remove-bg")
async def remove_bg_endpoint(
    request: Request, 
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    quality: str = Form("Medium")
):
    """Remove background dari gambar"""
    if not check_rate_limit(request.client.host):
        raise HTTPException(status_code=429, detail="Terlalu banyak request. Coba lagi nanti.")
    
    if rembg_session is None:
        raise HTTPException(status_code=503, detail="Model AI belum siap. Silakan coba beberapa saat lagi.")
    
    try:
        # Baca file
        contents = await file.read()
        
        # Validasi size
        if len(contents) > MAX_REQUEST_SIZE:
            raise HTTPException(status_code=413, detail=f"File terlalu besar. Maksimum {MAX_REQUEST_SIZE//1024//1024}MB")
        
        # Validasi tipe file
        if not validate_image_header(contents):
            raise HTTPException(status_code=400, detail="File gambar tidak valid")
        
        # Process image
        input_image = Image.open(io.BytesIO(contents))
        input_image = ImageOps.exif_transpose(input_image)
        input_image = initial_resize(input_image)
        
        # AI Process
        output_image = remove(input_image, session=rembg_session)
        
        # Save result
        filename = f"rbg_{uuid.uuid4().hex[:8]}.png"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        save_image_smart(output_image, output_path, quality_mode=quality, is_cv2=False)
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_resources)
        
        # Return URL
        base_url = str(request.base_url).rstrip("/")
        return {
            "url": f"{base_url}/outputs/{filename}",
            "filename": filename,
            "quality": quality
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error Remove BG: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal memproses gambar: {str(e)}")

# 2. MAGIC ERASER
@app.post("/api/erase-object")
async def erase_object_endpoint(
    request: Request, 
    background_tasks: BackgroundTasks, 
    data: EraseRequest
):
    """Hapus object dari gambar"""
    if not check_rate_limit(request.client.host):
        raise HTTPException(status_code=429, detail="Terlalu banyak request. Coba lagi nanti.")
    
    try:
        # Decode Base64 image dan mask
        def decode_b64_image(base64_str):
            """Decode base64 image"""
            try:
                # Handle data URL jika ada
                if ',' in base64_str:
                    base64_str = base64_str.split(',')[1]
                
                image_data = base64.b64decode(base64_str)
                return Image.open(io.BytesIO(image_data))
            except Exception as e:
                logger.error(f"❌ Decode error: {e}")
                raise HTTPException(status_code=400, detail="Format base64 tidak valid")
        
        # Decode images
        original_img = decode_b64_image(data.image)
        mask_img = decode_b64_image(data.mask).convert('L')  # Convert ke grayscale
        
        # Resize jika perlu
        original_img = initial_resize(original_img)
        mask_img = mask_img.resize(original_img.size, Image.NEAREST)
        
        # Lakukan inpainting
        result = pil_inpaint(original_img, mask_img, strength=data.strength)
        
        # Apply sharpness jika detail > 0
        if data.detail > 0:
            for _ in range(data.detail):
                result = result.filter(ImageFilter.SHARPEN)
        
        # Save result
        filename = f"magic_{uuid.uuid4().hex[:8]}.jpg"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        save_image_smart(result, output_path, quality_mode=data.quality, is_cv2=False)
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_resources)
        
        # Return URL
        base_url = str(request.base_url).rstrip("/")
        return {
            "url": f"{base_url}/outputs/{filename}",
            "filename": filename,
            "quality": data.quality
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error Eraser: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal menghapus object: {str(e)}")

# 3. VIDEO INFO
@app.post("/api/video-info")
async def video_info_endpoint(request: Request, data: VideoRequest):
    """Get info video dari URL"""
    if not check_rate_limit(request.client.host):
        raise HTTPException(status_code=429, detail="Terlalu banyak request. Coba lagi nanti.")
    
    # Domain whitelist
    allowed_domains = ['youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com']
    
    try:
        parsed_url = urlparse(data.url)
        domain = parsed_url.netloc.lower()
        
        if not any(allowed in domain for allowed in allowed_domains):
            logger.warning(f"⚠️ Domain tidak diizinkan: {domain}")
            # Tidak langsung reject, tapi log saja
        
    except Exception as e:
        logger.warning(f"⚠️ URL parsing error: {e}")
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'noplaylist': True,
            'extract_flat': False
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(data.url, download=False)
            
            formats_list = []
            
            # Tambahkan audio option
            formats_list.append({
                "format_id": "mp3",
                "resolution": "Audio MP3",
                "ext": "mp3",
                "size": "~3-5MB",
                "note": "Audio berkualitas tinggi"
            })
            
            # Tambahkan format video
            seen_res = set()
            if 'formats' in info:
                for f in info['formats']:
                    if f.get('vcodec') != 'none':  # Hanya format dengan video
                        res = f"{f.get('height') or 'N/A'}p"
                        ext = f.get('ext', 'mp4')
                        
                        if res not in seen_res and ext in ['mp4', 'webm']:
                            filesize = f.get('filesize') or f.get('filesize_approx')
                            size_str = format_bytes(filesize) if filesize else "~50MB"
                            
                            formats_list.append({
                                "format_id": f.get('format_id', 'best'),
                                "resolution": res,
                                "ext": ext,
                                "size": size_str,
                                "note": f.get('format_note', '')
                            })
                            seen_res.add(res)
            
            return {
                "title": info.get('title', 'Unknown'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration_string', 'N/A'),
                "source": info.get('extractor_key', 'Unknown'),
                "formats": formats_list[:10]  # Batasi ke 10 format
            }
            
    except Exception as e:
        logger.error(f"❌ Error Video Info: {e}")
        raise HTTPException(status_code=400, detail="Gagal mengambil info video. Pastikan URL valid.")

# 4. VIDEO DOWNLOAD
@app.post("/api/video-download")
async def video_download_endpoint(
    request: Request, 
    background_tasks: BackgroundTasks, 
    data: DownloadRequest
):
    """Download video dari URL"""
    if not check_rate_limit(request.client.host):
        raise HTTPException(status_code=429, detail="Terlalu banyak request. Coba lagi nanti.")
    
    filename = f"dl_{uuid.uuid4().hex[:8]}"
    output_template = os.path.join(OUTPUT_FOLDER, f"{filename}.%(ext)s")
    
    try:
        # Konfigurasi download
        ydl_opts = {
            'outtmpl': output_template,
            'quiet': True,
            'noplaylist': True,
            'max_filesize': MAX_VIDEO_SIZE_MB * 1024 * 1024,
            'socket_timeout': 30,
            'retries': 3
        }
        
        # Format spesifik
        if data.format_id == 'mp3':
            ydl_opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            })
            final_ext = "mp3"
        else:
            # Untuk video, pilih format yang reasonable
            if data.format_id == 'best':
                ydl_opts['format'] = 'best[filesize<100M]'  # Batasi 100MB
            else:
                ydl_opts['format'] = data.format_id
            final_ext = "mp4"
        
        # Download
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([data.url])
        
        # Cari file yang didownload
        final_filename = f"{filename}.{final_ext}"
        final_path = os.path.join(OUTPUT_FOLDER, final_filename)
        
        if not os.path.exists(final_path):
            # Fallback: cari file dengan prefix yang sama
            for f in os.listdir(OUTPUT_FOLDER):
                if f.startswith(filename):
                    final_path = os.path.join(OUTPUT_FOLDER, f)
                    final_filename = f
                    break
        
        if not os.path.exists(final_path):
            raise HTTPException(status_code=500, detail="File download tidak ditemukan")
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_resources)
        
        # Return file
        return FileResponse(
            final_path,
            filename=final_filename,
            media_type='application/octet-stream'
        )
        
    except Exception as e:
        logger.error(f"❌ Error Download: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Gagal download video. Mungkin file terlalu besar (>100MB) atau terjadi error: {str(e)}"
        )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"❌ Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info"
    )