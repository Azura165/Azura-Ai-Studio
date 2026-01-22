import os
import uuid
import time
import logging
import io
import gc
import cv2
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
from fastapi.responses import FileResponse
from pydantic import BaseModel

# AI Libraries
from rembg import remove, new_session
from PIL import Image, ImageEnhance, ImageOps

# --- CONFIGURATION & LOGGING ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Folder Config
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
MODELS_FOLDER = 'models'
SERVER_MAX_DIMENSION = 4096 

for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER, MODELS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# --- GLOBAL VARIABLES ---
rembg_session = None
request_history = {}

# --- LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global rembg_session
    try:
        logger.info("⏳ [STARTUP] Loading AI Models...")
        rembg_session = new_session("u2net")
        logger.info("✅ [STARTUP] AI Models Ready!")
    except Exception as e:
        logger.error(f"⚠️ Model load failed: {e}")
    yield
    logger.info("🛑 [SHUTDOWN] Cleaning up resources...")
    gc.collect()

# --- INIT APP ---
app = FastAPI(
    title="Radit AI Studio API",
    description="Backend AI High-Performance (FastAPI)",
    version="3.0.0", # Gold Master Version
    lifespan=lifespan
)

# --- SECURITY: CORS ---
app.add_middleware(
    CORSMiddleware,
    # ⚠️ SAAT DEPLOY KE VPS/VERCEL: Ganti "*" dengan domain frontend kamu (contoh: "https://radit-ai.com")
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=OUTPUT_FOLDER), name="outputs")

# --- DATA MODELS ---
class EraseRequest(BaseModel):
    image: str
    mask: str
    strength: int = 5
    detail: int = 2
    quality: str = "HD"

class VideoRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format_id: str

# --- HELPER FUNCTIONS ---

def check_rate_limit(ip_address: str):
    now = time.time()
    last_request = request_history.get(ip_address, 0)
    if now - last_request < 0.5: return False
    request_history[ip_address] = now
    return True

def validate_image_header(file_content: bytes) -> bool:
    try:
        if file_content.startswith(b'\xFF\xD8\xFF'): return True
        if file_content.startswith(b'\x89PNG\r\n\x1a\n'): return True
        if file_content.startswith(b'RIFF') and file_content[8:12] == b'WEBP': return True
        return False
    except: return False

def initial_resize(image: Image.Image) -> Image.Image:
    w, h = image.size
    if max(w, h) > SERVER_MAX_DIMENSION:
        ratio = SERVER_MAX_DIMENSION / max(w, h)
        new_size = (int(w * ratio), int(h * ratio))
        return image.resize(new_size, Image.LANCZOS)
    return image

def cleanup_old_files():
    try:
        now = time.time()
        for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
            for f in os.listdir(folder):
                path = os.path.join(folder, f)
                if os.path.isfile(path) and os.stat(path).st_mtime < now - 1800:
                    os.remove(path)
        keys_to_del = [k for k, v in request_history.items() if now - v > 60]
        for k in keys_to_del: del request_history[k]
        gc.collect()
    except Exception as e:
        logger.error(f"Cleanup error: {e}")

def save_image_smart(image_obj, path, quality_mode="HD", is_cv2=False):
    try:
        if is_cv2:
            image_obj = Image.fromarray(cv2.cvtColor(image_obj, cv2.COLOR_BGR2RGB))

        # Metadata Stripping (Privacy)
        data = list(image_obj.getdata())
        clean_image = Image.new(image_obj.mode, image_obj.size)
        clean_image.putdata(data)
        image_obj = clean_image

        target_max_dim = 4096
        q_val = 95
        if quality_mode == "Medium":
            target_max_dim = 2048
            q_val = 85
        elif quality_mode == "Low":
            target_max_dim = 1280
            q_val = 65

        w, h = image_obj.size
        if max(w, h) > target_max_dim:
            ratio = target_max_dim / max(w, h)
            new_size = (int(w * ratio), int(h * ratio))
            image_obj = image_obj.resize(new_size, Image.LANCZOS)

        if path.lower().endswith(".jpg") or path.lower().endswith(".jpeg"):
            image_obj.save(path, "JPEG", quality=q_val, optimize=True, subsampling=0)
        else:
            c_level = 6
            if quality_mode == "Low": c_level = 9
            image_obj.save(path, "PNG", optimize=True, compress_level=c_level)
        return True
    except Exception as e:
        logger.error(f"Save Smart Failed: {e}")
        return False

