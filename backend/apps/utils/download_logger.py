from downloads.models import DownloadLog

def log_download(user, file_name, file_url, source="other"):
    DownloadLog.objects.create(
        user=user,
        file_name=file_name,
        file_url=file_url,
        source=source
    )