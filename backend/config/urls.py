from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API Endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/tables/', include('apps.tables.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/kitchen/', include('apps.kitchen.urls')),
    path('api/staff/', include('apps.staff.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/delivery/', include('apps.delivery.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
