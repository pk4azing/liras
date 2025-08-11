from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    "reports-run-due-schedules-every-5min": {
        "task": "reports.tasks.run_due_schedules",
        "schedule": crontab(minute="*/5"),
    },
}