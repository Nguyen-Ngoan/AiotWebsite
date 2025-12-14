# core_api/models.py
from django.db import models


class Product(models.Model):
    """
    Sản phẩm cơ bản.
    Có thể là:
    - simple  : sản phẩm đơn
    - bundle  : sản phẩm dạng kit, gồm nhiều sản phẩm con (ProductItem)
    - service : dịch vụ (nếu cần sau này)
    """

    PRODUCT_TYPE_SIMPLE = "simple"
    PRODUCT_TYPE_BUNDLE = "bundle"
    PRODUCT_TYPE_SERVICE = "service"

    PRODUCT_TYPE_CHOICES = [
        (PRODUCT_TYPE_SIMPLE, "Simple"),
        (PRODUCT_TYPE_BUNDLE, "Bundle / Kit"),
        (PRODUCT_TYPE_SERVICE, "Service"),
    ]

    STATUS_DRAFT = "draft"
    STATUS_ACTIVE = "active"
    STATUS_ARCHIVED = "archived"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_ARCHIVED, "Archived"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)

    short_description = models.TextField(blank=True)
    # Nội dung chi tiết (HTML giống phần blog/post detail)
    description_html = models.TextField(blank=True)

    product_type = models.CharField(
        max_length=16,
        choices=PRODUCT_TYPE_CHOICES,
        default=PRODUCT_TYPE_SIMPLE,
    )
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
    )

    # Giá / tồn kho cơ bản (chưa tính variant)
    base_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Giá cơ bản của sản phẩm (VND).",
    )
    currency = models.CharField(max_length=8, default="VND")

    sku = models.CharField(
        max_length=64,
        blank=True,
        help_text="Mã SKU nội bộ, dùng cho quản lý kho.",
    )

    stock_tracking = models.BooleanField(
        default=True,
        help_text="Có theo dõi tồn kho cho sản phẩm này hay không.",
    )
    stock_qty = models.PositiveIntegerField(
        default=0,
        help_text="Số lượng tồn kho hiện tại (nếu có theo dõi).",
    )
    min_order_qty = models.PositiveIntegerField(
        default=1,
        help_text="Số lượng tối thiểu khi đặt hàng.",
    )

    # Tag dạng chuỗi, ngăn cách bởi dấu phẩy: "esp32, stepper, diy"
    tags = models.CharField(
        max_length=255,
        blank=True,
        help_text="Tags, ngăn cách bởi dấu phẩy.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self) -> str:
        return self.title


class ProductItem(models.Model):
    """
    1 dòng item trong bundle / kit.
    - parent_product: sản phẩm cha (bundle)
    - child_product : sản phẩm con
    - quantity      : số lượng sản phẩm con trong bộ
    - is_optional   : có thể bỏ chọn hay không
    - is_default    : mặc định được chọn khi hiển thị
    - display_order : thứ tự hiển thị trong UI
    - note          : ghi chú thêm
    """

    parent_product = models.ForeignKey(
        Product,
        related_name="items",
        on_delete=models.CASCADE,
        help_text="Sản phẩm cha (bundle/kit).",
    )
    child_product = models.ForeignKey(
        Product,
        related_name="used_in_bundles",
        on_delete=models.PROTECT,
        help_text="Sản phẩm con thuộc bộ.",
    )

    quantity = models.PositiveIntegerField(default=1)
    is_optional = models.BooleanField(
        default=False,
        help_text="Nếu True thì item này có thể bỏ chọn khi cấu hình kit.",
    )
    is_default = models.BooleanField(
        default=True,
        help_text="Nếu False thì item này không được chọn sẵn.",
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Thứ tự hiển thị trong danh sách sản phẩm con.",
    )
    note = models.CharField(
        max_length=255,
        blank=True,
        help_text="Ghi chú hiển thị (ví dụ: 'Có thể thay cảm biến khác').",
    )

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self) -> str:
        return f"{self.parent_product} → {self.child_product} x{self.quantity}"


class Material(models.Model):
    name = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    specifications = models.TextField(blank=True)

    def __str__(self):
        return self.name
