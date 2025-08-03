from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from rest_framework_simplejwt.tokens import  RefreshToken


class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        return {
            "id": user.id,
            "token": str(data['access']),
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
        }
