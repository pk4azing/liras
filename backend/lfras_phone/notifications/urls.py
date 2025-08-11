# CDCCD/notifications/urls.py
from django.urls import path

from .views import (
    NotificationListCreateAPIView,
    NotificationDetailAPIView,
    NotificationMarkReadAPIView,
    NotificationMarkUnreadAPIView,
    NotificationMarkAllReadAPIView,
)

app_name = "notifications"

urlpatterns = [
    # List & create
    path("", NotificationListCreateAPIView.as_view(), name="list-create"),

    # Detail / delete
    path("<int:pk>/", NotificationDetailAPIView.as_view(), name="detail"),

    # Mark read / unread
    path("<int:pk>/mark_read/", NotificationMarkReadAPIView.as_view(), name="mark-read"),
    path("<int:pk>/mark_unread/", NotificationMarkUnreadAPIView.as_view(), name="mark-unread"),

    # Bulk: mark all read (for current user; admins can use ?all=true)
    path("mark_all_read/", NotificationMarkAllReadAPIView.as_view(), name="mark-all-read"),
]