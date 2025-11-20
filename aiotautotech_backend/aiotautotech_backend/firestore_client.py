# aiotautotech_backend/firestore_client.py
from google.cloud import firestore
from django.conf import settings 

# Khởi tạo Firestore Client
# Kiểm tra xem có đang chạy trong chế độ DEBUG và tệp key có tồn tại không
if settings.DEBUG and settings.FIRESTORE_CREDENTIALS_PATH.exists():
    # Dùng tệp key cho môi trường phát triển cục bộ
    db = firestore.Client.from_service_account_json(
        settings.FIRESTORE_CREDENTIALS_PATH,
        project=settings.FIRESTORE_PROJECT_ID # Tên project cho rõ ràng
    )
    print("✅ Firestore Client initialized using Service Account Key.")
else:
    # Dùng thông tin xác thực mặc định (áp dụng khi triển khai lên Cloud Run/GCE)
    db = firestore.Client(project=settings.FIRESTORE_PROJECT_ID)
    print("✅ Firestore Client initialized using Default Credentials.")