def format_bytes(size):
    if not size: return "UNK"
    power = 2**10
    n = 0
    power_labels = {0 : '', 1: 'K', 2: 'M', 3: 'G', 4: 'T'}
    while size > power:
        size /= power
        n += 1
    return f"{size:.1f}{power_labels[n]}B"

# --- API ROUTES ---
# PENTING: Gunakan 'def' biasa (bukan async def) untuk tugas berat (CPU bound/Blocking IO)
# agar FastAPI menjalankannya di ThreadPool. Ini mencegah server 'hang' saat memproses gambar/video.

@app.get("/")
def read_root():
    return {"status": "Radit AI Engine v3.0 Online 🚀", "docs": "/docs"}

# 1. REMOVE BG
@app.post("/api/remove-bg")
def remove_bg_endpoint(request: Request, background_tasks: BackgroundTasks, file: UploadFile = File(...), quality: str = Form("HD")):
    if not check_rate_limit(request.client.host): raise HTTPException(status_code=429, detail="Too many requests")
    try:
        contents = file.file.read() # Read sync
        if not validate_image_header(contents): raise HTTPException(status_code=400, detail="Invalid image file")
        
        input_image = Image.open(io.BytesIO(contents))
        input_image = ImageOps.exif_transpose(input_image)
        input_image = initial_resize(input_image)
        
        # Heavy Task
        output_image = remove(input_image, session=rembg_session)
        
        filename = f"removed_{uuid.uuid4()}.png"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        save_image_smart(output_image, output_path, quality_mode=quality, is_cv2=False)
        
        background_tasks.add_task(cleanup_old_files)
        base_url = str(request.base_url).rstrip("/")
        return {"url": f"{base_url}/outputs/{filename}"}
    except Exception as e:
        logger.error(f"Error Remove BG: {e}")
        raise HTTPException(status_code=500, detail="Processing Failed")

