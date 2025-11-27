# backend/services/firestore_products.py
from typing import Dict, Any, List
from django.conf import settings
from google.cloud import firestore

_db = firestore.Client(project=settings.FIRESTORE_PROJECT_ID)


def add_product_image_metadata(product_id: str, image_data: Dict[str, Any]) -> None:
    """
    Lưu metadata ảnh vào field 'images' (array) của product document trong Firestore.
    """
    doc_ref = _db.collection("products").document(product_id)

    # Đảm bảo document tồn tại
    doc = doc_ref.get()
    if not doc.exists:
        raise ValueError(f"Product {product_id} does not exist in Firestore")

    # Thêm vào mảng 'images' bằng ArrayUnion
    doc_ref.update(
      {
        "images": firestore.ArrayUnion([image_data])
      }
    )
