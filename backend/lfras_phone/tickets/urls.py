# tickets/urls.py
from django.urls import path
from .views import (
    TicketListCreateView,
    TicketDetailView,
    TicketCommentListCreateView,
)

app_name = "tickets"

urlpatterns = [
    # Tickets
    path("tickets/", TicketListCreateView.as_view(), name="ticket-list-create"),
    path("tickets/<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),

    # Comments for a ticket
    path("tickets/<int:ticket_id>/comments/", TicketCommentListCreateView.as_view(), name="ticket-comments"),
]