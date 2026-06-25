from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True
    dependencies = [
        ('tables', '0001_initial'),
        ('menu', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_number', models.CharField(max_length=20, unique=True)),
                ('status', models.CharField(choices=[('pending', 'Kutilmoqda'), ('confirmed', 'Tasdiqlangan'), ('preparing', 'Tayyorlanmoqda'), ('ready', 'Tayyor'), ('served', 'Berildi'), ('completed', 'Yakunlangan'), ('cancelled', 'Bekor qilingan')], default='pending', max_length=20)),
                ('order_type', models.CharField(choices=[('dine_in', 'Zalda'), ('takeaway', 'Olib ketish'), ('delivery', 'Yetkazib berish')], default='dine_in', max_length=20)),
                ('customer_name', models.CharField(blank=True, max_length=200)),
                ('customer_phone', models.CharField(blank=True, max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('discount', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('total_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('table', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='tables.table')),
                ('waiter', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='waiter_orders', to=settings.AUTH_USER_MODEL)),
            ],
            options={'verbose_name': 'Buyurtma', 'verbose_name_plural': 'Buyurtmalar', 'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(choices=[('pending', 'Kutilmoqda'), ('preparing', 'Tayyorlanmoqda'), ('ready', 'Tayyor'), ('served', 'Berildi'), ('cancelled', 'Bekor qilingan')], default='pending', max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('menu_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='menu.menuitem')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order')),
            ],
            options={'verbose_name': 'Buyurtma elementi', 'verbose_name_plural': 'Buyurtma elementlari'},
        ),
    ]
