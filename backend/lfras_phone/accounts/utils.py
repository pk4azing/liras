# CDCCD/accounts/utility.py
from __future__ import annotations

import re
import smtplib
import ssl
from email.message import EmailMessage
from typing import Optional, Dict, Any


def normalize_us_phone(raw: str) -> str:
    """
    Normalize a US phone number to E.164 (+1XXXXXXXXXX).
    Leaves non‑US or malformed inputs untouched.
    """
    if not raw:
        return ""
    digits = re.sub(r"\D+", "", raw)

    # If it's already 11 digits and starts with country code 1
    if len(digits) == 11 and digits.startswith("1"):
        return f"+{digits}"

    # Plain 10-digit US number -> add +1
    if len(digits) == 10:
        return f"+1{digits}"

    # Otherwise return the original string (it might be an international E.164 already)
    return raw


def send_email(
    subject: str,
    body: str,
    to_email: str,
    smtp: Dict[str, Any],
    *,
    subtype: str = "plain",
    from_email: Optional[str] = None,
) -> Optional[str]:
    """
    Send an email using per-client SMTP settings (dict).

    Expected smtp keys:
      host (str), port (int), username (str or None), password (str or None),
      use_tls (bool), use_ssl (bool), from_email (str, optional)

    Returns the Message-ID on success (if available), or None if not provided by the server.
    Raises smtplib.SMTPException (or subclasses) on failure.
    """
    host = smtp.get("host")
    port = int(smtp.get("port") or 0)
    username = smtp.get("username")
    password = smtp.get("password")
    use_tls = bool(smtp.get("use_tls"))
    use_ssl = bool(smtp.get("use_ssl"))
    default_from = smtp.get("from_email")

    if not host or not port:
        raise smtplib.SMTPException("SMTP host/port missing in smtp config.")

    sender = from_email or default_from or (username if username else f"no-reply@{host}")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_email
    msg.set_content(body, subtype=subtype)

    # SSL vs STARTTLS vs plain
    if use_ssl:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(host=host, port=port, context=context) as server:
            if username and password:
                server.login(username, password)
            resp = server.send_message(msg)
    else:
        with smtplib.SMTP(host=host, port=port) as server:
            server.ehlo()
            if use_tls:
                context = ssl.create_default_context()
                server.starttls(context=context)
                server.ehlo()
            if username and password:
                server.login(username, password)
            resp = server.send_message(msg)

    # smtplib returns a dict of {recipient: error} for failures; on success it’s empty.
    if resp:
        # At least one recipient failed; raise a generic error
        raise smtplib.SMTPException(f"Failed recipients: {resp}")

    # Message-ID is often added by SMTP server; fallback to None
    return msg.get("Message-ID")