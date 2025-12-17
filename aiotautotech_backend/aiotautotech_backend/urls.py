# aiotautotech_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from core_api.views import RootView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Main API endpoints
    path("api/", include("core_api.urls")),

    # Trang root: trả về JSON status + endpoints
    path("", RootView.as_view(), name="root"),
]
