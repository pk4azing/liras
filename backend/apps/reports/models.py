from django.db import models
from django.conf import settings

REPORT_TYPE_CHOICES = [
    ("DAILY", "Daily Report"),
    ("WEEKLY", "Weekly Report"),
    ("MONTHLY", "Monthly Report"),
    ("CUSTOM", "Custom Report"),
]

class Report(models.Model):
    report_for = models.CharField(max_length=255, help_text="Whom or what this report is for")
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='requested_reports')
    generated_at = models.DateTimeField(auto_now_add=True)
    report_file_s3_path = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "report"
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.report_type} report for {self.report_for} by {self.requested_by}"