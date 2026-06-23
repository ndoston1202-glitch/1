from rest_framework import serializers
from .models import Order, OrderItem
from apps.menu.serializers import MenuItemListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(
        source='menu_item.price', max_digits=10, decimal_places=2, read_only=True
    )
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item', 'menu_item_name', 'menu_item_price',
            'quantity', 'price', 'subtotal', 'status', 'notes'
        ]
        read_only_fields = ['price']


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'notes']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    waiter_name = serializers.CharField(source='waiter.get_full_name', read_only=True)
    table_number = serializers.IntegerField(source='table.number', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'table', 'table_number', 'waiter', 'waiter_name',
            'status', 'order_type', 'customer_name', 'customer_phone',
            'notes', 'discount', 'total_amount', 'items', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['order_number', 'total_amount']


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'table', 'order_type', 'customer_name', 'customer_phone',
            'notes', 'discount', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context.get('request')

        import uuid
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

        order = Order.objects.create(
            order_number=order_number,
            waiter=request.user if request else None,
            **validated_data
        )

        for item_data in items_data:
            menu_item = item_data['menu_item']
            OrderItem.objects.create(
                order=order,
                price=menu_item.price,
                **item_data
            )

        order.calculate_total()
        return order


class OrderListSerializer(serializers.ModelSerializer):
    table_number = serializers.IntegerField(source='table.number', read_only=True)
    waiter_name = serializers.CharField(source='waiter.get_full_name', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'table_number', 'waiter_name',
            'status', 'order_type', 'total_amount', 'items_count', 'created_at'
        ]

    def get_items_count(self, obj):
        return obj.items.count()
