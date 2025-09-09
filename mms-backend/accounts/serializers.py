from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'vendor_name', 'subscription_active', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        request_user = self.context['request'].user
        if request_user.role != 'superadmin':
            raise serializers.ValidationError("Only super admin can create accounts.")
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        pw = validated_data.pop('password', None)
        if pw:
            instance.password = make_password(pw)
        return super().update(instance, validated_data)

# Optional: Vendor self-signup
class VendorSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'vendor_name', 'password']

    def create(self, validated_data):
        validated_data['role'] = 'vendor'
        validated_data['subscription_active'] = True
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
