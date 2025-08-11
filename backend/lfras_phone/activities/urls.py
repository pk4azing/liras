from django.urls import path

from .views import (
    ActivityListCreateView, ActivityRetrieveUpdateView,
    ActivityFileListCreateView, ActivityFileRetrieveUpdateView,
    ActivityFileDownloadURLView,
)

urlpatterns = [
    path("", ActivityListCreateView.as_view(), name="activity-list-create"),
    path("<int:pk>/", ActivityRetrieveUpdateView.as_view(), name="activity-detail"),
    path("<int:activity_pk>/files/", ActivityFileListCreateView.as_view(), name="activity-file-list-create"),
    path("files/<int:pk>/", ActivityFileRetrieveUpdateView.as_view(), name="activity-file-detail"),
    path("files/<int:pk>/download-url/", ActivityFileDownloadURLView.as_view(), name="activity-file-download-url"),
]