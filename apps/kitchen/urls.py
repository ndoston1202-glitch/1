from django.urls import path
from .views import kitchen_orders, update_item_status, mark_order_preparing, kitchen_stats

urlpatterns = [
    path('orders/', kitchen_orders, name='kitchen-orders'),
    path('orders/<int:order_id>/preparing/', mark_order_preparing, name='kitchen-preparing'),
    path('items/<int:item_id>/status/', update_item_status, name='kitchen-item-status'),
    path('stats/', kitchen_stats, name='kitchen-stats'),
]
