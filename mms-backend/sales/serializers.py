from rest_framework import serializers
from .models import Shop, WholesaleSale, RetailCustomer, RetailSale, Payment
from inventory.models import Stock


# ---------------- Shop Serializer ---------------- #
class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = '__all__'


# ---------------- Wholesale Sale Serializer ---------------- #
class WholesaleSaleSerializer(serializers.ModelSerializer):
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    product_name = serializers.CharField(source='stock.product.name', read_only=True)

    class Meta:
        model = WholesaleSale
        fields = '__all__'
        read_only_fields = ('total_amount', 'cost', 'profit')

    def validate(self, data):
        stock = data.get('stock')
        quantity = data.get('quantity')
        added_water = data.get('added_water', 0)

        if stock and stock.quantity < quantity:
            raise serializers.ValidationError("Not enough stock available.")
        if added_water < 0:
            raise serializers.ValidationError("Added water cannot be negative.")
        return data


# ---------------- Retail Customer Serializer ---------------- #
class RetailCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetailCustomer
        fields = '__all__'


# ---------------- Retail Sale Serializer ---------------- #
class RetailSaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    product_name = serializers.CharField(source='stock.product.name', read_only=True)

    class Meta:
        model = RetailSale
        fields = '__all__'
        read_only_fields = ('total', 'cost', 'profit')

    def validate(self, data):
        stock = data.get('stock')
        quantity = data.get('quantity')
        added_water = data.get('added_water', 0)

        if stock and stock.quantity < quantity:
            raise serializers.ValidationError("Not enough stock available.")
        if added_water < 0:
            raise serializers.ValidationError("Added water cannot be negative.")
        return data


# ---------------- Payment Serializer ---------------- #
class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
