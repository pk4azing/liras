import pytest
from django.contrib.auth import get_user_model
from backend.apps.clients.models import ClientCD, CDEmployee, CCDUser, FileUploadLog

User = get_user_model()

@pytest.mark.django_db
def test_clientcd_model_creation():
    client = ClientCD.objects.create(
        company_name="Test Corp",
        subdomain="testcorp",
        email_domain="testcorp.com",
        plan_type="ESSENTIALS",
        smtp_config={"host": "smtp.testcorp.com", "port": 587},
        config_s3_path="s3://bucket/testcorp/config.json",
        email_config_s3_path="s3://bucket/testcorp/email.json"
    )
    assert client.subdomain == "testcorp"
    assert client.plan_type == "ESSENTIALS"
    assert client.smtp_config["host"] == "smtp.testcorp.com"
    assert str(client) == "Test Corp"

@pytest.mark.django_db
def test_cdemployee_model_creation():
    client = ClientCD.objects.create(
        company_name="Corp X",
        subdomain="corpx",
        email_domain="corpx.com",
        plan_type="PROFESSIONAL"
    )
    employee = CDEmployee.objects.create(
        full_name="John Doe",
        email="john@corpx.com",
        role="Admin",
        designation="Lead",
        username="EMP_JOHN_DOE_001",
        client_cd=client
    )
    assert employee.email == "john@corpx.com"
    assert employee.client_cd == client
    assert str(employee) == "John Doe"

@pytest.mark.django_db
def test_ccduser_model_creation():
    client = ClientCD.objects.create(
        company_name="ClientZ",
        subdomain="clientz",
        email_domain="clientz.com",
        plan_type="ENTERPRISE"
    )
    user = CCDUser.objects.create(
        full_name="Jane Client",
        email="jane@clientz.com",
        designation="Analyst",
        username="CCD_JANE_CLIENT_001",
        client_cd=client
    )
    assert user.full_name == "Jane Client"
    assert user.client_cd == client
    assert str(user) == "Jane Client"

@pytest.mark.django_db
def test_fileuploadlog_model_creation():
    user = User.objects.create(
        username="uploader",
        email="uploader@test.com",
        password="pass1234"
    )
    log = FileUploadLog.objects.create(
        uploaded_by=user,
        original_filename="summary.pdf",
        s3_path="s3://test/uploads/summary.pdf"
    )
    assert log.original_filename == "summary.pdf"
    assert log.uploaded_by.email == "uploader@test.com"
    assert str(log) == "summary.pdf"