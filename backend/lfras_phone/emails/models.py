from __future__ import annotations

from django.db import models
from django.utils import timezone


class EmailLog(models.Model):
    to_email = models.EmailField()
    cc_email = models.EmailField(blank=True, default="")
    subject = models.CharField(max_length=255)
    template_key = models.CharField(max_length=255, blank=True, default="")
    context_json = models.JSONField(default=dict, blank=True)
    sent_at = models.DateTimeField(default=timezone.now)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-sent_at"]
        indexes = [models.Index(fields=["to_email", "sent_at"])]