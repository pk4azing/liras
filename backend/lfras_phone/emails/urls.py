from django.urls import path
from . import views

app_name = "emails"

urlpatterns = [
    # Example endpoint to trigger sending an email (optional)
    path("send-test/", views.SendTestEmailView.as_view(), name="send-test-email"),
]