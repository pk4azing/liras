from django.urls import path

from .views import EmployeeListCreateAPIView, EmployeeDetailAPIView

urlpatterns = [
    path("employees/", EmployeeListCreateAPIView.as_view(), name="employee-list-create"),
    path("employees/<int:pk>/", EmployeeDetailAPIView.as_view(), name="employee-detail"),
]