from django.contrib import admin
from .models import DeliveryZone, Delivery


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'delivery_fee', 'estimated_time', 'is_active']
    list_editable = ['is_active']


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ['order', 'courier', 'zone', 'status', 'delivery_fee', 'created_at']
    list_filter = ['status']
    search_fields = ['order__order_number', 'address']
