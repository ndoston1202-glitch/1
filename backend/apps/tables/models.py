from django.db import models


class Table(models.Model):
    class Status(models.TextChoices):
        FREE = 'free', 'Bo\'sh'
        OCCUPIED = 'occupied', 'Band'
        RESERVED = 'reserved', 'Bron qilingan'
        CLEANING = 'cleaning', 'Tozalanmoqda'

    number = models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField(default=4)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.FREE)
    location = models.CharField(max_length=100, blank=True, help_text='Zal, Teras, VIP...')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Stol'
        verbose_name_plural = 'Stollar'
        ordering = ['number']

    def __str__(self):
        return f"Stol #{self.number} ({self.get_status_display()})"


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Kutilmoqda'
        CONFIRMED = 'confirmed', 'Tasdiqlangan'
        CANCELLED = 'cancelled', 'Bekor qilingan'
        COMPLETED = 'completed', 'Yakunlangan'

    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='reservations')
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=20)
    guest_count = models.PositiveIntegerField()
    reserved_at = models.DateTimeField()
    duration = models.PositiveIntegerField(default=2, help_text='Soatda')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Bron'
        verbose_name_plural = 'Bronlar'
        ordering = ['-reserved_at']

    def __str__(self):
        return f"{self.customer_name} - Stol #{self.table.number} ({self.reserved_at})"
