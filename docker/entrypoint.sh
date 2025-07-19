#!/bin/sh

echo "Waiting for Postgres to become available..."

while ! nc -z db 5432; do
  sleep 0.5
done

echo "Postgres is up - continuing..."

# Apply migrations
python manage.py migrate

# Start development server
exec "$@"