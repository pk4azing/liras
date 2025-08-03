import io
import pytest
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from apps.clients.models import ClientCD, CCDUser
from apps.activity.models import FileActivity, ActivityFile
from unittest.mock import patch


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def setup_ccd_user(db):
    client = ClientCD.objects.create(
        company_name="LucidCD",
        subdomain="lucidcd",
        email_domain="lucidcd.com",
        plan_type="ESSENTIALS"
    )
    ccd_user = CCDUser.objects.create(
        full_name="Lucid CCD",
        email="lucid@lucidcd.com",
        designation="Audit",
        is_active=True,
        username="lucid_ccd",
        client_cd=client
    )
    return ccd_user


@pytest.mark.django_db
def test_start_activity(api_client, setup_ccd_user):
    api_client.force_authenticate(user=setup_ccd_user)
    response = api_client.post("/activity/start/")
    assert response.status_code == 201
    assert FileActivity.objects.filter(started_by=setup_ccd_user).exists()


@pytest.mark.django_db
def test_upload_file_to_activity(api_client, setup_ccd_user):
    api_client.force_authenticate(user=setup_ccd_user)
    activity = FileActivity.objects.create(started_by=setup_ccd_user)

    config_file = SimpleUploadedFile("test.json", b'{"key": "value"}', content_type="application/json")

    with patch("apps.activity.views.validate_file_content", return_value=(True, "")), \
         patch("apps.activity.views.upload_file_to_s3", return_value="s3://mock/path/test.json"):

        response = api_client.post(
            f"/activity/{activity.id}/upload-file/",
            data={
                "file": config_file,
                "expected_name": "test.json",
                "expected_keywords": ["key"],
                "type": "config"
            },
            format="multipart"
        )

    assert response.status_code == 201
    assert ActivityFile.objects.filter(activity=activity).exists()


@pytest.mark.django_db
def test_finish_activity(api_client, setup_ccd_user):
    api_client.force_authenticate(user=setup_ccd_user)
    activity = FileActivity.objects.create(started_by=setup_ccd_user)

    ActivityFile.objects.create(
        activity=activity,
        filename="done.json",
        s3_path="s3://bucket/done.json",
        is_valid=True
    )

    with patch("apps.activity.views.create_activity_zip", return_value="s3://mock/final.zip"), \
         patch("apps.activity.views.send_email_using_smtp"):

        response = api_client.post(f"/activity/{activity.id}/finish/")
        assert response.status_code == 200
        activity.refresh_from_db()
        assert activity.ended_at is not None
        assert activity.zip_s3_path == "s3://mock/final.zip"