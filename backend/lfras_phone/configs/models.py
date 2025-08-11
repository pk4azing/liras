from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class ConfigFile(models.Model):
    """
    Client/Customer-specific config files (txt) uploaded by CCD Standard users.
    Stored in S3 at:
      s3://{bucket}/LD_Clients/{client_ID}/Customer/{customer_ID}/configs/{filename}.txt
    """
    client_id = models.PositiveIntegerField(db_index=True)
    customer_id = models.PositiveIntegerField(db_index=True)
    file_name = models.CharField(max_length=255)
    s3_key = models.CharField(max_length=1024, db_index=True)
    content_type = models.CharField(max_length=64, default="text/plain")
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="uploaded_configs")
    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-uploaded_at"]
        unique_together = [("client_id", "customer_id", "file_name")]


class EmailTemplate(models.Model):
    """
    Text/HTML subject+body templates used for automated mail.
    """
    TEMPLATE_TYPES = [
        ("expiry", "Expiry Reminder"),
        ("custom", "Custom"),
    ]
    client_id = models.PositiveIntegerField(db_index=True)
    customer_id = models.PositiveIntegerField(db_index=True)
    template_type = models.CharField(max_length=32, choices=TEMPLATE_TYPES, default="expiry", db_index=True)
    template_key = models.CharField(max_length=255, db_index=True)  # logical key like "expiry_default"
    subject_template = models.TextField(blank=True, default="")
    body_template = models.TextField(blank=True, default="")
    s3_key = models.CharField(max_length=1024, blank=True, default="")
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["template_type", "template_key"]
        unique_together = [("client_id", "customer_id", "template_key")]