# utils/audit_logger.py

import json
from django.utils.timezone import now
from audit.models import AuditLog


def log_event(event_type, performed_by, cd_id=None, ccd_id=None, context=None):
    """
    Logs an event to the AuditLog table.

    :param event_type: str – Name of the event (e.g., 'activity_started')
    :param performed_by: User object (CD or CCD user)
    :param cd_id: Optional – CD User ID or org identifier
    :param ccd_id: Optional – CCD ID (customer identifier)
    :param context: Optional – dictionary of extra metadata (e.g., file name, reason)
    """
    try:
        log = AuditLog.objects.create(
            event_type=event_type,
            performed_by=performed_by,
            cd_id=cd_id,
            ccd_id=ccd_id,
            event_time=now(),
            context=json.dumps(context or {})
        )
        return log
    except Exception as e:
        print(f"[AuditLog Error] Failed to log event: {event_type}, Error: {e}")
        return None