from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class DownloadLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="downloads")
    file_name = models.CharField(max_length=255)
    file_url = models.URLField()
    source = models.CharField(max_length=50, choices=[
        ('activity', 'Activity'),
        ('report', 'Report'),
        ('ticket', 'Ticket'),
        ('other', 'Other'),
    ])
    downloaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} downloaded {self.file_name} at {self.downloaded_at}"