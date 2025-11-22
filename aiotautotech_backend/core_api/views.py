# core_api/views.py

from datetime import datetime, timezone

from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from aiotautotech_backend.firestore_client import db


def _serialize_post(doc) -> dict:
  """Chuyển 1 document Firestore thành dict trả về cho API."""
  data = doc.to_dict() or {}
  return {
      "id": doc.id,
      "title": data.get("title", ""),
      "content": data.get("content", ""),
      "author": data.get("author", ""),
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

    def post(self, request, *args, **kwargs):
        """
        Tạo bài viết mới. (Tuỳ bạn có dùng UI cho phần này hay không,
        API vẫn hữu ích để test qua Insomnia/Postman.)
        """
        payload = request.data or {}

        title = payload.get("title", "").strip()
        content = payload.get("content", "").strip()
        author = payload.get("author", "").strip() or "AiotAutotech"

        if not title:
            return Response(
                {"detail": "Thiếu trường 'title'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = datetime.now(timezone.utc)

        doc_ref = db.collection("posts").document()
        doc_ref.set(
            {
                "title": title,
                "content": content,
                "author": author,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
            }
        )

        # Lấy lại doc vừa tạo để trả về
        doc = doc_ref.get()
        return Response(_serialize_post(doc), status=status.HTTP_201_CREATED)


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

    def put(self, request, post_id: str, *args, **kwargs):
        """
        Cập nhật tiêu đề / nội dung / tác giả.
        Body JSON: { "title": "...", "content": "<html>", "author": "..." }
        Các field không gửi sẽ không bị đổi.
        """
        doc = self.get_object(post_id)
        data = request.data

        update_data = {}
        title = data.get("title")
        content = data.get("content")
        author = data.get("author")

        if title is not None:
            update_data["title"] = title
        if content is not None:
            update_data["content"] = content
        if author is not None:
            update_data["author"] = author

        if not update_data:
            return Response(
                {"detail": "Không có dữ liệu nào để cập nhật."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_data["updated_at"] = datetime.utcnow()

        doc.reference.update(update_data)
        updated_doc = doc.reference.get()
        return Response(_serialize_post(updated_doc), status=status.HTTP_200_OK)

    def delete(self, request, post_id: str, *args, **kwargs):
        """
        Xoá 1 bài viết khỏi Firestore.
        (Dùng tạm cho admin/dev – chưa có auth.)
        """
        doc = self.get_object(post_id)
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

