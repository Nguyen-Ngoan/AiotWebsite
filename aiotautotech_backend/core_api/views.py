# core_api/views.py

from typing import Any, Dict, List
from django.utils import timezone
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser

from aiotautotech_backend.firestore_client import db
from .utils import slugify
from .serializers import ProductImageUploadSerializer, TechnicalDocSerializer
from storage.r2 import upload_file_to_r2, generate_image_key
from services.firestore_products import add_product_image_metadata

import io
from PIL import Image
import boto3
import uuid
import os
from django.core.files.temp import NamedTemporaryFile
import pyvista as pv
import sys


from django.conf import settings


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

def _serialize_tech_doc(doc):
    """
    Serialize một document từ collection `technical_docs`.
    """
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "doc_type": data.get("doc_type", ""),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "url": data.get("url", ""),
        "thumbnail_url": data.get("thumbnail_url"), # Có thể là None
        "version": data.get("version", ""),
        "file_size": data.get("file_size"),
        "updated_at": data.get("updated_at"),
    }

def _serialize_product(doc):
    data = doc.to_dict() or {}

    images = data.get("images") or []
    if not isinstance(images, list):
        images = []

    # --- LOGIC MỚI: Lấy thông tin chi tiết của technical docs ---
    tech_doc_ids = data.get("tech_doc_ids", [])
    technical_docs = []
    if tech_doc_ids:
        doc_refs = [db.collection("technical_docs").document(doc_id) for doc_id in tech_doc_ids]
        docs = db.get_all(doc_refs) # Batch get
        technical_docs = [_serialize_tech_doc(doc) for doc in docs if doc.exists]
    # -----------------------------------------------------------

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

        # Media: `images` là nguồn dữ liệu duy nhất
        "images": images,

        # SEO
        "seo_title": data.get("seo_title", "") or "",
        "seo_description": data.get("seo_description", "") or "",
        "og_image": data.get("og_image", "") or "",

        # --- Cấu trúc mới ---
        "tech_doc_ids": tech_doc_ids, # Trả về danh sách ID
        "technical_docs": technical_docs, # Trả về danh sách object chi tiết

        # === Features ===
        "keyFeatures": data.get("key_features", []), # Trả về camelCase
        "useCases": data.get("use_cases", []),       # Trả về camelCase
        "limitations": data.get("limitations", []),
        "compatibility": data.get("compatibility", []), # Giữ nguyên vì đã nhất quán
        "specs": data.get("specs", []),                 # Giữ nguyên vì đã nhất quán

        # "docs": data.get("docs") or {}, # Loại bỏ trường `docs` cũ
    }


