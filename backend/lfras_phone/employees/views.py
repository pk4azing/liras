# CDCCD/employees/views.py
from __future__ import annotations

from django.conf import settings
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from .serializers import (
    EmployeeListSerializer,
    EmployeeCreateSerializer,   # ← fixed
    EmployeeUpdateSerializer,   # ← fixed
    EmployeeDetailSerializer,
)

# ---------- helpers ----------

def _email_domain(email: str) -> str:
    return (email or "").split("@")[-1].lower().strip()

def _login_url() -> str:
    return getattr(settings, "FRONTEND_LOGIN_URL", "/login")

# ---------- permissions ----------

class IsClientUser(permissions.BasePermission):
    message = _("You do not have permission to perform this action.")

    def has_permission(self, request: Request, view: APIView) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if not getattr(request.user, "client_id", None):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return str(request.user.user_category) in {
            User.UserCategory.SUPERADMIN,
            User.UserCategory.ADMIN,
        }

    def has_object_permission(self, request: Request, view: APIView, obj: User) -> bool:
        if getattr(request.user, "client_id", None) != getattr(obj, "client_id", None):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return str(request.user.user_category) in {
            User.UserCategory.SUPERADMIN,
            User.UserCategory.ADMIN,
        }

# ---------- views ----------

class EmployeeListCreateAPIView(APIView):
    permission_classes = [IsClientUser]

    def get(self, request: Request) -> Response:
        qs = User.objects.filter(client_id=request.user.client_id).order_by("-id")

        search = request.query_params.get("search")
        is_active = request.query_params.get("is_active")
        category = request.query_params.get("user_category")

        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(full_name__icontains=search)
                | Q(username__icontains=search)
            )
        if is_active in {"true", "false"}:
            qs = qs.filter(is_active=(is_active == "true"))
        if category:
            qs = qs.filter(user_category=category)

        return Response(EmployeeListSerializer(qs, many=True).data, status=status.HTTP_200_OK)

    def post(self, request: Request) -> Response:
        creator_domain = _email_domain(request.user.email)
        payload_domain = _email_domain(request.data.get("email", ""))

        if not creator_domain or creator_domain != payload_domain:
            return Response(
                {"detail": _("Employee email domain must match your organization domain.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ser = EmployeeCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        employee: User = ser.save(
            client_id=request.user.client_id,
            client_code=request.user.client_code or f"LFRAS_C_{request.user.client_id}",
            user_category=ser.validated_data.get("user_category", User.USER_CATEGORY_DEFAULT),
        )

        employee_code = f"LFRAS_C_{employee.client_id}_EMP_{employee.id}"
        generated_password: str | None = getattr(ser, "generated_password", None)

        try:
            from django.core.mail import send_mail
            subject = "Your LFRAS employee account"
            lines = [
                f"Hello {employee.full_name or employee.email},",
                "",
                f"Your account has been created for client {employee.client_code}.",
                f"Login URL: {_login_url()}",
            ]
            if generated_password:
                lines.append(f"Temporary Password: {generated_password}")
            lines += ["", f"Username (audit): {employee.username}", f"Employee Code: {employee_code}"]
            send_mail(
                subject,
                "\n".join(lines),
                getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@lfras"),
                [employee.email],
                fail_silently=True,
            )
        except Exception:
            pass

        out = EmployeeDetailSerializer(employee).data
        out["employee_code"] = employee_code
        out["login_url"] = _login_url()
        return Response(out, status=status.HTTP_201_CREATED)


class EmployeeDetailAPIView(APIView):
    permission_classes = [IsClientUser]

    def _get_obj(self, request: Request, pk: int) -> User:
        from rest_framework.exceptions import NotFound
        obj = User.objects.filter(pk=pk, client_id=request.user.client_id).first()
        if not obj:
            raise NotFound(_("Employee not found."))
        self.check_object_permissions(request, obj)
        return obj

    def get(self, request: Request, pk: int) -> Response:
        obj = self._get_obj(request, pk)
        data = EmployeeDetailSerializer(obj).data
        data["employee_code"] = f"LFRAS_C_{obj.client_id}_EMP_{obj.id}"
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request: Request, pk: int) -> Response:
        obj = self._get_obj(request, pk)

        new_email = request.data.get("email")
        if new_email:
            cdomain = _email_domain(request.user.email)
            ndomain = _email_domain(new_email)
            if not cdomain or cdomain != ndomain:
                return Response(
                    {"detail": _("New email domain must match your organization domain.")},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        ser = EmployeeUpdateSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        obj = ser.save()

        data = EmployeeDetailSerializer(obj).data
        data["employee_code"] = f"LFRAS_C_{obj.client_id}_EMP_{obj.id}"
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request: Request, pk: int) -> Response:
        return self.patch(request, pk)

    def delete(self, request: Request, pk: int) -> Response:
        obj = self._get_obj(request, pk)
        obj.is_active = False
        obj.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)