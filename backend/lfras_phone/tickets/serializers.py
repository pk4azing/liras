# tickets/serializers.py
from rest_framework import serializers
from .models import Ticket, TicketComment, TicketHistory

class TicketListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id", "title", "description", "status", "priority",
            "created_at", "updated_at", "created_by_name", "assigned_to_name"
        ]


class TicketDetailSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id", "title", "description", "status", "priority",
            "created_at", "updated_at", "comments"
        ]

    def get_comments(self, obj):
        comments = TicketComment.objects.filter(ticket=obj).order_by("created_at")
        return TicketCommentSerializer(comments, many=True).data


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["title", "description", "priority", "assigned_to"]


class TicketCommentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = TicketComment
        fields = ["id", "comment", "created_by_name", "created_at"]


class TicketHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.get_full_name", read_only=True)

    class Meta:
        model = TicketHistory
        fields = ["id", "field_changed", "old_value", "new_value", "changed_by_name", "changed_at"]