# core_api/urls.py

from django.urls import path
from .views import (
    RootView,
    PostListView,
    PostDetailView,
    ProductListView,
    ProductDetailView,
    ProductImageUploadView,
    ProductImageDeleteView,
    TechnicalDocListView,
    TechnicalDocDetailView,
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
    path(
        "products/<str:product_id>/images/delete/",
        ProductImageDeleteView.as_view(),
        name="product-image-delete",
    ),

    # Technical Docs (Cấu trúc mới)
    path("technical-docs/", TechnicalDocListView.as_view(), name="technical-doc-list"),
    path("technical-docs/<str:doc_id>/", TechnicalDocDetailView.as_view(), name="technical-doc-detail"),
]
