from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import DeliveryZone, Delivery
from .serializers import DeliveryZoneSerializer, DeliverySerializer, DeliveryCreateSerializer


class DeliveryZoneListCreateView(generics.ListCreateAPIView):
    queryset = DeliveryZone.objects.all()
    serializer_class = DeliveryZoneSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']


class DeliveryZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeliveryZone.objects.all()
    serializer_class = DeliveryZoneSerializer


class DeliveryListCreateView(generics.ListCreateAPIView):
    queryset = Delivery.objects.select_related('order', 'courier', 'zone').all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'courier']
    ordering_fields = ['created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DeliveryCreateSerializer
        return DeliverySerializer


class DeliveryDetailView(generics.RetrieveUpdateAPIView):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_delivery_status(request, pk):
    try:
        delivery = Delivery.objects.get(pk=pk)
    except Delivery.DoesNotExist:
        return Response({'detail': 'Yetkazib berish topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in [s[0] for s in Delivery.Status.choices]:
        return Response({'detail': 'Noto\'g\'ri status'}, status=status.HTTP_400_BAD_REQUEST)

    delivery.status = new_status
    now = timezone.now()

    if new_status == 'assigned':
        delivery.courier = request.user
        delivery.assigned_at = now
    elif new_status == 'picked_up':
        delivery.picked_up_at = now
    elif new_status == 'delivered':
        delivery.delivered_at = now

    delivery.save()
    return Response(DeliverySerializer(delivery).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def courier_deliveries(request):
    """Kuryer uchun o'ziga tayinlangan yetkazib berishlar"""
    deliveries = Delivery.objects.filter(
        courier=request.user,
        status__in=['assigned', 'picked_up', 'on_way']
    ).select_related('order', 'zone').order_by('-created_at')
    return Response(DeliverySerializer(deliveries, many=True).data)
