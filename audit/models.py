from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class AuditLog(models.Model):
    EVENT_TYPE_CHOICES = [
        # Auth
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('OTP_SENT', 'OTP Sent'),
        ('OTP_FAILED', 'OTP Failed'),
        ('PASSWORD_RESET_REQUESTED', 'Password Reset Requested'),
        ('PASSWORD_RESET_COMPLETED', 'Password Reset Completed'),

        # Activity
        ('ACTIVITY_STARTED', 'Activity Started'),
        ('FILE_UPLOADED', 'File Uploaded'),
        ('FILE_VALIDATED', 'File Validated'),
        ('ACTIVITY_COMPLETED', 'Activity Completed'),

        # Reports
        ('REPORT_REQUESTED', 'Report Requested'),
        ('REPORT_GENERATED', 'Report Generated'),
        ('REPORT_DOWNLOADED', 'Report Downloaded'),

        # Tickets
        ('TICKET_CREATED', 'Ticket Created'),
        ('TICKET_UPDATED', 'Ticket Updated'),
        ('TICKET_COMMENT_ADDED', 'Ticket Comment Added'),
        ('TICKET_CLOSED', 'Ticket Closed'),

        # Notifications
        ('NOTIFICATION_TRIGGERED', 'Notification Triggered'),
        ('NOTIFICATION_SENT', 'Notification Sent'),
        ('NOTIFICATION_SEEN', 'Notification Seen'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    performed_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    cd_id = models.UUIDField(null=True, blank=True)
    ccd_id = models.UUIDField(null=True, blank=True)
    description = models.TextField(blank=True)
    context = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.event_type} by {self.performed_by} on {self.timestamp}"