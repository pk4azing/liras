from django.core.mail import EmailMessage
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_email(subject, body, to_emails, from_email=None, attachments=None):
    """
    Generic reusable email sender.
    """
    if isinstance(to_emails, str):
        to_emails = [to_emails]

    if not from_email:
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)
        if not from_email:
            raise ValueError("DEFAULT_FROM_EMAIL is not set in settings.")

    try:
        email = EmailMessage(subject, body, from_email, to_emails)

        if attachments:
            for attachment in attachments:
                if isinstance(attachment, tuple) and len(attachment) == 3:
                    email.attach(attachment[0], attachment[1], attachment[2])
                else:
                    logger.warning(f"Invalid attachment format: {attachment}")

        email.send(fail_silently=False)
        logger.info(f"Email sent to: {', '.join(to_emails)}")
        return True

    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False