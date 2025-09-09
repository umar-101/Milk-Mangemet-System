from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import SystemSettingViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'settings', SystemSettingViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
