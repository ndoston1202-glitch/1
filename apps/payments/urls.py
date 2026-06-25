from django.urls import path
from .views import PaymentListCreateView, PaymentDetailView, refund_payment

urlpatterns = [
    path('', PaymentListCreateView.as_view(), name='payment-list'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
    path('<int:pk>/refund/', refund_payment, name='payment-refund'),
]
