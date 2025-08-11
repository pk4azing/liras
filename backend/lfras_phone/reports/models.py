from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Tuple

from django.conf import settings
from django.db import models
from django.utils import timezone


class ScheduledReport(models.Model):
    class Frequency(models.TextChoices):
        DAILY = "DAILY", "Daily"
        WEEKLY = "WEEKLY", "Weekly"
        MONTHLY = "MONTHLY", "Monthly"
        QUARTERLY = "QUARTERLY", "Quarterly"
        HALF_YEARLY = "HALF_YEARLY", "Half-yearly"
        YEARLY = "YEARLY", "Yearly"

    # tie to tenant
    client_id = models.PositiveBigIntegerField(db_index=True)

    name = models.CharField(max_length=150, default="", blank=True)
    report_type = models.CharField(
        max_length=32,
        choices=getattr(settings, "REPORT_TYPES", [
            ("downloads", "Downloads"),
            ("users", "Users"),
            ("customers", "Customers"),
            ("activities", "Activities"),
        ]),
    )
    requested_format = models.CharField(
        max_length=8,
        choices=[("csv", "CSV"), ("xlsx", "Excel"), ("pdf", "PDF"), ("txt", "Text")],
        default="csv",
    )

    frequency = models.CharField(max_length=16, choices=Frequency.choices)
    active = models.BooleanField(default=True)

    # optional JSON filters (depends on your reporting needs)
    filters = models.JSONField(default=dict, blank=True)

    # run-state
    last_run_at = models.DateTimeField(null=True, blank=True)
    next_run_at = models.DateTimeField(null=True, blank=True)

    # housekeeping
    created_by_id = models.PositiveBigIntegerField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reports_scheduled_reports"
        indexes = [
            models.Index(fields=["client_id", "active"]),
            models.Index(fields=["next_run_at"]),
        ]

    def __str__(self) -> str:
        return self.name or f"ScheduledReport#{self.pk}"

    # ---- period helpers ----------------------------------------------------
    @staticmethod
    def _period_for(frequency: str, now: datetime) -> Tuple[date, date]:
        today = now.date()

        if frequency == ScheduledReport.Frequency.DAILY:
            return today - timedelta(days=1), today  # yesterday -> today (exclusive end)

        if frequency == ScheduledReport.Frequency.WEEKLY:
            # last full week (Mon..Sun) ending yesterday
            end = today
            start = end - timedelta(days=7)
            return start, end

        if frequency == ScheduledReport.Frequency.MONTHLY:
            # last full month
            first_this = today.replace(day=1)
            last_month_end = first_this - timedelta(days=1)
            last_month_start = last_month_end.replace(day=1)
            return last_month_start, last_month_end + timedelta(days=1)

        if frequency == ScheduledReport.Frequency.QUARTERLY:
            # previous quarter
            month = ((today.month - 1) // 3) * 3 + 1
            first_this_q = date(today.year, month, 1)
            first_prev_q_month = month - 3 or 10
            year = today.year if month > 3 else today.year - 1
            first_prev_q = date(year, first_prev_q_month, 1)
            first_this_prev_q = date(year, first_prev_q_month + 3, 1)
            return first_prev_q, first_this_prev_q

        if frequency == ScheduledReport.Frequency.HALF_YEARLY:
            # previous half-year
            if today.month <= 6:
                start = date(today.year - 1, 7, 1)
                end = date(today.year, 1, 1)
            else:
                start = date(today.year, 1, 1)
                end = date(today.year, 7, 1)
            return start, end

        if frequency == ScheduledReport.Frequency.YEARLY:
            start = date(today.year - 1, 1, 1)
            end = date(today.year, 1, 1)
            return start, end

        # default fallback: yesterday
        return today - timedelta(days=1), today

    @staticmethod
    def _add_interval(frequency: str, from_dt: datetime) -> datetime:
        if frequency == ScheduledReport.Frequency.DAILY:
            return from_dt + timedelta(days=1)
        if frequency == ScheduledReport.Frequency.WEEKLY:
            return from_dt + timedelta(weeks=1)
        if frequency == ScheduledReport.Frequency.MONTHLY:
            # naive month add (ok for scheduling)
            month = from_dt.month + 1
            year = from_dt.year + (month - 1) // 12
            month = (month - 1) % 12 + 1
            return from_dt.replace(year=year, month=month, day=1)
        if frequency == ScheduledReport.Frequency.QUARTERLY:
            month = from_dt.month + 3
            year = from_dt.year + (month - 1) // 12
            month = (month - 1) % 12 + 1
            return from_dt.replace(year=year, month=month, day=1)
        if frequency == ScheduledReport.Frequency.HALF_YEARLY:
            month = from_dt.month + 6
            year = from_dt.year + (month - 1) // 12
            month = (month - 1) % 12 + 1
            return from_dt.replace(year=year, month=month, day=1)
        if frequency == ScheduledReport.Frequency.YEARLY:
            return from_dt.replace(year=from_dt.year + 1, month=1, day=1)
        return from_dt + timedelta(days=1)

    def ensure_next_run(self):
        now = timezone.now()
        if not self.next_run_at:
            # align next run to “now” for first execution
            self.next_run_at = now