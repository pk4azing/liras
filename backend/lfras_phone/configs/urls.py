from django.urls import path

from .views import (
    ConfigFileListCreateView, ConfigFileDownloadURLView,
    EmailTemplateListCreateView, EmailTemplateRetrieveUpdateView
)

urlpatterns = [
    path("configs/", ConfigFileListCreateView.as_view(), name="config-list-create"),
    path("configs/<int:pk>/download-url/", ConfigFileDownloadURLView.as_view(), name="config-download-url"),
    path("email-templates/", EmailTemplateListCreateView.as_view(), name="email-template-list-create"),
    path("email-templates/<int:pk>/", EmailTemplateRetrieveUpdateView.as_view(), name="email-template-detail"),
]