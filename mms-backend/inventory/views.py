from rest_framework import viewsets
from .models import Supplier, Product, Stock, Purchase, StockMovement, Wastage, Expense
from .serializers import (
    SupplierSerializer, ProductSerializer,
    StockSerializer, PurchaseSerializer, StockMovementSerializer, WastageSerializer, ExpenseSerializer
)
from rest_framework import viewsets, serializers
from django.core.exceptions import ValidationError
from .models import Wastage
from .serializers import WastageSerializer

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
        try:
            # Save with created_by set
            serializer.save(created_by=self.request.user)
        except ValidationError as e:
            # Convert Django ValidationError to DRF 400 error
            raise serializers.ValidationError(
                {"detail": e.messages if hasattr(e, "messages") else str(e)}
            )

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
