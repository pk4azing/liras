from rest_framework import serializers
from .models import DownloadLog

class DownloadLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DownloadLog
        fields = '__all__'
        read_only_fields = fields