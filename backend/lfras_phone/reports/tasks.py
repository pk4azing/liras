# reports/tasks.py
from __future__ import annotations

import logging
from typing import Any, Iterable, Optional, Tuple, Callable

from django.apps import apps
from django.conf import settings
from django.core.mail import send_mail as django_send_mail
from django.db import transaction
from django.utils import timezone

# Optional Celery support ------------------------------------------------------
try:
    from celery import shared_task  # type: ignore
except Exception:  # Celery not installed / not configured
    def shared_task(*dargs, **dkwargs):  # no-op decorator
        def _wrap(func):
            return func
        return _wrap

log = logging.getLogger(__name__)


# Email sending adapter --------------------------------------------------------
def _resolve_mailer() -> Callable[..., int]:
    """
    Prefer your utils.email_utils.send_email(to, subject, body, attachments=None)
    Fallback to Django's send_mail(subject, message, from_email, recipient_list, ...)
    Returns a callable with a uniform signature returning 'int' emails sent.
    """
    try:
        from utils.email_utils import send_email as project_send_email  # type: ignore

        def _send(to: Iterable[str], subject: str, body: str, attachments: Optional[list] = None) -> int:
            # Normalize 'to' to list[str]
            recipients = list(to) if isinstance(to, (list, tuple, set)) else [str(to)]
            return int(project_send_email(recipients, subject, body, attachments=attachments))

        return _send
    except Exception:
        from_addr = getattr(settings, "DEFAULT_FROM_EMAIL", None)

        def _send(to: Iterable[str], subject: str, body: str, attachments: Optional[list] = None) -> int:
            recipients = list(to) if isinstance(to, (list, tuple, set)) else [str(to)]
            # Attachments ignored in fallback; add if you later need EmailMessage
            return django_send_mail(subject, body, from_addr, recipients, fail_silently=False)

        return _send


send_via_email = _resolve_mailer()


# Model resolution -------------------------------------------------------------
def _resolve_report_model() -> Tuple[type, str]:
    """
    Try several common class names so this file works even if your model is
    named differently. Returns (ModelClass, discovered_name).
    """
    candidates = ["ReportRequest", "ScheduledReport", "ReportSchedule", "ReportJob"]
    for name in candidates:
        try:
            Model = apps.get_model("reports", name)
            if Model is not None:
                return Model, name
        except Exception:
            pass
    raise ImportError(
        "Could not find a scheduled report model in 'reports' app. "
        "Tried: ReportRequest, ScheduledReport, ReportSchedule, ReportJob."
    )


def _now():
    return timezone.now()


# Field helpers ----------------------------------------------------------------
def _str_fields(Model) -> set[str]:
    try:
        return {f.name for f in Model._meta.get_fields()}  # type: ignore[attr-defined]
    except Exception:
        return set()


def _is_active(obj: Any, fields: set[str]) -> bool:
    # Prefer explicit booleans/flags if present; otherwise assume it's active
    if "is_active" in fields:
        return bool(getattr(obj, "is_active", True))
    if "active" in fields:
        return bool(getattr(obj, "active", True))
    if "status" in fields:
        return str(getattr(obj, "status", "")).lower() in {"active", "enabled", "pending", "scheduled"}
    return True


def _due_at(obj: Any, fields: set[str]):
    """
    Return the datetime the job is due to run, based on the first matching field.
    """
    for candidate in ("next_run_at", "scheduled_for", "run_at", "when", "execute_at", "due_at"):
        if candidate in fields:
            return getattr(obj, candidate, None)
    # If there's a cron or interval model, we treat as due if never run
    if "last_run_at" in fields:
        return getattr(obj, "last_run_at", None) or _now()
    return None


def _should_run(obj: Any, fields: set[str], now) -> bool:
    if not _is_active(obj, fields):
        return False
    due = _due_at(obj, fields)
    if due is None:
        # If we cannot find a due time, be conservative and skip
        return False
    try:
        return due <= now
    except Exception:
        return False


def _recipient_list(obj: Any, fields: set[str]) -> list[str]:
    # Try common patterns
    for fname in ("recipients", "emails", "to", "to_emails"):
        if fname in fields:
            val = getattr(obj, fname, None)
            if not val:
                return []
            if isinstance(val, str):
                # split on common delimiters
                parts = [p.strip() for p in val.replace(";", ",").split(",") if p.strip()]
                return parts
            if isinstance(val, (list, tuple, set)):
                return [str(x).strip() for x in val if str(x).strip()]
    # Single FK/User?
    if "user" in fields:
        user = getattr(obj, "user", None)
        email = getattr(user, "email", None)
        if email:
            return [email]
    return []


def _subject_for(obj: Any, fields: set[str]) -> str:
    for fname in ("subject", "title", "name"):
        if fname in fields:
            val = getattr(obj, fname, None)
            if val:
                return str(val)
    return "Scheduled Report"


