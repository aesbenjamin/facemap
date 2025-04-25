FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV, Mediapipe and network tools
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
    net-tools \
    iproute2 \
    iputils-ping \
    dnsutils \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables to specify headless OpenCV and networking
ENV PYTHONUNBUFFERED=1
ENV OPENCV_VIDEOIO_PRIORITY_MSMF=0
ENV MEDIAPIPE_DISABLE_GPU=1
ENV PORT=5000
ENV HOST="::"

# Fix for IPv6-only network issue with Python socket resolution
# This ensures that the application properly prioritizes IPv6
RUN echo "precedence ::ffff:0:0/96 100" >> /etc/gai.conf

# Expose port (both IPv4 and IPv6)
EXPOSE 5000/tcp

# Use the startup command with IPv6 support
# Add verbose logging to see exactly what's happening
CMD uvicorn main:app --host "::" --port 5000 --log-level debug
