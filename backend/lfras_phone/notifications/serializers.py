from __future__ import annotations

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Read serializer (list/detail)."""
    level_display = serializers.CharField(source="get_level_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "level",
            "level_display",
            "is_read",
            "created_at",
            "related_app",
            "related_model",
            "related_id",
            "meta",
            "actor",      # id only; expand via select_related in view if needed
            "user",       # id only (recipient)
        ]
        read_only_fields = fields


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Create serializer—primarily for internal/system use or staff tools.
    `user` is required; `actor` comes from request.user when available.
    """
    class Meta:
        model = Notification
        fields = [
            "user",
            "title",
            "message",
            "level",
            "related_app",
            "related_model",
            "related_id",
            "meta",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data.setdefault("actor", request.user)
        return super().create(validated_data)


class NotificationMarkReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["is_read"]