from django.urls import path
from .views import (
    TableListCreateView, TableDetailView, change_table_status,
    ReservationListCreateView, ReservationDetailView
)

urlpatterns = [
    path('', TableListCreateView.as_view(), name='table-list'),
    path('<int:pk>/', TableDetailView.as_view(), name='table-detail'),
    path('<int:pk>/status/', change_table_status, name='table-status'),
    path('reservations/', ReservationListCreateView.as_view(), name='reservation-list'),
    path('reservations/<int:pk>/', ReservationDetailView.as_view(), name='reservation-detail'),
]
