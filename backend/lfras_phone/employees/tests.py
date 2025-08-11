# CDCCD/employees/tests.py
from __future__ import annotations

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User


class EmployeesAPITest(TestCase):
    def setUp(self):
        # A CD “admin” user who will create/manage employees
        self.client_id = 101
        self.client_code = f"LFRAS_C_{self.client_id:06d}"
        self.org_domain = "example.com"

        self.admin = User.objects.create_user(
            email=f"owner@{self.org_domain}",
            password="AdminPass123!",
            full_name="Owner Admin",
            client_id=self.client_id,
            client_code=self.client_code,
            is_staff=True,
            is_superuser=False,
        )
        # Mark as SUPERADMIN for write access via our permission class
        self.admin.user_category = User.UserCategory.SUPERADMIN
        self.admin.save(update_fields=["user_category"])

        self.api = APIClient()
        self.api.force_authenticate(self.admin)

    def test_list_employees_initial_empty(self):
        resp = self.api.get("/employees/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data, [])

    def test_create_employee_success_same_domain(self):
        payload = {
            "email": f"alice@{self.org_domain}",
            "full_name": "Alice Worker",
            "phone": "+14155550123",
            "city": "SF",
            "address": "1 Market St",
            # optional: let backend default to STANDARD if omitted
            "user_category": User.UserCategory.STANDARD,
        }
        resp = self.api.post("/employees/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)

        # Response includes derived employee_code and login_url
        self.assertIn("employee_code", resp.data)
        self.assertTrue(resp.data["employee_code"].startswith(f"LFRAS_C_{self.client_id}_EMP_"))
        self.assertEqual(resp.data["client_id"], self.client_id)
        self.assertEqual(resp.data["email"], payload["email"])
        self.assertEqual(resp.data["user_category"], User.UserCategory.STANDARD)

        # Appears in list
        list_resp = self.api.get("/employees/")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_resp.data), 1)

    def test_create_employee_reject_different_domain(self):
        payload = {
            "email": "bob@otherco.io",  # mismatched domain
            "full_name": "Bob Blocked",
            "phone": "+14155550124",
        }
        resp = self.api.post("/employees/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", resp.data)

    def test_detail_update_and_soft_delete(self):
        # create one
        create = self.api.post(
            "/employees/",
            {
                "email": f"carol@{self.org_domain}",
                "full_name": "Carol Ops",
                "phone": "+14155550125",
            },
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED, create.data)
        emp_id = create.data["id"]

        # GET detail
        detail = self.api.get(f"/employees/{emp_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["email"], f"carol@{self.org_domain}")
        self.assertIn("employee_code", detail.data)

        # PATCH update (valid same-domain email)
        patch = self.api.patch(
            f"/employees/{emp_id}/",
            {"email": f"carol.renamed@{self.org_domain}", "full_name": "Carol Updated"},
            format="json",
        )
        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        self.assertEqual(patch.data["email"], f"carol.renamed@{self.org_domain}")
        self.assertEqual(patch.data["full_name"], "Carol Updated")

        # DELETE (soft delete -> is_active=False)
        delete = self.api.delete(f"/employees/{emp_id}/")
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)

        # Verify soft delete
        user = User.objects.get(pk=emp_id)
        self.assertFalse(user.is_active)

    def test_filters(self):
        # seed a few users
        for i in range(3):
            u = User.objects.create_user(
                email=f"user{i}@{self.org_domain}",
                password="x",
                full_name=f"User {i}",
                client_id=self.client_id,
                client_code=self.client_code,
                is_staff=False,
            )
            if i == 1:
                u.user_category = User.UserCategory.ADMIN
                u.save(update_fields=["user_category"])

        # filter by search
        r1 = self.api.get("/employees/?search=User 1")
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r1.data), 1)

        # filter by category
        r2 = self.api.get(f"/employees/?user_category={User.UserCategory.ADMIN}")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertTrue(all(row["user_category"] == User.UserCategory.ADMIN for row in r2.data))