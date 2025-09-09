from rest_framework import viewsets
from .models import Supplier, Product, Stock, Purchase, StockMovement, Wastage, Expense
from .serializers import (
    SupplierSerializer, ProductSerializer,
    StockSerializer, PurchaseSerializer, StockMovementSerializer, WastageSerializer, ExpenseSerializer
)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer


class WastageViewSet(viewsets.ModelViewSet):
    queryset = Wastage.objects.all()
    serializer_class = WastageSerializer

    def perform_create(self, serializer):
        serializer.save()  # stock movement handled in model save()


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
