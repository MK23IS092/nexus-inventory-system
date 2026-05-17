FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build deps and pip dependencies
COPY requirements.txt ./
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libssl-dev libffi-dev \
    && pip install --no-cache-dir -r requirements.txt gunicorn \
    && apt-get remove -y build-essential gcc libssl-dev libffi-dev \
    && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
