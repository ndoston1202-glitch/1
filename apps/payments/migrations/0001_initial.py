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
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('method', models.CharField(choices=[('cash', 'Naqd pul'), ('card', 'Karta'), ('payme', 'Payme'), ('click', 'Click'), ('transfer', "O'tkazma")], default='cash', max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Kutilmoqda'), ('completed', "To'langan"), ('failed', 'Muvaffaqiyatsiz'), ('refunded', 'Qaytarilgan')], default='pending', max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('paid_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('change_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('transaction_id', models.CharField(blank=True, max_length=100)),
                ('notes', models.TextField(blank=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('cashier', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='orders.order')),
            ],
            options={'verbose_name': "To'lov", 'verbose_name_plural': "To'lovlar", 'ordering': ['-created_at']},
        ),
    ]
