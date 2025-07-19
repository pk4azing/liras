from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ProfileSerializer,
    UpdateProfileSerializer
)
from clients.models import CDEmployee, CCDUser


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = self.get_user(request)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

    def get_user(self, request):
        email = request.user.email
        try:
            return CDEmployee.objects.get(email=email)
        except CDEmployee.DoesNotExist:
            return CCDUser.objects.get(email=email)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = self.get_user(request)
        serializer = UpdateProfileSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Profile updated successfully."})

    def get_user(self, request):
        email = request.user.email
        try:
            return CDEmployee.objects.get(email=email)
        except CDEmployee.DoesNotExist:
            return CCDUser.objects.get(email=email)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"detail": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"detail": "Password updated successfully."})