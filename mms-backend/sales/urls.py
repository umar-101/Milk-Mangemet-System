from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShopViewSet,
    WholesaleSaleViewSet,
    RetailCustomerViewSet,
    RetailSaleViewSet,
    PaymentViewSet
)

router = DefaultRouter()
router.register(r'shops', ShopViewSet)
router.register(r'wholesale-sales', WholesaleSaleViewSet)
router.register(r'retail-customers', RetailCustomerViewSet)
router.register(r'retail-sales', RetailSaleViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
