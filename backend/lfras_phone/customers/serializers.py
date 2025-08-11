from __future__ import annotations

from django.conf import settings
from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    # Read-only system fields
    id = serializers.IntegerField(read_only=True)
    customer_id = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    updated_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Customer
        fields = [
            "id",
            "client_id",
            "customer_id",
            "name",
            "email",
            "phone",
            "city",
            "address",
            "is_active",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        # minimal guardrails; email uniqueness per client is handled by DB constraint
        if self.instance is None and not attrs.get("client_id"):
            raise serializers.ValidationError({"client_id": "client_id is required."})
        if self.instance is None and not attrs.get("email"):
            raise serializers.ValidationError({"email": "email is required (used for login)."})
        return attrs