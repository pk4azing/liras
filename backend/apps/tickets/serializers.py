from rest_framework import serializers
from .models import Ticket, TicketComment, TicketHistory


class TicketSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'description',
            'status',
            'created_by', 'created_by_email',
            'assigned_to', 'assigned_to_email',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_by', 'created_by_email', 'created_at', 'updated_at']


class TicketCommentSerializer(serializers.ModelSerializer):
    commented_by_email = serializers.EmailField(source='commented_by.email', read_only=True)

    class Meta:
        model = TicketComment
        fields = [
            'id',
            'ticket',
            'comment',
            'commented_by', 'commented_by_email',
            'commented_at'
        ]
        read_only_fields = ['commented_by', 'commented_by_email', 'commented_at']


class TicketHistorySerializer(serializers.ModelSerializer):
    performed_by_email = serializers.EmailField(source='performed_by.email', read_only=True)

    class Meta:
        model = TicketHistory
        fields = [
            'id',
            'ticket',
            'action',
            'notes',
            'performed_by', 'performed_by_email',
            'timestamp'
        ]
        read_only_fields = ['performed_by', 'performed_by_email', 'timestamp']