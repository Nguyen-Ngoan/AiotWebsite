# # core_api/urls.py
# from django.urls import path
# from .views import PostCreateView

# urlpatterns = [
#     path('posts/', PostCreateView.as_view(), name='post-create'),
# ]

# core_api/urls.py

from django.urls import path
from .views import RootView, PostListView, PostDetailView

urlpatterns = [
    path("", RootView.as_view(), name="api-root"),

    # /api/posts/
    path("posts/", PostListView.as_view(), name="post-list-create"),

    # /api/posts/<post_id>/
    path("posts/<str:post_id>/", PostDetailView.as_view(), name="post-detail"),
]
