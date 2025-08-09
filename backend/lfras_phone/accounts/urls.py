from django.urls import path

from .views import (
    LoginView,
    TokenRefresh,
    LogoutView,
    ProfileView,
    PasswordCheckView,
    PasswordUpdateView,
    PasswordResetRequestView,
    SMTPConfigView,
)

urlpatterns = [
    # Auth
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefresh.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Profile
    path("profile/", ProfileView.as_view(), name="profile"),

    # Password
    path("password/check/", PasswordCheckView.as_view(), name="password_check"),
    path("password/update/", PasswordUpdateView.as_view(), name="password_update"),
    path("password/reset-request/", PasswordResetRequestView.as_view(), name="password_reset_request"),

    # SMTP (no serializer)
    path("<int:client_id>/smtp/", SMTPConfigView.as_view(), name="smtp_config"),
]