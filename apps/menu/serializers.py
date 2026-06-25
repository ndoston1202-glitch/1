from rest_framework import serializers
from .models import Category, MenuItem, Printer


class PrinterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Printer
        fields = ['id', 'name', 'location', 'ip_address', 'is_active', 'created_at']


class CategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'is_active', 'order', 'items_count', 'created_at']

    def get_items_count(self, obj):
        return obj.items.filter(is_available=True).count()


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    profit = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'printer', 'printer_name',
            'name', 'description', 'price', 'cost_price', 'profit',
            'image', 'is_available', 'preparation_time',
            'calories', 'is_vegetarian', 'is_spicy', 'created_at', 'updated_at'
        ]

    def get_profit(self, obj):
        return float(obj.price) - float(obj.cost_price)


class MenuItemListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    profit = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'printer', 'printer_name',
            'name', 'price', 'cost_price', 'profit',
            'image', 'is_available', 'preparation_time', 'is_vegetarian', 'is_spicy'
        ]

    def get_profit(self, obj):
        return float(obj.price) - float(obj.cost_price)
