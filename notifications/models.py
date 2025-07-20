from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    LEVEL_CHOICES = [
        ('Good', 'Good'),
        ('Bad', 'Bad'),
        ('Critical', 'Critical'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='Good')
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"To {self.user.email} | {self.level} | {self.created_at.strftime('%Y-%m-%d %H:%M')}"