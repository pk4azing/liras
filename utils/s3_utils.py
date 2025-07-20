import boto3
import zipfile
import io
import json
from io import BytesIO
from django.conf import settings
from botocore.exceptions import ClientError

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

BUCKET_NAME = "lfras-ccd-data"  # You can also move this to settings or constants


def get_file_from_s3(s3_path: str):
    """
    Download a file from S3 and return it as a BytesIO object (for FileResponse).
    """
    bucket = settings.AWS_STORAGE_BUCKET_NAME
    try:
        file_stream = BytesIO()
        s3_client.download_fileobj(Bucket=bucket, Key=s3_path, Fileobj=file_stream)
        file_stream.seek(0)
        return file_stream
    except ClientError as e:
        raise Exception(f"S3 download failed: {e.response['Error']['Message']}")


# -------- Path Generators --------

def generate_activity_path(ccd_id, activity_id):
    return f"{ccd_id}/activities/{activity_id}"

def generate_zip_path(ccd_id, activity_id):
    return f"{ccd_id}/activities/{activity_id}/zip/final.zip"

def generate_file_path(ccd_id, activity_id, filename):
    return f"{ccd_id}/activities/{activity_id}/files/{filename}"

def generate_config_path(ccd_id, filename):
    return f"{ccd_id}/configs/{filename}"

def generate_report_path(ccd_id, filename):
    return f"{ccd_id}/reports/{filename}"


# -------- Folder Creation --------

def create_s3_folder(path_prefix):
    """
    Create an empty folder (prefix) in S3.
    """
    try:
        s3_client.put_object(Bucket=BUCKET_NAME, Key=(path_prefix.rstrip('/') + '/'))
    except ClientError as e:
        print(f"[S3 Folder Creation Error] {e}")


def create_activity_folder_in_s3(ccd_id, activity_id):
    """
    Create base folders for an activity in S3.
    """
    base_path = generate_activity_path(ccd_id, activity_id)
    create_s3_folder(base_path + "/files")
    create_s3_folder(base_path + "/zip")


# -------- Upload & Read --------

def upload_file_to_s3(file_content, s3_path):
    """
    Uploads file content to S3.
    """
    try:
        s3_client.upload_fileobj(file_content, BUCKET_NAME, s3_path)
        return True
    except ClientError as e:
        print(f"[S3 Upload Error] {e}")
        return False

def upload_file_to_activity(ccd_id, activity_id, filename, file_obj):
    """
    Upload a file under the activity folder in /files/.
    """
    try:
        s3_path = generate_file_path(ccd_id, activity_id, filename)
        s3_client.upload_fileobj(file_obj, BUCKET_NAME, s3_path)
        return s3_path
    except ClientError as e:
        print(f"[S3 Upload Activity File Error] {e}")
        return None


def upload_report_to_s3(file_name, content):
    """
    Uploads a report (as plain text) to the reports folder in S3.
    Returns the full S3 path if successful, else None.
    """
    try:
        s3_path = generate_report_path("global", file_name)  # You can replace 'global' with CD_ID or CCD_ID if needed
        file_obj = io.BytesIO(content.encode("utf-8"))
        s3_client.upload_fileobj(file_obj, BUCKET_NAME, s3_path)
        return s3_path
    except ClientError as e:
        print(f"[Report Upload Error] {e}")
        return None



def read_json_from_s3(s3_path):
    """
    Reads and parses a JSON file from S3 (used for validation config).
    """
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_path)
        content = response['Body'].read()
        return json.loads(content)
    except ClientError as e:
        print(f"[S3 Read Error] {e}")
        return None

def read_template_from_s3(s3_path):
    """
    Reads a text-based email template from S3.
    """
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_path)
        content = response['Body'].read().decode('utf-8')
        return content
    except ClientError as e:
        print(f"[S3 Template Error] {e}")
        return ""


# -------- Zipping Logic --------

def zip_activity_files(ccd_id, activity_id):
    """
    Zips all files under /files and uploads to /zip folder.
    Returns path to zip if successful, else None.
    """
    prefix = f"{ccd_id}/activities/{activity_id}/files/"
    zip_buffer = io.BytesIO()

    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix)
        if 'Contents' not in response:
            return None

        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for obj in response['Contents']:
                key = obj['Key']
                if key.endswith('/'):
                    continue
                file_obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
                content = file_obj['Body'].read()
                filename = key.split('/')[-1]
                zipf.writestr(filename, content)

        zip_buffer.seek(0)
        final_zip_path = generate_zip_path(ccd_id, activity_id)
        s3_client.upload_fileobj(zip_buffer, BUCKET_NAME, final_zip_path)
        return final_zip_path

    except Exception as e:
        print(f"[Zip Error] {e}")
        return None