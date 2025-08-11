from __future__ import annotations

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Activity, ActivityFile
from .serializers import ActivitySerializer, ActivityFileSerializer


class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # basic: allow staff or creator/uploader
        if request.user and request.user.is_staff:
            return True
        if isinstance(obj, Activity):
            return obj.created_by_id == request.user.id
        if isinstance(obj, ActivityFile):
            return obj.uploader_id == request.user.id or obj.activity.created_by_id == request.user.id
        return False


# Activities
class ActivityListCreateView(generics.ListCreateAPIView):
    queryset = Activity.objects.all().select_related("customer", "created_by")
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

class ActivityRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Activity.objects.all().select_related("customer", "created_by")
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]


# Activity Files
class ActivityFileListCreateView(generics.ListCreateAPIView):
    serializer_class = ActivityFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActivityFile.objects.filter(activity_id=self.kwargs["activity_pk"]).select_related("activity", "uploader")

    def perform_create(self, serializer):
        # activity_pk from URL
        activity = Activity.objects.get(pk=self.kwargs["activity_pk"])
        serializer.save(activity=activity, uploader=self.request.user)


class ActivityFileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = ActivityFile.objects.select_related("activity", "uploader")
    serializer_class = ActivityFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]


class ActivityFileDownloadURLView(APIView):
    """
    Return the plain S3 URL (not presigned) as requested.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk: int):
        try:
            af = ActivityFile.objects.get(pk=pk)
        except ActivityFile.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        # Authorization:
        if not (request.user.is_staff or af.uploader_id == request.user.id or af.activity.created_by_id == request.user.id):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"s3_url": af.s3_url})