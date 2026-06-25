from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView,
    change_order_status, add_order_item, remove_order_item
)

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/status/', change_order_status, name='order-status'),
    path('<int:pk>/items/', add_order_item, name='order-add-item'),
    path('<int:pk>/items/<int:item_pk>/', remove_order_item, name='order-remove-item'),
]
