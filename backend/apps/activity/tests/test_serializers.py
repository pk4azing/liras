import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.clients.models import ClientCD, CCDUser
from apps.activity.models import FileActivity, ActivityFile
from apps.activity.serializers import (
    FileActivitySerializer,
    ActivityFileUploadSerializer
)


@pytest.mark.django_db
def test_file_activity_serializer():
    client = ClientCD.objects.create(
        company_name="Test CD",
        subdomain="testcd",
        email_domain="testcd.com",
        plan_type="ESSENTIALS"
    )
    user = CCDUser.objects.create(
        full_name="User A",
        email="user@testcd.com",
        designation="Finance",
        username="usera",
        is_active=True,
        client_cd=client
    )

    activity = FileActivity.objects.create(started_by=user)

    serializer = FileActivitySerializer(instance=activity)
    data = serializer.data

    assert data["id"] == str(activity.id)
    assert data["started_by"] == user.id
    assert "started_at" in data
    assert "ended_at" in data


@pytest.mark.django_db
def test_activity_file_upload_serializer_json_validation():
    json_file = SimpleUploadedFile("test_config.json", b"{}", content_type="application/json")
    serializer = ActivityFileUploadSerializer(data={
        "file": json_file,
        "expected_name": "test_config.json",
        "expected_keywords": ["key1", "key2"],
        "type": "config"
    })

    assert serializer.is_valid()


@pytest.mark.django_db
def test_activity_file_upload_serializer_txt_validation():
    txt_file = SimpleUploadedFile("email_template.txt", b"Hello", content_type="text/plain")
    serializer = ActivityFileUploadSerializer(data={
        "file": txt_file,
        "expected_name": "email_template.txt",
        "expected_keywords": ["Hello"],
        "type": "email_template"
    })

    assert serializer.is_valid()


@pytest.mark.django_db
def test_activity_file_upload_serializer_invalid_file():
    file = SimpleUploadedFile("wrong.docx", b"Invalid", content_type="application/octet-stream")
    serializer = ActivityFileUploadSerializer(data={
        "file": file,
        "expected_name": "wrong.docx",
        "expected_keywords": [],
        "type": "config"
    })

    assert not serializer.is_valid()
    assert "file" in serializer.errors