from django.urls import path, include
from rest_framework.routers import DefaultRouter
from clients.views import ClientCDViewSet, CDEmployeeViewSet, CCDUserViewSet

router = DefaultRouter()
router.register(r'clientcd', ClientCDViewSet, basename='clientcd')
router.register(r'cdemployee', CDEmployeeViewSet, basename='cdemployee')
router.register(r'ccduser', CCDUserViewSet, basename='ccduser')

urlpatterns = [
    path('', include(router.urls)),
]