from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from inventory.models import Supplier, Stock, Purchase


class Shop(models.Model):
    PAYMENT_PREFS = (('cash','Cash'),('credit','Credit'))
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
    PAYMENT_STATUS = (('paid','Paid'),('pending','Pending'),('partial','Partial'))

    shop = models.ForeignKey(Shop, related_name='wholesale_sales', on_delete=models.PROTECT)
    date_time = models.DateTimeField(default=timezone.now)
    shift = models.CharField(max_length=20, choices=ShippingShift.choices, blank=True, null=True)

    stock = models.ForeignKey(Stock, related_name='wholesale_sales', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)  # milk liters taken from stock
    added_water = models.DecimalField(max_digits=12, decimal_places=3, default=0)  # water added (zero cost)

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
        self.clean()

        # Revenue = (milk + water) * rate - discount
        self.total_amount = (self.delivered_quantity * self.rate) - (self.discount or 0)

        # Cost only for milk liters using latest purchase rate for this product
        unit_cost = 0
        if self.stock:
            latest_purchase = Purchase.objects.filter(product=self.stock.product).order_by('-date_time').first()
            if latest_purchase:
                unit_cost = latest_purchase.rate
        self.cost = self.quantity * unit_cost

        # Profit
        self.profit = (self.total_amount or 0) - (self.cost or 0)

        # Reduce stock by milk liters only
        if self.stock:
            self.stock.quantity -= self.quantity
            self.stock.save()

        super().save(*args, **kwargs)


# ---------------- Retail ---------------- #
class RetailCustomer(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RetailSale(models.Model):
    PAYMENT_STATUS = (('paid','Paid'),('pending','Pending'))

    customer = models.ForeignKey(RetailCustomer, related_name='sales', null=True, blank=True, on_delete=models.SET_NULL)
    date_time = models.DateTimeField(default=timezone.now)

    stock = models.ForeignKey(Stock, related_name='retail_sales', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)  # milk liters taken from stock
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
        self.clean()

        # Total charged = (milk + water) * rate
        self.total = self.delivered_quantity * self.rate

        # Weighted average cost for milk liters only
        weighted_cost = 0
        purchases = Purchase.objects.filter(product=self.stock.product)
        total_qty = sum((p.quantity for p in purchases), start=0)
        if total_qty > 0:
            total_cost = sum((p.quantity * p.rate for p in purchases), start=0)
            weighted_cost = total_cost / total_qty

        self.cost = self.quantity * weighted_cost

        # Profit
        self.profit = (self.total or 0) - (self.cost or 0)

        # Reduce stock by milk liters only
        if self.stock:
            self.stock.quantity -= self.quantity
            self.stock.save()

        super().save(*args, **kwargs)


# ---------------- Payments ---------------- #
class Payment(models.Model):
    PAYMENT_DIRECTION = (('to_supplier','To Supplier'),('from_shop','From Shop'))
    direction = models.CharField(max_length=20, choices=PAYMENT_DIRECTION)
    supplier = models.ForeignKey(Supplier, null=True, blank=True, on_delete=models.CASCADE)
    shop = models.ForeignKey(Shop, null=True, blank=True, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name='sales_payments'
    )
