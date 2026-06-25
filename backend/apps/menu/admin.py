from django.contrib import admin
from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'order']
    list_editable = ['is_active', 'order']
    search_fields = ['name']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'cost_price', 'is_available', 'preparation_time']
    list_editable = ['price', 'cost_price', 'is_available']
    list_filter = ['category', 'is_available', 'is_vegetarian', 'is_spicy']
    search_fields = ['name', 'description']
