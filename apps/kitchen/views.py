from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer, OrderItemSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kitchen_orders(request):
    """Oshxona uchun faol buyurtmalar: confirmed va preparing"""
    orders = Order.objects.filter(
        status__in=['confirmed', 'preparing']
    ).select_related('table', 'waiter').prefetch_related('items__menu_item').order_by('created_at')

    result = []
    for order in orders:
        items = order.items.exclude(status='cancelled')
        result.append({
            'id': order.id,
            'order_number': order.order_number,
            'table_number': order.table.number if order.table else None,
            'order_type': order.order_type,
            'status': order.status,
            'created_at': order.created_at,
            'items': [
                {
                    'id': item.id,
                    'name': item.menu_item.name,
                    'quantity': item.quantity,
                    'status': item.status,
                    'notes': item.notes,
                    'preparation_time': item.menu_item.preparation_time,
                }
                for item in items
            ]
        })
    return Response(result)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_item_status(request, item_id):
    """Buyurtma elementi statusini yangilash"""
    try:
        item = OrderItem.objects.select_related('order').get(pk=item_id)
    except OrderItem.DoesNotExist:
        return Response({'detail': 'Element topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in [s[0] for s in OrderItem.Status.choices]:
        return Response({'detail': 'Noto\'g\'ri status'}, status=status.HTTP_400_BAD_REQUEST)

    item.status = new_status
    item.save()

    # Agar barcha elementlar tayyor bo'lsa, buyurtmani ready qilamiz
    order = item.order
    all_items = order.items.exclude(status='cancelled')
    if all_items.exists() and all(i.status == 'ready' for i in all_items):
        order.status = 'ready'
        order.save()

    return Response(OrderItemSerializer(item).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_order_preparing(request, order_id):
    """Buyurtmani tayyorlanmoqda deb belgilash"""
    try:
        order = Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        return Response({'detail': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    order.status = 'preparing'
    order.save()
    order.items.filter(status='pending').update(status='preparing')
    return Response(OrderSerializer(order).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kitchen_stats(request):
    """Oshxona statistikasi"""
    from django.utils import timezone
    from datetime import timedelta

    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0)

    pending = Order.objects.filter(status='confirmed').count()
    preparing = Order.objects.filter(status='preparing').count()
    ready = Order.objects.filter(status='ready').count()

    avg_time_items = OrderItem.objects.filter(
        status='ready',
        order__created_at__gte=today_start
    ).count()

    return Response({
        'pending_orders': pending,
        'preparing_orders': preparing,
        'ready_orders': ready,
        'completed_today': Order.objects.filter(
            status='completed', completed_at__gte=today_start
        ).count(),
    })
