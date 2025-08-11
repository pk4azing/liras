from __future__ import annotations

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


# Generic E.164 validator (not country-specific)
E164_VALIDATOR = RegexValidator(
    regex=r"^\+[1-9]\d{7,14}$",
    message="Enter a valid phone number in E.164 format, e.g. +14155552671.",
)


class Customer(models.Model):
    """
    Customer records owned by a specific LD Client (shared DB).
    A CCD user can be created for this customer (login by email).
    """
    client_id = models.PositiveIntegerField(db_index=True)
    customer_id = models.CharField(max_length=64, unique=True, db_index=True)  # LFRAS_C_{client}_CUST_{seq}

    name = models.CharField(max_length=255)
    email = models.EmailField()  # used for CCD user login
    phone = models.CharField(max_length=16, blank=True, default="", validators=[E164_VALIDATOR])
    city = models.CharField(max_length=128, blank=True, default="")
    address = models.CharField(max_length=512, blank=True, default="")

    # Activity flags
    is_active = models.BooleanField(default=True)

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="customers_created"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="customers_updated"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Ensure a customer email can't be duplicated under the same client
        constraints = [
            models.UniqueConstraint(fields=["client_id", "email"], name="uniq_customer_email_per_client"),
        ]
        indexes = [
            models.Index(fields=["client_id"]),
            models.Index(fields=["email"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.customer_id} - {self.name}"