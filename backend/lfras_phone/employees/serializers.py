# CDCCD/employees/serializers.py
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils.crypto import get_random_string
from rest_framework import serializers

User = get_user_model()

# ---------- helpers

def employee_id_for(user: User) -> str:
    # LFRAS_C_{client_ID}_EMP_{UserID}
    cid = user.client_id or 0
    return f"LFRAS_C_{cid}_EMP_{user.id}"


def ensure_employee_group(user: User) -> None:
    grp, _ = Group.objects.get_or_create(name="employee")
    user.groups.add(grp)


def same_domain_or_superuser(creator: User, email: str) -> None:
    """
    Enforce: employees must share email domain with the creator's email,
    unless the creator is a superuser (then skip check).
    """
    if not creator or creator.is_superuser:
        return
    creator_domain = (creator.email or "").split("@")[-1].lower()
    new_domain = (email or "").split("@")[-1].lower()
    if creator_domain and new_domain and creator_domain != new_domain:
        raise serializers.ValidationError(
            {"email": f"Email domain must be '{creator_domain}' for this client."}
        )


# Convenient way to read choices from the model if defined there as TextChoices.
# Fallback to known values if the model hasn’t been updated yet.
_USER_CATEGORY_CHOICES = getattr(
    User, "USER_CATEGORY_CHOICES", [("superadmin", "SuperAdmin"), ("admin", "Admin"), ("standard", "Standard")]
)
_USER_CATEGORY_DEFAULT = getattr(User, "USER_CATEGORY_DEFAULT", "standard")


# ---------- Read serializers (List / Detail)

class EmployeeListSerializer(serializers.ModelSerializer):
    employee_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "full_name", "phone", "city", "address",
            "client_id", "client_code", "is_active", "employee_id", "user_category",
        ]

    def get_employee_id(self, obj: User) -> str:
        return employee_id_for(obj)


class EmployeeDetailSerializer(EmployeeListSerializer):
    """Extend here later if you want extra per-detail fields."""
    pass


# ---------- Create

class EmployeeCreateSerializer(serializers.ModelSerializer):
    """
    Creates an employee under the creator's client (unless superuser provides explicit client).
    - Enforces same-domain (unless superuser).
    - Adds user to 'employee' group.
    - Generates a temporary password and emails it.
    - Defaults `user_category` to 'standard' for non-superusers.
    - Returns one-time `plain_password` in the response.
    """
    client_id = serializers.IntegerField(required=False, allow_null=True)
    client_code = serializers.CharField(required=False, allow_blank=True)
    plain_password = serializers.CharField(read_only=True)
    user_category = serializers.ChoiceField(choices=_USER_CATEGORY_CHOICES, required=False)

    class Meta:
        model = User
        fields = [
            "email", "full_name", "phone", "city", "address",
            "client_id", "client_code", "user_category", "plain_password",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        creator: User = getattr(request, "user", None)
        if not creator or not creator.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        # Domain enforcement
        same_domain_or_superuser(creator, attrs.get("email") or "")

        # If not superuser, pin to creator's client and force category to 'standard'
        if not creator.is_superuser:
            attrs["client_id"] = creator.client_id
            attrs["client_code"] = creator.client_code
            attrs["user_category"] = _USER_CATEGORY_DEFAULT
        else:
            # Superuser may set user_category explicitly; if omitted, keep default.
            attrs["user_category"] = attrs.get("user_category", _USER_CATEGORY_DEFAULT)

        return attrs

    def create(self, validated_data):
        temp_password = get_random_string(12)

        user = User.objects.create_user(
            email=validated_data["email"],
            password=temp_password,
            full_name=validated_data.get("full_name", ""),
            phone=validated_data.get("phone", ""),
            city=validated_data.get("city", ""),
            address=validated_data.get("address", ""),
            client_id=validated_data.get("client_id"),
            client_code=validated_data.get("client_code", "") or "",
            # username is auto-assigned by the custom manager after first save
        )
        # set user_category after user exists (in case model validates it)
        category = validated_data.get("user_category", _USER_CATEGORY_DEFAULT)
        if getattr(user, "user_category", None) is not None:
            user.user_category = category
            user.save(update_fields=["user_category"])

        ensure_employee_group(user)

        # email the credentials (best-effort)
        try:
            from accounts.utils import send_email  # your SMTP helper
        except Exception:
            def send_email(*args, **kwargs):  # noqa: E306
                return

        eid = employee_id_for(user)
        login_url = (self.context or {}).get("login_url") or ""
        body = (
            f"Hello {user.full_name or user.email},\n\n"
            f"Your employee account has been created.\n"
            f"Employee ID: {eid}\n"
            f"Email: {user.email}\n"
            f"Temporary password: {temp_password}\n"
            f"Login: {login_url}\n\n"
            f"Please change your password after first login."
        )
        send_email("Your employee account", body, [user.email])

        # return one-time plain password
        user.plain_password = temp_password
        return user

    def to_representation(self, instance):
        data = EmployeeDetailSerializer(instance).data
        if hasattr(instance, "plain_password"):
            data["plain_password"] = instance.plain_password
        return data


# ---------- Update

class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """
    Full/partial updates for profile and activation status.
    - Non‑superusers cannot change `user_category`.
    """
    user_category = serializers.ChoiceField(choices=_USER_CATEGORY_CHOICES, required=False)

    class Meta:
        model = User
        fields = ["full_name", "phone", "city", "address", "is_active", "user_category"]

    def validate(self, attrs):
        request = self.context.get("request")
        updater: User = getattr(request, "user", None)

        if "user_category" in attrs and (not updater or not updater.is_superuser):
            # silently ignore or raise—here we choose to forbid
            raise serializers.ValidationError({"user_category": "Only superusers can change user category."})
        return attrs


# ---------- Soft delete / deactivate

class EmployeeDeactivateSerializer(serializers.ModelSerializer):
    """
    Soft delete by toggling is_active to False.
    """
    class Meta:
        model = User
        fields = ["is_active"]

    def validate(self, attrs):
        attrs["is_active"] = False
        return attrs

    def update(self, instance, validated_data):
        instance.is_active = False
        instance.save(update_fields=["is_active"])
        return instance