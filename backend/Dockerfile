# Gunakan Python 3.10 versi ringan (Slim)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# --- BAGIAN PENTING: INSTALL DRIVER SYSTEM LINUX ---
# Ini akan menginstall library yang dicari oleh OpenCV (libGL & libglib)
# yang menyebabkan error "libxcb" sebelumnya.
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements dan install dependencies Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode backend
COPY . .

# Perintah untuk menyalakan server
CMD uvicorn main:app --host 0.0.0.0 --port $PORT