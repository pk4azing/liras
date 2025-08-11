from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound

from .models import Ticket, TicketComment, TicketHistory
from .serializers import (
    TicketCreateSerializer,
    TicketListSerializer,
    TicketDetailSerializer,
    TicketCommentSerializer,
    TicketHistorySerializer,
)


class TicketListCreateView(generics.ListCreateAPIView):
    """
    GET: List tickets
    POST: Create a ticket
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        # Use different serializers for list vs create
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketListSerializer


class TicketDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve one ticket
    PUT/PATCH: Update ticket
    """
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        return Ticket.objects.all()

    def get_object(self):
        try:
            return self.get_queryset().get(pk=self.kwargs.get(self.lookup_url_kwarg))
        except Ticket.DoesNotExist:
            raise NotFound('Ticket not found')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return TicketCreateSerializer
        return TicketDetailSerializer


class TicketCommentListCreateView(generics.ListCreateAPIView):
    """
    GET: List comments for a ticket
    POST: Add a comment to a ticket
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_id')
        return TicketComment.objects.filter(ticket_id=ticket_id).order_by('created_at')

    def get_serializer_class(self):
        return TicketCommentSerializer

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_id')
        serializer.save(ticket_id=ticket_id, author=self.request.user)


class TicketHistoryListCreateView(generics.ListCreateAPIView):
    """
    GET: List history entries for a ticket
    POST: Create a history entry for a ticket
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_id')
        return TicketHistory.objects.filter(ticket_id=ticket_id).order_by('created_at')

    def get_serializer_class(self):
        return TicketHistorySerializer

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_id')
        serializer.save(ticket_id=ticket_id, actor=self.request.user)