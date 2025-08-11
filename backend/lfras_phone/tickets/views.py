from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Ticket, TicketComment, TicketActivity
from .serializers import (
    TicketSerializer,
    TicketListSerializer,
    TicketCommentSerializer,
    TicketActivitySerializer,
)
from .permissions import IsTicketViewer, CanCreateTicket, CanEditTicket


class TicketListCreateView(APIView):
    permission_classes = [IsAuthenticated, CanCreateTicket]

    def get(self, request):
        qs = Ticket.objects.filter(client_id=request.user.client_id, is_active=True)
        status_q = request.query_params.get("status")
        if status_q:
            qs = qs.filter(status=status_q)
        serializer = TicketListSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        ser = TicketSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        ticket = ser.save()
        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class TicketDetailView(APIView):
    permission_classes = [IsAuthenticated, IsTicketViewer, CanEditTicket]

    def get_object(self, request, pk):
        obj = get_object_or_404(Ticket, pk=pk, is_active=True)
        # object-level checks handled by permissions
        self.check_object_permissions(request, obj)
        return obj

    def get(self, request, pk: int):
        ticket = self.get_object(request, pk)
        return Response(TicketSerializer(ticket).data)

    def patch(self, request, pk: int):
        ticket = self.get_object(request, pk)
        ser = TicketSerializer(ticket, data=request.data, partial=True, context={"request": request})
        ser.is_valid(raise_exception=True)
        ticket = ser.save()
        return Response(TicketSerializer(ticket).data)

    def delete(self, request, pk: int):
        ticket = self.get_object(request, pk)
        # Restrict archive to CD side
        if not getattr(request.user, "is_staff", False):
            return Response({"detail": "Only CD users may archive tickets."}, status=status.HTTP_403_FORBIDDEN)
        ticket.is_active = False
        ticket.save(update_fields=["is_active"])
        TicketActivity.objects.create(ticket=ticket, actor=request.user, action="close", note="Ticket archived")
        return Response(status=status.HTTP_204_NO_CONTENT)


class TicketCommentCreateListView(APIView):
    permission_classes = [IsAuthenticated, IsTicketViewer]

    def get(self, request, ticket_id: int):
        ticket = get_object_or_404(Ticket, pk=ticket_id, is_active=True)
        self.check_object_permissions(request, ticket)
        ser = TicketCommentSerializer(ticket.comments.all(), many=True)
        return Response(ser.data)

    def post(self, request, ticket_id: int):
        ticket = get_object_or_404(Ticket, pk=ticket_id, is_active=True)
        self.check_object_permissions(request, ticket)

        # Everyone in the tenant (CD or LD) can comment; LD must belong to same client_id (already checked)
        ser = TicketCommentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        comment = TicketComment.objects.create(ticket=ticket, author=request.user, body=ser.validated_data["body"])
        TicketActivity.objects.create(ticket=ticket, actor=request.user, action="comment", note="Comment added")
        return Response(TicketCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class TicketActivityListView(APIView):
    permission_classes = [IsAuthenticated, IsTicketViewer]

    def get(self, request, ticket_id: int):
        ticket = get_object_or_404(Ticket, pk=ticket_id, is_active=True)
        self.check_object_permissions(request, ticket)
        ser = TicketActivitySerializer(ticket.activities.all(), many=True)
        return Response(ser.data)