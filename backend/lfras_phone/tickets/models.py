from __future__ import annotations

from django.conf import settings
from django.db import models, transaction
from django.db.models.signals import post_save
from django.dispatch import receiver


class Ticket(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("blocked", "Blocked"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    ticket_code = models.CharField(max_length=64, unique=True, blank=True, default="")
    client_id = models.PositiveBigIntegerField(db_index=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="open", db_index=True)
    priority = models.CharField(max_length=16, choices=PRIORITY_CHOICES, default="medium", db_index=True)
    progress = models.PositiveSmallIntegerField(default=0)  # 0..100

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="tickets_created", on_delete=models.PROTECT
    )

    # Assigned LD contact (no FK — LD can be outside this DB)
    assigned_ld_email = models.EmailField(blank=True, default="", db_index=True)
    assigned_ld_name = models.CharField(max_length=255, blank=True, default="")

    # Optional S3 “bucket/prefix” to drop related assets
    s3_prefix = models.CharField(max_length=512, blank=True, default="")

    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tickets"
        indexes = [
            models.Index(fields=["client_id", "status"]),
            models.Index(fields=["ticket_code"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self) -> str:
        return self.ticket_code or f"Ticket#{self.pk}"


@receiver(post_save, sender=Ticket)
def _ensure_ticket_code(sender, instance: Ticket, created: bool, **kwargs):
    """
    Give tickets a stable human code once we have a PK:
      LFRAS_T_{client_id}_{id}
    """
    if created and not instance.ticket_code:
        instance.ticket_code = f"LFRAS_T_{instance.client_id}_{instance.id}"
        # prevent recursion
        Ticket.objects.filter(pk=instance.pk).update(ticket_code=instance.ticket_code)


class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, related_name="comments", on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="ticket_comments", on_delete=models.PROTECT)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "ticket_comments"
        ordering = ["created_at"]


class TicketActivity(models.Model):
    ticket = models.ForeignKey(Ticket, related_name="activities", on_delete=models.CASCADE)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="ticket_activities", on_delete=models.PROTECT)
    action = models.CharField(max_length=64)  # e.g. status_change, assign, progress_change, comment, update, close
    note = models.TextField(blank=True, default="")
    from_value = models.CharField(max_length=255, blank=True, default="")
    to_value = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "ticket_activity"
        ordering = ["-created_at"]