from rest_framework import serializers
from .models import Table, Reservation


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'number', 'capacity', 'status', 'location', 'is_active', 'created_at']


class ReservationSerializer(serializers.ModelSerializer):
    table_number = serializers.IntegerField(source='table.number', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'table', 'table_number', 'customer_name', 'customer_phone',
            'guest_count', 'reserved_at', 'duration', 'status', 'notes', 'created_at'
        ]
