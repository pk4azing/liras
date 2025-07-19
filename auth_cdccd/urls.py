from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    ProfileView,
    UpdateProfileView,
    ChangePasswordView
)

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", UpdateProfileView.as_view(), name="profile_update"),
    path("profile/change-password/", ChangePasswordView.as_view(), name="change_password"),
]