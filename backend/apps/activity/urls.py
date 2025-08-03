from django.urls import path, include
from rest_framework.routers import DefaultRouter
from activity.views import ActivityViewSet

router = DefaultRouter()
router.register(r'activities', ActivityViewSet, basename='activity')

urlpatterns = [
    path('', include(router.urls)),
]