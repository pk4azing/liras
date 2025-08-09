# accounts/serializers.py

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers, exceptions

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# ---------- Phone helpers (US, E.164) ----------

US_E164_REGEX = r"^\+1[2-9]\d{9}$"  # +1 NXX NXXXXXX (first digit after +1 must be 2–9)

def normalize_us_phone(phone: str) -> str:
    """
    Normalize common US inputs to +1XXXXXXXXXX.
    Examples accepted:
      4155552671  -> +14155552671
      14155552671 -> +14155552671
      +14155552671 (kept)
      (415) 555-2671 -> +14155552671
    """
    if not phone:
        return ""

    s = "".join(ch for ch in str(phone).strip() if ch.isdigit() or ch == "+")
    # Remove leading '+' for normalization step
    if s.startswith("+"):
        s_no_plus = s[1:]
    else:
        s_no_plus = s

    # Already +1 and 11 digits after '+'
    if s.startswith("+1") and len(s) == 12:
        return s

    # Starts with '1' and has 11 digits -> add '+'
    if s_no_plus.startswith("1") and len(s_no_plus) == 11:
        return f"+{s_no_plus}"

    # 10 digits -> prepend +1
    if len(s_no_plus) == 10 and s_no_plus.isdigit():
        return f"+1{s_no_plus}"

    # if it doesn't fit, return original trimmed (will fail regex)
    return s if s.startswith("+") else f"+{s_no_plus}"


# ---------- Small mail helper ----------

def _safe_send_mail(subject: str, message: str, to_email: str) -> None:
    """
    Try to send mail; do not block API if mail backend fails.
    Uses DEFAULT_FROM_EMAIL; override with settings.ACCOUNTS_FROM_EMAIL if provided.
    """
    if not to_email:
        return
    from_email = getattr(settings, "ACCOUNTS_FROM_EMAIL", getattr(settings, "DEFAULT_FROM_EMAIL", None))
    try:
        send_mail(subject, message, from_email, [to_email], fail_silently=True)
    except Exception:
        # Do not raise — logging can be added here if desired.
        pass


# =========================================================
#                     AUTH / TOKENS
# =========================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extend SimpleJWT’s TokenObtainPairSerializer to return compact user info.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # add minimal custom claims if you want
        token["username"] = user.get_username()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.pop("refresh", None)
        user: User = self.user

        # add user payload alongside tokens
        data.update({
            "id": user.id,
            "username": user.get_username(),
            "email": getattr(user, "email", "") or "",
            "phone": getattr(user, "phone", "") or "",
        })
        return data


