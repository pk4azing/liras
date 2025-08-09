from __future__ import annotations

import json
from typing import Optional

import boto3
from botocore.exceptions import ClientError

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMessage, get_connection
from django.db import transaction
from django.utils.crypto import get_random_string

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserProfileSerializer,
    PasswordResetRequestSerializer,
    CustomTokenObtainPairSerializer,  # your existing JWT login serializer
)

User = get_user_model()

# ---------------------------
# Helpers: S3 + SMTP sending
# ---------------------------

def _s3():
    return boto3.client(
        "s3",
        region_name=getattr(settings, "AWS_S3_REGION_NAME", None),
        aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", None),
        aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", None),
    )

S3_BUCKET = getattr(settings, "AWS_S3_BUCKET_NAME", None)
ROOT_PREFIX = "LD_Clients"

def _smtp_key(client_id: int) -> str:
    return f"{ROOT_PREFIX}/{client_id}/Configs/smtp.json"

def _get_json(bucket: str, key: str) -> Optional[dict]:
    try:
        obj = _s3().get_object(Bucket=bucket, Key=key)
        return json.loads(obj["Body"].read().decode("utf-8"))
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        if code in {"NoSuchKey", "404"}:
            return None
        raise

def _put_json(bucket: str, key: str, data: dict) -> None:
    _s3().put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"),
        ContentType="application/json",
    )

def _send_email_with_client_smtp(
    *,
    client_id: Optional[int],
    subject: str,
    body: str,
    to_email: str,
    fallback_to_default: bool = True,
) -> None:
    """
    Try to send via client SMTP (S3-stored). If not configured and fallback is True,
    use Django's default EMAIL_* settings.
    """
    connection = None
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)

    if client_id and S3_BUCKET:
        cfg = _get_json(S3_BUCKET, _smtp_key(client_id))
        if cfg:
            # expected fields in cfg (we validate min shape in the PUT view)
            host = cfg.get("host")
            port = cfg.get("port")
            username = cfg.get("username")
            password = cfg.get("password")
            use_tls = not cfg.get("secure", False)  # if secure=True, assume SSL; else TLS
            use_ssl = cfg.get("secure", False)
            from_email = cfg.get("senderEmail") or from_email

            connection = get_connection(
                backend="django.core.mail.backends.smtp.EmailBackend",
                host=host,
                port=port,
                username=username,
                password=password,
                use_tls=use_tls if not use_ssl else False,
                use_ssl=use_ssl,
                timeout=30,
            )

    if connection is None and fallback_to_default:
        connection = get_connection()

    if connection is None:
        # No way to send email; fail silently by design (log if you want)
        return

    EmailMessage(
        subject=subject,
        body=body,
        from_email=from_email,
        to=[to_email],
        connection=connection,
    ).send(fail_silently=True)


# ---------------------------
# Auth: Login / Refresh / Logout
# ---------------------------

class LoginView(TokenObtainPairView):
    """
    POST: {email/username, password} -> returns access/refresh + your extra fields
    """
    serializer_class = CustomTokenObtainPairSerializer


class TokenRefresh(TokenRefreshView):
    pass


