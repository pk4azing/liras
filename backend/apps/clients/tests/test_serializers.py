import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.exceptions import ValidationError as DRFValidationError
from backend.apps.clients.serializers import (
    ClientCDSerializer,
    FileUploadSerializer,
    CDEmployeeCreateSerializer,
    CCDUserCreateSerializer,
)
from backend.apps.clients.models import ClientCD



@pytest.mark.django_db
def test_clientcd_serializer_valid():
    client = ClientCD.objects.create(
        company_name="TestCorp",
        subdomain="testcorp",
        email_domain="testcorp.com",
        plan_type="ESSENTIALS"
    )
    serializer = ClientCDSerializer(instance=client)
    assert serializer.data['company_name'] == "TestCorp"
    assert serializer.data['subdomain'] == "testcorp"


def test_fileupload_serializer_valid_config():
    file = SimpleUploadedFile("config.json", b"{}", content_type="application/json")
    serializer = FileUploadSerializer(data={'file': file, 'upload_type': 'config'})
    assert serializer.is_valid()


def test_fileupload_serializer_invalid_config_extension():
    file = SimpleUploadedFile("config.txt", b"{}", content_type="text/plain")
    serializer = FileUploadSerializer(data={'file': file, 'upload_type': 'config'})
    with pytest.raises(DRFValidationError):
        serializer.is_valid(raise_exception=True)


def test_fileupload_serializer_valid_email_template():
    file = SimpleUploadedFile("template.txt", b"Welcome", content_type="text/plain")
    serializer = FileUploadSerializer(data={'file': file, 'upload_type': 'email_template'})
    assert serializer.is_valid()


def test_fileupload_serializer_invalid_email_template_extension():
    file = SimpleUploadedFile("template.json", b"{}", content_type="application/json")
    serializer = FileUploadSerializer(data={'file': file, 'upload_type': 'email_template'})
    with pytest.raises(DRFValidationError):
        serializer.is_valid(raise_exception=True)


@pytest.mark.django_db
def test_cdemployee_serializer_valid_creation():
    client = ClientCD.objects.create(
        company_name="X",
        subdomain="x",
        email_domain="x.com",
        plan_type="ESSENTIALS"
    )
    data = {
        "full_name": "Jane Doe",
        "email": "jane@x.com",
        "role": "Admin",
        "designation": "Ops Head",
        "is_active": True,
        "client_cd": str(client.id),
    }
    serializer = CDEmployeeCreateSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()
    assert instance.username.startswith("CDU_jane-doe_")
    assert instance.email == "jane@x.com"


@pytest.mark.django_db
def test_cdemployee_serializer_invalid_email_domain():
    client = ClientCD.objects.create(
        company_name="Y",
        subdomain="y",
        email_domain="y.com",
        plan_type="ESSENTIALS"
    )
    data = {
        "full_name": "Mark Smith",
        "email": "mark@wrong.com",
        "role": "Viewer",
        "designation": "Analyst",
        "is_active": True,
        "client_cd": str(client.id),
    }
    serializer = CDEmployeeCreateSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors


@pytest.mark.django_db
def test_ccduser_serializer_valid_creation():
    client = ClientCD.objects.create(
        company_name="ClientZ",
        subdomain="cz",
        email_domain="cz.com",
        plan_type="ESSENTIALS"
    )
    data = {
        "full_name": "Tom Client",
        "email": "tom@cz.com",
        "designation": "Reviewer",
        "is_active": True,
        "client_cd": str(client.id),
    }
    serializer = CCDUserCreateSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()
    assert user.username.startswith("CCDU_tom-client_")
    assert user.email == "tom@cz.com"


@pytest.mark.django_db
def test_ccduser_serializer_invalid_domain():
    client = ClientCD.objects.create(
        company_name="Zeta",
        subdomain="zeta",
        email_domain="zeta.com",
        plan_type="ESSENTIALS"
    )
    data = {
        "full_name": "Mike Wrong",
        "email": "mike@notzeta.com",
        "designation": "QA",
        "is_active": True,
        "client_cd": str(client.id),
    }
    serializer = CCDUserCreateSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors