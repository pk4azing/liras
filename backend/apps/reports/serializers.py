# reports/serializers.py

from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id',
            'report_for',
            'report_type',
            'requested_by',
            'report_file_s3_path',
            'generated_at'
        ]
        read_only_fields = ['id', 'report_file_s3_path', 'generated_at', 'requested_by']