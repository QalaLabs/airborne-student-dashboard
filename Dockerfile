# ==========================================
# Stage 1: Build Vite React Production Assets
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# ==========================================
# Stage 2: Python FastAPI Production Runner for Cloud Run
# ==========================================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Expose port (Cloud Run sets dynamic $PORT at runtime)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Launch uvicorn dynamically bound to $PORT per Cloud Run best practices
CMD ["sh", "-c", "uvicorn server.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
