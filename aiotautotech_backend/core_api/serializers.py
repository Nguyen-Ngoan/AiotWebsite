# core_api/serializers.py
from rest_framework import serializers

from .models import Product, ProductItem


class PostSerializer(serializers.Serializer):
    """
    Serializer cho dữ liệu bài viết.
    Firestore là NoSQL, nên ta chỉ định nghĩa các trường dữ liệu.
    """
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()
    author = serializers.CharField(max_length=100, required=False)
    created_at = serializers.DateTimeField(read_only=True)  # Firestore sẽ tự thêm

    # Không cần create() vì logic lưu dùng Firestore trong View.


class ProductItemSerializer(serializers.ModelSerializer):
    """
    1 dòng item trong bundle.
    - child_product_id: id của sản phẩm con (FK)
    """

    # dùng child_product_id để map id → Product
    child_product_id = serializers.PrimaryKeyRelatedField(
        source="child_product",
        queryset=Product.objects.all(),
    )

    class Meta:
        model = ProductItem
        fields = [
            "id",
            "child_product_id",
            "quantity",
            "is_optional",
            "is_default",
            "display_order",
            "note",
        ]


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer cho Product.
    Nếu product_type = 'bundle' => trường items sẽ trả về danh sách ProductItem.
    """

    items = ProductItemSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "description_html",
            "product_type",
            "status",
            "base_price",
            "currency",
            "sku",
            "stock_tracking",
            "stock_qty",
            "min_order_qty",
            "tags",
            "main_image_url",
            "gallery_urls",
            "created_at",
            "updated_at",
            "items",  # danh sách sản phẩm con (nếu là bundle)
        ]


class ProductImageUploadSerializer(serializers.Serializer):
  file = serializers.ImageField()
  seo_file_name = serializers.CharField(max_length=255)
  alt = serializers.CharField(max_length=500)
  title = serializers.CharField(max_length=500, required=False, allow_blank=True)
  type = serializers.ChoiceField(choices=["cover", "gallery", "detail", "dimension"])
  is_primary = serializers.BooleanField(default=False)

  ai_description = serializers.CharField(required=False, allow_blank=True)
  ai_tags = serializers.CharField(required=False, allow_blank=True)
  ai_context = serializers.CharField(required=False, allow_blank=True)
