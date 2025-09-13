from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShopViewSet,
    WholesaleSaleViewSet,
    RetailCustomerViewSet,
    RetailSaleViewSet,
    SubscriptionViewSet,
    SubscriptionExceptionViewSet,
)

router = DefaultRouter()
router.register(r'shops', ShopViewSet)
router.register(r'wholesale-sales', WholesaleSaleViewSet)
router.register(r'retail-customers', RetailCustomerViewSet)
router.register(r'retail-sales', RetailSaleViewSet)
router.register(r'subscriptions', SubscriptionViewSet)  # ✅ new
router.register(r'subscription-exceptions', SubscriptionExceptionViewSet)  # ✅ new

urlpatterns = [
    path('', include(router.urls)),
]
