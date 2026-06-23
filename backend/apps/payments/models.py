from django.db import models
from django.conf import settings


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = 'cash', 'Naqd pul'
        CARD = 'card', 'Karta'
        PAYME = 'payme', 'Payme'
        CLICK = 'click', 'Click'
        TRANSFER = 'transfer', 'O\'tkazma'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Kutilmoqda'
        COMPLETED = 'completed', 'To\'langan'
        FAILED = 'failed', 'Muvaffaqiyatsiz'
        REFUNDED = 'refunded', 'Qaytarilgan'

    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='payment')
    cashier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CASH)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    change_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'To\'lov'
        verbose_name_plural = 'To\'lovlar'
        ordering = ['-created_at']

    def __str__(self):
        return f"To'lov #{self.order.order_number} - {self.get_method_display()}"
