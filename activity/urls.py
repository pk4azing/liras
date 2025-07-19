# activity/urls.py

from django.urls import path
from activity.views import (
    ActivityCreateView,
    ActivityDetailView,
    FileUploadView,
)

urlpatterns = [
    path('start/', ActivityCreateView.as_view(), name='activity-start'),
    path('<uuid:id>/', ActivityDetailView.as_view(), name='activity-detail'),
    path('<uuid:activity_id>/upload/', FileUploadView.as_view(), name='activity-file-upload'),
]