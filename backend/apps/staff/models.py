from django.db import models
from django.conf import settings


class Shift(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Faol'
        COMPLETED = 'completed', 'Yakunlangan'

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shifts'
    )
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Smena'
        verbose_name_plural = 'Smenalar'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.started_at.date()}"


class Attendance(models.Model):
    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendances'
    )
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    is_present = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Davomat'
        verbose_name_plural = 'Davomat'
        unique_together = ['employee', 'date']

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date}"