def _body_for(obj: Any, fields: set[str]) -> str:
    # If your model stores body/content, prefer it. Else, generate a basic text body.
    for fname in ("body", "content", "message"):
        if fname in fields:
            val = getattr(obj, fname, None)
            if val:
                return str(val)
    # Fallback simple body (you can inject your real report here)
    return "Hello,\n\nPlease find your scheduled report attached or summarized.\n\nRegards,\nReports"


def _attachments_for(obj: Any, fields: set[str]) -> Optional[list]:
    # If your model has an attachments relation or file field, plug it here.
    # We keep this generic; return None to skip.
    return None


def _mark_executed(obj: Any, fields: set[str], now) -> None:
    """
    Update timing/status fields safely if they exist.
    """
    changed = False
    if "last_run_at" in fields:
        setattr(obj, "last_run_at", now)
        changed = True

    # Compute next_run_at if interval/cron is defined; otherwise clear next_run_at
    if "next_run_at" in fields:
        next_val = getattr(obj, "next_run_at", None)
        new_next = None

        # Try interval fields
        for ival_name in ("interval_minutes", "interval_min", "every_minutes", "frequency_minutes"):
            if ival_name in fields:
                try:
                    mins = int(getattr(obj, ival_name) or 0)
                    if mins > 0:
                        new_next = now + timezone.timedelta(minutes=mins)
                except Exception:
                    pass

        # If there's a generic 'interval_seconds'
        if new_next is None and "interval_seconds" in fields:
            try:
                secs = int(getattr(obj, "interval_seconds") or 0)
                if secs > 0:
                    new_next = now + timezone.timedelta(seconds=secs)
            except Exception:
                pass

        # If no interval found, keep whatever was there or set None
        setattr(obj, "next_run_at", new_next or next_val)
        changed = True

    if "status" in fields:
        try:
            setattr(obj, "status", "sent")
            changed = True
        except Exception:
            pass

    if changed:
        obj.save(update_fields=[f for f in ("last_run_at", "next_run_at", "status") if f in fields])
    else:
        obj.save()  # safe fallback


# Core task --------------------------------------------------------------------
def _iter_due_requests(now) -> Iterable[Any]:
    """
    Iterate all objects in the discovered reports model that should run now.
    We filter in Python so we don't depend on exact field names.
    """
    Model, model_name = _resolve_report_model()
    fields = _str_fields(Model)
    try:
        qs = Model.objects.all()
    except Exception as exc:
        log.error("Unable to query %s: %s", model_name, exc)
        return []

    def _filter(obj):
        try:
            return _should_run(obj, fields, now)
        except Exception:
            return False

    # Materialize and filter in Python.
    return [obj for obj in qs if _filter(obj)]


def _send_one(obj: Any) -> bool:
    """
    Send a single report email for 'obj'. Returns True if at least one email was sent.
    """
    Model = obj.__class__
    fields = _str_fields(Model)
    to = _recipient_list(obj, fields)
    if not to:
        log.warning("Skipping %s(pk=%s): no recipients", Model.__name__, getattr(obj, "pk", None))
        return False

    subject = _subject_for(obj, fields)
    body = _body_for(obj, fields)
    attachments = _attachments_for(obj, fields)

    try:
        sent = send_via_email(to, subject, body, attachments=attachments)
        ok = int(sent) > 0
        if not ok:
            log.warning("Email send reported 0 recipients for %s(pk=%s)", Model.__name__, getattr(obj, "pk", None))
        return ok
    except Exception as exc:
        log.exception("Failed sending email for %s(pk=%s): %s", Model.__name__, getattr(obj, "pk", None), exc)
        return False


@shared_task(name="reports.send_scheduled_reports")
def send_scheduled_reports() -> int:
    """
    Scan for due report requests and send them. Returns count successfully sent.
    - If Celery is installed, this function can be queued with .delay().
    - If not, it runs synchronously when called.
    """
    now = _now()
    due = list(_iter_due_requests(now))
    if not due:
        log.info("No scheduled reports due at %s", now.isoformat())
        return 0

    sent_count = 0
    for obj in due:
        with transaction.atomic():
            if _send_one(obj):
                sent_count += 1
                try:
                    _mark_executed(obj, _str_fields(obj.__class__), now)
                except Exception as exc:
                    log.exception("Failed to mark report executed for %s(pk=%s): %s",
                                  obj.__class__.__name__, getattr(obj, "pk", None), exc)

    log.info("Sent %d/%d scheduled report(s)", sent_count, len(due))
    return sent_count


# --- Compatibility wrapper for older call sites -------------------------------
def run_schedule_now(use_celery: bool = True):
    """
    Backward‑compatible entry point used by older code.
    If Celery is available and use_celery=True, enqueue the task; else run inline.
    """
    try:
        if use_celery and hasattr(send_scheduled_reports, "delay"):
            return send_scheduled_reports.delay()  # AsyncResult
    except Exception:
        pass
    return send_scheduled_reports()