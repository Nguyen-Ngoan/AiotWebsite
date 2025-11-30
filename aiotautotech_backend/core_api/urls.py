# core_api/urls.py

from django.urls import path
from .views import (
    RootView,
    PostListView,
    PostDetailView,
    ProductListView,
    ProductDetailView,
    ProductImageUploadView,
    ProductDocUploadView,
)

urlpatterns = [
    path("", RootView.as_view(), name="api-root"),

    # Posts
    path("posts/", PostListView.as_view(), name="post-list-create"),
    path("posts/<str:post_id>/", PostDetailView.as_view(), name="post-detail"),

    # Products (lưu trên Firestore, không dùng DB Django)
    path("products/", ProductListView.as_view(), name="product-list-create"),
    path("products/<str:product_id>/", ProductDetailView.as_view(), name="product-detail"),
    path(
        "products/<str:product_id>/images/",
        ProductImageUploadView.as_view(),
        name="product-image-upload",
    ),

    # Product Docs
    path("products/<str:product_id>/docs/", ProductDocUploadView.as_view(), name="product-doc-upload"),
]
