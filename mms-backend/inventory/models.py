from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

from django.db.models import Sum, F, Q

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    unit = models.CharField(max_length=50, default='liter')  # 'liter' or 'kg'
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.unit not in ['liter', 'kg']:
            raise ValidationError("Unit must be either 'liter' or 'kg'.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Stock(models.Model):
    product = models.OneToOneField(
        Product,
        related_name="stock",
        on_delete=models.CASCADE
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"





class Purchase(models.Model):
    supplier = models.ForeignKey(Supplier, related_name='purchases', on_delete=models.PROTECT)
    product = models.ForeignKey(Product, related_name='purchases', on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    extra_ice = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    date_time = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Purchase quantity (milk) must be greater than zero.")
        if self.extra_ice < 0:
            raise ValidationError("Extra ice cannot be negative.")

    def save(self, *args, **kwargs):
        self.clean()

        if not self.total_amount:
            self.total_amount = self.quantity * self.rate

        super().save(*args, **kwargs)

        # Update or create stock record
        stock, created = Stock.objects.get_or_create(product=self.product)
        stock.quantity += self.quantity
        stock.save()

        # Log stock movement
        StockMovement.objects.create(
            product=self.product,
            quantity=self.quantity,
            movement_type='in',
            notes=f"Purchase from {self.supplier.name}",
            created_by=self.created_by,
        )
class StockMovement(models.Model):
    MOVEMENT_TYPE = (
        ('in', 'In'),
        ('out', 'Out'),
    )

    product = models.ForeignKey(
        Product,
        related_name="movements",
        on_delete=models.CASCADE
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE)
    date_time = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL
    )

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Stock movement quantity must be greater than zero.")

        stock = getattr(self.product, "stock", None)  # use the OneToOne relation safely
        if self.movement_type == 'out' and stock and self.quantity > stock.quantity:
            raise ValidationError(
                f"Cannot move out {self.quantity}; only {stock.quantity} available."
            )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

        stock, _ = Stock.objects.get_or_create(product=self.product)
        if self.movement_type == 'in':
            stock.quantity += self.quantity
        else:
            stock.quantity -= self.quantity
        stock.save()

    def __str__(self):
        return f"{self.product.name} - {self.movement_type} - {self.quantity}"


class Wastage(models.Model):
    product = models.ForeignKey(
        Product, related_name='wastages', on_delete=models.CASCADE
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    reason = models.TextField()
    date_time = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL
    )

    def clean(self):
        if self.quantity <= 0:
            raise ValidationError("Wastage quantity must be greater than zero.")

        # Compute available stock using StockMovement
        movements = StockMovement.objects.filter(product=self.product)
        total_in = movements.filter(movement_type='in').aggregate(Sum('quantity'))['quantity__sum'] or 0
        total_out = movements.filter(movement_type='out').aggregate(Sum('quantity'))['quantity__sum'] or 0
        available_stock = total_in - total_out

        if self.quantity > available_stock:
            raise ValidationError(
                f"Cannot mark {self.quantity} as wastage; only {available_stock} available."
            )

    def save(self, *args, **kwargs):
        # Run model validations first
        self.clean()

        super().save(*args, **kwargs)

        # Reduce stock
        stock, created = Stock.objects.get_or_create(product=self.product)
        stock.quantity -= self.quantity
        stock.save()

        # Log stock movement
        StockMovement.objects.create(
            product=self.product,
            quantity=self.quantity,
            movement_type='out',
            notes=f"Wastage: {self.reason}",
            created_by=self.created_by,
        )

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("electricity", "Electricity"),
        ("salary", "Salary"),
        ("food", "Food/Tea"),
        ("services", "Services"),
        ("petrol", "Petrol"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField()  # 👈 changed
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.category}) - {self.amount}"
