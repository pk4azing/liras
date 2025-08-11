# CDCCD/notifications/views.py
from __future__ import annotations

from django.utils import timezone
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.generics import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer


# ---- Helpers / Permissions ---------------------------------------------------

class IsAuthenticatedAndClientScoped(permissions.BasePermission):
    """
    Allow access only to authenticated users; queryset must be filtered by user.client_id.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


def scoped_queryset(request):
    """
    Limit notifications to the current user's client and—by default—to the current
    user as a recipient. SuperAdmin/Admin may optionally view all recipients for
    the same client using ?all=true.
    """
    user = request.user
    qs = Notification.objects.filter(client_id=user.client_id)

    # SuperAdmin/Admin for the same client can view everyone's notifications if all=true
    all_flag = request.query_params.get("all", "false").lower() in {"1", "true", "yes"}
    if not (all_flag and getattr(user, "user_category", "standard") in {"admin", "superadmin"}):
        qs = qs.filter(recipient=user)

    # Filtering by read status
    is_read = request.query_params.get("is_read")
    if is_read is not None:
        if is_read.lower() in {"1", "true", "yes"}:
            qs = qs.filter(is_read=True)
        elif is_read.lower() in {"0", "false", "no"}:
            qs = qs.filter(is_read=False)

    # Optional filters
    severity = request.query_params.get("severity")
    if severity:
        qs = qs.filter(severity__iexact=severity)

    since = request.query_params.get("since")  # ISO date/datetime
    if since:
        qs = qs.filter(created_at__gte=since)

    until = request.query_params.get("until")
    if until:
        qs = qs.filter(created_at__lte=until)

    search = request.query_params.get("search")
    if search:
        qs = qs.filter(
            Q(verb__icontains=search) |
            Q(message__icontains=search) |
            Q(extra__icontains=search)
        )

    return qs.order_by("-created_at")


# ---- Views -------------------------------------------------------------------

class NotificationListCreateAPIView(APIView, LimitOffsetPagination):
    """
    GET  /notifications/               -> list (client-scoped, recipient-scoped)
    POST /notifications/               -> create (client-scoped)
    """
    permission_classes = [IsAuthenticatedAndClientScoped]
    default_limit = 20
    max_limit = 100

    def get(self, request):
        qs = scoped_queryset(request)
        page = self.paginate_queryset(qs, request, view=self)
        ser = NotificationSerializer(page, many=True)
        return self.get_paginated_response(ser.data)

    def post(self, request):
        # Force client_id to current user's client by default
        data = request.data.copy()
        if "client_id" not in data or data.get("client_id") is None:
            data["client_id"] = request.user.client_id

        # If recipient omitted, default to current user
        if "recipient" not in data or data.get("recipient") in (None, "", 0, "0"):
            data["recipient"] = request.user.pk

        ser = NotificationSerializer(data=data, context={"request": request})
        if ser.is_valid():
            instance = ser.save()
            return Response(NotificationSerializer(instance).data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationDetailAPIView(APIView):
    """
    GET    /notifications/{pk}/        -> detail (scoped)
    DELETE /notifications/{pk}/        -> delete (recipient OR admin/superadmin within same client)
    """
    permission_classes = [IsAuthenticatedAndClientScoped]

    def get_object(self, request, pk: int) -> Notification:
        user = request.user
        base = Notification.objects.filter(pk=pk, client_id=user.client_id)
        all_flag = request.query_params.get("all", "false").lower() in {"1", "true", "yes"}
        if not (all_flag and getattr(user, "user_category", "standard") in {"admin", "superadmin"}):
            base = base.filter(recipient=user)
        return get_object_or_404(base)

    def get(self, request, pk: int):
        obj = self.get_object(request, pk)
        return Response(NotificationSerializer(obj).data)

    def delete(self, request, pk: int):
        user = request.user
        obj = get_object_or_404(Notification, pk=pk, client_id=user.client_id)
        # allow delete if recipient == user OR user is admin/superadmin of same client
        can_admin = getattr(user, "user_category", "standard") in {"admin", "superadmin"}
        if obj.recipient_id != user.id and not can_admin:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationMarkReadAPIView(APIView):
    """
    PATCH /notifications/{pk}/mark_read/
    """
    permission_classes = [IsAuthenticatedAndClientScoped]

    def patch(self, request, pk: int):
        user = request.user
        obj = get_object_or_404(Notification, pk=pk, client_id=user.client_id)

        # Only recipient OR admin/superadmin in same client can mark read
        can_admin = getattr(user, "user_category", "standard") in {"admin", "superadmin"}
        if obj.recipient_id != user.id and not can_admin:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        if not obj.is_read:
            obj.is_read = True
            obj.read_at = timezone.now()
            obj.save(update_fields=["is_read", "read_at"])
        return Response({"status": "ok", "is_read": obj.is_read, "read_at": obj.read_at})


class NotificationMarkUnreadAPIView(APIView):
    """
    PATCH /notifications/{pk}/mark_unread/
    """
    permission_classes = [IsAuthenticatedAndClientScoped]

    def patch(self, request, pk: int):
        user = request.user
        obj = get_object_or_404(Notification, pk=pk, client_id=user.client_id)

        can_admin = getattr(user, "user_category", "standard") in {"admin", "superadmin"}
        if obj.recipient_id != user.id and not can_admin:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        if obj.is_read:
            obj.is_read = False
            obj.read_at = None
            obj.save(update_fields=["is_read", "read_at"])
        return Response({"status": "ok", "is_read": obj.is_read, "read_at": obj.read_at})


class NotificationMarkAllReadAPIView(APIView):
    """
    POST /notifications/mark_all_read/
    Marks all notifications for the current user (and client) as read.
    Admin/SuperAdmin can pass ?all=true to mark all recipients in the same client.
    """
    permission_classes = [IsAuthenticatedAndClientScoped]

    def post(self, request):
        user = request.user
        now = timezone.now()

        qs = Notification.objects.filter(client_id=user.client_id, is_read=False)
        all_flag = request.query_params.get("all", "false").lower() in {"1", "true", "yes"}
        can_admin = getattr(user, "user_category", "standard") in {"admin", "superadmin"}

        if not (all_flag and can_admin):
            qs = qs.filter(recipient=user)

        updated = qs.update(is_read=True, read_at=now)
        return Response({"status": "ok", "updated": updated})