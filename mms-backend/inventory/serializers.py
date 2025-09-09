from rest_framework import serializers
from .models import Supplier, Product, Stock, Purchase, StockMovement, Wastage, Expense

VALID_UNITS = ['liter', 'kg']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact', 'address', 'active']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'unit']

    def validate_unit(self, value):
        if value not in VALID_UNITS:
            raise serializers.ValidationError(f"Unit must be one of {VALID_UNITS}")
        return value


# serializers.py

class StockSerializer(serializers.ModelSerializer):
    # Read-only nested product info for display
    product = ProductSerializer(read_only=True)
    # Write-only product_id field for create/update
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Stock
        fields = ['id', 'product', 'product_id', 'quantity', 'created_at']



class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = [
            'id',
            'supplier',
            'product',
            'quantity',
            'extra_ice',   # <- add this
            'rate',
            'total_amount', # optional if you want frontend to receive stored total
            'notes',
            'created_by',
            'date_time'
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Purchase quantity must be greater than zero")
        return value

    def validate(self, data):
        # Ensure product is valid
        if not data.get("product"):
            raise serializers.ValidationError("Purchase must be linked to a valid product.")
        return data


class StockMovementSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",   # maps product_id → product FK
        write_only=True
    )

    class Meta:
        model = StockMovement
        fields = [
            'id',
            'product',       # returned in response
            'product_id',    # accepted on create/update
            'quantity',
            'movement_type',
            'notes',
            'created_by',
            'date_time'
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Stock movement quantity must be greater than zero")
        return value



class WastageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wastage
        fields = ['id', 'product', 'quantity', 'reason', 'date_time', 'created_by']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Wastage quantity must be greater than zero")
        return value


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'name', 'amount', 'date']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Expense amount must be greater than zero")
        return value
