# activities/models.py
from __future__ import annotations

from datetime import timedelta
import boto3
from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from accounts.models import User
from customers.models import Customer


US_EXPIRY_DAYS = 365


def default_file_expiry() -> timezone.datetime:
    """Serializable default for expires_at (no lambda so migrations can serialize it)."""
    return timezone.now() + timedelta(days=US_EXPIRY_DAYS)


class Activity(models.Model):
    client_id = models.PositiveIntegerField(db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="activities")
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_activities")

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=32,
        choices=[
            ("draft", "Draft"),
            ("in_progress", "In Progress"),
            ("completed", "Completed"),
            ("archived", "Archived"),
        ],
        default="draft",
        db_index=True,
    )
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)

    activity_id = models.CharField(
        max_length=96,
        unique=True,
        blank=True,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["client_id", "status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.activity_id or 'ACT?'} — {self.title}"

    @staticmethod
    def _build_activity_id(client_id: int, customer: Customer, pk: int) -> str:
        return f"LFRAS_C_{client_id}_CUST_{customer.customer_id}_ACT_{pk:06d}"

    @property
    def s3_base_prefix(self) -> str:
        return (
            f"LD_Clients/{self.client_id}/"
            f"Customer/{self.customer.customer_id}/"
            f"Activity/{self.activity_id}/"
        )


class ActivityFile(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name="files")
    uploader = models.ForeignKey(User, on_delete=models.PROTECT, related_name="uploaded_activity_files")

    file_name = models.CharField(max_length=512)
    content_type = models.CharField(max_length=128, blank=True, default="")
    size = models.BigIntegerField(default=0)
    checksum = models.CharField(max_length=128, blank=True, default="")

    s3_key = models.CharField(max_length=1024, db_index=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        default=default_file_expiry,
        help_text="Defaults to 365 days from upload.",
    )

    # If you planned to track validation, keep this (optional)
    # validation_status = models.CharField(
    #     max_length=24,
    #     choices=[
    #         ("uploaded", "Uploaded"),
    #         ("validating", "Validating"),
    #         ("validated_success", "Validated (Success)"),
    #         ("validated_failure", "Validation (Failure)"),
    #     ],
    #     default="uploaded",
    #     db_index=True,
    # )

    class Meta:
        ordering = ["-uploaded_at"]
        indexes = [
            models.Index(fields=["activity", "uploaded_at"]),
            models.Index(fields=["expires_at"]),
            # If you enabled validation_status above, keep this index too:
            # models.Index(fields=["validation_status"]),
        ]

    def __str__(self) -> str:
        return f"{self.file_name} ({self.s3_key})"

    @property
    def is_expired(self) -> bool:
        return bool(self.expires_at and timezone.now() >= self.expires_at)

    @property
    def s3_url(self) -> str:
        bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", "")
        region = getattr(settings, "AWS_S3_REGION_NAME", "us-east-1")
        if not bucket:
            return self.s3_key
        return f"https://{bucket}.s3.{region}.amazonaws.com/{self.s3_key}"


@receiver(post_save, sender=Activity)
def set_activity_id_and_s3_folders(sender, instance: Activity, created: bool, **kwargs):
    if not created:
        return

    # Assign activity_id if missing
    if not instance.activity_id:
        new_id = Activity._build_activity_id(
            client_id=instance.client_id,
            customer=instance.customer,
            pk=instance.pk,
        )
        type(instance).objects.filter(pk=instance.pk).update(activity_id=new_id)
        instance.activity_id = new_id

    # Create S3 folder placeholders (safe no-ops if they exist)
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
    )
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    base = instance.s3_base_prefix
    folders = [
        base,
        f"{base}Files/",
        f"{base}zipped/",
    ]

    for folder in folders:
        s3_client.put_object(Bucket=bucket_name, Key=folder)