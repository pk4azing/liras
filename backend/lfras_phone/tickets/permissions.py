from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsTicketViewer(BasePermission):
    """
    Anyone (CD or LD) can view tickets for their client_id.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # visibility limited by client_id
        return getattr(request.user, "client_id", None) == obj.client_id


class CanCreateTicket(BasePermission):
    """
    Only CD side creates tickets. We treat CD as is_staff == True.
    """
    def has_permission(self, request, view):
        if request.method != "POST":
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class CanEditTicket(BasePermission):
    """
    - CD (is_staff) can edit any ticket in their client space.
    - LD can edit *only* tickets assigned to them AND only limited fields
      (status, progress, add comments via the comments endpoint).
    """
    ALLOWED_FOR_LD = {"status", "progress"}

    def has_object_permission(self, request, view, obj):
        user = request.user
        if request.method in SAFE_METHODS:
            return True

        if getattr(user, "client_id", None) != obj.client_id:
            return False

        if getattr(user, "is_staff", False):
            return True  # CD full edit

        # LD: must be assignee and only allowed fields
        if obj.assigned_ld_email and obj.assigned_ld_email.lower() == getattr(user, "email", "").lower():
            if request.method in ("PATCH", "PUT"):
                incoming = set(request.data.keys())
                return incoming.issubset(self.ALLOWED_FOR_LD)
            return True
        return False