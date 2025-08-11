from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class Notification(models.Model):
    class Level(models.TextChoices):
        INFO = "info", "Info"
        SUCCESS = "success", "Success"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"
        CRITICAL = "critical", "Critical"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        help_text="Recipient of the notification",
    )
    # Optional: actor who triggered this (LD/CD/CCD user or system)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications_sent",
        help_text="Who performed the action (optional).",
    )

    title = models.CharField(max_length=160)
    message = models.TextField(blank=True, default="")

    level = models.CharField(
        max_length=16, choices=Level.choices, default=Level.INFO, db_index=True
    )

    # A light-weight generic linkage (avoids hard dependency on other apps)
    related_app = models.CharField(max_length=50, blank=True, default="", db_index=True)
    related_model = models.CharField(max_length=50, blank=True, default="", db_index=True)
    related_id = models.CharField(max_length=64, blank=True, default="", db_index=True)

    # Arbitrary extra data for clients (URLs, s3 keys, etc.)
    meta = models.JSONField(blank=True, default=dict)

    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "cdccd_notifications"
        indexes = [
            models.Index(fields=["user", "is_read", "created_at"]),
            models.Index(fields=["related_app", "related_model", "related_id"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"[{self.get_level_display()}] {self.title} → {self.user_id}"


def create_notification(
    *,
    user,
    title: str,
    message: str = "",
    level: str = Notification.Level.INFO,
    actor=None,
    related_app: str = "",
    related_model: str = "",
    related_id: str = "",
    meta: dict | None = None,
) -> Notification:
    """Helper used by other apps (activities, downloads, reports, tickets)."""
    return Notification.objects.create(
        user=user,
        actor=actor,
        title=title,
        message=message,
        level=level,
        related_app=related_app,
        related_model=related_model,
        related_id=str(related_id or ""),
        meta=meta or {},
    )