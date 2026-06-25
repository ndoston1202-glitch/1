from django.contrib import admin
from .models import Table, Reservation


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['number', 'capacity', 'status', 'location', 'is_active']
    list_editable = ['status', 'is_active']
    list_filter = ['status', 'location']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'table', 'guest_count', 'reserved_at', 'status']
    list_filter = ['status']
    search_fields = ['customer_name', 'customer_phone']
