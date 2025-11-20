from django.contrib import admin
from django.urls import path, include
from core_api.views import root_view, PostListView

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/posts/', PostListView.as_view(), name='post-list-create'),
]
