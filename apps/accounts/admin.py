from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'full_name', 'role', 'phone', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'phone']
    fieldsets = UserAdmin.fieldsets + (
        ('Qo\'shimcha', {'fields': ('role', 'phone', 'avatar')}),
    )

    def full_name(self, obj):
        return obj.get_full_name()
    full_name.short_description = 'To\'liq ism'
