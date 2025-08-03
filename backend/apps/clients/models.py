from django.db import models
from django.contrib.auth import get_user_model
import uuid
User = get_user_model()


class ClientCD(models.Model):
    PLAN_CHOICES = [
        ('ESSENTIALS', 'Essentials'),
        ('PROFESSIONAL', 'Professional'),
        ('ENTERPRISE', 'Enterprise'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255)
    subdomain = models.CharField(max_length=100, unique=True)
    email_domain = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=50, choices=PLAN_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    smtp_config = models.JSONField(default=dict)
    config_s3_path = models.TextField(null=True, blank=True)
    email_config_s3_path = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.company_name


class CDEmployee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=100)  # This can also be a choices field
    designation = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    username = models.CharField(max_length=100, unique=True)
    client_cd = models.ForeignKey(ClientCD, on_delete=models.CASCADE, related_name='employees')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class CCDUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    designation = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    username = models.CharField(max_length=100, unique=True)
    client_cd = models.ForeignKey(ClientCD, on_delete=models.CASCADE, related_name='ccd_users')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class FileUploadLog(models.Model):
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    original_filename = models.CharField(max_length=255)
    s3_path = models.CharField(max_length=1024)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_filename