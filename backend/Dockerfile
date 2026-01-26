# backend/Dockerfile
FROM python:3.10-slim-bullseye

# Install system dependencies untuk Debian 11 (Bullseye)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libxcb1 \
    libx11-6 \
    libfontconfig1 \
    libfreetype6 \
    ffmpeg \
    libavcodec-extra \
    libpng16-16 \
    libjpeg62-turbo \
    libtiff5 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads outputs models

# Set environment variables
ENV PORT=5000
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Expose port
EXPOSE $PORT

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000", "--loop", "asyncio", "--timeout-keep-alive", "120"]