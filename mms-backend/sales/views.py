from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Shop, WholesaleSale, RetailCustomer, RetailSale, Payment
from .serializers import (
    ShopSerializer,
    WholesaleSaleSerializer,
    RetailCustomerSerializer,
    RetailSaleSerializer,
    PaymentSerializer,
)


# ---------------- Shop ---------------- #
class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [IsAuthenticated]


# ---------------- Wholesale Sale ---------------- #
class WholesaleSaleViewSet(viewsets.ModelViewSet):
    queryset = WholesaleSale.objects.all().select_related("shop", "stock__product")
    serializer_class = WholesaleSaleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)


# ---------------- Retail Customer ---------------- #
class RetailCustomerViewSet(viewsets.ModelViewSet):
    queryset = RetailCustomer.objects.all()
    serializer_class = RetailCustomerSerializer
    permission_classes = [IsAuthenticated]


# ---------------- Retail Sale ---------------- #
class RetailSaleViewSet(viewsets.ModelViewSet):
    queryset = RetailSale.objects.all().select_related("customer", "stock__product")
    serializer_class = RetailSaleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)


# ---------------- Payment ---------------- #
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related("supplier", "shop")
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)
