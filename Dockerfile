FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Python dependencies from the backend service
COPY Backend/requirements.txt /app/Backend/requirements.txt
RUN pip install --no-cache-dir -r /app/Backend/requirements.txt gunicorn

# Copy only the backend sources needed for Railway deployment
COPY Backend/ /app/Backend/

WORKDIR /app/Backend

EXPOSE 5000

# Railway sets PORT; fall back to 5000 for local container runs
CMD ["sh", "-c", "gunicorn -w 2 -b 0.0.0.0:${PORT:-5000} app:app"]
