from django.db import models


class Printer(models.Model):
    """Oshxona printerlari — har bir taom o'z printeriga chiqadi"""
    name = models.CharField(max_length=100, verbose_name='Printer nomi')
    location = models.CharField(max_length=100, blank=True, verbose_name='Joylashuv (Oshxona, Salat bar...)')
    ip_address = models.CharField(max_length=50, blank=True, verbose_name='IP manzil')
    is_active = models.BooleanField(default=True, verbose_name='Faol')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Printer'
        verbose_name_plural = 'Printerlar'

    def __str__(self):
        return f"{self.name} ({self.location})"


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Kategoriya'
        verbose_name_plural = 'Kategoriyalar'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    printer = models.ForeignKey(
        Printer, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='menu_items', verbose_name='Printer (Oshxona)'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Tannarx (so\'mda)')
    image = models.ImageField(upload_to='menu/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    preparation_time = models.PositiveIntegerField(default=15, help_text='Tayyorlash vaqti (daqiqada)')
    calories = models.PositiveIntegerField(null=True, blank=True)
    is_vegetarian = models.BooleanField(default=False)
    is_spicy = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Menyu elementi'
        verbose_name_plural = 'Menyu elementlari'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} - {self.price} so'm"
