from rest_framework import generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer


class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.select_related('order', 'cashier').all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['method', 'status']
    ordering_fields = ['created_at', 'amount']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PaymentDetailView(generics.RetrieveAPIView):
    queryset = Payment.objects.select_related('order', 'cashier').all()
    serializer_class = PaymentSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refund_payment(request, pk):
    try:
        payment = Payment.objects.get(pk=pk)
    except Payment.DoesNotExist:
        from rest_framework import status
        return Response({'detail': 'To\'lov topilmadi'}, status=status.HTTP_404_NOT_FOUND)

    payment.status = 'refunded'
    payment.save()
    return Response(PaymentSerializer(payment).data)
