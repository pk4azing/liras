from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI schema config
schema_view = get_schema_view(
    openapi.Info(
        title="LFRAS CD/CCD API",
        default_version="v1",
        description="API documentation for LFRAS Customer Dashboard & Customer's Client Dashboard",
        contact=openapi.Contact(email="support@lfras.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # Apps
    path("api/accounts/", include("accounts.urls")),
    path("api/customers/", include("customers.urls")),
    path("api/activities/", include("activities.urls")),
    path("api/configs/", include("configs.urls")),
    path("api/emails/", include("emails.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/tickets/", include("tickets.urls")),

    # API Docs
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]

# Static & media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)