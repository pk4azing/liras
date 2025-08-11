from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from .models import Ticket, TicketComment

User = get_user_model()


class TicketFlowTests(APITestCase):
    def setUp(self):
        # same tenant
        self.client_id = 101

        # CD user (creator, is_staff=True)
        self.cd = User.objects.create_user(
            email="cd@acme.com",
            password="cd-pass",
            is_staff=True,
            client_id=self.client_id,
            client_code="LFRAS_C_000101",
            full_name="CD Admin",
        )

        # LD user (assignee, not staff)
        self.ld = User.objects.create_user(
            email="agent@ld.com",
            password="ld-pass",
            is_staff=False,
            client_id=self.client_id,
            client_code="LFRAS_C_000101",
            full_name="LD Agent",
        )

        # outsider tenant
        self.outsider = User.objects.create_user(
            email="outsider@else.com",
            password="out-pass",
            client_id=999,
            client_code="LFRAS_C_000999",
        )

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_cd_can_create_list_and_update_ticket(self):
        self.auth(self.cd)

        # create
        url = reverse("tickets:ticket-list-create")
        payload = {
            "title": "S3 ingestion failing",
            "description": "Pipeline error when uploading CSV",
            "priority": "high",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        tid = res.data["id"]

        # list (same tenant)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

        # update anything (CD has full edit)
        upd = reverse("tickets:ticket-detail", kwargs={"pk": tid})
        res = self.client.patch(upd, {"assigned_ld_email": self.ld.email, "status": "in_progress"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data["status"], "in_progress")
        self.assertEqual(res.data["assigned_ld_email"], self.ld.email)

    def test_ld_can_only_update_own_assigned_status_and_progress(self):
        # prepare ticket by CD
        self.auth(self.cd)
        url = reverse("tickets:ticket-list-create")
        res = self.client.post(url, {"title": "Bug", "description": "", "priority": "low"}, format="json")
        tid = res.data["id"]

        # assign to LD
        upd = reverse("tickets:ticket-detail", kwargs={"pk": tid})
        self.client.patch(upd, {"assigned_ld_email": self.ld.email}, format="json")

        # LD tries allowed fields
        self.auth(self.ld)
        res = self.client.patch(upd, {"status": "in_progress", "progress": 40}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data["status"], "in_progress")
        self.assertEqual(res.data["progress"], 40)

        # LD tries forbidden field
        res = self.client.patch(upd, {"title": "Hacked"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_tenant_isolation(self):
        # CD creates a ticket in tenant 101
        self.auth(self.cd)
        url = reverse("tickets:ticket-list-create")
        res = self.client.post(url, {"title": "Only ours", "priority": "low"}, format="json")
        tid = res.data["id"]

        # outsider cannot view
        self.auth(self.outsider)
        detail = reverse("tickets:ticket-detail", kwargs={"pk": tid})
        res = self.client.get(detail)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_comments_any_side_same_tenant(self):
        self.auth(self.cd)
        url = reverse("tickets:ticket-list-create")
        res = self.client.post(url, {"title": "Comment test", "priority": "low"}, format="json")
        tid = res.data["id"]

        comments_url = reverse("tickets:ticket-comments", kwargs={"ticket_id": tid})

        # LD posts a comment (same tenant)
        self.auth(self.ld)
        res = self.client.post(comments_url, {"body": "Looking into it"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertEqual(TicketComment.objects.filter(ticket_id=tid).count(), 1)

        # fetch comments
        res = self.client.get(comments_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_cd_can_archive_ticket(self):
        self.auth(self.cd)
        url = reverse("tickets:ticket-list-create")
        res = self.client.post(url, {"title": "To archive", "priority": "medium"}, format="json")
        tid = res.data["id"]

        detail = reverse("tickets:ticket-detail", kwargs={"pk": tid})
        res = self.client.delete(detail)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Ticket.objects.get(pk=tid).is_active)