# 2. MAGIC ERASER
@app.post("/api/erase-object")
def erase_object_endpoint(request: Request, background_tasks: BackgroundTasks, data: EraseRequest):
    if not check_rate_limit(request.client.host): raise HTTPException(status_code=429, detail="Too many requests")
    try:
        def decode_b64(s): return cv2.imdecode(np.frombuffer(base64.b64decode(s.split(',')[1]), np.uint8), cv2.IMREAD_COLOR)
        img = decode_b64(data.image)
        mask_raw = decode_b64(data.mask)
        mask = cv2.cvtColor(mask_raw, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(mask, 10, 255, cv2.THRESH_BINARY)
        
        h, w = img.shape[:2]
        if max(h, w) > 3000:
            scale = 3000 / float(max(h, w))
            img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
            mask = cv2.resize(mask, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
            
        kernel_size = max(3, int(min(h, w) * 0.005) * data.strength)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
        mask_dilated = cv2.dilate(mask, kernel, iterations=2)
        inpaint_radius = max(3, int(min(h, w) * 0.01))
        
        # Heavy Task
        result = cv2.inpaint(img, mask_dilated, inpaint_radius, cv2.INPAINT_TELEA)
        
        if data.detail > 0:
            kernel_sharp = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            result = cv2.filter2D(result, -1, kernel_sharp)
            
        filename = f"magic_{uuid.uuid4()}.jpg"
        path = os.path.join(OUTPUT_FOLDER, filename)
        save_image_smart(result, path, quality_mode=data.quality, is_cv2=True)
        
        background_tasks.add_task(cleanup_old_files)
        base_url = str(request.base_url).rstrip("/")
        return {"url": f"{base_url}/outputs/{filename}"}
    except Exception as e:
        logger.error(f"Error Eraser: {e}")
        raise HTTPException(status_code=500, detail="Magic Eraser Failed")

# 3. UPSCALER
@app.post("/api/upscale")
def upscale_endpoint(request: Request, background_tasks: BackgroundTasks, file: UploadFile = File(...), scale: int = Form(2), quality: str = Form("HD")):
    if not check_rate_limit(request.client.host): raise HTTPException(status_code=429, detail="Too many requests")
    try:
        contents = file.file.read()
        if not validate_image_header(contents): raise HTTPException(status_code=400, detail="Invalid image")
        
        input_image = Image.open(io.BytesIO(contents))
        input_image = ImageOps.exif_transpose(input_image)
        
        w, h = input_image.size
        new_w, new_h = w * scale, h * scale
        if max(new_w, new_h) > 4096:
            ratio = 4096 / max(new_w, new_h)
            new_w, new_h = int(new_w * ratio), int(new_h * ratio)
            
        output_image = input_image.resize((new_w, new_h), Image.LANCZOS)
        output_image = ImageEnhance.Sharpness(output_image).enhance(1.3)
        
        filename = f"upscaled_{uuid.uuid4()}.png"
        output_path = os.path.join(OUTPUT_FOLDER, filename)
        save_image_smart(output_image, output_path, quality_mode=quality, is_cv2=False)
        
        background_tasks.add_task(cleanup_old_files)
        base_url = str(request.base_url).rstrip("/")
        return {"url": f"{base_url}/outputs/{filename}"}
    except Exception as e:
        logger.error(f"Error Upscale: {e}")
        raise HTTPException(status_code=500, detail="Upscaling Failed")

# 4. VIDEO INFO
@app.post("/api/video-info")
def video_info_endpoint(request: Request, data: VideoRequest):
    if not check_rate_limit(request.client.host): raise HTTPException(status_code=429, detail="Too many requests")
    
    # Domain Validation
    allowed_domains = ['youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com', 'twitter.com', 'x.com', 'facebook.com', 'fb.watch']
    try:
        parsed_url = urlparse(data.url)
        # Handle short URLs like youtu.be where domain is in netloc
        domain = parsed_url.netloc.lower()
        if not any(allowed in domain for allowed in allowed_domains):
             logger.warning(f"Non-standard domain: {domain}")
             # Optional: raise HTTPException(status_code=400, detail="Domain not supported")
    except: pass

    try:
        ydl_opts = {'quiet': True, 'no_warnings': True, 'noplaylist': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(data.url, download=False)
            
            formats_list = []
            formats_list.append({
                "format_id": "mp3", "resolution": "Audio MP3", "ext": "mp3",
                "size": "~3MB", "note": "High Quality Audio"
            })

            seen_res = set()
            if 'formats' in info:
                for f in reversed(info['formats']):
                    res = f.get('resolution') or f"{f.get('height')}p"
                    ext = f.get('ext')
                    if f.get('vcodec') != 'none' and res and res not in seen_res and ext in ['mp4', 'webm']:
                        filesize = f.get('filesize') or f.get('filesize_approx')
                        size_str = format_bytes(filesize) if filesize else "UNK"
                        
                        formats_list.append({
                            "format_id": f.get('format_id'),
                            "resolution": res,
                            "ext": ext,
                            "size": size_str,
                            "note": f.get('format_note', '')
                        })
                        seen_res.add(res)
            
            return {
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration_string'),
                "source": info.get('extractor_key'),
                "formats": formats_list
            }
    except Exception as e:
        logger.error(f"Error Video Info: {e}")
        raise HTTPException(status_code=400, detail="Gagal mengambil info video")

# 5. VIDEO DOWNLOAD
@app.post("/api/video-download")
def video_download_endpoint(request: Request, background_tasks: BackgroundTasks, data: DownloadRequest):
    if not check_rate_limit(request.client.host): raise HTTPException(status_code=429, detail="Too many requests")
    
    # Security: Double Check Domain
    allowed_domains = ['youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com', 'twitter.com', 'x.com', 'facebook.com', 'fb.watch']
    if not any(allowed in data.url.lower() for allowed in allowed_domains):
         raise HTTPException(status_code=400, detail="Domain tidak didukung")

    filename = f"dl_{uuid.uuid4()}"
    output_template = os.path.join(OUTPUT_FOLDER, f"{filename}.%(ext)s")
    
    ydl_opts = {
        'outtmpl': output_template,
        'quiet': True,
        'noplaylist': True,
    }

    if data.format_id == 'mp3':
        ydl_opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        })
        final_filename = f"{filename}.mp3"
    else:
        ydl_opts.update({
            'format': f"{data.format_id}+bestaudio/best" if data.format_id != 'best' else 'bestvideo+bestaudio/best',
            'merge_output_format': 'mp4',
        })
        final_filename = f"{filename}.mp4"

    try:
        # Heavy Task (Download & Merge)
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([data.url])
        
        final_path = os.path.join(OUTPUT_FOLDER, final_filename)
        
        if not os.path.exists(final_path):
            for f in os.listdir(OUTPUT_FOLDER):
                if f.startswith(filename):
                    final_path = os.path.join(OUTPUT_FOLDER, f)
                    final_filename = f
                    break
        
        background_tasks.add_task(cleanup_old_files)
        return FileResponse(final_path, filename=final_filename, media_type='application/octet-stream')

    except Exception as e:
        logger.error(f"Error Download: {e}")
        raise HTTPException(status_code=500, detail="Gagal memproses download.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)