# CDCCD/accounts/serializers.py
from __future__ import annotations

import json
from typing import Any, Dict

import boto3
from botocore.exceptions import ClientError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.conf import settings
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.tokens import default_token_generator
from django.core.validators import RegexValidator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .utils import normalize_us_phone, send_email

User = get_user_model()

US_E164_VALIDATOR = RegexValidator(
    regex=r"^\+1\d{10}$",
    message=_("Enter a valid US phone number in E.164 format (e.g., +14155552671)."),
)


# ---------- helpers for loading per‑client SMTP from S3 ----------
def _smtp_s3_key_for_client(user: User) -> str:
    """
    Expected S3 layout:
      LD_Clients/{client_code}/Configs/smtp.json
    If you store only an integer client_id on the user, we build code as LFRAS_C_{client_id}.
    """
    cid = getattr(user, "client_id", None)
    # You can switch to user.client_code if you store it.
    client_code = f"LFRAS_C_{cid}" if cid is not None else "UNKNOWN"
    return f"LD_Clients/{client_code}/Configs/smtp.json"


def load_client_smtp_config(user: User) -> Dict[str, Any]:
    """
    Fetch JSON SMTP config for the user's client from S3.
    Requires AWS credentials & bucket in settings:
      AWS_STORAGE_BUCKET_NAME
      (and credentials via env/instance role)
    """
    bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", None)
    if not bucket:
        raise RuntimeError("AWS_STORAGE_BUCKET_NAME is not configured.")

    s3 = boto3.client("s3", region_name=getattr(settings, "AWS_S3_REGION_NAME", None))
    key = _smtp_s3_key_for_client(user)
    try:
        obj = s3.get_object(Bucket=bucket, Key=key)
        data = obj["Body"].read().decode("utf-8")
        return json.loads(data)
    except ClientError as e:
        raise RuntimeError(f"SMTP config not found for client at s3://{bucket}/{key}") from e


# ---------- serializers ----------

class UserProfileSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(
        required=False, allow_blank=True, validators=[US_E164_VALIDATOR]
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "full_name",
            "phone",
            "city",
            "address",
            "client_id",
        ]
        read_only_fields = ["id", "email", "username", "client_id"]

    def validate_phone(self, value: str) -> str:
        normalized = normalize_us_phone(value)
        US_E164_VALIDATOR(normalized)
        return normalized

    def update(self, instance: User, validated_data: dict) -> User:
        # Track old values for email notification if you want to include a diff (optional)
        updated_fields = []
        for attr in ("full_name", "phone", "city", "address"):
            if attr in validated_data:
                old = getattr(instance, attr, "")
                new = validated_data[attr]
                if old != new:
                    setattr(instance, attr, new)
                    updated_fields.append(attr)

        instance.save(update_fields=updated_fields or None)

        # Send "profile updated" email via per‑client SMTP
        try:
            smtp = load_client_smtp_config(instance)
            body_lines = ["Your profile was updated successfully."]
            if updated_fields:
                body_lines.append("Updated fields: " + ", ".join(updated_fields))
            send_email(
                subject="Profile updated",
                body="\n".join(body_lines),
                to_email=instance.email,
                smtp=smtp,
            )
        except Exception:
            pass

        return instance

    def to_representation(self, instance: User) -> dict:
        data = super().to_representation(instance)
        # Ensure stable output keys
        data["name"] = data.pop("full_name", "") or ""
        return data


class CheckPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs: dict) -> dict:
        user = self.context["request"].user
        if not user.check_password(attrs["password"]):
            raise serializers.ValidationError({"password": _("Incorrect password.")})
        return attrs


class UpdatePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs: dict) -> dict:
        user = self.context["request"].user
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError({"current_password": _("Incorrect password.")})
        # Django’s built-in validators (length, common, numeric, etc.)
        password_validation.validate_password(attrs["new_password"], user)
        return attrs

    def save(self, **kwargs) -> User:
        user = self.context["request"].user
        new_pw = self.validated_data["new_password"]
        user.set_password(new_pw)
        user.save(update_fields=["password"])

        # Notify via per‑client SMTP
        try:
            smtp = load_client_smtp_config(user)
            send_email(
                subject="Your password was changed",
                body="This is a confirmation that your password has been changed.",
                to_email=user.email,
                smtp=smtp,
            )
        except Exception:
            pass

        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Request a password reset link/code to be emailed to the user.
    """
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        try:
            self.user = User.objects.get(email__iexact=value)
        except User.DoesNotExist:
            # Don’t reveal whether email exists; keep response generic
            self.user = None
        return value

    def save(self, **kwargs) -> None:
        # If we don’t have the user, just no-op (but pretend success)
        if not self.user:
            return

        user = self.user
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Build a link your frontend understands; configure in settings
        base_url = getattr(settings, "FRONTEND_RESET_URL", "").rstrip("/")
        if base_url:
            reset_link = f"{base_url}/reset-password?uid={uidb64}&token={token}"
            body = (
                "You (or someone else) requested a password reset.\n\n"
                f"Use this link to set a new password:\n{reset_link}\n\n"
                "If you didn’t request this, you can ignore this email."
            )
        else:
            # If you don’t have a frontend URL yet, send raw token data
            body = (
                "You requested a password reset.\n\n"
                f"UID: {uidb64}\n"
                f"Token: {token}\n\n"
                "Provide these to the reset endpoint to complete the process."
            )

        try:
            smtp = load_client_smtp_config(user)
            send_email(
                subject="Password reset instructions",
                body=body,
                to_email=user.email,
                smtp=smtp,
            )
        except Exception:
            # swallow email errors; you can log them
            pass


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Confirms a password reset given uidb64 + token + new_password.
    Mirrors the logic used by Django's built-in password reset flow.
    """
    uid = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    re_new_password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    def validate(self, attrs):
        uidb64 = attrs.get("uid")
        token = attrs.get("token")
        new_password = attrs.get("new_password")
        re_new_password = attrs.get("re_new_password")

        if new_password != re_new_password:
            raise serializers.ValidationError({"re_new_password": "Passwords do not match."})

        # Resolve the user from uidb64
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError({"uid": "Invalid user identifier."})

        # Validate token
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        # Run Django’s password validators
        password_validation.validate_password(new_password, user=user)

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Issue only ACCESS token in response (no refresh) and append minimal user info.
    """
    def validate(self, attrs: dict) -> dict:
        data = super().validate(attrs)
        # Keep access only
        access = data.get("access")
        user: User = self.user

        return {
            "access": access,
            "id": user.id,
            "username": getattr(user, "username", "") or user.email,
            "email": user.email,
            "phone": getattr(user, "phone", "") or "",
        }