import pytest
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.clients.models import ClientCD, CCDUser
from apps.activity.models import FileActivity, ActivityFile

User = get_user_model()


@pytest.mark.django_db
def test_file_activity_creation():
    client = ClientCD.objects.create(
        company_name="TestCD",
        subdomain="testcd",
        email_domain="testcd.com",
        plan_type="ESSENTIALS"
    )
    user = CCDUser.objects.create(
        full_name="Test User",
        email="test@cd.com",
        designation="Finance",
        is_active=True,
        username="test_user",
        client_cd=client
    )

    activity = FileActivity.objects.create(
        started_by=user
    )

    assert activity.id is not None
    assert activity.started_by == user
    assert activity.started_at is not None
    assert activity.ended_at is None


@pytest.mark.django_db
def test_activity_file_creation_and_status_tracking():
    client = ClientCD.objects.create(
        company_name="TestCD",
        subdomain="testcd",
        email_domain="testcd.com",
        plan_type="ESSENTIALS"
    )
    user = CCDUser.objects.create(
        full_name="Test User",
        email="test@cd.com",
        designation="Finance",
        is_active=True,
        username="test_user",
        client_cd=client
    )
    activity = FileActivity.objects.create(started_by=user)

    file = ActivityFile.objects.create(
        activity=activity,
        filename="invoice.pdf",
        s3_path="s3://bucket/path/invoice.pdf",
        is_valid=True,
        reason=""
    )

    assert file.filename == "invoice.pdf"
    assert file.activity == activity
    assert file.is_valid is True
    assert file.s3_path.startswith("s3://")
    assert file.uploaded_at is not None