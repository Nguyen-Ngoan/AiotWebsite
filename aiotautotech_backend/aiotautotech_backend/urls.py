# from django.contrib import admin
# from django.urls import path, include
# from core_api.views import root_view, PostListView

# urlpatterns = [
#     path('', root_view, name='root'),
#     path('admin/', admin.site.urls),
#     path('api/posts/', PostListView.as_view(), name='post-list-create'),
# ]


# aiotautotech_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from core_api.views import RootView

urlpatterns = [
    path("admin/", admin.site.urls),

    # API chính
    path("api/", include("core_api.urls")),

    # Trang root: trả về JSON status + endpoints
    path("", RootView.as_view(), name="root"),
]