# =========================================================
#                   PROFILE SERIALIZER
# =========================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """
    View/Update a user's profile.
    Email and username are read-only here (adjust if you want them editable).
    """
    phone = serializers.CharField(
        allow_blank=True,
        required=False,
        help_text=_("US E.164 number, e.g. +14155552671"),
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "full_name",
            "phone",
            "city",
            "address",
        )
        read_only_fields = ("id", "username", "email")

    # represent as consistent keys expected by frontend
    def to_representation(self, instance: User) -> dict:
        base = super().to_representation(instance)
        return {
            "id": instance.id,
            "username": instance.get_username(),
            "email": getattr(instance, "email", "") or "",
            "name": getattr(instance, "full_name", "") or "",
            "phone": getattr(instance, "phone", "") or "",
            "city": getattr(instance, "city", "") or "",
            "address": getattr(instance, "address", "") or "",
        }

    def validate_phone(self, value: str) -> str:
        if not value:
            return ""
        normalized = normalize_us_phone(value)
        import re
        if not re.fullmatch(US_E164_REGEX, normalized):
            raise serializers.ValidationError(
                _("Enter a valid US phone number in E.164 format, e.g. +14155552671.")
            )
        return normalized

    def update(self, instance: User, validated_data: dict) -> User:
        # Map 'name' from incoming data to full_name if client sends 'name'
        name = self.initial_data.get("name")
        if name is not None:
            validated_data["full_name"] = name

        # Handle phone normalization if present
        if "phone" in validated_data:
            validated_data["phone"] = self.validate_phone(validated_data.get("phone", ""))

        for field in ("full_name", "phone", "city", "address"):
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        instance.save()

        # email notification about profile update
        _safe_send_mail(
            subject=_("Your profile was updated"),
            message=_("Hi,\n\nYour account profile details were updated. "
                      "If you did not perform this change, please contact support immediately.\n"),
            to_email=getattr(instance, "email", ""),
        )
        return instance


# =========================================================
#              PASSWORD: CHECK / CHANGE / RESET
# =========================================================

class PasswordCheckSerializer(serializers.Serializer):
    """
    Verify that an entered password matches the current user's password.
    """
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            raise exceptions.NotAuthenticated()

        pw = attrs.get("password")
        if not request.user.check_password(pw):
            raise serializers.ValidationError({"password": _("Incorrect password.")})
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """
    Change password for the logged-in user.
    """
    old_password = serializers.CharField(write_only=True)
    new_password1 = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            raise exceptions.NotAuthenticated()

        user: User = request.user
        old = attrs.get("old_password")
        p1 = attrs.get("new_password1")
        p2 = attrs.get("new_password2")

        if not user.check_password(old):
            raise serializers.ValidationError({"old_password": _("Old password is incorrect.")})
        if p1 != p2:
            raise serializers.ValidationError({"new_password2": _("Passwords do not match.")})

        # Optional: add Django's default password validation
        from django.contrib.auth.password_validation import validate_password
        validate_password(p1, user=user)

        return attrs

    def save(self, **kwargs) -> User:
        request = self.context.get("request")
        user: User = request.user
        new_password = self.validated_data["new_password1"]
        user.set_password(new_password)
        user.save()

        # email notification
        _safe_send_mail(
            subject=_("Your password was changed"),
            message=_("Hi,\n\nYour account password was changed successfully. "
                      "If this wasn't you, reset your password immediately and contact support.\n"),
            to_email=getattr(user, "email", ""),
        )
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Request a password reset link via email.
    For security, always respond success even if email is not associated to an account.
    """
    email = serializers.EmailField()

    def validate(self, attrs):
        self._user: Optional[User] = None
        email = attrs.get("email", "").strip().lower()
        try:
            self._user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            self._user = None
        return attrs

    def save(self, **kwargs) -> None:
        user = getattr(self, "_user", None)
        if not user:
            # Do not reveal that the email does not exist.
            return

        uid = urlsafe_base64_encode(str(user.pk).encode("utf-8"))
        token = default_token_generator.make_token(user)

        # Build reset URL (front-end should handle form). Configure in settings.
        frontend_base = getattr(settings, "FRONTEND_RESET_BASE_URL", None)
        if frontend_base:
            reset_url = f"{frontend_base}?uid={uid}&token={token}"
        else:
            # Fallback to a simple plain text payload
            reset_url = f"/reset-password?uid={uid}&token={token}"

        _safe_send_mail(
            subject=_("Reset your password"),
            message=_(
                "Hi,\n\nWe received a request to reset your password.\n\n"
                "Open the following link to set a new password:\n\n"
                f"{reset_url}\n\n"
                "If you did not request this, you can ignore this email."
            ),
            to_email=user.email,
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Confirm password reset with uid+token and set a new password.
    """
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password1 = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        uidb64 = attrs.get("uid")
        token = attrs.get("token")
        p1 = attrs.get("new_password1")
        p2 = attrs.get("new_password2")

        if p1 != p2:
            raise serializers.ValidationError({"new_password2": _("Passwords do not match.")})

        try:
            uid_int = int(force_str(urlsafe_base64_decode(uidb64)))
        except Exception:
            raise serializers.ValidationError({"uid": _("Invalid user identifier.")})

        try:
            user = User.objects.get(pk=uid_int, is_active=True)
        except User.DoesNotExist:
            raise serializers.ValidationError({"uid": _("User not found.")})

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": _("Invalid or expired token.")})

        # Optional: validate via Django's password validators
        from django.contrib.auth.password_validation import validate_password
        validate_password(p1, user=user)

        # stash for save()
        self._user = user
        return attrs

    def save(self, **kwargs) -> User:
        user: User = self._user
        new_password = self.validated_data["new_password1"]
        user.set_password(new_password)
        user.save()

        # email notification
        _safe_send_mail(
            subject=_("Your password was reset"),
            message=_("Hi,\n\nYour account password was reset successfully. "
                      "If you did not perform this action, contact support immediately.\n"),
            to_email=getattr(user, "email", ""),
        )
        return user