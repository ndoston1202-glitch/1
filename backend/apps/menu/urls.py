from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    MenuItemListCreateView, MenuItemDetailView,
    menu_by_category, PrinterListCreateView, PrinterDetailView
)

urlpatterns = [
    path('printers/', PrinterListCreateView.as_view(), name='printer-list'),
    path('printers/<int:pk>/', PrinterDetailView.as_view(), name='printer-detail'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('items/', MenuItemListCreateView.as_view(), name='menuitem-list'),
    path('items/<int:pk>/', MenuItemDetailView.as_view(), name='menuitem-detail'),
    path('by-category/', menu_by_category, name='menu-by-category'),
]
