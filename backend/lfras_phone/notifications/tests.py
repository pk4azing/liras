# CDCCD/notifications/tests.py
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

User = get_user_model()


class NotificationAPITests(APITestCase):
    def setUp(self):
        self.client_api = APIClient()

        # Users
        self.user1 = User.objects.create_user(
            email="u1@example.com", password="pass1234", full_name="User One"
        )
        self.user2 = User.objects.create_user(
            email="u2@example.com", password="pass1234", full_name="User Two"
        )

        # Seed notifications
        # Use the API to create (so we test serializer defaults like user assignment)
        self.client_api.force_authenticate(self.user1)
        self.n1 = self._create_notification(title="A1", message="m1", level="info")   # unread
        self.n2 = self._create_notification(title="A2", message="m2", level="warning")  # unread
        self.n3 = self._create_notification(title="A3", message="m3", level="success")  # will mark read below

        # Mark one as read
        url_mark_read = reverse("notifications:mark-read", args=[self.n3["id"]])
        res = self.client_api.post(url_mark_read, {})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Another user's notification
        self.client_api.force_authenticate(self.user2)
        self.n_other = self._create_notification(title="B1", message="x", level="error")
        self.client_api.force_authenticate(self.user1)

    def _create_notification(self, *, title, message, level="info", meta=None):
        url = reverse("notifications:list-create")
        payload = {"title": title, "message": message, "level": level}
        if meta is not None:
            payload["meta"] = meta
        res = self.client_api.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        return res.data

    def test_list_returns_only_current_users_notifications(self):
        url = reverse("notifications:list-create")
        res = self.client_api.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # user1 has 3
        self.assertEqual(len(res.data), 3)
        # ensure all belong to user1
        for item in res.data:
            self.assertEqual(item["user"], self.user1.id)

    def test_create_sets_owner_to_request_user(self):
        url = reverse("notifications:list-create")
        payload = {"title": "Hello", "message": "World", "level": "info"}
        res = self.client_api.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["user"], self.user1.id)
        self.assertEqual(res.data["is_read"], False)
        self.assertEqual(res.data["title"], "Hello")

    def test_detail_retrieve_own_notification(self):
        url = reverse("notifications:detail", args=[self.n1["id"]])
        res = self.client_api.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["id"], self.n1["id"])

    def test_detail_not_visible_for_others(self):
        # user1 tries to fetch user2's notification -> 404
        url = reverse("notifications:detail", args=[self.n_other["id"]])
        res = self.client_api.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_own_notification(self):
        url = reverse("notifications:detail", args=[self.n2["id"]])
        res = self.client_api.delete(url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        # verify gone
        res = self.client_api.get(url)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_others_notification_forbidden_by_visibility(self):
        url = reverse("notifications:detail", args=[self.n_other["id"]])
        res = self.client_api.delete(url)
        # detail view returns 404 for non-owners to avoid leaking existence
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_read_and_mark_unread(self):
        # start with unread n1
        url_read = reverse("notifications:mark-read", args=[self.n1["id"]])
        res = self.client_api.post(url_read, {})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # confirm is_read True
        url_detail = reverse("notifications:detail", args=[self.n1["id"]])
        res = self.client_api.get(url_detail)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_read"])

        # mark unread
        url_unread = reverse("notifications:mark-unread", args=[self.n1["id"]])
        res = self.client_api.post(url_unread, {})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        res = self.client_api.get(url_detail)
        self.assertFalse(res.data["is_read"])

    def test_mark_all_read_for_current_user(self):
        # Make sure at least some unread exist
        list_url = reverse("notifications:list-create")
        res = self.client_api.get(list_url, {"is_read": "false"})
        self.assertGreaterEqual(len(res.data), 1)

        url = reverse("notifications:mark-all-read")
        res = self.client_api.post(url, {})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("updated", res.data)

        # Now all should be read
        res = self.client_api.get(list_url, {"is_read": "false"})
        self.assertEqual(len(res.data), 0)

    def test_filter_is_read_true_and_false(self):
        list_url = reverse("notifications:list-create")

        res = self.client_api.get(list_url, {"is_read": "true"})
        # n3 was marked read in setUp; after mark_all test it might change, so isolate:
        # Reset by marking n1 read to ensure at least one read exists
        reverse_read = reverse("notifications:mark-read", args=[self.n1["id"]])
        self.client_api.post(reverse_read, {})
        res = self.client_api.get(list_url, {"is_read": "true"})
        self.assertGreaterEqual(len(res.data), 1)
        for item in res.data:
            self.assertTrue(item["is_read"])

        res = self.client_api.get(list_url, {"is_read": "false"})
        for item in res.data:
            self.assertFalse(item["is_read"])

    def test_cannot_see_others_items_when_listing(self):
        # switch to user2 and ensure only their one item shows
        self.client_api.force_authenticate(self.user2)
        url = reverse("notifications:list-create")
        res = self.client_api.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["id"], self.n_other["id"])
        self.client_api.force_authenticate(self.user1)