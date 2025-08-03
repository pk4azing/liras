import io
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.clients.models import ClientCD, CDEmployee, CCDUser

from unittest.mock import patch

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_user(db):
    return User.objects.create_user(
        username="admin",
        email="admin@lucid.com",
        password="testpass123"
    )


@pytest.fixture
def auth_client(api_client, auth_user):
    api_client.force_authenticate(user=auth_user)
    return api_client


@pytest.mark.django_db
def test_create_clientcd_and_upload_file(auth_client):
    client_data = {
        "company_name": "LucidX",
        "subdomain": "lucidx",
        "email_domain": "lucidx.com",
        "plan_type": "ESSENTIALS"
    }

    create_resp = auth_client.post("/clients/clientcd/", client_data)
    assert create_resp.status_code == 201
    client_id = create_resp.data["id"]

    with patch("apps.clients.views.upload_file_to_s3", return_value="s3://mock/path/config.json"):
        file = io.BytesIO(b'{"test": "data"}')
        file.name = "config.json"
        upload_resp = auth_client.post(
            f"/clients/clientcd/{client_id}/upload-file/",
            data={"file": file, "upload_type": "config"},
            format="multipart"
        )
        assert upload_resp.status_code == 200
        assert "s3_path" in upload_resp.data


@pytest.mark.django_db
def test_create_cdemployee_sends_email(auth_client):
    client = ClientCD.objects.create(
        company_name="TestCorp",
        subdomain="testcorp",
        email_domain="testcorp.com",
        plan_type="ESSENTIALS",
        smtp_config={"host": "smtp.testcorp.com"},
        email_config_s3_path="s3://bucket/email/employee_invite.txt"
    )

    payload = {
        "full_name": "Test User",
        "email": "test.user@testcorp.com",
        "role": "Admin",
        "designation": "Lead",
        "is_active": True,
        "client_cd": str(client.id)
    }

    with patch("apps.clients.views.send_email_using_smtp") as mock_send:
        response = auth_client.post("/clients/cdemployee/", data=payload)
        assert response.status_code == 201
        assert CDEmployee.objects.filter(email="test.user@testcorp.com").exists()
        mock_send.assert_called_once()


@pytest.mark.django_db
def test_create_ccduser_sends_email(auth_client):
    client = ClientCD.objects.create(
        company_name="ClientY",
        subdomain="clienty",
        email_domain="clienty.com",
        plan_type="PROFESSIONAL",
        smtp_config={"host": "smtp.clienty.com"},
        email_config_s3_path="s3://bucket/email/ccd_invite.txt"
    )

    payload = {
        "full_name": "CCD User",
        "email": "ccd.user@clienty.com",
        "designation": "Compliance",
        "is_active": True,
        "client_cd": str(client.id)
    }

    with patch("apps.clients.views.send_email_using_smtp") as mock_send:
        response = auth_client.post("/clients/ccduser/", data=payload)
        assert response.status_code == 201
        assert CCDUser.objects.filter(email="ccd.user@clienty.com").exists()
        mock_send.assert_called_once()