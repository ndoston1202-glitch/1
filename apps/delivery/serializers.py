from rest_framework import serializers
from .models import DeliveryZone, Delivery


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'min_order', 'delivery_fee', 'estimated_time', 'is_active']


class DeliverySerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    courier_name = serializers.CharField(source='courier.get_full_name', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)

    class Meta:
        model = Delivery
        fields = [
            'id', 'order', 'order_number', 'courier', 'courier_name',
            'zone', 'zone_name', 'address', 'status', 'delivery_fee',
            'estimated_time', 'notes', 'assigned_at', 'picked_up_at', 'delivered_at', 'created_at'
        ]
        read_only_fields = ['assigned_at', 'picked_up_at', 'delivered_at']


class DeliveryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = ['order', 'zone', 'address', 'notes']

    def create(self, validated_data):
        zone = validated_data.get('zone')
        if zone:
            validated_data['delivery_fee'] = zone.delivery_fee
            validated_data['estimated_time'] = zone.estimated_time
        return super().create(validated_data)
