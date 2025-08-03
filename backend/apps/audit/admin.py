from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'performed_by', 'timestamp')
    search_fields = ('event_type', 'performed_by__email', 'description')
    list_filter = ('event_type', 'timestamp')