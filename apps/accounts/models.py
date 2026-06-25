from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MANAGER = 'manager', 'Menejer'
        WAITER = 'waiter', 'Ofitsiant'
        CASHIER = 'cashier', 'Kassir'
        CHEF = 'chef', 'Oshpaz'
        DELIVERY = 'delivery', 'Kuryer'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.WAITER)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Foydalanuvchi'
        verbose_name_plural = 'Foydalanuvchilar'

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
