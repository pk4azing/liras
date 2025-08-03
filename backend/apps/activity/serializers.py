from rest_framework import serializers
from activity.models import Activity, ActivityFile
from django.utils.timezone import now


class ActivityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'ccd_user', 'cd', 'started_by', 'start_time']
        read_only_fields = ['id', 'started_by', 'start_time']

    def create(self, validated_data):
        validated_data['started_by'] = self.context['request'].user
        validated_data['start_time'] = now()
        return super().create(validated_data)


class ActivityFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityFile
        fields = ['id', 'activity', 'filename', 'uploaded_at', 'validated_at', 'is_valid', 'reason', 'expiry_days']


class FileUploadSerializer(serializers.Serializer):
    files = serializers.ListField(
        child=serializers.FileField(), write_only=True
    )


class ActivityDetailSerializer(serializers.ModelSerializer):
    files = ActivityFileSerializer(many=True, source='activityfile_set', read_only=True)
    class Meta:
        model = Activity
        fields = [
            'id',
            'ccd_user',
            'cd',
            'started_by',
            'start_time',
            'end_time',
            'end_time',
            'zip_s3_path',
            'status',
            'files'
        ]


class ActivityCompleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'end_time', 'zip_s3_path', 'status']
        read_only_fields = ['id', 'end_time', 'zip_s3_path', 'status']