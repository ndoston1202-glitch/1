from rest_framework import generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer, MenuItemListSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['order', 'name']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class MenuItemListCreateView(generics.ListCreateAPIView):
    queryset = MenuItem.objects.select_related('category').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_available', 'is_vegetarian', 'is_spicy']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return MenuItemListSerializer
        return MenuItemSerializer


class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItem.objects.select_related('category').all()
    serializer_class = MenuItemSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def menu_by_category(request):
    """Kategoriya bo'yicha guruhlab menyu qaytarish"""
    categories = Category.objects.filter(is_active=True).prefetch_related('items')
    result = []
    for cat in categories:
        items = cat.items.filter(is_available=True)
        result.append({
            'id': cat.id,
            'name': cat.name,
            'image': request.build_absolute_uri(cat.image.url) if cat.image else None,
            'items': MenuItemListSerializer(items, many=True, context={'request': request}).data
        })
    return Response(result)
