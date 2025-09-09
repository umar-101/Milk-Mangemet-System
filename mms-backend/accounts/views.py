from rest_framework import viewsets, permissions, generics
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, VendorSignupSerializer
from .permissions import IsSuperAdmin

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            return User.objects.all()
        elif user.role == 'vendor':
            return User.objects.filter(id=user.id)
        return User.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'list']:
            return [IsSuperAdmin()]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'vendor':
            serializer.validated_data.pop('role', None)
            serializer.validated_data.pop('subscription_active', None)
        serializer.save()

# Vendor self-signup API
class VendorSignupView(generics.CreateAPIView):
    serializer_class = VendorSignupSerializer
    permission_classes = []  # anyone can sign up
