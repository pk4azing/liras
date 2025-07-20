from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from django.db.models import QuerySet
from tickets.models import Ticket, TicketComment, TicketHistory
from tickets.serializers import TicketSerializer, TicketCommentSerializer, TicketHistorySerializer
from utils.notification_utils import create_notification
from utils.audit_logger import log_event


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Ticket]:
        user = self.request.user
        return Ticket.objects.filter(created_by=user) | Ticket.objects.filter(assigned_to=user)

    def perform_create(self, serializer):
        user = self.request.user
        ticket = serializer.save(created_by=user)

        # Notify LD (assigned_to) if provided
        if ticket.assigned_to:
            create_notification(
                user=ticket.assigned_to,
                message=f"New ticket assigned: {ticket.title}",
                level='Good'
            )

        log_event(
            event_type="TICKET_CREATED",
            performed_by=user,
            context={"ticket_id": ticket.id, "title": ticket.title}
        )


class TicketCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TicketCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[TicketComment]:
        user = self.request.user
        return TicketComment.objects.filter(created_by=user)

    def perform_create(self, serializer):
        user = self.request.user
        comment = serializer.save(created_by=user)

        # Notify other party (if LD assigned and CD commented or vice versa)
        ticket = comment.ticket
        counterpart = ticket.assigned_to if ticket.created_by == user else ticket.created_by

        if counterpart:
            create_notification(
                user=counterpart,
                message=f"New comment on ticket: {ticket.title}",
                level='Good'
            )

        log_event(
            event_type="TICKET_COMMENTED",
            performed_by=user,
            context={"ticket_id": ticket.id, "comment": comment.comment}
        )


class TicketHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TicketHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[TicketHistory]:
        user = self.request.user
        return TicketHistory.objects.filter(ticket__created_by=user) | TicketHistory.objects.filter(ticket__assigned_to=user)