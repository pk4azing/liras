#!/bin/sh

echo "Waiting for Postgres to become available..."

while ! nc -z db 5432; do
  sleep 0.5
done

echo "Postgres is up - continuing..."

# Apply migrations
python manage.py migrate

# Start development server
gunicorn lfras_phone.wsgi:application --bind 0.0.0.0:2225