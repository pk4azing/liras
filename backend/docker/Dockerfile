# backend/docker/Dockerfile
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system and cron dependencies
RUN apt-get update && apt-get install -y \
    cron \
    netcat-openbsd \
    libpq-dev \
    gcc \
    build-essential \
    curl \
    && apt-get clean

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --ignore-installed

COPY . .


RUN chmod +x docker/cron/cronjob.sh
COPY docker/cron/crontab /etc/cron.d/lfras-cron
COPY docker/cron/cronjob.sh /app/docker/cron/run_cron.sh
RUN chmod 0644 /etc/cron.d/lfras-cron \
    && chmod +x /app/docker/cron/run_cron.sh \
    && crontab /etc/cron.d/lfras-cron

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose backend app port
EXPOSE 2225

ENTRYPOINT ["/entrypoint.sh"]