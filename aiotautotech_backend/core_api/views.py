# core_api/views.py

import mimetypes
from typing import Any, Dict, List
from django.utils import timezone
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from aiotautotech_backend.firestore_client import db
from .utils import slugify

from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ProductImageUploadSerializer
from storage.r2 import upload_file_to_r2, generate_image_key
from services.firestore_products import add_product_image_metadata

def _serialize_post(doc):
    data = doc.to_dict() or {}

    return {
        "id": doc.id,
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "author": data.get("author", ""),
        "slug": data.get("slug", ""),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


def _serialize_product(doc):
    data = doc.to_dict() or {}

    return {
        "id": doc.id,
        "title": data.get("title", ""),
        "slug": data.get("slug", ""),
        "short_description": data.get("short_description", ""),
        "description_html": data.get("description_html", ""),
        "product_type": data.get("product_type", ""),
        "status": data.get("status", ""),
        "base_price": data.get("base_price"),
        "currency": data.get("currency", "VND"),
        "sku": data.get("sku", ""),
        "stock_tracking": data.get("stock_tracking", True),
        "stock_qty": data.get("stock_qty", 0),
        "min_order_qty": data.get("min_order_qty", 1),
        "tags": data.get("tags", []),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),

        # Media
        "main_image_url": data.get("main_image_url") or "",
        "gallery_urls": data.get("gallery_urls") or [],

        # SEO
        "seo_title": data.get("seo_title", "") or "",
        "seo_description": data.get("seo_description", "") or "",
        "og_image": data.get("og_image", "") or "",

        # Tech docs
        "datasheet_url": data.get("datasheet_url", "") or "",
        "schematic_url": data.get("schematic_url", "") or "",
        "step_model_url": data.get("step_model_url", "") or "",
        "stl_files_url": data.get("stl_files_url", "") or "",
        "user_manual_url": data.get("user_manual_url", "") or "",
        "github_repo_url": data.get("github_repo_url", "") or "",
    }


class RootView(APIView):
    """
    GET /  -> trả về thông tin backend + các endpoint chính.
    """

    def get(self, request, *args, **kwargs):
        base_url = request.build_absolute_uri("/")
        # remove trailing slash nếu có
        if base_url.endswith("/"):
            base_url = base_url[:-1]

        return Response(
            {
                "status": "Django API Backend đang hoạt động",
                "project": "AiotAutotech API",
                "endpoints": {
                    "list_create_posts": f"{base_url}/api/posts/",
                    "retrieve_post": f"{base_url}/api/posts/<post_id>/",
                    "list_create_products": f"{base_url}/api/products/",
                    "retrieve_product": f"{base_url}/api/products/<product_id>/",
                },
            }
        )


class PostListView(APIView):
    """
    GET /api/posts/  -> lấy danh sách bài viết
    POST /api/posts/ -> tạo bài viết mới
    """

    def get(self, request, *args, **kwargs):
        # Lấy tối đa 50 bài viết, order theo updated_at giảm dần
        query = (
            db.collection("posts")
            .order_by("updated_at", direction="DESCENDING")
            .limit(50)
        )

        docs = query.stream()
        posts = [_serialize_post(doc) for doc in docs]

        return Response(posts)

    def post(self, request):
        data = request.data
        title = (data.get("title") or "").strip()
        content = (data.get("content") or "").strip()
        author = (data.get("author") or "").strip()
        slug_input = (data.get("slug") or "").strip()  # cho phép client gửi slug custom

        if not title:
            return Response({"error": "Title is required"}, status=400)

        # Ưu tiên slug client gửi, nếu trống thì tự sinh từ title
        slug = slugify(slug_input or title)

        now = timezone.now()

        payload = {
            "title": title,
            "content": content,
            "author": author or "Unknown",
            "slug": slug,  # BẮT BUỘC CÓ SLUG
            "created_at": now,
            "updated_at": now,
        }

        doc_ref = db.collection("posts").document()
        doc_ref.set(payload)

        doc = doc_ref.get()
        return Response(_serialize_post(doc), status=201)


