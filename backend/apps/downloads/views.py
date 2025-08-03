from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse

from downloads.models import DownloadLog
from utils.s3_utils import get_file_from_s3
from utils.notification_utils import create_notification

class DownloadFileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        s3_path = request.query_params.get('s3_path')
        if not s3_path:
            return Response({"error": "Missing 's3_path' parameter."}, status=400)

        try:
            file_stream = get_file_from_s3(s3_path)
            DownloadLog.objects.create(user=request.user, s3_path=s3_path)

            create_notification(
                user=request.user,
                message=f"You downloaded a file: {s3_path}",
                level="Good"
            )

            return FileResponse(file_stream, as_attachment=True, filename=s3_path.split("/")[-1])
        except Exception as e:
            return Response({"error": str(e)}, status=500)