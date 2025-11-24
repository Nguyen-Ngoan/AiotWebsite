# core_api/views.py

from django.utils import timezone
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from aiotautotech_backend.firestore_client import db
from .utils import slugify


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
                },
            }
        )


class PostListView(APIView):
    """
    GET /api/posts/  -> lấy danh sách bài viết
    POST /api/posts/ -> tạo bài viết mới (nếu cần)
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
            slug_input = slug_input.strip()
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

