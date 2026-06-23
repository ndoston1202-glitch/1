from django.urls import path
from .views import (
    DeliveryZoneListCreateView, DeliveryZoneDetailView,
    DeliveryListCreateView, DeliveryDetailView,
    update_delivery_status, courier_deliveries
)

urlpatterns = [
    path('zones/', DeliveryZoneListCreateView.as_view(), name='zone-list'),
    path('zones/<int:pk>/', DeliveryZoneDetailView.as_view(), name='zone-detail'),
    path('', DeliveryListCreateView.as_view(), name='delivery-list'),
    path('<int:pk>/', DeliveryDetailView.as_view(), name='delivery-detail'),
    path('<int:pk>/status/', update_delivery_status, name='delivery-status'),
    path('my/', courier_deliveries, name='courier-deliveries'),
]
