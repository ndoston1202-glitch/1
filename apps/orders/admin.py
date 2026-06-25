from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'table', 'waiter', 'status', 'order_type', 'total_amount', 'created_at']
    list_filter = ['status', 'order_type']
    search_fields = ['order_number', 'customer_name', 'customer_phone']
    inlines = [OrderItemInline]
    readonly_fields = ['order_number', 'total_amount']
