from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F
from .models import SystemSetting, Report
from .serializers import SystemSettingSerializer, ReportSerializer
from inventory.models import Purchase, Expense, StockMovement
from sales.models import WholesaleSale, RetailSale, Shop

class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer

    @action(detail=False, methods=['get'])
    def daily_sales(self, request):
        # daily combined wholesale + retail totals
        date = request.query_params.get('date')  # YYYY-MM-DD optional
        # simple aggregation across models (filtering if date provided)
        wholesale = WholesaleSale.objects.all()
        retail = RetailSale.objects.all()
        if date:
            wholesale = wholesale.filter(date_time__date=date)
            retail = retail.filter(date_time__date=date)
        ws_total = wholesale.aggregate(total=Sum('total_amount'))['total'] or 0
        rs_total = retail.aggregate(total=Sum('total'))['total'] or 0
        return Response({'date': date or 'all', 'wholesale_total': ws_total, 'retail_total': rs_total, 'combined_total': ws_total + rs_total})

    @action(detail=False, methods=['get'])
    def monthly_profit_loss(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        purchases = Purchase.objects.all()
        wholesale = WholesaleSale.objects.all()
        retail = RetailSale.objects.all()
        expenses = Expense.objects.all()
        if year and month:
            purchases = purchases.filter(date_time__year=year, date_time__month=month)
            wholesale = wholesale.filter(date_time__year=year, date_time__month=month)
            retail = retail.filter(date_time__year=year, date_time__month=month)
            expenses = expenses.filter(date__year=year, date__month=month)
        total_revenue = (wholesale.aggregate(total=Sum('total_amount'))['total'] or 0) + (retail.aggregate(total=Sum('total'))['total'] or 0)
        total_cost = purchases.aggregate(total=Sum('total_cost'))['total'] or 0
        total_expenses = expenses.aggregate(total=Sum('amount'))['amount'] or 0
        profit_loss = total_revenue - (total_cost + total_expenses)
        return Response({
            'year': year, 'month': month,
            'revenue': total_revenue,
            'purchase_costs': total_cost,
            'expenses': total_expenses,
            'profit_loss': profit_loss
        })

    @action(detail=False, methods=['get'])
    def outstanding_payments(self, request):
        # outstanding balances per shop and per supplier
        # Shop outstanding: sum(wholesale total) - sum(payments from shop)
        shops = Shop.objects.all()
        shop_data = []
        for s in shops:
            total_sales = s.wholesale_sales.aggregate(total=Sum('total_amount'))['total'] or 0
            received = Payment.objects.filter(direction='from_shop', shop=s).aggregate(total=Sum('amount'))['total'] or 0
            shop_data.append({'shop': s.name, 'outstanding': total_sales - received})
        suppliers = []
        from inventory.models import Supplier
        sup_qs = Supplier.objects.all()
        for sup in sup_qs:
            total_purchases = sup.purchases.aggregate(total=Sum('total_cost'))['total'] or 0
            paid = Payment.objects.filter(direction='to_supplier', supplier=sup).aggregate(total=Sum('amount'))['total'] or 0
            suppliers.append({'supplier': sup.name, 'outstanding': total_purchases - paid})
        return Response({'shops': shop_data, 'suppliers': suppliers})
