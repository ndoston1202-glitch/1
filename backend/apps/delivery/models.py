from django.db import models
from django.conf import settings


class DeliveryZone(models.Model):
    name = models.CharField(max_length=100)
    min_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estimated_time = models.PositiveIntegerField(default=30, help_text='Daqiqada')
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Yetkazib berish hududi'
        verbose_name_plural = 'Yetkazib berish hududlari'

    def __str__(self):
        return self.name


class Delivery(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Kutilmoqda'
        ASSIGNED = 'assigned', 'Tayinlangan'
        PICKED_UP = 'picked_up', 'Olingan'
        ON_WAY = 'on_way', 'Yo\'lda'
        DELIVERED = 'delivered', 'Yetkazildi'
        FAILED = 'failed', 'Muvaffaqiyatsiz'

    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='delivery')
    courier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='deliveries'
    )
    zone = models.ForeignKey(DeliveryZone, on_delete=models.SET_NULL, null=True, blank=True)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estimated_time = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Yetkazib berish'
        verbose_name_plural = 'Yetkazib berishlar'
        ordering = ['-created_at']

    def __str__(self):
        return f"Yetkazib berish #{self.order.order_number} - {self.get_status_display()}"
