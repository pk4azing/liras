from __future__ import annotations
# If you want a dedicated app task runner, you can import & call activities.tasks
# Keeping this file in case you prefer to register Celery beat here too.

from activities.tasks import send_file_expiry_reminders  # re-export for beat