class PostDetailView(APIView):
    """
    GET    /api/posts/<post_id>/    -> xem chi tiết 1 bài
    PUT    /api/posts/<post_id>/    -> cập nhật bài viết
    DELETE /api/posts/<post_id>/    -> xoá bài viết
    """

    def get_object(self, post_id: str):
        doc_ref = db.collection("posts").document(post_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise Http404
        return doc  # DocumentSnapshot

    def get(self, request, post_id: str, *args, **kwargs):
        doc = self.get_object(post_id)
        return Response(_serialize_post(doc))

    def put(self, request, post_id):
        doc_ref = db.collection("posts").document(post_id)
        doc = doc_ref.get()
        if not doc.exists:
            return Response({"error": "Post not found"}, status=404)

        data = request.data
        update_data = {}

        title = data.get("title")
        content = data.get("content")
        author = data.get("author")
        slug_input = data.get("slug")

        if title is not None:
            title = title.strip()
            update_data["title"] = title

        if content is not None:
            update_data["content"] = content

        if author is not None:
            update_data["author"] = author

        # Chính sách slug khi update:
        # - Nếu client gửi slug → dùng slug đó (slug custom)
        # - Nếu không gửi slug:
        #   - GIỮ slug cũ (không auto đổi theo title mới, tránh gãy link)
        if slug_input is not None:
            slug_input = (slug_input or "").strip()
            update_data["slug"] = slugify(slug_input) if slug_input else ""

        update_data["updated_at"] = timezone.now()

        if update_data:
            doc_ref.update(update_data)

        doc = doc_ref.get()
        return Response(_serialize_post(doc))

    def delete(self, request, post_id: str, *args, **kwargs):
        """
        Xoá 1 bài viết khỏi Firestore.
        (Dùng tạm cho admin/dev – chưa có auth.)
        """
        doc = self.get_object(post_id)
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductListView(APIView):
    """
    GET /api/products/  -> lấy danh sách sản phẩm
    POST /api/products/ -> tạo sản phẩm mới (lưu vào Firestore, KHÔNG dùng DB Django)
    """

    def get(self, request, *args, **kwargs):
        # Lấy tối đa 50 sản phẩm, order theo updated_at giảm dần (nếu có)
        query = (
            db.collection("products")
            .order_by("updated_at", direction="DESCENDING")
            .limit(50)
        )

        docs = query.stream()
        products = [_serialize_product(doc) for doc in docs]
        return Response(products)

    def post(self, request, *args, **kwargs):
        data = request.data

        title = (data.get("title") or "").strip()
        slug_input = (data.get("slug") or "").strip()

        if not title:
            return Response({"error": "Title is required"}, status=400)

        slug = slugify(slug_input or title)

        short_description = (data.get("short_description") or "").strip()
        description_html = (data.get("description_html") or "").strip()
        product_type = (data.get("product_type") or "simple").strip()
        status_value = (data.get("status") or "draft").strip()

        # Các trường số: chấp nhận cả string lẫn number
        def to_int(value, default=None):
            if value in (None, ""):
                return default
            try:
                return int(value)
            except (TypeError, ValueError):
                try:
                    return int(float(value))
                except (TypeError, ValueError):
                    return default

        def to_float(value, default=None):
            if value in (None, ""):
                return default
            try:
                return float(value)
            except (TypeError, ValueError):
                return default

        base_price = to_float(data.get("base_price"), default=None)
        currency = (data.get("currency") or "VND").strip() or "VND"
        sku = (data.get("sku") or "").strip()
        stock_tracking = bool(data.get("stock_tracking", True))
        stock_qty = to_int(data.get("stock_qty"), default=0) or 0
        min_order_qty = to_int(data.get("min_order_qty"), default=1) or 1

        # Tags: có thể là list hoặc string
        tags = data.get("tags") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]

        # Media
        main_image_url = (data.get("main_image_url") or "").strip()
        gallery_raw = data.get("gallery_urls") or []
        if isinstance(gallery_raw, str):
            # Cho phép gửi string phân tách bằng xuống dòng hoặc dấu phẩy
            gallery_urls = [
                u.strip()
                for part in gallery_raw.splitlines()
                for u in part.split(",")
                if u.strip()
            ]
        elif isinstance(gallery_raw, (list, tuple)):
            gallery_urls = [str(u).strip() for u in gallery_raw if str(u).strip()]
        else:
            gallery_urls = []

        # SEO
        seo_title = (data.get("seo_title") or "").strip()
        seo_description = (data.get("seo_description") or "").strip()
        og_image = (data.get("og_image") or "").strip()

        # Tech docs
        datasheet_url = (data.get("datasheet_url") or "").strip()
        schematic_url = (data.get("schematic_url") or "").strip()
        step_model_url = (data.get("step_model_url") or "").strip()
        stl_files_url = (data.get("stl_files_url") or "").strip()
        user_manual_url = (data.get("user_manual_url") or "").strip()
        github_repo_url = (data.get("github_repo_url") or "").strip()

        now = timezone.now()

        payload = {
            "title": title,
            "slug": slug,
            "short_description": short_description,
            "description_html": description_html,
            "product_type": product_type,
            "status": status_value,
            "base_price": base_price,
            "currency": currency,
            "sku": sku,
            "stock_tracking": stock_tracking,
            "stock_qty": stock_qty,
            "min_order_qty": min_order_qty,
            "tags": tags,

            # Media
            "main_image_url": main_image_url,
            "gallery_urls": gallery_urls,

            # SEO
            "seo_title": seo_title,
            "seo_description": seo_description,
            "og_image": og_image,

            # Tech docs
            "datasheet_url": datasheet_url,
            "schematic_url": schematic_url,
            "step_model_url": step_model_url,
            "stl_files_url": stl_files_url,
            "user_manual_url": user_manual_url,
            "github_repo_url": github_repo_url,

            "created_at": now,
            "updated_at": now,
        }

        doc_ref = db.collection("products").document()
        doc_ref.set(payload)

        doc = doc_ref.get()
        return Response(_serialize_product(doc), status=201)


