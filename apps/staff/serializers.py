from rest_framework import serializers
from .models import Shift, Attendance
from django.contrib.auth import get_user_model

User = get_user_model()


class ShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    duration_hours = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = ['id', 'employee', 'employee_name', 'started_at', 'ended_at', 'status', 'notes', 'duration_hours']

    def get_duration_hours(self, obj):
        if obj.ended_at and obj.started_at:
            delta = obj.ended_at - obj.started_at
            return round(delta.total_seconds() / 3600, 2)
        return None


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'date', 'check_in', 'check_out', 'is_present', 'notes']
