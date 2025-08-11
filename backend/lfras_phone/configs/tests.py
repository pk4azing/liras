from __future__ import annotations

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import ConfigFile, EmailTemplate

User = get_user_model()


class ConfigsAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="ccd@example.com", password="pass123", username="XU")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_upload_and_get_url(self):
        url = reverse("config-list-create")
        payload = {"client_id": 10, "customer_id": 200, "file_name": "rules.txt"}
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.data["id"]
        durl = reverse("config-download-url", kwargs={"pk": pk})
        r2 = self.client.get(durl)
        self.assertEqual(r2.status_code, 200)
        self.assertIn("s3_url", r2.data)

    def test_email_template_crud(self):
        url = reverse("email-template-list-create")
        p = {
            "client_id": 10,
            "customer_id": 200,
            "template_type": "expiry",
            "template_key": "expiry_default",
            "subject_template": "File Expiry: {{ file_name }}",
            "body_template": "<p>Expires {{ expires_at }}</p>",
        }
        r = self.client.post(url, p, format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.data["id"]

        durl = reverse("email-template-detail", kwargs={"pk": pk})
        r2 = self.client.get(durl)
        self.assertEqual(r2.status_code, 200)
        r3 = self.client.patch(durl, {"is_active": False}, format="json")
        self.assertEqual(r3.status_code, 200)