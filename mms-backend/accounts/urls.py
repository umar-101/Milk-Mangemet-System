from rest_framework.routers import DefaultRouter
from .views import UserViewSet, VendorSignupView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    *router.urls,
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('vendor-signup/', VendorSignupView.as_view(), name='vendor-signup'),
]
