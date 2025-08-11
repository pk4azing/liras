from django.urls import path

from .views import (
    ScheduledReportListCreateView,
    ScheduledReportDetailView,
    ScheduledReportRunNowView,
)

app_name = "reports"

urlpatterns = [
    path("schedules/", ScheduledReportListCreateView.as_view(), name="schedule-list-create"),
    path("schedules/<int:pk>/", ScheduledReportDetailView.as_view(), name="schedule-detail"),
    path("schedules/<int:pk>/run-now/", ScheduledReportRunNowView.as_view(), name="schedule-run-now"),
]