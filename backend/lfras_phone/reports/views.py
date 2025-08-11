from __future__ import annotations

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ScheduledReport
from .serializers import ScheduledReportSerializer
from .tasks import run_schedule_now  # Celery task wrapper


class IsSameClientOrSuperuser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj: ScheduledReport):
        if request.user.is_superuser:
            return True
        return getattr(request.user, "client_id", None) == obj.client_id

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class ScheduledReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsSameClientOrSuperuser]

    def get_queryset(self):
        qs = ScheduledReport.objects.all().order_by("-id")
        user = self.request.user
        if user.is_superuser:
            return qs
        return qs.filter(client_id=user.client_id)


class ScheduledReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsSameClientOrSuperuser]

    def get_queryset(self):
        qs = ScheduledReport.objects.all()
        user = self.request.user
        if user.is_superuser:
            return qs
        return qs.filter(client_id=user.client_id)


class ScheduledReportRunNowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        try:
            sched = ScheduledReport.objects.get(pk=pk)
        except ScheduledReport.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        perm = IsSameClientOrSuperuser()
        if not perm.has_object_permission(request, self, sched):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        run_schedule_now.delay(sched.id)
        return Response({"status": "queued", "scheduled_report_id": sched.id})