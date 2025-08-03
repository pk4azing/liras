from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.timezone import now
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Activity, ActivityFile
from .serializers import (
    ActivityCreateSerializer,
    FileUploadSerializer,
    ActivityDetailSerializer,
    ActivityCompleteSerializer,
)
from clients.models import CCDUser, ClientCD
from utils.s3_utils import create_activity_folder_in_s3, upload_file_to_s3, zip_activity_folder
from utils.email_utils import send_activity_email
from utils.audit_logger import log_audit
from utils.notification_utils import notify_activity_event


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivityDetailSerializer

    def get_serializer_class(self):
        if self.action == 'start_activity':
            return ActivityCreateSerializer
        elif self.action == 'upload_files':
            return FileUploadSerializer
        elif self.action == 'complete_activity':
            return ActivityCompleteSerializer
        return ActivityDetailSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Activity.objects.none()
        try:
            ccd_user = CCDUser.objects.get(username=self.request.user.username)
            return Activity.objects.filter(ccd_user=ccd_user).order_by('-start_time')
        except CCDUser.DoesNotExist:
            return Activity.objects.none()

    @action(detail=False, methods=['post'], url_path='start')
    def start_activity(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            activity = serializer.save()
            prefix = create_activity_folder_in_s3(
                cd_id=activity.cd.id,
                ccd_id=activity.ccd_user.id,
                activity_id=activity.id
            )
            activity.status = 'Started'
            activity.save()

            log_audit(request.user, f"Activity {activity.id} started.")
            send_activity_email(activity, stage='start')
            notify_activity_event(activity, event='started')

        return Response(ActivityDetailSerializer(activity).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='upload')
    def upload_files(self, request, pk=None):
        activity = get_object_or_404(Activity, pk=pk)
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        uploaded_files = request.FILES.getlist('files')
        file_objs = []

        for file_obj in uploaded_files:
            s3_path = upload_file_to_s3(file_obj, activity)
            file_record = ActivityFile.objects.create(
                activity=activity,
                filename=file_obj.name,
                uploaded_at=now(),
                is_valid=True,  # Assume success for now
            )
            file_objs.append(file_record)

        log_audit(request.user, f"Uploaded {len(file_objs)} files to activity {activity.id}.")
        notify_activity_event(activity, event='file_uploaded')

        return Response({'uploaded': len(file_objs)}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete_activity(self, request, pk=None):
        activity = get_object_or_404(Activity, pk=pk)

        with transaction.atomic():
            zip_path = zip_activity_folder(activity)
            activity.end_time = now()
            activity.status = 'Completed'
            activity.zip_s3_path = zip_path
            activity.save()

            log_audit(request.user, f"Activity {activity.id} completed.")
            send_activity_email(activity, stage='complete')
            notify_activity_event(activity, event='completed')

        return Response(ActivityDetailSerializer(activity).data, status=status.HTTP_200_OK)