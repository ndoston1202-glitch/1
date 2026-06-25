from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Shift, Attendance
from .serializers import ShiftSerializer, AttendanceSerializer


class ShiftListCreateView(generics.ListCreateAPIView):
    queryset = Shift.objects.select_related('employee').all()
    serializer_class = ShiftSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'status']
    ordering_fields = ['started_at']


class ShiftDetailView(generics.RetrieveUpdateAPIView):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_shift(request):
    """Smena boshlash"""
    active_shift = Shift.objects.filter(employee=request.user, status='active').first()
    if active_shift:
        return Response({'detail': 'Faol smena allaqachon mavjud'}, status=status.HTTP_400_BAD_REQUEST)

    shift = Shift.objects.create(employee=request.user, started_at=timezone.now())
    return Response(ShiftSerializer(shift).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_shift(request):
    """Smenani yakunlash"""
    shift = Shift.objects.filter(employee=request.user, status='active').first()
    if not shift:
        return Response({'detail': 'Faol smena topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    shift.ended_at = timezone.now()
    shift.status = 'completed'
    shift.save()
    return Response(ShiftSerializer(shift).data)


class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'date', 'is_present']
    ordering_fields = ['date']


class AttendanceDetailView(generics.RetrieveUpdateAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
