# accounts/utility/s3_utils.py
from __future__ import annotations
import io
import json
from typing import Any, Optional, Dict

import boto3
from botocore.exceptions import ClientError
from django.conf import settings


def _prefix() -> str:
    p = getattr(settings, "AWS_S3_PREFIX", "") or ""
    return p if not p or p.endswith("/") else p + "/"


def s3_client():
    return boto3.client(
        "s3",
        region_name=getattr(settings, "AWS_REGION_NAME", None),
        aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", None),
        aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", None),
    )


def put_json(bucket: str, key: str, data: Dict[str, Any]) -> None:
    body = json.dumps(data, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    s3_client().put_object(Bucket=bucket, Key=_prefix() + key, Body=body, ContentType="application/json")


def get_json(bucket: str, key: str) -> Optional[Dict[str, Any]]:
    try:
        obj = s3_client().get_object(Bucket=bucket, Key=_prefix() + key)
        raw = obj["Body"].read()
        return json.loads(raw.decode("utf-8"))
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        if code in ("NoSuchKey", "404"):
            return None
        raise


def ensure_folder(bucket: str, key: str) -> None:
    """Create an empty 'folder' marker (key ends with '/')."""
    if not key.endswith("/"):
        key = key + "/"
    try:
        s3_client().put_object(Bucket=bucket, Key=_prefix() + key, Body=b"")
    except ClientError:
        # safe to ignore; folder markers are optional
        pass


def ensure_folders(bucket: str, keys: list[str]) -> None:
    for k in keys:
        ensure_folder(bucket, k)