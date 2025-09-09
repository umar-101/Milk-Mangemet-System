from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet, ProductViewSet, StockViewSet,
    PurchaseViewSet, StockMovementViewSet, WastageViewSet, ExpenseViewSet
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'products', ProductViewSet)
router.register(r'stocks', StockViewSet)
router.register(r'purchases', PurchaseViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'wastages', WastageViewSet)
router.register(r'expenses', ExpenseViewSet)  # New endpoint

urlpatterns = [
    path('', include(router.urls)),
]
