from django_cron import CronJobBase, Schedule
from django.utils.timezone import now
from datetime import timedelta
from activity.models import ActivityFile
from utils.email_utils import send_email_using_smtp
from utils.audit_logger import log_event
from utils.notification_utils import create_notification

REMINDER_DAYS = {
    28: "4 weeks",
    21: "3 weeks",
    14: "2 weeks",
    7: "1 week",
    1: "24 hours",
    0: "today"
}

class FileExpiryReminderCronJob(CronJobBase):
    RUN_EVERY_MINS = 1440  # once a day
    code = 'activity.file_expiry_reminder'  # unique code

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)

    def do(self):
        today = now().date()

        for reminder_day, label in REMINDER_DAYS.items():
            target_date = today + timedelta(days=reminder_day)
            expiring_files = ActivityFile.objects.filter(
                expiry_days__isnull=False,
                uploaded_at__isnull=False,
            )

            for file in expiring_files:
                expiry_date = file.uploaded_at.date() + timedelta(days=file.expiry_days)
                if expiry_date == target_date:
                    ccd_user = file.activity.ccd_user
                    cd_client = ccd_user.client_cd

                    subject = f"Reminder: File '{file.filename}' expires in {label}"
                    context = {
                        "ccd_user": ccd_user.full_name,
                        "file_name": file.filename,
                        "activity_id": file.activity.id,
                        "expiry_date": expiry_date.strftime('%Y-%m-%d'),
                        "days_left": label,
                    }
                    template_path = cd_client.email_config_s3_path
                    smtp_config = cd_client.smtp_config

                    send_email_using_smtp(subject, template_path, ccd_user.email, context, smtp_config)

                    # Audit log
                    log_event(
                        event_type="expiry_reminder_sent",
                        performed_by=None,
                        cd_id=cd_client.id,
                        ccd_id=ccd_user.id,
                        context={"file": file.filename, "days_left": label}
                    )

                    # Notification
                    create_notification(
                        user=ccd_user,
                        message=f"Your file '{file.filename}' will expire in {label}.",
                        level="Critical" if reminder_day in [0, 1] else "Bad"
                    )