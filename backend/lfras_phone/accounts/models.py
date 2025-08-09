from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, username, phone, password=None, role="POC", **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")
        if not phone:
            raise ValueError("Users must have a phone number")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
            phone=phone,
            role=role,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, phone, password, role="POC", **extra_fields)


class User(AbstractUser):
    ROLES_CHOICES = (
        ("POC", "Point of Contact"),
        ("CD_EMPLOYEE", "CD Employee"),
        ("CCD_USER", "CCD User"),
    )

    email = models.EmailField(max_length=255, unique=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=15, choices=ROLES_CHOICES, default="POC")
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "phone"]

    objects = CustomUserManager()

    class Meta:
        indexes = [
            models.Index(fields=["email", "phone"]),
            models.Index(fields=["city", "full_name"]),
        ]