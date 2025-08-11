# CDCCD/celery.py
from __future__ import annotations

import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CDCCD.settings")  # <-- adjust if your settings module path differs

app = Celery("CDCCD")

# Load any CELERY_* settings from Django settings.py
app.config_from_object("django.conf:settings", namespace="CELERY")

# Discover tasks across all installed apps (tasks.py files)
app.autodiscover_tasks()

# Beat schedule — periodic tasks
app.conf.beat_schedule = {
    "send-activity-file-expiry-reminders-daily-0005-est": {
        "task": "activities.tasks.send_file_expiry_reminders",
        "schedule": crontab(minute=5, hour=0),  # server time; task adjusts to America TZ
    },
}

# Optional: timezone if you want Celery beat itself in a specific zone
app.conf.timezone = "UTC"  # keep UTC for beat, we convert in the task