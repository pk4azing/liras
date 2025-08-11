# CDCCD/accounts/models.py
from __future__ import annotations

import secrets
import string
from typing import Optional, Tuple

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.db import models, transaction


US_E164_VALIDATOR = RegexValidator(
    regex=r"^\+1\d{10}$",
    message="Enter a valid US phone number in E.164 format, e.g. +14155552671.",
)


def _generate_password(length: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+[]{}:,./?"
    return "".join(secrets.choice(alphabet) for _ in range(length))


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: Optional[str] = None, **extra_fields):
        if not email:
            raise ValueError("The email address must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        # first save to obtain PK (we need it to build username format)
        user.save(using=self._db)

        # if username is blank, derive from PK as LFRAS_C_E_{id}
        if not user.username:
            user.username = f"LFRAS_C_E_{user.id}"
            user.save(update_fields=["username"])
        return user

    def create_user(self, email: str, password: Optional[str] = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        # default user_category to STANDARD if not provided
        extra_fields.setdefault("user_category", User.UserCategory.STANDARD)
        return self._create_user(email=email, password=password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        if not password:
            raise ValueError("Superusers must have a password.")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        # superusers are superadmins by definition here
        extra_fields.setdefault("user_category", User.UserCategory.SUPERADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email=email, password=password, **extra_fields)

    @transaction.atomic
    def create_cd_admin_for_client(
        self,
        *,
        client_id: int,
        email: str,
        full_name: str | None = None,
        phone: str | None = None,
        city: str | None = None,
        address: str | None = None,
        client_code: str | None = None,  # e.g., LFRAS_C_{client_id}; derived if not provided
        make_superuser: bool = False,
        user_category: "User.UserCategory | str | None" = None,  # pass SUPERADMIN when LD creates POC
    ) -> Tuple["User", str]:
        """
        Upsert a client-scoped admin user for CD/CCD using LD PointOfContact email.
        Returns (user, generated_password).

        - If the user already exists, it updates staff/superuser flags and resets password.
        - If creating a POC from LD, set user_category=SUPERADMIN (and optionally is_superuser).
        - Otherwise default user_category=STANDARD.
        """
        email_norm = self.normalize_email(email)
        user = self.model.objects.filter(email=email_norm).first()
        raw_password = _generate_password()

        # derive client_code if not provided (no zero-padding to match your convention)
        code = client_code or f"LFRAS_C_{client_id}"

        # compute desired category
        if user_category is None:
            user_category = User.UserCategory.SUPERADMIN if make_superuser else User.UserCategory.STANDARD

        if user:
            if not user.client_id:
                user.client_id = client_id
            if not user.client_code:
                user.client_code = code

            user.is_staff = True
            if make_superuser:
                user.is_superuser = True

            if full_name and not user.full_name:
                user.full_name = full_name
            if phone and not user.phone:
                user.phone = phone
            if city and not user.city:
                user.city = city
            if address and not user.address:
                user.address = address

            # set/normalize category
            user.user_category = user_category

            user.set_password(raw_password)
            user.save(update_fields=[
                "client_id", "client_code", "is_staff", "is_superuser",
                "full_name", "phone", "city", "address", "user_category", "password"
            ])

            # ensure username exists (older rows might not have it yet)
            if not user.username:
                user.username = f"LFRAS_C_E_{user.id}"
                user.save(update_fields=["username"])
            return user, raw_password

        # Create new user; username gets filled post-save in _create_user
        extra = dict(
            client_id=client_id,
            client_code=code,
            is_active=True,
            is_staff=True,
            is_superuser=bool(make_superuser),
            user_category=user_category,
            full_name=full_name or "",
            phone=phone or "",
            city=city or "",
            address=address or "",
            # leave username blank so _create_user can derive from PK
            username="",
        )
        user = self._create_user(email=email_norm, password=raw_password, **extra)
        return user, raw_password


class User(AbstractUser):
    """
    CD/CCD user model:
      - Login is by email (USERNAME_FIELD = 'email').
      - We still keep a unique `username` assigned automatically: LFRAS_C_E_{id}.
      - `client_id` links to LD's ld_clients PK (int).
      - `client_code` stores the human-friendly code, e.g. LFRAS_C_{client_id}.
      - `user_category` marks user role grouping (superadmin/admin/standard).
    """

    class UserCategory(models.TextChoices):
        SUPERADMIN = "superadmin", "SuperAdmin"
        ADMIN = "admin", "Admin"
        STANDARD = "standard", "Standard"

    # expose choices/defaults for serializers and other apps
    USER_CATEGORY_CHOICES = list(UserCategory.choices)
    USER_CATEGORY_DEFAULT = UserCategory.STANDARD

    # keep a unique username string (auto-generated), but auth uses email
    username = models.CharField(max_length=64, unique=True, blank=True, default="")
    email = models.EmailField(unique=True, db_index=True)

    full_name = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=16, blank=True, default="", validators=[US_E164_VALIDATOR])
    city = models.CharField(max_length=128, blank=True, default="")
    address = models.CharField(max_length=512, blank=True, default="")

    client_id = models.PositiveBigIntegerField(null=True, blank=True, db_index=True)
    client_code = models.CharField(max_length=32, blank=True, default="", db_index=True)  # e.g., LFRAS_C_{client_id}

    user_category = models.CharField(
        max_length=16,
        choices=UserCategory.choices,
        default=UserCategory.STANDARD,
        db_index=True,
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []  # for createsuperuser

    class Meta:
        db_table = "cdccd_users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["client_id"]),
            models.Index(fields=["client_code"]),
            models.Index(fields=["user_category"]),
        ]
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self) -> str:
        return self.email or f"User#{self.pk}"