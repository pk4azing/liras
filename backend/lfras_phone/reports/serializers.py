from rest_framework import serializers

from .models import ScheduledReport


class ScheduledReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledReport
        fields = [
            "id",
            "client_id",
            "name",
            "report_type",
            "requested_format",
            "frequency",
            "active",
            "filters",
            "last_run_at",
            "next_run_at",
            "created_by_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["last_run_at", "next_run_at", "created_at", "updated_at", "created_by_id"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["created_by_id"] = getattr(user, "id", None)
        # if no client_id provided, infer from user
        if not validated_data.get("client_id") and getattr(user, "client_id", None):
            validated_data["client_id"] = user.client_id
        obj = super().create(validated_data)
        obj.ensure_next_run()
        obj.save(update_fields=["next_run_at"])
        return obj

    def validate(self, attrs):
        # forbid cross-tenant writes unless superuser
        req = self.context["request"]
        user = req.user
        cid = attrs.get("client_id") or getattr(self.instance, "client_id", None)
        if not user.is_superuser and user.client_id and cid and user.client_id != cid:
            raise serializers.ValidationError("Cross-tenant access is not allowed.")
        return attrs