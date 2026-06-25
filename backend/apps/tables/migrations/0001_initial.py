from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Table',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.PositiveIntegerField(unique=True)),
                ('capacity', models.PositiveIntegerField(default=4)),
                ('status', models.CharField(choices=[('free', "Bo'sh"), ('occupied', 'Band'), ('reserved', 'Bron qilingan'), ('cleaning', 'Tozalanmoqda')], default='free', max_length=20)),
                ('location', models.CharField(blank=True, max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'verbose_name': 'Stol', 'verbose_name_plural': 'Stollar', 'ordering': ['number']},
        ),
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer_name', models.CharField(max_length=200)),
                ('customer_phone', models.CharField(max_length=20)),
                ('guest_count', models.PositiveIntegerField()),
                ('reserved_at', models.DateTimeField()),
                ('duration', models.PositiveIntegerField(default=2)),
                ('status', models.CharField(choices=[('pending', 'Kutilmoqda'), ('confirmed', 'Tasdiqlangan'), ('cancelled', 'Bekor qilingan'), ('completed', 'Yakunlangan')], default='pending', max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('table', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='tables.table')),
            ],
            options={'verbose_name': 'Bron', 'verbose_name_plural': 'Bronlar', 'ordering': ['-reserved_at']},
        ),
    ]
