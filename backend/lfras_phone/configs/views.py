from __future__ import annotations

import boto3
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ConfigFile, EmailTemplate
from .serializers import ConfigFileSerializer, EmailTemplateSerializer


class ConfigFileListCreateView(generics.ListCreateAPIView):
    """
    CCD Standard users upload .txt config files.
    """
    serializer_class = ConfigFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.request.query_params.get("client_id")
        customer_id = self.request.query_params.get("customer_id")
        qs = ConfigFile.objects.all()
        if client_id:
            qs = qs.filter(client_id=client_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

    def perform_create(self, serializer):
        data = serializer.validated_data
        client_id = data["client_id"]
        customer_id = data["customer_id"]
        file_name = data["file_name"]

        # build S3 key
        key = f"LD_Clients/{client_id}/Customer/{customer_id}/configs/{file_name}"
        serializer.save(s3_key=key)


class ConfigFileDownloadURLView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk: int):
        try:
            cf = ConfigFile.objects.get(pk=pk)
        except ConfigFile.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        bucket = settings.AWS_STORAGE_BUCKET_NAME
        region = getattr(settings, "AWS_S3_REGION_NAME", "us-east-1")
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{cf.s3_key}" if bucket else cf.s3_key
        return Response({"s3_url": url})


class EmailTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.request.query_params.get("client_id")
        customer_id = self.request.query_params.get("customer_id")
        qs = EmailTemplate.objects.all()
        if client_id:
            qs = qs.filter(client_id=client_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs


class EmailTemplateRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]