from __future__ import annotations

import json
import os
import uuid
from typing import Any, Optional

import boto3
from botocore.exceptions import ClientError

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserProfileSerializer,
    CheckPasswordSerializer,
    UpdatePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    CustomTokenObtainPairSerializer,   # you already have this in serializers.py
)

User = get_user_model()

# -----------------------------------------------------------------------------
# S3 utilities (read/write smtp.json under the user's client folder)
# -----------------------------------------------------------------------------
def _get_s3_client():
    # Creds & region must be set in settings.py
    return boto3.client(
        "s3",
        region_name=getattr(settings, "AWS_S3_REGION_NAME", None),
        aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", None),
        aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", None),
        aws_session_token=getattr(settings, "AWS_SESSION_TOKEN", None),
    )

def _smtp_s3_key(client_id: str | int) -> str:
    # We store SMTP config per client at LD_Clients/{client_id}/Configs/smtp.json
    return f"LD_Clients/{client_id}/Configs/smtp.json"

def load_smtp_from_s3(client_id: str | int) -> Optional[dict]:
    bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", None)
    if not bucket:
        raise RuntimeError("AWS_STORAGE_BUCKET_NAME is not configured in settings.")

    s3 = _get_s3_client()
    key = _smtp_s3_key(client_id)

    try:
        obj = s3.get_object(Bucket=bucket, Key=key)
        body = obj["Body"].read().decode("utf-8")
        return json.loads(body)
    except ClientError as e:
        # Not found is fine; return None
        code = e.response.get("Error", {}).get("Code", "")
        if code in ("NoSuchKey", "404"):
            return None
        raise
    except Exception:
        raise

def save_smtp_to_s3(client_id: str | int, data: dict) -> None:
    bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", None)
    if not bucket:
        raise RuntimeError("AWS_STORAGE_BUCKET_NAME is not configured in settings.")

    s3 = _get_s3_client()
    key = _smtp_s3_key(client_id)
    body = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=body.encode("utf-8"),
        ContentType="application/json",
    )

# -----------------------------------------------------------------------------
# Auth (login / logout w/ blacklist)
# -----------------------------------------------------------------------------
class LoginView(TokenObtainPairView):
    """
    Uses your CustomTokenObtainPairSerializer.
    If your serializer is configured to return only `access` + user details,
    that’s exactly what this endpoint will return.
    """
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """
    Blacklist refresh token on logout.
    Request body must include: {"refresh": "<refresh_token>"}.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            raise ValidationError({"detail": "Refresh token is required to logout."})

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            raise ValidationError({"detail": "Invalid or expired refresh token."})

        return Response({"ok": True}, status=status.HTTP_200_OK)

# -----------------------------------------------------------------------------
# Profile CRUD
# -----------------------------------------------------------------------------
class ProfileView(APIView):
    """
    GET:    Return own profile
    POST:   Initialize/overwrite profile fields (idempotent for existing users)
    PATCH:  Partial update
    DELETE: Soft-delete (deactivate) the user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user: User = request.user
        data = {
            "id": user.id,
            "username": getattr(user, "username", "") or "",
            "email": user.email,
            "phone": getattr(user, "phone", "") or "",
            "name": getattr(user, "full_name", "") or "",
            "city": getattr(user, "city", "") or "",
            "address": getattr(user, "address", "") or "",
        }
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Upsert-style create/update for the current user's profile fields.
        """
        serializer = UserProfileSerializer(instance=request.user, data=request.data, partial=False, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.to_representation(request.user), status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserProfileSerializer(instance=request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.to_representation(request.user), status=status.HTTP_200_OK)

    def delete(self, request):
        """
        Soft delete: deactivate user.
        """
        user: User = request.user
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

# -----------------------------------------------------------------------------
# Password flows
# -----------------------------------------------------------------------------
class PasswordCheckView(APIView):
    """
    POST: { "password": "..." } -> { "valid": true/false }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckPasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response({"valid": serializer.validated_data["valid"]}, status=status.HTTP_200_OK)


class PasswordChangeView(APIView):
    """
    POST: { "current_password": "...", "new_password": "..." }
    - Changes password and (optionally) emails the user via client SMTP (serializer handles email).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UpdatePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()  # serializer handles set_password + email
        return Response({"ok": True}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """
    POST: { "email": "..." }
    Generates a reset token and emails user a reset link using client SMTP.
    The email content and sending is handled by the serializer (using SMTP from S3).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()  # serializer generates token & sends email
        return Response({"ok": True}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    POST: { "uidb64": "...", "token": "...", "new_password": "..." }
    Confirms reset and sets new password (serializer sets password + optional email).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"ok": True}, status=status.HTTP_200_OK)

# -----------------------------------------------------------------------------
# SMTP config (per client) stored in S3 as JSON
# -----------------------------------------------------------------------------
class SMTPConfigView(APIView):
    """
    GET:  returns SMTP JSON stored at LD_Clients/{client_id}/Configs/smtp.json
    PUT:  accepts JSON body and writes it to the same path
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_client_id_or_403(self, request) -> str | int:
        client_id = getattr(request.user, "client_id", None)
        if not client_id:
            raise PermissionDenied("User is not linked to a client_id.")
        return client_id

    def get(self, request):
        client_id = self.get_client_id_or_403(request)
        data = load_smtp_from_s3(client_id)
        if data is None:
            # Return empty stub rather than 404 so UI can show empty form
            data = {}
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        client_id = self.get_client_id_or_403(request)

        if not isinstance(request.data, dict):
            raise ValidationError({"detail": "Body must be a JSON object."})

        # Optionally, add a simple allowlist check:
        # required_keys = ["host", "port", "username", "password", "use_tls", "from_email"]
        # for k in required_keys:
        #     if k not in request.data:
        #         raise ValidationError({k: "This field is required."})

        save_smtp_to_s3(client_id, request.data)
        return Response({"ok": True}, status=status.HTTP_200_OK)