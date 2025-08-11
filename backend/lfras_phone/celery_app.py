import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lfras_phone.settings")

app = Celery("lfras_phone")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "send-activity-file-expiry-reminders-daily-0005-local": {
        "task": "activities.tasks.send_file_expiry_reminders",
        "schedule": crontab(minute=5, hour=0),
    },
}