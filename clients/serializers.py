from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils.text import slugify

from clients.models import ClientCD, CDEmployee, CCDUser
from auth_cdccd.constants import PLAN_LIMITS


class ClientCDSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientCD
        fields = [
            'id', 'company_name', 'subdomain', 'email_domain',
            'plan_type', 'config_s3_path', 'email_config_s3_path',
            'created_at'
        ]
        read_only_fields = ['config_s3_path', 'email_config_s3_path', 'created_at']


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    upload_type = serializers.ChoiceField(choices=['config', 'email_template'])

    def validate(self, data):
        file = data['file']
        upload_type = data['upload_type']
        if upload_type == 'config' and not file.name.endswith('.json'):
            raise ValidationError("Config file must be a .json file.")
        if upload_type == 'email_template' and not file.name.endswith('.txt'):
            raise ValidationError("Email template must be a .txt file.")
        return data


class CDEmployeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CDEmployee
        fields = [
            'id', 'full_name', 'email', 'role', 'designation', 'is_active',
            'username', 'client_cd', 'created_at'
        ]
        read_only_fields = ['username', 'created_at']

    def validate_email(self, value):
        client = self.initial_data.get('client_cd')
        client_obj = ClientCD.objects.get(id=client)
        domain = client_obj.email_domain.lower()
        if not value.lower().endswith(f"@{domain}"):
            raise serializers.ValidationError("Email domain must match the client's allowed domain.")
        return value

    def validate(self, data):
        client = data.get('client_cd')
        if client.cdemployee_set.count() >= PLAN_LIMITS[client.plan_type]['max_employees']:
            raise serializers.ValidationError("Plan limit reached for CDEmployees.")
        return data

    def create(self, validated_data):
        username = f"CDU_{slugify(validated_data['full_name'])}_{CDEmployee.objects.count() + 1}"
        validated_data['username'] = username
        return super().create(validated_data)


class CCDUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CCDUser
        fields = [
            'id', 'full_name', 'email', 'designation', 'is_active',
            'username', 'client_cd', 'created_at'
        ]
        read_only_fields = ['username', 'created_at']

    def validate_email(self, value):
        client = self.initial_data.get('client_cd')
        client_obj = ClientCD.objects.get(id=client)
        domain = client_obj.email_domain.lower()
        if not value.lower().endswith(f"@{domain}"):
            raise serializers.ValidationError("Email domain must match the client's allowed domain.")
        return value

    def validate(self, data):
        client = data.get('client_cd')
        if client.ccduser_set.count() >= PLAN_LIMITS[client.plan_type]['max_ccd_users']:
            raise serializers.ValidationError("Plan limit reached for CCDUsers.")
        return data

    def create(self, validated_data):
        username = f"CCDU_{slugify(validated_data['full_name'])}_{CCDUser.objects.count() + 1}"
        validated_data['username'] = username
        return super().create(validated_data)