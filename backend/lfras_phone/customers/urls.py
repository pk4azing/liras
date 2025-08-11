from django.urls import path

from .views import CustomerListCreateAPI, CustomerDetailAPI

urlpatterns = [
    path("customers/", CustomerListCreateAPI.as_view(), name="customer-list-create"),
    path("customers/<int:pk>/", CustomerDetailAPI.as_view(), name="customer-detail"),
]