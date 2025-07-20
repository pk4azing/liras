import smtplib
from email.mime.text import MIMEText
from botocore.exceptions import ClientError
import boto3
import logging
from django.conf import settings
from string import Template
from utils.audit_logger import log_event

logger = logging.getLogger(__name__)


def load_email_template_from_s3(bucket_name, template_path):
    s3 = boto3.client('s3')
    try:
        obj = s3.get_object(Bucket=bucket_name, Key=template_path)
        content = obj['Body'].read().decode('utf-8')
        return content
    except ClientError as e:
        logger.error(f"Failed to fetch email template from S3: {e}")
        return None


def render_template(template_str, context):
    try:
        template = Template(template_str)
        return template.safe_substitute(context)
    except Exception as e:
        logger.error(f"Error rendering template: {e}")
        return None


def send_email_using_smtp(subject, recipient, context, template_s3_path, smtp_config, audit_user=None):
    try:
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    except AttributeError:
        logger.error("AWS_STORAGE_BUCKET_NAME is not defined in settings.")
        return False

    template_str = load_email_template_from_s3(bucket_name, template_s3_path)
    if not template_str:
        logger.warning(f"Template at {template_s3_path} not found. Skipping email.")
        return False

    body = render_template(template_str, context)
    if not body:
        logger.warning("Template rendering failed. Skipping email.")
        return False

    message = MIMEText(body)
    message['Subject'] = subject
    message['From'] = smtp_config.get('from_email', smtp_config['username'])
    message['To'] = recipient

    if 'reply_to' in smtp_config:
        message.add_header('Reply-To', smtp_config['reply_to'])

    try:
        if smtp_config.get("use_tls", True):
            server = smtplib.SMTP(smtp_config['host'], smtp_config['port'])
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(smtp_config['host'], smtp_config['port'])

        server.login(smtp_config['username'], smtp_config['password'])
        server.sendmail(message['From'], [recipient], message.as_string())
        server.quit()

        log_event(
            event_type="EMAIL_SENT",
            performed_by=audit_user,
            context={
                "recipient": recipient,
                "template": template_s3_path
            }
        )
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {e}")
        log_event(
            event_type="EMAIL_FAILED",
            performed_by=audit_user,
            context={
                "recipient": recipient,
                "template": template_s3_path,
                "error": str(e)
            }
        )
        return False