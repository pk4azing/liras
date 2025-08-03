from django.urls import path
from .views import DownloadFileView

urlpatterns = [
    path('file/', DownloadFileView.as_view(), name='file-download'),
]