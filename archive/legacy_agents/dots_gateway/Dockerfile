# Production Dockerfile for Hermes Dots Gateway
FROM python:3.12-slim

WORKDIR /app

# Install system tools needed for agent execution (git, curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY dots_gateway/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy gateway and configuration
COPY dots_gateway/ /app/dots_gateway/

ENV PYTHONUNBUFFERED=1
ENV DOTS_HOST=0.0.0.0
ENV DOTS_PORT=8000

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "dots_gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
