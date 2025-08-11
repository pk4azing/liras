from __future__ import annotations

import json
from typing import Optional

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import Template, Context
from django.utils.html import strip_tags

from activities.models import ActivityFile
from configs.models import EmailTemplate


def _render_template(et: Optional[EmailTemplate], context: dict) -> tuple[str, str]:
    """
    Render subject & body (html or text). Fallback to a default if template not found.
    """
    default_subject = "File Expiry Reminder"
    default_body = (
        "Hello,\n\n"
        "The file '{{ file_name }}' in activity '{{ activity_title }}' will expire in {{ days_remaining }} day(s) "
        "on {{ expires_at }}.\n\nS3 Path: {{ s3_key }}\n\nThanks."
    )

    if not et:
        t = Template(default_body)
        body_text = t.render(Context(context))
        return default_subject, body_text

    subject = et.subject_template or default_subject
    body = et.body_template or default_body

    subject_r = Template(subject).render(Context(context))
    body_r = Template(body).render(Context(context))
    return subject_r, body_r


def send_expiry_email(f: ActivityFile, *, days_remaining: int):
    activity = f.activity
    to_email = f.uploader.email  # CCD User
    cc_email = activity.created_by.email if activity.created_by and activity.created_by.email else ""

    # Find a matching email template for "expiry" type for this client/customer if present
    et = EmailTemplate.objects.filter(
        client_id=activity.client_id,
        customer_id=activity.customer.customer_id,
        template_type="expiry",
        is_active=True,
    ).order_by("-updated_at").first()

    context = {
        "days_remaining": days_remaining,
        "file_name": f.file_name,
        "s3_key": f.s3_key,
        "s3_url": f.s3_url,
        "expires_at": f.expires_at,
        "activity_title": activity.title,
        "activity_id": activity.activity_id,
        "client_id": activity.client_id,
        "customer_id": activity.customer.customer_id,
    }

    subject, body = _render_template(et, context)

    # Compose email
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@example.com")
    msg = EmailMultiAlternatives(subject=subject, body=strip_tags(body), from_email=from_email, to=[to_email])
    if cc_email:
        msg.cc = [cc_email]
    # If body contains HTML, attach as alternative; otherwise the text version is fine.
    if "<html" in body.lower() or "</p>" in body.lower():
        msg.attach_alternative(body, "text/html")
    msg.send(fail_silently=True)

    # Log
    from .models import EmailLog
    EmailLog.objects.create(
        to_email=to_email, cc_email=cc_email, subject=subject,
        template_key=et.template_key if et else "",
        context_json=context, success=True
    )