from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='categories/')),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Kategoriya',
                'verbose_name_plural': 'Kategoriyalar',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('cost_price', models.DecimalField(decimal_places=2, default=0, help_text="Tannarx (so'mda)", max_digits=10)),
                ('image', models.ImageField(blank=True, null=True, upload_to='menu/')),
                ('is_available', models.BooleanField(default=True)),
                ('preparation_time', models.PositiveIntegerField(default=15, help_text='Tayyorlash vaqti (daqiqada)')),
                ('calories', models.PositiveIntegerField(blank=True, null=True)),
                ('is_vegetarian', models.BooleanField(default=False)),
                ('is_spicy', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='menu.category')),
            ],
            options={
                'verbose_name': 'Menyu elementi',
                'verbose_name_plural': 'Menyu elementlari',
                'ordering': ['category', 'name'],
            },
        ),
    ]
