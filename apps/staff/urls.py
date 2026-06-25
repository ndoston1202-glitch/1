from django.urls import path
from .views import (
    ShiftListCreateView, ShiftDetailView, start_shift, end_shift,
    AttendanceListCreateView, AttendanceDetailView
)

urlpatterns = [
    path('shifts/', ShiftListCreateView.as_view(), name='shift-list'),
    path('shifts/<int:pk>/', ShiftDetailView.as_view(), name='shift-detail'),
    path('shifts/start/', start_shift, name='shift-start'),
    path('shifts/end/', end_shift, name='shift-end'),
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-list'),
    path('attendance/<int:pk>/', AttendanceDetailView.as_view(), name='attendance-detail'),
]