class ProductDetailView(APIView):
    """
    GET    /api/products/<product_id>/    -> xem chi tiết 1 sản phẩm
    PUT    /api/products/<product_id>/    -> cập nhật sản phẩm
    DELETE /api/products/<product_id>/    -> xoá sản phẩm
    Tất cả đều thao tác trên Firestore, KHÔNG dùng DB Django.
    """

    def get_object(self, product_id: str):
        doc_ref = db.collection("products").document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise Http404
        return doc

    def get(self, request, product_id: str, *args, **kwargs):
        doc = self.get_object(product_id)
        return Response(_serialize_product(doc))

    def put(self, request, product_id: str, *args, **kwargs):
        doc_ref = db.collection("products").document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            return Response({"error": "Product not found"}, status=404)

        data = request.data
        update_data = {}

        # Các trường text cơ bản
        if "title" in data:
            title = (data.get("title") or "").strip()
            update_data["title"] = title

        if "short_description" in data:
            update_data["short_description"] = (data.get("short_description") or "").strip()

        if "description_html" in data:
            update_data["description_html"] = (data.get("description_html") or "").strip()

        if "product_type" in data:
            update_data["product_type"] = (data.get("product_type") or "").strip()

        if "status" in data:
            update_data["status"] = (data.get("status") or "").strip()

        if "sku" in data:
            update_data["sku"] = (data.get("sku") or "").strip()

        if "currency" in data:
            currency = (data.get("currency") or "VND").strip() or "VND"
            update_data["currency"] = currency

        # slug: chỉ đổi nếu client gửi slug
        if "slug" in data:
            slug_input = (data.get("slug") or "").strip()
            update_data["slug"] = slugify(slug_input) if slug_input else ""

        # Các trường số / bool
        def to_int(value, default=None):
            if value in (None, ""):
                return default
            try:
                return int(value)
            except (TypeError, ValueError):
                try:
                    return int(float(value))
                except (TypeError, ValueError):
                    return default

        def to_float(value, default=None):
            if value in (None, ""):
                return default
            try:
                return float(value)
            except (TypeError, ValueError):
                return default

        if "base_price" in data:
            update_data["base_price"] = to_float(data.get("base_price"), default=None)

        if "stock_tracking" in data:
            update_data["stock_tracking"] = bool(data.get("stock_tracking"))

        if "stock_qty" in data:
            update_data["stock_qty"] = to_int(data.get("stock_qty"), default=0) or 0

        if "min_order_qty" in data:
            update_data["min_order_qty"] = to_int(data.get("min_order_qty"), default=1) or 1

        if "tags" in data:
            tags = data.get("tags") or []
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(",") if t.strip()]
            update_data["tags"] = tags

        # Media
        if "main_image_url" in data:
            update_data["main_image_url"] = (data.get("main_image_url") or "").strip()

        if "gallery_urls" in data:
            gallery_raw = data.get("gallery_urls") or []
            if isinstance(gallery_raw, str):
                gallery_urls = [
                    u.strip()
                    for part in gallery_raw.splitlines()
                    for u in part.split(",")
                    if u.strip()
                ]
            elif isinstance(gallery_raw, (list, tuple)):
                gallery_urls = [str(u).strip() for u in gallery_raw if str(u).strip()]
            else:
                gallery_urls = []
            update_data["gallery_urls"] = gallery_urls

        # SEO
        if "seo_title" in data:
            update_data["seo_title"] = (data.get("seo_title") or "").strip()

        if "seo_description" in data:
            update_data["seo_description"] = (data.get("seo_description") or "").strip()

        if "og_image" in data:
            update_data["og_image"] = (data.get("og_image") or "").strip()

        # Tech docs
        if "datasheet_url" in data:
            update_data["datasheet_url"] = (data.get("datasheet_url") or "").strip()

        if "schematic_url" in data:
            update_data["schematic_url"] = (data.get("schematic_url") or "").strip()

        if "step_model_url" in data:
            update_data["step_model_url"] = (data.get("step_model_url") or "").strip()

        if "stl_files_url" in data:
            update_data["stl_files_url"] = (data.get("stl_files_url") or "").strip()

        if "user_manual_url" in data:
            update_data["user_manual_url"] = (data.get("user_manual_url") or "").strip()

        if "github_repo_url" in data:
            update_data["github_repo_url"] = (data.get("github_repo_url") or "").strip()

        update_data["updated_at"] = timezone.now()

        if update_data:
            doc_ref.update(update_data)

        doc = doc_ref.get()
        return Response(_serialize_product(doc))


    def delete(self, request, product_id: str, *args, **kwargs):
        doc = self.get_object(product_id)
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductImageUploadView(APIView):
    """
    POST /api/products/<product_id>/images/

    Multipart form-data:
      - file: ảnh
      - seo_file_name
      - alt
      - title
      - type
      - is_primary
      - ai_description
      - ai_tags (comma separated)
      - ai_context
    """

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, product_id: str, format=None):
        serializer = ProductImageUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        file_obj = validated["file"]

        seo_file_name: str = validated["seo_file_name"]
        alt: str = validated["alt"]
        title: str = validated.get("title") or ""
        img_type: str = validated["type"]
        is_primary: bool = validated.get("is_primary", False)

        ai_description: str = validated.get("ai_description", "")
        ai_tags_raw: str = validated.get("ai_tags", "")
        ai_context: str = validated.get("ai_context", "")

        # Parse AI tags: "linear_rail, stepper_motor" -> ["linear_rail", "stepper_motor"]
        ai_tags: List[str] = [
            tag.strip() for tag in ai_tags_raw.split(",") if tag.strip()
        ]

        # Content-Type
        content_type, _ = mimetypes.guess_type(file_obj.name)
        if not content_type:
            content_type = "image/jpeg"

        # Key trên R2
        key = generate_image_key(product_id, seo_file_name)

        # Upload lên R2
        try:
            public_url = upload_file_to_r2(
                file_obj=file_obj,
                key=key,
                content_type=content_type,
            )
        except Exception as e:
            return Response(
                {"detail": f"Cannot upload to R2: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Build metadata
        image_data: Dict[str, Any] = {
            "id": key,  # hoặc uuid, tuỳ bạn
            "url": public_url,
            "fileName": seo_file_name,
            "alt": alt,
            "title": title,
            "type": img_type,
            "isPrimary": is_primary,
            "aiDescription": ai_description,
            "aiTags": ai_tags,
            "aiContext": ai_context,
        }

        # Lưu vào Firestore
        try:
            add_product_image_metadata(product_id=product_id, image_data=image_data)
        except ValueError as ve:
            # Product chưa tồn tại
            return Response(
                {"detail": str(ve)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": f"Cannot save metadata to Firestore: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(image_data, status=status.HTTP_201_CREATED)