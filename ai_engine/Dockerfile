FROM python:3.10-slim
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["sh", "-c", "gunicorn -w 1 --threads 2 --timeout 300 --max-requests 50 --max-requests-jitter 10 -b 0.0.0.0:${PORT:-5001} app:app"]
