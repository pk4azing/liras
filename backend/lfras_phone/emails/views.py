from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class SendTestEmailView(APIView):
    """
    Simple API to test email sending.
    """
    def get(self, request, *args, **kwargs):
        return Response({"message": "Email service is working."}, status=status.HTTP_200_OK)