from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    ProfileView,
    PasswordCheckView,
    PasswordChangeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    SMTPConfigView,
)

urlpatterns = [
    # auth
    path("login/", LoginView.as_view(), name="accounts-login"),
    path("logout/", LogoutView.as_view(), name="accounts-logout"),

    # profile
    path("profile/", ProfileView.as_view(), name="accounts-profile"),

    # password flows
    path("password/check/", PasswordCheckView.as_view(), name="accounts-password-check"),
    path("password/change/", PasswordChangeView.as_view(), name="accounts-password-change"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="accounts-password-reset-request"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="accounts-password-reset-confirm"),

    # smtp config
    path("smtp/", SMTPConfigView.as_view(), name="accounts-smtp-config"),
]
