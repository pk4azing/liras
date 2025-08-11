from __future__ import annotations

import json
import smtplib
import ssl
from email.message import EmailMessage
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import ClientError

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
from rest_framework.views import APIView

from accounts.models import User  # your custom email-as-username user
from .models import Customer
from .serializers import CustomerSerializer


# ---------- S3 helpers ----------

def _s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", None),
        aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", None),
        region_name=getattr(settings, "AWS_REGION", None),
    )


def _ensure_prefix(bucket: str, key_prefix: str) -> None:
    """
    Create an S3 'folder' marker (zero-byte object with trailing slash) if desired.
    S3 doesn't need folders, but writing them keeps UI views tidy.
    """
    if not key_prefix.endswith("/"):
        key_prefix += "/"
    s3 = _s3_client()
    try:
        s3.put_object(Bucket=bucket, Key=key_prefix)
    except ClientError as e:
        raise RuntimeError(f"Failed to create S3 prefix {key_prefix}: {e}")


def _create_customer_scaffold(bucket: str, client_id: int, customer_id_str: str) -> None:
    """
    Create base folders for a newly created customer.

    1. LD_Clients/{client_id}/Customer/{customer_id}/
    2. LD_Clients/{client_id}/Customer/{customer_id}/Activity/
    """
    root = f"LD_Clients/{client_id}/Customer/{customer_id_str}/"
    _ensure_prefix(bucket, root)
    _ensure_prefix(bucket, root + "Activity/")


# ---------- SMTP helpers (per-client config stored in S3) ----------

def _smtp_config_s3_key(client_id: int) -> str:
    # Where LD stored SMTP JSON for the client
    return f"LD_Clients/{client_id}/Configs/smtp.json"


def _get_client_smtp_config(client_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetch SMTP JSON from S3:
    {
      "host": "...",
      "port": 587,
      "username": "...",
      "password": "...",
      "use_tls": true,
      "use_ssl": false,
      "from_email": "no-reply@example.com"
    }
    """
    bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", None)
    if not bucket:
        return None

    s3 = _s3_client()
    key = _smtp_config_s3_key(client_id)
    try:
        obj = s3.get_object(Bucket=bucket, Key=key)
        data = obj["Body"].read()
        return json.loads(data.decode("utf-8"))
    except ClientError:
        return None
    except Exception:
        return None


def _send_email_with_smtp_config(
    client_id: int,
    to_email: str,
    subject: str,
    body_text: str,
) -> bool:
    cfg = _get_client_smtp_config(client_id)
    if not cfg:
        return False

    host = cfg.get("host")
    port = int(cfg.get("port", 587))
    username = cfg.get("username")
    password = cfg.get("password")
    use_tls = bool(cfg.get("use_tls", True))
    use_ssl = bool(cfg.get("use_ssl", False))
    from_email = cfg.get("from_email") or username

    if not (host and port and username and password and from_email):
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(body_text)

    try:
        if use_ssl:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(host=host, port=port, context=context, timeout=30) as server:
                server.login(username, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host=host, port=port, timeout=30) as server:
                if use_tls:
                    server.starttls(context=ssl.create_default_context())
                server.login(username, password)
                server.send_message(msg)
        return True
    except Exception:
        return False


# ---------- API views ----------

class CustomerListCreateAPI(APIView):
    """
    GET: list customers (optionally filter by client_id)
    POST: create a customer, auto-create CCD user (login by email), email credentials,
          and scaffold S3 folders.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Customer.objects.all()
        client_id = request.query_params.get("client_id")
        if client_id is not None:
            qs = qs.filter(client_id=client_id)
        ser = CustomerSerializer(qs, many=True)
        return Response(ser.data)

    @transaction.atomic
    def post(self, request):
        ser = CustomerSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=HTTP_400_BAD_REQUEST)

        client_id = ser.validated_data["client_id"]
        customer_email = ser.validated_data["email"]

        # per-client sequence (simple, OK for low concurrency; for high throughput use a counter table + SELECT FOR UPDATE)
        seq = Customer.objects.filter(client_id=client_id).count() + 1
        generated_customer_id = f"LFRAS_C_{client_id}_CUST_{seq:06d}"

        # Create the customer record
        customer = Customer.objects.create(
            customer_id=generated_customer_id,
            created_by=request.user if request.user.is_authenticated else None,
            updated_by=request.user if request.user.is_authenticated else None,
            **ser.validated_data,
        )

        # Create CCD user that logs in with the customer's email
        temp_password = User.objects.make_random_password()
        ccd_user, created = User.objects.get_or_create(
            email=customer_email,
            defaults={
                "full_name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "city": customer.city,
                "client_id": client_id,
                "is_active": True,
            },
        )
        if created:
            ccd_user.set_password(temp_password)
            ccd_user.save(update_fields=["password"])
        else:
            # If user already exists, we won't overwrite their password silently
            temp_password = None

        # Create base S3 folder(s)
        bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", None)
        if bucket:
            _create_customer_scaffold(bucket=bucket, client_id=client_id, customer_id_str=generated_customer_id)

        # Email credentials (only if we created a brand-new user)
        if temp_password:
            portal_url = getattr(settings, "CUSTOMER_PORTAL_URL", "https://client.lucidcompliance.com")
            body = (
                f"Hello {customer.name},\n\n"
                f"Your account has been created.\n\n"
                f"Portal: {portal_url}\n"
                f"Login Email: {customer_email}\n"
                f"Temporary Password: {temp_password}\n\n"
                f"Please sign in and change your password.\n\n"
                f"Thanks,\nLucid Compliance"
            )
            _send_email_with_smtp_config(
                client_id=client_id,
                to_email=customer_email,
                subject="Your Lucid Compliance customer account",
                body_text=body,
            )

        out = CustomerSerializer(customer).data
        if temp_password:
            # Helpful echo (optional; remove if you don't want to return temp password)
            out["login_email"] = customer_email
        return Response(out, status=HTTP_201_CREATED)


class CustomerDetailAPI(APIView):
    """
    GET: retrieve
    PATCH: partial update
    DELETE: soft delete (set is_active=False) or hard delete (optional)
    """
    permission_classes = [IsAuthenticated]

    def _get_obj(self, pk: int) -> Optional[Customer]:
        try:
            return Customer.objects.get(pk=pk)
        except Customer.DoesNotExist:
            return None

    def get(self, request, pk: int):
        obj = self._get_obj(pk)
        if not obj:
            return Response({"detail": "Not found."}, status=HTTP_404_NOT_FOUND)
        ser = CustomerSerializer(obj)
        return Response(ser.data)

    @transaction.atomic
    def patch(self, request, pk: int):
        obj = self._get_obj(pk)
        if not obj:
            return Response({"detail": "Not found."}, status=HTTP_404_NOT_FOUND)

        ser = CustomerSerializer(instance=obj, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(ser.errors, status=HTTP_400_BAD_REQUEST)

        updated = ser.save(updated_by=request.user if request.user.is_authenticated else None)
        return Response(CustomerSerializer(updated).data)

    @transaction.atomic
    def delete(self, request, pk: int):
        obj = self._get_obj(pk)
        if not obj:
            return Response({"detail": "Not found."}, status=HTTP_404_NOT_FOUND)

        # Soft delete by default
        obj.is_active = False
        obj.updated_by = request.user if request.user.is_authenticated else None
        obj.save(update_fields=["is_active", "updated_by", "updated_at"])
        return Response({"detail": "Customer deactivated."})