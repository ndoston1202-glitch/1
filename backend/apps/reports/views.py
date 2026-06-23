from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from datetime import timedelta, date


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Asosiy dashboard statistikasi"""
    from apps.orders.models import Order
    from apps.payments.models import Payment

    today = timezone.now().date()
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)

    # Bugungi statistika
    today_orders = Order.objects.filter(created_at__gte=today_start)
    today_revenue = Payment.objects.filter(
        status='completed', paid_at__gte=today_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Faol buyurtmalar
    active_orders = Order.objects.filter(
        status__in=['pending', 'confirmed', 'preparing', 'ready']
    ).count()

    # Haftalik daromad
    week_start = today_start - timedelta(days=7)
    weekly_revenue = Payment.objects.filter(
        status='completed', paid_at__gte=week_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        'today': {
            'orders': today_orders.count(),
            'revenue': today_revenue,
            'completed_orders': today_orders.filter(status='completed').count(),
            'cancelled_orders': today_orders.filter(status='cancelled').count(),
        },
        'active_orders': active_orders,
        'weekly_revenue': weekly_revenue,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_report(request):
    """Savdo hisoboti - kunlik, haftalik, oylik"""
    from apps.payments.models import Payment
    from apps.orders.models import Order

    period = request.query_params.get('period', 'daily')
    now = timezone.now()

    if period == 'daily':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        payments = Payment.objects.filter(status='completed', paid_at__gte=start)
    elif period == 'weekly':
        start = now - timedelta(days=7)
        payments = Payment.objects.filter(status='completed', paid_at__gte=start)
    elif period == 'monthly':
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        payments = Payment.objects.filter(status='completed', paid_at__gte=start)
    else:
        payments = Payment.objects.filter(status='completed')

    by_method = payments.values('method').annotate(
        count=Count('id'),
        total=Sum('amount')
    )

    return Response({
        'period': period,
        'total_revenue': payments.aggregate(total=Sum('amount'))['total'] or 0,
        'total_transactions': payments.count(),
        'by_method': list(by_method),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_menu_items(request):
    """Eng ko'p buyurtma qilingan taomlar"""
    from apps.orders.models import OrderItem

    limit = int(request.query_params.get('limit', 10))
    period_days = int(request.query_params.get('days', 30))
    start = timezone.now() - timedelta(days=period_days)

    items = OrderItem.objects.filter(
        created_at__gte=start
    ).values(
        'menu_item__id', 'menu_item__name', 'menu_item__category__name'
    ).annotate(
        total_quantity=Sum('quantity'),
        total_revenue=Sum('price')
    ).order_by('-total_quantity')[:limit]

    return Response(list(items))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def orders_report(request):
    """Buyurtmalar hisoboti"""
    from apps.orders.models import Order

    period = request.query_params.get('period', 'daily')
    now = timezone.now()

    if period == 'daily':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == 'weekly':
        start = now - timedelta(days=7)
    else:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    orders = Order.objects.filter(created_at__gte=start)

    by_status = orders.values('status').annotate(count=Count('id'))
    by_type = orders.values('order_type').annotate(count=Count('id'))

    return Response({
        'period': period,
        'total_orders': orders.count(),
        'by_status': list(by_status),
        'by_type': list(by_type),
        'avg_order_value': orders.aggregate(avg=Avg('total_amount'))['avg'] or 0,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_report(request):
    """Xodimlar hisoboti"""
    from apps.orders.models import Order
    from apps.payments.models import Payment
    from django.contrib.auth import get_user_model

    User = get_user_model()
    period_days = int(request.query_params.get('days', 30))
    start = timezone.now() - timedelta(days=period_days)

    waiters = User.objects.filter(role='waiter')
    result = []
    for waiter in waiters:
        orders = Order.objects.filter(waiter=waiter, created_at__gte=start)
        result.append({
            'id': waiter.id,
            'name': waiter.get_full_name(),
            'total_orders': orders.count(),
            'completed_orders': orders.filter(status='completed').count(),
            'total_revenue': orders.filter(status='completed').aggregate(
                total=Sum('total_amount')
            )['total'] or 0,
        })

    return Response(sorted(result, key=lambda x: x['total_orders'], reverse=True))
