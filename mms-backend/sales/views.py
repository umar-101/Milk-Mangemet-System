from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import (
    Shop,
    WholesaleSale,
    RetailCustomer,
    RetailSale,
    Subscription,
    SubscriptionException,
)
from .serializers import (
    ShopSerializer,
    WholesaleSaleSerializer,
    RetailCustomerSerializer,
    RetailSaleSerializer,
    SubscriptionSerializer,
    SubscriptionExceptionSerializer,
)
from datetime import date
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


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


# ---------------- Subscription ---------------- #
class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all().select_related("customer", "shop", "stock__product")
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)


# ---------------- Subscription Exception ---------------- #
class SubscriptionExceptionViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionException.objects.all().select_related("subscription")
    serializer_class = SubscriptionExceptionSerializer
    permission_classes = [IsAuthenticated]

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all().select_related("customer", "shop", "stock__product")
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(created_by=self.request.user)

    # 🔹 Custom action: generate today's sales
    @action(detail=False, methods=["post"], url_path="generate-today")
    def generate_today(self, request):
        today = date.today()
        created_sales = []

        for sub in self.queryset.filter(is_active=True):
            # Check for exception
            exception = SubscriptionException.objects.filter(
                subscription=sub, date=today
            ).first()

            if exception and exception.skip:
                continue  # skip this subscription today

            quantity = exception.quantity if exception and exception.quantity else sub.daily_quantity

            if quantity <= 0:
                continue

            if sub.customer:  # Retail subscription
                sale = RetailSale.objects.create(
                    customer=sub.customer,
                    stock=sub.stock,
                    quantity=quantity,
                    added_water=0,
                    rate=sub.rate,
                    shift=sub.shift,
                    created_by=request.user,
                )
            elif sub.shop:  # Wholesale subscription
                sale = WholesaleSale.objects.create(
                    shop=sub.shop,
                    stock=sub.stock,
                    quantity=quantity,
                    added_water=0,
                    rate=sub.rate,
                    shift=sub.shift,
                    created_by=request.user,
                )
            else:
                continue  # invalid subscription

            created_sales.append({
                "id": sale.id,
                "type": "retail" if sub.customer else "wholesale",
                "quantity": float(quantity),
            })

        return Response(
            {"message": "Today's sales generated", "sales": created_sales},
            status=status.HTTP_201_CREATED
        )