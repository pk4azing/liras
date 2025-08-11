from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from .models import Activity, ActivityFile


class ActivitySerializer(serializers.ModelSerializer):
    s3_base_prefix = serializers.ReadOnlyField()

    class Meta:
        model = Activity
        fields = [
            "id", "client_id", "customer", "created_by",
            "title", "description", "status",
            "started_at", "ended_at",
            "activity_id", "s3_base_prefix",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "activity_id", "s3_base_prefix", "created_at", "updated_at"]


class ActivityFileSerializer(serializers.ModelSerializer):
    s3_url = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = ActivityFile
        fields = [
            "id", "activity", "uploader",
            "file_name", "content_type", "size", "checksum",
            "s3_key", "s3_url",
            "uploaded_at", "expires_at", "is_expired",
            "validation_status", "validation_started_at", "validation_ended_at", "validation_notes",
        ]
        read_only_fields = ["id", "uploaded_at", "is_expired", "s3_url"]

    def validate(self, data):
        # Ensure expires_at is >= uploaded_at (or now)
        expires_at = data.get("expires_at")
        if expires_at and expires_at <= timezone.now():
            raise serializers.ValidationError("expires_at must be in the future.")
        return data