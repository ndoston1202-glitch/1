from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Table, Reservation
from .serializers import TableSerializer, ReservationSerializer


class TableListCreateView(generics.ListCreateAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'location', 'is_active']
    ordering_fields = ['number']


class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def change_table_status(request, pk):
    try:
        table = Table.objects.get(pk=pk)
    except Table.DoesNotExist:
        return Response({'detail': 'Stol topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in [s[0] for s in Table.Status.choices]:
        return Response({'detail': 'Noto\'g\'ri status'}, status=status.HTTP_400_BAD_REQUEST)

    table.status = new_status
    table.save()
    return Response(TableSerializer(table).data)


class ReservationListCreateView(generics.ListCreateAPIView):
    queryset = Reservation.objects.select_related('table').all()
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['table', 'status']
    search_fields = ['customer_name', 'customer_phone']
    ordering_fields = ['reserved_at', 'created_at']


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
