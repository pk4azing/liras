from __future__ import annotations

from datetime import timedelta
import pytz
from django.conf import settings
from django.utils import timezone
from celery import shared_task

from .models import ActivityFile
from emails.helpers import send_expiry_email

# Schedule idea: run once daily at 00:05 America/New_York via celery-beat
REMINDER_DAYS = (28, 21, 14, 7, 1, 0)


@shared_task(bind=True, ignore_result=True, max_retries=3)
def send_file_expiry_reminders(self):
    tzname = getattr(settings, "AMERICA_TZ", "America/New_York")
    local_tz = pytz.timezone(tzname)

    # "now" in local zone; only send around 00:05 local
    now_utc = timezone.now()
    now_local = now_utc.astimezone(local_tz)

    if not (now_local.hour == 0 and now_local.minute >= 5 and now_local.minute < 20):
        # only send between 00:05 - 00:19 local to be safe
        return

    for days in REMINDER_DAYS:
        target_date_start = (now_local + timedelta(days=days)).replace(hour=0, minute=0, second=0, microsecond=0)
        target_date_end = target_date_start + timedelta(days=1)

        # convert back to UTC for DB filtering
        start_utc = target_date_start.astimezone(timezone.utc)
        end_utc = target_date_end.astimezone(timezone.utc)

        files = ActivityFile.objects.select_related("activity", "uploader", "activity__created_by").filter(
            expires_at__gte=start_utc,
            expires_at__lt=end_utc,
        )

        for f in files:
            try:
                send_expiry_email(f, days_remaining=days)
            except Exception as e:
                # Let it continue; you could also log here
                continue