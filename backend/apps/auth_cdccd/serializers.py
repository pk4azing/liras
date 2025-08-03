from rest_framework import serializers
from django.contrib.auth import password_validation
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from clients.models import CDEmployee, CCDUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = None
        role = None
        dashboard = None

        try:
            user = CDEmployee.objects.get(email=email)
            role = 'cd'
            dashboard = 'cd_dashboard'
        except CDEmployee.DoesNotExist:
            try:
                user = CCDUser.objects.get(email=email)
                role = 'ccd'
                dashboard = 'ccd_dashboard'
            except CCDUser.DoesNotExist:
                raise serializers.ValidationError("Invalid login credentials.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid login credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive.")

        data = super().validate({
            'username': user.username,
            'password': password
        })

        data.update({
            'redirect_to': dashboard,
            'role': role
        })

        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value


class ProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if isinstance(instance, CDEmployee):
            data['role'] = 'cd'
        elif isinstance(instance, CCDUser):
            data['role'] = 'ccd'
        return data


class UpdateProfileSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()
        return instance