from django.db import models
from django.conf import settings


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Kutilmoqda'
        CONFIRMED = 'confirmed', 'Tasdiqlangan'
        PREPARING = 'preparing', 'Tayyorlanmoqda'
        READY = 'ready', 'Tayyor'
        SERVED = 'served', 'Berildi'
        COMPLETED = 'completed', 'Yakunlangan'
        CANCELLED = 'cancelled', 'Bekor qilingan'

    class OrderType(models.TextChoices):
        DINE_IN = 'dine_in', 'Zalda'
        TAKEAWAY = 'takeaway', 'Olib ketish'
        DELIVERY = 'delivery', 'Yetkazib berish'

    order_number = models.CharField(max_length=20, unique=True)
    table = models.ForeignKey(
        'tables.Table', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    waiter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='waiter_orders'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.DINE_IN)
    customer_name = models.CharField(max_length=200, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Buyurtma'
        verbose_name_plural = 'Buyurtmalar'
        ordering = ['-created_at']

    def __str__(self):
        return f"Buyurtma #{self.order_number} - {self.get_status_display()}"

    def calculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        discount_amount = total * (self.discount / 100)
        self.total_amount = total - discount_amount
        self.save(update_fields=['total_amount'])
        return self.total_amount


class OrderItem(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Kutilmoqda'
        PREPARING = 'preparing', 'Tayyorlanmoqda'
        READY = 'ready', 'Tayyor'
        SERVED = 'served', 'Berildi'
        CANCELLED = 'cancelled', 'Bekor qilingan'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey('menu.MenuItem', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Buyurtma elementi'
        verbose_name_plural = 'Buyurtma elementlari'

    def __str__(self):
        return f"{self.menu_item.name} x{self.quantity}"

    @property
    def subtotal(self):
        return self.price * self.quantity

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.menu_item.price
        super().save(*args, **kwargs)