class LogoutView(APIView):
    """
    POST: optionally accept a 'refresh' token and blacklist it.
    Frontend already clears local storage; this just adds server-side revocation if provided.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try:
                token = RefreshToken(refresh)
                token.blacklist()  # requires simplejwt blacklist app enabled
            except Exception:
                # ignore; still log out client-side
                pass
        return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


# ---------------------------
# Profile (CRUD-like)
# ---------------------------

class ProfileView(APIView):
    """
    GET    -> return current user's profile
    PATCH  -> partial update profile (name/phone/city/address/email)
    DELETE -> delete the user account (hard delete)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user: User = request.user
        data = {
            "id": user.id,
            "username": getattr(user, "username", "") or "",
            "email": getattr(user, "email", "") or "",
            "name": getattr(user, "full_name", "") or "",
            "phone": getattr(user, "phone", "") or "",
            "city": getattr(user, "city", "") or "",
            "address": getattr(user, "address", "") or "",
        }
        return Response(data, status=status.HTTP_200_OK)

    @transaction.atomic
    def patch(self, request):
        user: User = request.user
        serializer = UserProfileSerializer(instance=user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()

        # Notify via email using client-supplied SMTP if available
        client_id = request.data.get("client_id") or request.headers.get("X-Client-ID")
        try:
            client_id = int(client_id) if client_id is not None else None
        except (TypeError, ValueError):
            client_id = None

        if updated_user.email:
            _send_email_with_client_smtp(
                client_id=client_id,
                subject="Your profile was updated",
                body="Hi,\n\nYour account profile was recently updated. If this wasn't you, please contact support.\n",
                to_email=updated_user.email,
            )

        return Response(UserProfileSerializer(updated_user).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request):
        user: User = request.user
        email = getattr(user, "email", None)

        user.delete()

        # Best-effort notify
        client_id = request.headers.get("X-Client-ID")
        try:
            client_id = int(client_id) if client_id is not None else None
        except (TypeError, ValueError):
            client_id = None

        if email:
            _send_email_with_client_smtp(
                client_id=client_id,
                subject="Your account was deleted",
                body="Hi,\n\nThis is a confirmation that your account has been deleted.\n",
                to_email=email,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------
# Password: check / update / reset-request
# ---------------------------

class PasswordCheckView(APIView):
    """
    POST: {password} -> {valid: true/false}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        raw = request.data.get("password", "")
        valid = bool(raw) and request.user.check_password(raw)
        return Response({"valid": valid}, status=status.HTTP_200_OK)


class PasswordUpdateView(APIView):
    """
    POST: {current_password, new_password}
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return Response(
                {"detail": "current_password and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        # (Optional) add your own password policy checks here
        if len(new_password) < 8:
            return Response({"detail": "New password must be at least 8 characters."}, status=400)

        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        # notify
        client_id = request.data.get("client_id") or request.headers.get("X-Client-ID")
        try:
            client_id = int(client_id) if client_id is not None else None
        except (TypeError, ValueError):
            client_id = None

        if request.user.email:
            _send_email_with_client_smtp(
                client_id=client_id,
                subject="Your password was changed",
                body="Hi,\n\nYour account password was just changed. If this wasn't you, reset it immediately.\n",
                to_email=request.user.email,
            )

        return Response({"detail": "Password updated."}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """
    POST: {email}
    Sends a reset notice (or link/code if you wire one up) to the email if it exists.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Don't leak emails
            return Response({"detail": "If that account exists, a reset email has been sent."}, status=200)

        # generate a simple one-time code token (you can swap this for your real flow)
        reset_code = get_random_string(8).upper()

        # save code somewhere persistent if you need verification later (cache/db) — omitted here

        # try using client SMTP if header provided
        client_id = request.headers.get("X-Client-ID")
        try:
            client_id = int(client_id) if client_id is not None else None
        except (TypeError, ValueError):
            client_id = None

        _send_email_with_client_smtp(
            client_id=client_id,
            subject="Password reset request",
            body=(
                "Hi,\n\nWe received a request to reset your password.\n"
                f"Reset code: {reset_code}\n\n"
                "If you did not request this, you can ignore this email."
            ),
            to_email=email,
        )

        return Response({"detail": "If that account exists, a reset email has been sent."}, status=status.HTTP_200_OK)


# ---------------------------
# SMTP Config (no serializer)
# ---------------------------

class SMTPConfigView(APIView):
    """
    GET /api/accounts/{client_id}/smtp/ -> read JSON from S3
    PUT /api/accounts/{client_id}/smtp/ -> write JSON to S3
    No serializer is used; we validate a minimal shape inline.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, client_id: int, *args, **kwargs):
        if not S3_BUCKET:
            return Response({"detail": "S3 bucket not configured."}, status=500)

        data = _get_json(S3_BUCKET, _smtp_key(client_id))
        if not data:
            return Response({"detail": "No SMTP config found."}, status=404)
        return Response(data, status=200)

    @transaction.atomic
    def put(self, request, client_id: int, *args, **kwargs):
        if not S3_BUCKET:
            return Response({"detail": "S3 bucket not configured."}, status=500)

        # Inline minimal validation
        payload = request.data if isinstance(request.data, dict) else {}
        required = ["host", "port", "username", "password", "senderEmail"]
        missing = [k for k in required if payload.get(k) in (None, "")]
        if missing:
            return Response({"detail": f"Missing required fields: {', '.join(missing)}"}, status=400)

        try:
            payload["port"] = int(payload["port"])
        except (TypeError, ValueError):
            return Response({"detail": "port must be an integer."}, status=400)

        secure = payload.get("secure")
        if secure not in (True, False, None):
            return Response({"detail": "secure must be boolean."}, status=400)
        if secure is None:
            payload["secure"] = False  # default

        _put_json(S3_BUCKET, _smtp_key(client_id), payload)
        return Response({"detail": "SMTP config saved."}, status=200)