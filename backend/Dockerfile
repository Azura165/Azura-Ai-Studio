# backend/Dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p uploads outputs models

# Environment variables
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE $PORT

# Create and use a start script
RUN echo '#!/bin/bash\nuvicorn main:app --host 0.0.0.0 --port $PORT --loop asyncio --timeout-keep-alive 120' > /start.sh \
    && chmod +x /start.sh

# Use the start script
CMD ["/start.sh"]