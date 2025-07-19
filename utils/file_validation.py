# utils/file_validation.py

import os
from utils.s3_utils import read_json_from_s3


def validate_file(file_obj, config_dict):
    """
    Validates a single file object based on per-file config.

    Returns:
        (is_valid, reason, expiry_days)
    """
    filename = file_obj.name
    extension = os.path.splitext(filename)[1].lower().lstrip(".")
    config_files = config_dict.get("files", [])

    matching_rule = next((f for f in config_files if f["name"] == filename), None)

    if not matching_rule:
        return False, f"Filename '{filename}' not allowed.", None

    # Extension check
    allowed_exts = matching_rule.get("allowed_extensions", [])
    if allowed_exts and extension not in allowed_exts:
        return False, f"Extension '.{extension}' not allowed for {filename}.", None

    # Keyword check
    required_keywords = matching_rule.get("required_keywords", [])
    if required_keywords:
        content = file_obj.read().decode("utf-8", errors="ignore").lower()
        if not any(kw.lower() in content for kw in required_keywords):
            return False, f"Missing required keywords in {filename}.", None
        file_obj.seek(0)  # reset stream pointer

    expiry_days = matching_rule.get("expiry_days", 0)

    return True, "Valid", expiry_days


def validate_uploaded_files(files_list, config_s3_path):
    """
    Validates all uploaded files based on config.

    Returns:
        List of dicts {filename, valid, reason, expiry_days}
    """
    try:
        config_dict = read_json_from_s3(config_s3_path)
    except Exception as e:
        return [{"filename": f.name, "valid": False, "reason": f"Config error: {e}", "expiry_days": None} for f in files_list]

    results = []
    for f in files_list:
        is_valid, reason, expiry_days = validate_file(f, config_dict)
        results.append({
            "filename": f.name,
            "valid": is_valid,
            "reason": reason,
            "expiry_days": expiry_days
        })

    return results


def get_expected_filenames_from_config(config_s3_path):
    """
    Returns list of expected filenames from the config.
    """
    try:
        config_dict = read_json_from_s3(config_s3_path)
        return [file_rule.get("name") for file_rule in config_dict.get("files", [])]
    except Exception as e:
        print(f"[Config Parsing Error] {e}")
        return []


def validate_uploaded_file(file_obj, config_s3_path):
    """
    Validates a single uploaded file based on config stored in S3.
    """
    config_dict = read_json_from_s3(config_s3_path)
    return validate_file(file_obj, config_dict)