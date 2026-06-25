from django.contrib import admin
from .models import Category, MenuItem, Printer


@admin.register(Printer)
class PrinterAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'ip_address', 'is_active']
    list_editable = ['is_active']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'order']
    list_editable = ['is_active', 'order']
    search_fields = ['name']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'printer', 'price', 'cost_price', 'is_available', 'preparation_time']
    list_editable = ['price', 'cost_price', 'is_available']
    list_filter = ['category', 'is_available', 'is_vegetarian', 'is_spicy']
    search_fields = ['name', 'description']
