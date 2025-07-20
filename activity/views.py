from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.timezone import now
from activity.models import Activity, ActivityFile
from activity.serializers import ActivityCreateSerializer, ActivityDetailSerializer, FileUploadSerializer
from utils.s3_utils import create_activity_folder_in_s3, upload_file_to_s3, zip_activity_files, read_json_from_s3
from utils.audit_logger import log_event
from utils.file_validation import validate_uploaded_files
from utils.email_utils import send_email_using_smtp
from clients.models import ClientCD
from utils.notification_utils import create_notification


class ActivityCreateView(generics.CreateAPIView):
    serializer_class = ActivityCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        activity = serializer.save(started_by=self.request.user)
        ccd_id = activity.ccd.id
        create_activity_folder_in_s3(ccd_id, activity.id)

        # Log event
        log_event(
            event_type="activity_started",
            performed_by=self.request.user,
            cd_id=getattr(self.request.user, 'cd_id', None),
            ccd_id=ccd_id,
            context={"activity_id": activity.id}
        )

        # Send start email
        client = ClientCD.objects.get(id=activity.cd.id)
        subject = "Activity Started"
        template_path = activity.ccd_user.client.activity_start_template_s3_path
        smtp_config = activity.ccd_user.client.smtp_config
        context = {
            "user": self.request.user.get_full_name(),
            "activity_id": activity.id
        }
        send_email_using_smtp(subject, template_path, self.request.user.email, context, smtp_config)

        # Send notification
        create_notification(
            user=self.request.user,
            message=f"Activity #{activity.id} has been started.",
            level="Good"
        )


class ActivityDetailView(generics.RetrieveAPIView):
    serializer_class = ActivityDetailSerializer
    permission_classes = [IsAuthenticated]
    queryset = Activity.objects.all()
    lookup_field = "id"


class FileUploadView(generics.CreateAPIView):
    serializer_class = FileUploadSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        activity_id = kwargs.get("activity_id")
        try:
            activity = Activity.objects.get(id=activity_id)
        except Activity.DoesNotExist:
            return Response({"error": "Activity not found."}, status=404)

        files = request.FILES.getlist("files")
        if not files:
            return Response({"error": "No files provided."}, status=400)

        config_path = activity.ccd_user.client_cd.config_s3_path
        config_dict = read_json_from_s3(config_path)
        expected_file_names = [f["name"] for f in config_dict.get("files", [])]
        validation_results = validate_uploaded_files(files, config_path)

        all_valid = True
        for file_obj, file_result in zip(files, validation_results):
            s3_path = f"{activity.ccd_user.id}/activities/{activity.id}/files/{file_obj.name}"
            upload_file_to_s3(file_obj, s3_path)

            ActivityFile.objects.create(
                activity=activity,
                file_name=file_obj.name,
                uploaded_at=now(),
                validated_at=now(),
                is_valid=file_result["valid"],
                reason=file_result["reason"],
                expiry_days=file_result["expiry_days"]
            )

            log_event(
                event_type="file_uploaded",
                performed_by=request.user,
                cd_id=getattr(request.user, 'cd_id', None),
                ccd_id=activity.ccd_user.id,
                context={
                    "activity_id": activity.id,
                    "file": file_obj.name,
                    "valid": file_result["valid"],
                    "reason": file_result["reason"]
                }
            )

            if not file_result["valid"]:
                all_valid = False

        # Completion check
        uploaded_valid_files = ActivityFile.objects.filter(activity=activity, is_valid=True).values_list("file_name", flat=True)
        if all_valid and set(expected_file_names).issubset(set(uploaded_valid_files)):
            zip_path = zip_activity_files(activity.ccd_user.id, activity.id)
            activity.completed = True
            activity.zip_s3_path = zip_path
            activity.end_time = now()
            activity.status = "completed"
            activity.save()

            log_event(
                event_type="activity_completed",
                performed_by=request.user,
                cd_id=getattr(request.user, 'cd_id', None),
                ccd_id=activity.ccd_user.id,
                context={"activity_id": activity.id, "zip_path": zip_path}
            )

            client = ClientCD.objects.get(id=activity.ccd_user.client_cd.id)
            subject = "Activity Completed"
            template_path = activity.ccd_user.client_cd.config_s3_path
            smtp_config = activity.ccd_user.client_cd.email_config_s3_path
            context = {
                "user": request.user.get_full_name(),
                "activity_id": activity.id,
                "zip_link": zip_path
            }
            send_email_using_smtp(subject, template_path, request.user.email, context, smtp_config)

            # Send notification
            create_notification(
                user=request.user,
                message=f"Activity #{activity.id} has been completed. Zip file is ready.",
                level="Good"
            )

        return Response({"validation_results": validation_results}, status=200)