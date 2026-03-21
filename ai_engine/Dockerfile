FROM python:3.10-slim

# Install FFMPEG (Required for Auto-Editor and Video Processing)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose Port for Flask (Render dynamically maps PORT, we will bind to 5001)
EXPOSE 5001

# Command to run the application using Gunicorn for production
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5001", "app:app"]
