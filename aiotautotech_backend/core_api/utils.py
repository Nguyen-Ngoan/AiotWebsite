# core_api/utils.py
import re
import unicodedata


def slugify(value: str) -> str:
    """
    Chuyển tiếng Việt có dấu → slug không dấu, chỉ gồm a-z0-9 và '-'.
    """
    if not value:
        return ""

    # Chuẩn hóa Unicode, bỏ dấu
    value = unicodedata.normalize("NFD", value)
    value = value.encode("ascii", "ignore").decode("ascii")

    # Chuyển về lower & thay các ký tự không phải a-z0-9 thành '-'
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")

    return value or ""
