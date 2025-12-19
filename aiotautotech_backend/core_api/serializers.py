# core_api/serializers.py
from rest_framework import serializers

from .models import Product, ProductItem, Material


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
            "created_at",
            "updated_at",
            "items",  # danh sách sản phẩm con (nếu là bundle)
        ]


class ProductImageUploadSerializer(serializers.Serializer):
    file = serializers.ImageField()
    seo_file_name = serializers.CharField(max_length=255)
    alt = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,   
    )
    title = serializers.CharField(max_length=500, required=False, allow_blank=True)
    type = serializers.ChoiceField(choices=["cover", "gallery", "detail", "dimension"])
    is_primary = serializers.BooleanField(default=False)

    ai_description = serializers.CharField(required=False, allow_blank=True)
    ai_tags = serializers.CharField(required=False, allow_blank=True)
    ai_context = serializers.CharField(required=False, allow_blank=True)


class TechnicalDocSerializer(serializers.Serializer):
    """
    Serializer cho việc tạo/cập nhật một tài liệu trong collection `technical_docs`.
    """
    file = serializers.FileField(required=False) # Không bắt buộc khi chỉ cập nhật metadata
    thumbnail_file = serializers.ImageField(required=False) # Thêm trường cho file thumbnail
    doc_type = serializers.ChoiceField(
        choices=[
            "datasheet", "schematic", "step_model",
            "stl_files", "user_manual", "github_repo", "gcode_file"
        ]
    )
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    version = serializers.CharField(max_length=50, required=False, allow_blank=True)


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'name', 'unit_price', 'specifications']
