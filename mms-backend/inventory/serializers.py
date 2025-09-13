from rest_framework import serializers
from .models import Supplier, Product, Stock, Purchase, StockMovement, Wastage, Expense
from django.db.models import Sum, F, Q
VALID_UNITS = ['liter', 'kg']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact', 'address', 'active']


class ProductSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'unit', 'stock_quantity']

    def get_stock_quantity(self, obj):
        stock = getattr(obj, "stock", None)
        return stock.quantity if stock else 0


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
            'extra_ice',
            'rate',
            'total_amount',
            'notes',
            'created_by',
            'date_time'
        ]
        read_only_fields = ['created_by', 'total_amount', 'date_time']

    def create(self, validated_data):
        # attach request.user automatically
        request = self.context.get('request')
        if request and hasattr(request, "user"):
            validated_data['created_by'] = request.user

        # use model's save() logic so stock gets updated
        purchase = Purchase(**validated_data)
        purchase.save()
        return purchase




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
        read_only_fields = ['created_by', 'date_time']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Wastage quantity must be greater than zero")
        return value

    def validate(self, data):
        product = data['product']
        quantity = data['quantity']

        stock = getattr(product, 'stock', None)
        available_stock = stock.quantity if stock else 0

        if quantity > available_stock:
            raise serializers.ValidationError(
                f"Cannot mark {quantity} as wastage; only {available_stock} available."
            )
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, "user"):
            validated_data['created_by'] = request.user

        # Just create → model's save() will handle stock + StockMovement
        return Wastage.objects.create(**validated_data)


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["id", "name", "category", "amount", "date", "description"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Expense amount must be greater than zero")
        return value
