FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and Mediapipe
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libx11-6 \
    libxrandr2 \
    libxxf86vm1 \
    libxi6 \
    libxfixes3 \
    libxcursor1 \
    libgles2 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables to specify headless OpenCV
ENV PYTHONUNBUFFERED=1
ENV OPENCV_VIDEOIO_PRIORITY_MSMF=0
ENV MEDIAPIPE_DISABLE_GPU=1
ENV PORT=5000
ENV HOST="::"

# Add healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Expose port (both IPv4 and IPv6)
EXPOSE 5000/tcp

# Use the startup command with IPv6 support
CMD uvicorn main:app --host "::" --port 5000
