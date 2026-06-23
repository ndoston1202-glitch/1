from rest_framework import serializers
from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'is_active', 'order', 'items_count', 'created_at']

    def get_items_count(self, obj):
        return obj.items.filter(is_available=True).count()


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'image', 'is_available', 'preparation_time',
            'calories', 'is_vegetarian', 'is_spicy', 'created_at', 'updated_at'
        ]


class MenuItemListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = ['id', 'category', 'category_name', 'name', 'price',
                  'image', 'is_available', 'preparation_time', 'is_vegetarian', 'is_spicy']