def create_stl_thumbnail(stl_file_path):
    """
    Tạo ảnh thumbnail từ file STL và trả về dưới dạng bytes.
    Trả về None nếu có lỗi.
    """
    plotter = None
    try:
        # Kích hoạt framebuffer ảo (Xvfb) CHỈ trên Linux (môi trường server/Cloud Run)
        # để đảm bảo render off-screen một cách đáng tin cậy.
        if sys.platform.startswith('linux'):
            pv.start_xvfb()

        # Bật chế độ render off-screen (quan trọng cho Cloud Run)
        pv.set_plot_theme("document")

        # Đọc file STL
        mesh = pv.read(stl_file_path)

        # Tạo một plotter
        plotter = pv.Plotter(
            off_screen=True,
            window_size=[800, 800],  # 1. Tăng độ phân giải
            # Bật khử răng cưa để các cạnh mượt hơn
            line_smoothing=True, 
            polygon_smoothing=True
        )

        # Thêm vật thể vào plotter
        plotter.add_mesh(
            mesh,
            color="royalblue",
            style='surface',      # QUAN TRỌNG: Đảm bảo render bề mặt
            smooth_shading=False, # Hiển thị rõ các mặt phẳng (facet)
        )

        # Đặt camera để nhìn rõ vật thể
        plotter.view_isometric()
        plotter.camera.zoom(1)
        
        # --- Thiết lập ánh sáng tùy chỉnh để tránh cháy sáng ---
        # 1. Tắt tất cả các đèn mặc định (đặc biệt là "headlight")
        # plotter.remove_all_lights()

        # 2. Chỉ sử dụng một nguồn sáng chính, dịu hơn, chiếu từ bên cạnh
        # main_light = pv.Light(position=(-1, 1, 0.5), intensity=0.8)
        # plotter.add_light(main_light)

        # Chụp ảnh và lưu vào buffer
        img_buffer = io.BytesIO()
        plotter.screenshot(img_buffer, transparent_background=True)

        img_buffer.seek(0)
        return img_buffer.getvalue()

    except Exception as e:
        print(f"Error creating STL thumbnail: {e}")
        return None
    finally:
        if plotter:
            plotter.close()


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
        data = request.data or {}

        title = (data.get("title") or "").strip()
        if not title:
            return Response(
                {"detail": "Title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slug = data.get("slug") or slugify(title)

        # Đọc các field features (support cả snake_case và camelCase)
        key_features = data.get("key_features")
        if key_features is None:
            key_features = data.get("keyFeatures", [])

        use_cases = data.get("use_cases")
        if use_cases is None:
            use_cases = data.get("useCases", [])

        limitations = data.get("limitations")
        if limitations is None:
            limitations = data.get("limitations", [])

        compatibility = data.get("compatibility")
        if compatibility is None:
            compatibility = data.get("compatibility", [])

        specs = data.get("specs", [])

        # Đảm bảo list
        if not isinstance(key_features, list):
            key_features = []
        if not isinstance(use_cases, list):
            use_cases = []
        if not isinstance(limitations, list):
            limitations = []
        if not isinstance(compatibility, list):
            compatibility = []
        if not isinstance(specs, list):
            specs = []

        payload = {
            "title": title,
            "slug": slug,
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

            # === Features (NEW) ===
            "key_features": key_features,
            "use_cases": use_cases,
            "limitations": limitations,
            "compatibility": compatibility,
            "specs": specs,
        }

        now = timezone.now()
        payload["created_at"] = now
        payload["updated_at"] = now

        doc_ref = db.collection("products").document()
        doc_ref.set(payload)

        return Response(_serialize_product(doc_ref.get()), status=status.HTTP_201_CREATED)


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

        data = request.data or {}
        update_data: Dict[str, Any] = {}

        # Các trường text cơ bản
        if "title" in data:
            title = (data.get("title") or "").strip()
            update_data["title"] = title

        if "short_description" in data:
            update_data["short_description"] = (
                data.get("short_description") or ""
            ).strip()

        if "description_html" in data:
            update_data["description_html"] = (
                data.get("description_html") or ""
            ).strip()

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
            update_data["base_price"] = to_float(
                data.get("base_price"), default=None
            )

        if "stock_tracking" in data:
            update_data["stock_tracking"] = bool(data.get("stock_tracking"))

        if "stock_qty" in data:
            update_data["stock_qty"] = to_int(
                data.get("stock_qty"), default=0
            ) or 0

        if "min_order_qty" in data:
            update_data["min_order_qty"] = to_int(
                data.get("min_order_qty"), default=1
            ) or 1

        if "tags" in data:
            tags = data.get("tags") or []
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(",") if t.strip()]
            update_data["tags"] = tags

        # images: full metadata list từ UI admin (xoá / edit image)
        if "images" in data:
            images = data.get("images") or []
            if isinstance(images, (list, tuple)):
                # không validate sâu – tin tưởng dữ liệu từ admin UI
                update_data["images"] = list(images)


        # SEO
        if "seo_title" in data:
            update_data["seo_title"] = (data.get("seo_title") or "").strip()

        if "seo_description" in data:
            update_data["seo_description"] = (
                data.get("seo_description") or ""
            ).strip()

        if "og_image" in data:
            update_data["og_image"] = (data.get("og_image") or "").strip()

        # Tech docs (cấu trúc mới: chỉ lưu IDs)
        if "tech_doc_ids" in data:
            update_data["tech_doc_ids"] = data.get("tech_doc_ids", [])
            
        # === Features (NEW) ===

        # key_features: chấp nhận cả key_features & keyFeatures
        if "key_features" in data or "keyFeatures" in data:
            key_features = data.get("key_features")
            if key_features is None:
                key_features = data.get("keyFeatures", [])
            if not isinstance(key_features, list):
                key_features = []
            update_data["key_features"] = key_features

        # use_cases: chấp nhận cả use_cases & useCases
        if "use_cases" in data or "useCases" in data:
            use_cases = data.get("use_cases")
            if use_cases is None:
                use_cases = data.get("useCases", [])
            if not isinstance(use_cases, list):
                use_cases = []
            update_data["use_cases"] = use_cases

        # limitations
        if "limitations" in data:
            limitations = data.get("limitations") # Không cần gán giá trị mặc định ở đây
            if not isinstance(limitations, list):
                limitations = []
            update_data["limitations"] = limitations

        # compatibility
        if "compatibility" in data:
            compatibility = data.get("compatibility") # Không cần gán giá trị mặc định ở đây
            if not isinstance(compatibility, list):
                compatibility = []
            update_data["compatibility"] = compatibility

        # specs
        if "specs" in data:
            specs = data.get("specs", [])
            if not isinstance(specs, list):
                specs = []
            update_data["specs"] = specs

        # updated_at
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
    def post(self, request, product_id):
        try:
            file = request.FILES.get("file")
            if not file:
                return Response({"error": "No file uploaded"}, status=400)

            # ---- Lấy metadata từ request.data ----
            serializer = ProductImageUploadSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            seo_file_name = validated_data.get("seo_file_name") or file.name.rsplit(".", 1)[0]

            # ---- Read image ----
            img = Image.open(file).convert("RGB")

            # ---- Define sizes (3:2) ----
            SIZES = {
                "large":  (1500, 1000),
                "medium": (1200, 800),
                "thumb":  (600, 400),
            }

            resized_files = {}

            for key, (w, h) in SIZES.items():
                buf = io.BytesIO()
                resized = img.resize((w, h), Image.Resampling.LANCZOS)
                resized.save(buf, format="JPEG", quality=85)
                buf.seek(0)
                resized_files[key] = buf

            # ---- Upload 3 files to R2 ----
            session = boto3.session.Session()
            s3 = session.client(
                "s3",
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            )

            # Sử dụng seo_file_name đã được validate
            base_name = slugify(seo_file_name)
            folder = f"images/products/{product_id}"

            urls = {}

            for key, buf in resized_files.items():
                r2_key = f"{folder}/{base_name}-{key}.jpg"

                s3.upload_fileobj(
                    buf,
                    settings.R2_BUCKET_NAME,
                    r2_key,
                    ExtraArgs={"ContentType": "image/jpeg"}
                )

                urls[key] = (
                    f"{settings.CDN_URL}/{r2_key}"
                )

            # ---- Lưu metadata vào Firestore ----
            doc_ref = db.collection("products").document(product_id)
            doc = doc_ref.get()
            data = doc.to_dict() or {}

            images = data.get("images", [])
            new_img_meta = {
                "id": base_name, # Dùng slugified base_name làm ID
                "fileName": base_name,
                "type": validated_data.get("type", "gallery"),
                "isPrimary": validated_data.get("is_primary", False),
                "url": urls["large"],
                "url_medium": urls["medium"],
                "url_thumb": urls["thumb"],
                "alt": validated_data.get("alt", ""),
                "title": validated_data.get("title", ""),
            }

            images.append(new_img_meta)
            doc_ref.update({"images": images})

            return Response({"images": images}, status=200)

        except Exception as e:
            print("Resize/Upload error:", e)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TechnicalDocListView(APIView):
    """
    GET: Lấy danh sách tài liệu, có thể lọc theo `doc_type`.
         /api/technical-docs/?doc_type=stl_files
    POST: Tạo một tài liệu mới (upload file + lưu metadata).
    """
    parser_classes = [MultiPartParser]

    def get(self, request, *args, **kwargs):
        doc_type = request.query_params.get("doc_type")
        query = db.collection("technical_docs")

        if doc_type:
            query = query.where("doc_type", "==", doc_type)

        query = query.order_by("updated_at", direction="DESCENDING").limit(100)

        try:
            docs = query.stream()
            serialized_docs = [_serialize_tech_doc(doc) for doc in docs]
            return Response(serialized_docs)
        except Exception as e:
            print(f"Firestore query error: {e}")
            return Response({"error": "Lỗi truy vấn. Có thể bạn cần tạo composite index trên Firestore."}, status=500)

    def post(self, request, *args, **kwargs):
        serializer = TechnicalDocSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        file = validated_data.get("file")
        doc_type = validated_data.get("doc_type")

        if not file:
            return Response({"error": "File is required for creation."}, status=400)

        try:
            session = boto3.session.Session()
            s3 = session.client(
                "s3",
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            )

            thumbnail_url = None
            if doc_type in ["stl_files", "step_model"]:
                with NamedTemporaryFile(suffix=".stl") as temp_stl:
                    for chunk in file.chunks():
                        temp_stl.write(chunk)
                    temp_stl.flush()
                    thumbnail_bytes = create_stl_thumbnail(temp_stl.name)
                    if thumbnail_bytes:
                        thumbnail_r2_key = f"technical_docs/thumbnails/{uuid.uuid4()}.png"
                        s3.upload_fileobj(
                            io.BytesIO(thumbnail_bytes),
                            settings.R2_BUCKET_NAME,
                            thumbnail_r2_key,
                            ExtraArgs={"ContentType": "image/png"},
                        )
                        thumbnail_url = f"{settings.CDN_URL}/{thumbnail_r2_key}"
                file.seek(0)

            original_file_extension = os.path.splitext(file.name)[1]
            r2_key = f"technical_docs/files/{uuid.uuid4()}{original_file_extension}"
            s3.upload_fileobj(file, settings.R2_BUCKET_NAME, r2_key, ExtraArgs={"ContentType": file.content_type})
            url = f"{settings.CDN_URL}/{r2_key}"

            now = timezone.now()
            payload = {
                "doc_type": doc_type,
                "title": validated_data.get("title"),
                "description": validated_data.get("description", ""),
                "version": validated_data.get("version", ""),
                "url": url,
                "r2_key": r2_key, # Lưu lại key để có thể xoá file
                "file_size": file.size,
                "created_at": now,
                "updated_at": now,
            }
            if thumbnail_url:
                payload["thumbnail_url"] = thumbnail_url

            doc_ref = db.collection("technical_docs").document()
            doc_ref.set(payload)

            return Response(_serialize_tech_doc(doc_ref.get()), status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Technical Doc Upload Error:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TechnicalDocDetailView(APIView):
    """
    GET: Lấy chi tiết một tài liệu.
    PUT: Cập nhật metadata của một tài liệu.
    DELETE: Xoá một tài liệu (bao gồm cả file trên R2).
    """
    parser_classes = [MultiPartParser]
    def get_object(self, doc_id: str):
        doc_ref = db.collection("technical_docs").document(doc_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise Http404
        return doc

    def get(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        return Response(_serialize_tech_doc(doc))

    def put(self, request, doc_id: str, *args, **kwargs):
        doc_ref = db.collection("technical_docs").document(doc_id)
        if not doc_ref.get().exists:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = TechnicalDocSerializer(data=request.data, partial=True) # partial=True cho phép cập nhật một phần
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        update_data = serializer.validated_data
        update_data["updated_at"] = timezone.now()

        # Xử lý upload thumbnail mới nếu có
        thumbnail_file = update_data.get("thumbnail_file")
        if thumbnail_file:
            try:
                session = boto3.session.Session()
                s3 = session.client(
                    "s3",
                    endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                )
                
                # Tạo key duy nhất cho thumbnail
                thumbnail_r2_key = f"technical_docs/thumbnails/{uuid.uuid4()}.png"
                
                # Upload file ảnh thumbnail
                s3.upload_fileobj(
                    thumbnail_file,
                    settings.R2_BUCKET_NAME,
                    thumbnail_r2_key,
                    ExtraArgs={"ContentType": thumbnail_file.content_type},
                )
                
                # Cập nhật URL thumbnail trong data để lưu vào Firestore
                update_data["thumbnail_url"] = f"{settings.CDN_URL}/{thumbnail_r2_key}"

            except Exception as e:
                print(f"Thumbnail Upload Error on PUT: {e}")
                return Response({"error": f"Thumbnail upload failed: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        doc_ref.update(update_data)
        return Response(_serialize_tech_doc(doc_ref.get()))

    def delete(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        doc_data = doc.to_dict()

        # Xoá file trên R2 nếu có
        r2_key = doc_data.get("r2_key")
        if r2_key:
            try:
                session = boto3.session.Session()
                s3 = session.client(
                    "s3",
                    endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                )
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=r2_key)
                print(f"Deleted file from R2: {r2_key}")
            except Exception as e:
                # Ghi log lỗi nhưng vẫn tiếp tục xoá document
                print(f"Could not delete file from R2: {r2_key}. Error: {e}")

        # Xoá document trên Firestore
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
