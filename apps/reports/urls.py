from django.urls import path
from .views import dashboard_stats, sales_report, top_menu_items, orders_report, staff_report

urlpatterns = [
    path('dashboard/', dashboard_stats, name='report-dashboard'),
    path('sales/', sales_report, name='report-sales'),
    path('menu/', top_menu_items, name='report-menu'),
    path('orders/', orders_report, name='report-orders'),
    path('staff/', staff_report, name='report-staff'),
]
