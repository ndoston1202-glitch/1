from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    cashier_name = serializers.CharField(source='cashier.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'cashier', 'cashier_name',
            'method', 'status', 'amount', 'paid_amount', 'change_amount',
            'transaction_id', 'notes', 'paid_at', 'created_at'
        ]
        read_only_fields = ['cashier', 'change_amount', 'paid_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'method', 'paid_amount', 'notes']

    def validate(self, attrs):
        order = attrs['order']
        if hasattr(order, 'payment'):
            raise serializers.ValidationError({'order': 'Bu buyurtma uchun to\'lov allaqachon mavjud'})
        attrs['amount'] = order.total_amount
        return attrs

    def create(self, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        paid_amount = validated_data.get('paid_amount', 0)
        amount = validated_data['amount']

        change = max(paid_amount - amount, 0)
        validated_data['change_amount'] = change
        validated_data['status'] = 'completed'
        validated_data['paid_at'] = timezone.now()
        validated_data['cashier'] = request.user if request else None

        payment = super().create(validated_data)

        # Buyurtmani yakunlash
        order = payment.order
        order.status = 'completed'
        from django.utils import timezone as tz
        order.completed_at = tz.now()
        order.save()

        if order.table:
            order.table.status = 'free'
            order.table.save()

        return payment
