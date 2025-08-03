from notifications.models import Notification

def create_notification(user, message, level='Good'):
    Notification.objects.create(
        user=user,
        message=message,
        level=level
    )


def notify_activity_event(user, title, message, cd_id=None, ccd_id=None):
    """
    Creates a new notification for the given user about an activity-related event.

    :param user: User to notify
    :param title: Notification title
    :param message: Notification body
    :param cd_id: Optional ClientCD UUID
    :param ccd_id: Optional CCDUser UUID
    """
    Notification.objects.create(
        user=user,
        title=title,
        message=message,
        cd_id=cd_id,
        ccd_id=ccd_id,
        level='info'
    )