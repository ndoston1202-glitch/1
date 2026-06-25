from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True
    dependencies = [
        ('orders', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryZone',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('min_order', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('delivery_fee', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('estimated_time', models.PositiveIntegerField(default=30)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={'verbose_name': 'Yetkazib berish hududi', 'verbose_name_plural': 'Yetkazib berish hududlari'},
        ),
        migrations.CreateModel(
            name='Delivery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('address', models.TextField()),
                ('status', models.CharField(choices=[('pending', 'Kutilmoqda'), ('assigned', 'Tayinlangan'), ('picked_up', 'Olingan'), ('on_way', "Yo'lda"), ('delivered', 'Yetkazildi'), ('failed', 'Muvaffaqiyatsiz')], default='pending', max_length=20)),
                ('delivery_fee', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('estimated_time', models.PositiveIntegerField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('assigned_at', models.DateTimeField(blank=True, null=True)),
                ('picked_up_at', models.DateTimeField(blank=True, null=True)),
                ('delivered_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('courier', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='deliveries', to=settings.AUTH_USER_MODEL)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='delivery', to='orders.order')),
                ('zone', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='delivery.deliveryzone')),
            ],
            options={'verbose_name': 'Yetkazib berish', 'verbose_name_plural': 'Yetkazib berishlar', 'ordering': ['-created_at']},
        ),
    ]
