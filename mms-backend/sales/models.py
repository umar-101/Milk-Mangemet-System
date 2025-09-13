# sales/models.py
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

from inventory.models import Stock, Purchase, StockMovement


class Shop(models.Model):
    PAYMENT_PREFS = (('cash', 'Cash'), ('credit', 'Credit'))

    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    delivery_route = models.CharField(max_length=200, blank=True, null=True)
    default_selling_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    default_selling_quantity = models.DecimalField(max_digits=12, decimal_places=3, blank=True, null=True)
    payment_pref = models.CharField(max_length=20, choices=PAYMENT_PREFS, default='cash')
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ShippingShift(models.TextChoices):
    MORNING = 'morning', 'Morning'
    EVENING = 'evening', 'Evening'


# ---------------- Wholesale Sale ---------------- #
class WholesaleSale(models.Model):
    PAYMENT_STATUS = (('paid', 'Paid'), ('pending', 'Pending'), ('partial', 'Partial'))

    shop = models.ForeignKey(Shop, related_name='wholesale_sales', on_delete=models.PROTECT)
    date_time = models.DateTimeField(default=timezone.now)
    shift = models.CharField(max_length=20, choices=ShippingShift.choices, blank=True, null=True)

    stock = models.ForeignKey(Stock, related_name='wholesale_sales', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    added_water = models.DecimalField(max_digits=12, decimal_places=3, default=0)

    rate = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    profit = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name='sales_wholesalesales'
    )

    class Meta:
        indexes = [
            models.Index(fields=["date_time"]),
            models.Index(fields=["payment_status"]),
        ]

    @property
    def delivered_quantity(self):
        return (self.quantity or 0) + (self.added_water or 0)

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Sale quantity (milk) must be greater than zero.")
        if self.added_water < 0:
            raise ValidationError("Added water cannot be negative.")
        if self.stock and self.quantity > self.stock.quantity:
            raise ValidationError(f"Not enough stock. Available: {self.stock.quantity}")

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        self.clean()

        # Revenue
        self.total_amount = (self.delivered_quantity * self.rate) - (self.discount or 0)

        # Cost → latest purchase rate
        unit_cost = 0
        latest_purchase = Purchase.objects.filter(product=self.stock.product).order_by('-date_time').first()
        if latest_purchase:
            unit_cost = latest_purchase.rate
        self.cost = self.quantity * unit_cost

        # Profit
        self.profit = (self.total_amount or 0) - (self.cost or 0)

        super().save(*args, **kwargs)

        if is_new:
            StockMovement.objects.create(
                product=self.stock.product,
                quantity=self.quantity,
                movement_type='out',
                notes=f"Wholesale sale to {self.shop.name}",
                created_by=self.created_by,
            )


# ---------------- Retail ---------------- #
class RetailCustomer(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RetailSale(models.Model):
    PAYMENT_STATUS = (('paid', 'Paid'), ('pending', 'Pending'))

    customer = models.ForeignKey(RetailCustomer, related_name='sales', null=True, blank=True, on_delete=models.SET_NULL)
    date_time = models.DateTimeField(default=timezone.now)
    shift = models.CharField(max_length=20, choices=ShippingShift.choices, blank=True, null=True)

    stock = models.ForeignKey(Stock, related_name='retail_sales', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    added_water = models.DecimalField(max_digits=12, decimal_places=3, default=0)

    rate = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    profit = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='paid')
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name='sales_retailsales'
    )

    class Meta:
        indexes = [
            models.Index(fields=["date_time"]),
            models.Index(fields=["payment_status"]),
        ]

    @property
    def delivered_quantity(self):
        return (self.quantity or 0) + (self.added_water or 0)

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Sale quantity (milk) must be greater than zero.")
        if self.added_water < 0:
            raise ValidationError("Added water cannot be negative.")
        if self.stock and self.quantity > self.stock.quantity:
            raise ValidationError(f"Not enough stock. Available: {self.stock.quantity}")

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        self.clean()

        # Revenue
        self.total = self.delivered_quantity * self.rate

        # Weighted average cost
        purchases = Purchase.objects.filter(product=self.stock.product)
        total_qty = sum((p.quantity for p in purchases), Decimal(0))
        total_cost = sum((p.quantity * p.rate for p in purchases), Decimal(0))
        weighted_cost = (total_cost / total_qty) if total_qty > 0 else 0
        self.cost = self.quantity * weighted_cost

        # Profit
        self.profit = (self.total or 0) - (self.cost or 0)

        super().save(*args, **kwargs)

        if is_new:
            StockMovement.objects.create(
                product=self.stock.product,
                quantity=self.quantity,
                movement_type='out',
                notes=f"Retail sale to {self.customer.name if self.customer else 'Walk-in'}",
                created_by=self.created_by,
            )


# ---------------- Subscriptions ---------------- #
class Subscription(models.Model):
    customer = models.ForeignKey(RetailCustomer, null=True, blank=True, on_delete=models.CASCADE)
    shop = models.ForeignKey(Shop, null=True, blank=True, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    shift = models.CharField(max_length=20, choices=ShippingShift.choices)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(blank=True, null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        if self.customer:
            return f"Subscription for {self.customer.name} - {self.quantity} liters"
        return f"Subscription for {self.shop.name} - {self.quantity} liters"


class SubscriptionException(models.Model):
    subscription = models.ForeignKey(Subscription, related_name="exceptions", on_delete=models.CASCADE)
    date = models.DateField()
    quantity = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    skip = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('subscription', 'date')

    def __str__(self):
        return f"Exception {self.date} for {self.subscription}"
