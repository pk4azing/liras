from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from clients.models import ClientCD, CDEmployee, CCDUser
from clients.serializers import (
    ClientCDSerializer,
    CDEmployeeCreateSerializer,
    CCDUserCreateSerializer,
    FileUploadSerializer
)
from utils.s3_utils import upload_file_to_s3
from utils.email_utils import send_email_using_smtp


class ClientCDViewSet(viewsets.ModelViewSet):
    queryset = ClientCD.objects.all()
    serializer_class = ClientCDSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='upload-file')
    def upload_file(self, request):
        """Upload config or email template file to S3 for a specific ClientCD"""
        serializer = FileUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        client_cd = self.get_object()
        file_obj = serializer.validated_data['file']
        upload_type = serializer.validated_data['upload_type']

        filename = file_obj.name
        s3_key = f"client_configs/{client_cd.id}/{upload_type}/{filename}"
        s3_path = upload_file_to_s3(file_obj, s3_key)

        if upload_type == 'config':
            client_cd.config_s3_path = s3_path
        else:
            client_cd.email_config_s3_path = s3_path

        client_cd.save()

        return Response({
            "message": f"{upload_type.replace('_', ' ').title()} uploaded successfully.",
            "s3_path": s3_path
        }, status=status.HTTP_200_OK)


class CDEmployeeViewSet(viewsets.ModelViewSet):
    queryset = CDEmployee.objects.all()
    serializer_class = CDEmployeeCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        cd_employee = serializer.save()

        smtp_config = cd_employee.client.smtp_config
        template_s3_path = cd_employee.client.email_template_s3_path  # should point to the employee_invite template
        context = {
            "name": cd_employee.full_name,
            "username": cd_employee.username
        }

        send_email_using_smtp(
            subject="Your Lucid Dashboard Employee Account",
            recipient=cd_employee.user.email,
            context=context,
            template_s3_path=template_s3_path,
            smtp_config=smtp_config,
            audit_user=self.request.user  # logs who triggered this
        )


class CCDUserViewSet(viewsets.ModelViewSet):
    queryset = CCDUser.objects.all()
    serializer_class = CCDUserCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        ccd_user = serializer.save()

        smtp_config = ccd_user.client.smtp_config
        template_s3_path = ccd_user.client.email_template_s3_path  # should point to the ccd_invite template
        context = {
            "name": ccd_user.full_name,
            "username": ccd_user.username
        }

        send_email_using_smtp(
            subject="Your Client Dashboard Access",
            recipient=ccd_user.user.email,
            context=context,
            template_s3_path=template_s3_path,
            smtp_config=smtp_config,
            audit_user=self.request.user  # logs who triggered this
        )