from django.contrib import admin
from .models import Shift, Attendance


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['employee', 'started_at', 'ended_at', 'status']
    list_filter = ['status']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'check_in', 'check_out', 'is_present']
    list_filter = ['is_present', 'date']
