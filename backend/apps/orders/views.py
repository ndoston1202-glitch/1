from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderListSerializer, OrderItemSerializer
)


class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.select_related('table', 'waiter').prefetch_related('items').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order_type', 'table', 'waiter']
    search_fields = ['order_number', 'customer_name', 'customer_phone']
    ordering_fields = ['created_at', 'total_amount']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.select_related('table', 'waiter').prefetch_related('items').all()
    serializer_class = OrderSerializer


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'detail': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in [s[0] for s in Order.Status.choices]:
        return Response({'detail': 'Noto\'g\'ri status'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    if new_status == Order.Status.COMPLETED:
        order.completed_at = timezone.now()
        if order.table:
            order.table.status = 'free'
            order.table.save()
    order.save()
    return Response(OrderSerializer(order).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_order_item(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'detail': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    from apps.menu.models import MenuItem
    menu_item_id = request.data.get('menu_item')
    quantity = request.data.get('quantity', 1)

    try:
        menu_item = MenuItem.objects.get(pk=menu_item_id)
    except MenuItem.DoesNotExist:
        return Response({'detail': 'Menyu elementi topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    item = OrderItem.objects.create(
        order=order,
        menu_item=menu_item,
        price=menu_item.price,
        quantity=quantity,
        notes=request.data.get('notes', '')
    )
    order.calculate_total()
    return Response(OrderItemSerializer(item).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_order_item(request, pk, item_pk):
    try:
        item = OrderItem.objects.get(pk=item_pk, order__pk=pk)
        order = item.order
        item.delete()
        order.calculate_total()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except OrderItem.DoesNotExist:
        return Response({'detail': 'Element topilmadi'}, status=status.HTTP_404_NOT_FOUND)
