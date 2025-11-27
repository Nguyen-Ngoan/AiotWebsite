# backend/storage/r2.py
import mimetypes
import unicodedata
import re
from django.conf import settings

import boto3


def get_r2_client():
    """
    Tạo S3 client trỏ vào Cloudflare R2.
    """
    if not settings.R2_ACCOUNT_ID:
        raise RuntimeError("R2_ACCOUNT_ID is not set")
    if not settings.R2_ACCESS_KEY_ID or not settings.R2_SECRET_ACCESS_KEY:
        raise RuntimeError("R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY is not set")

    endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",  # theo docs Cloudflare
    )


def _slugify_filename(name: str) -> str:
    """
    Đảm bảo tên file sạch: không dấu, khoảng trắng -> '-', lowercase.
    Giữ lại phần mở rộng.
    """
    # tách extension
    if "." in name:
        base, ext = name.rsplit(".", 1)
        ext = "." + ext.lower()
    else:
        base, ext = name, ""

    # normalize, remove accents
    base = unicodedata.normalize("NFD", base)
    base = base.encode("ascii", "ignore").decode("ascii")

    # replace non-alnum by '-'
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base)
    base = base.strip("-").lower()

    if not base:
        base = "image"

    return base + ext


def generate_image_key(product_id: str, seo_file_name: str) -> str:
    """
    Sinh key lưu trên R2. Bạn đang có bucket aiotautotech và thư mục 'images/'.
    → ta lưu vào: images/products/<product_id>/<seo-file-name>
    """
    safe_name = _slugify_filename(seo_file_name)
    return f"images/products/{product_id}/{safe_name}"


def upload_file_to_r2(file_obj, key: str, content_type: str | None = None) -> str:
    """
    Upload file binary lên Cloudflare R2.

    - file_obj: Django UploadedFile hoặc file-like object (có .read()).
    - key: path trong bucket, ví dụ 'images/products/123/slug-main-1.jpg'

    Trả về: public URL dùng cho frontend.
    """
    if not content_type:
        content_type, _ = mimetypes.guess_type(key)
    if not content_type:
        content_type = "application/octet-stream"

    client = get_r2_client()
    bucket = settings.R2_BUCKET_NAME

    # Lưu ý: R2 không dùng ACL như S3 (public/private theo bucket policy),
    # nên KHÔNG truyền 'ACL': 'public-read' trong ExtraArgs.
    client.upload_fileobj(
        Fileobj=file_obj,
        Bucket=bucket,
        Key=key,
        ExtraArgs={"ContentType": content_type},
    )

    base_url = settings.R2_PUBLIC_BASE_URL.rstrip("/")
    return f"{base_url}/{key}"
