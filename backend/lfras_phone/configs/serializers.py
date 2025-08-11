from __future__ import annotations

from rest_framework import serializers
from django.conf import settings

from .models import ConfigFile, EmailTemplate


class ConfigFileSerializer(serializers.ModelSerializer):
    s3_url = serializers.SerializerMethodField()

    class Meta:
        model = ConfigFile
        fields = [
            "id", "client_id", "customer_id", "file_name",
            "s3_key", "s3_url", "content_type",
            "uploaded_by", "uploaded_at",
        ]
        read_only_fields = ["id", "s3_url", "uploaded_at", "uploaded_by"]

    def get_s3_url(self, obj: ConfigFile) -> str:
        bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", "")
        region = getattr(settings, "AWS_S3_REGION_NAME", "us-east-1")
        if not bucket:
            return obj.s3_key
        return f"https://{bucket}.s3.{region}.amazonaws.com/{obj.s3_key}"

    def validate(self, data):
        name: str = data.get("file_name") or ""
        if not name.lower().endswith(".txt"):
            raise serializers.ValidationError("Config files must be .txt")
        return data

    def create(self, validated_data):
        validated_data["uploaded_by"] = self.context["request"].user
        return super().create(validated_data)


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = [
            "id", "client_id", "customer_id",
            "template_type", "template_key",
            "subject_template", "body_template",
            "s3_key", "is_active", "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]