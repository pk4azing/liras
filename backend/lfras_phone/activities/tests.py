from __future__ import annotations

from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from customers.models import Customer
from .models import Activity, ActivityFile

User = get_user_model()


class ActivitiesAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="u1@example.com", password="pass123", username="X1")
        self.staff = User.objects.create_user(email="staff@example.com", password="pass123", username="X2", is_staff=True)
        self.customer = Customer.objects.create(customer_id=101, name="Cust-101")
        self.activity = Activity.objects.create(
            client_id=123, customer=self.customer, created_by=self.user,
            title="A1", description="D1"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_create_file_and_get_download_url(self):
        # create file
        url = reverse("activity-file-list-create", kwargs={"activity_pk": self.activity.pk})
        payload = {
            "file_name": "foo.csv",
            "content_type": "text/csv",
            "size": 100,
            "checksum": "abc",
            "s3_key": f"{self.activity.s3_base_prefix}Files/foo.csv",
        }
        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, 201)
        fid = r.data["id"]

        # get download url
        url2 = reverse("activity-file-download-url", kwargs={"pk": fid})
        r2 = self.client.get(url2)
        self.assertEqual(r2.status_code, 200)
        self.assertIn("s3_url", r2.data)

    def test_expiry_default_and_validation_status(self):
        f = ActivityFile.objects.create(
            activity=self.activity, uploader=self.user,
            file_name="bar.txt", s3_key=f"{self.activity.s3_base_prefix}Files/bar.txt"
        )
        self.assertEqual(f.validation_status, "uploaded")
        self.assertTrue(f.expires_at > timezone.now())
        self.assertAlmostEqual(
            (f.expires_at - f.uploaded_at).days, 365, delta=1
        )