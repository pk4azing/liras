from django.db import models
from django.conf import settings

TICKET_STATUS_CHOICES = [
    ('Open', 'Open'),
    ('In Progress', 'In Progress'),
    ('Resolved', 'Resolved'),
    ('Closed', 'Closed'),
]

class Ticket(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=TICKET_STATUS_CHOICES, default='Open')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='created_tickets'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='assigned_tickets'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket {self.id} - {self.title}"


class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    commented_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    comment = models.TextField()
    commented_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.commented_by.email} on Ticket {self.ticket.id}"


class TicketHistory(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='history')
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"History for Ticket {self.ticket.id} - {self.action}"