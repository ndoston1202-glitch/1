from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(
        source='menu_item.price', max_digits=10, decimal_places=2, read_only=True
    )
    printer_name = serializers.SerializerMethodField()
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item', 'menu_item_name', 'menu_item_price',
            'quantity', 'price', 'subtotal', 'status', 'notes', 'printer_name'
        ]
        read_only_fields = ['price']

    def get_printer_name(self, obj):
        if obj.menu_item.printer:
            return obj.menu_item.printer.name
        return None


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

    def validate(self, attrs):
        """1 stolga faqat 1 ta faol buyurtma bo'lishi mumkin"""
        table = attrs.get('table')
        if table:
            active_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'served']
            existing = Order.objects.filter(
                table=table,
                status__in=active_statuses
            ).first()
            if existing:
                raise serializers.ValidationError({
                    'table': f'Stol #{table.number} da faol buyurtma mavjud! (#{existing.order_number}). '
                             f'Avval mavjud buyurtmaga taom qo\'shing.'
                })
        return attrs

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
            # Dublikat chek — bir xil taom bo'lsa miqdorini oshir
            existing_item = OrderItem.objects.filter(
                order=order,
                menu_item=menu_item
            ).first()
            if existing_item:
                existing_item.quantity += item_data.get('quantity', 1)
                existing_item.save()
            else:
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
