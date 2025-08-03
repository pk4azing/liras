from django.db import models
from django.utils import timezone
from clients.models import CCDUser, CDEmployee, ClientCD
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()

class Activity(models.Model):
    STATUS_CHOICES = [
        ('STARTED', 'Started'),
        ('VALIDATING', 'Validating'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ccd_user = models.ForeignKey(CCDUser, on_delete=models.CASCADE, related_name='activities')
    cd = models.ForeignKey(ClientCD, on_delete=models.CASCADE, related_name='activities')
    started_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='STARTED')
    total_files_uploaded = models.PositiveIntegerField(default=0)
    zip_s3_path = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Activity {self.id} by {self.ccd_user.email}"


class ActivityFile(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(default=timezone.now)
    validated_at = models.DateTimeField(null=True, blank=True)
    expiry_at = models.DateTimeField(null=True, blank=True)
    is_valid = models.BooleanField(default=False)
    reason = models.TextField(null=True, blank=True)
    s3_path = models.TextField(null=True, blank=True)
    expiry_days = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.filename} in Activity {self.activity.id}"


class FileKeywordValidation(models.Model):
    activity_file = models.ForeignKey(ActivityFile, on_delete=models.CASCADE, related_name='keywords')
    keyword = models.CharField(max_length=255)
    found = models.BooleanField(default=False)

    def __str__(self):
        return f"Keyword '{self.keyword}' - Found: {self.found} for {self.activity_file.filename}"