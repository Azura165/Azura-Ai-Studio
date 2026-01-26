# backend/Dockerfile
FROM python:3.10-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Create directories
RUN mkdir -p uploads outputs models

# Set permissions
RUN chmod +x /app/main.py

# Environment
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health').read()" || exit 1

# Run app - STRING FORMAT (bukan array)
CMD uvicorn main:app --host 0.0.0.0 --port $PORT --loop asyncio --timeout-keep-alive 120