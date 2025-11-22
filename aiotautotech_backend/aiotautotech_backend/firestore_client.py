# # aiotautotech_backend/firestore_client.py
# from google.cloud import firestore
# from django.conf import settings 

# # Khởi tạo Firestore Client
# # Kiểm tra xem có đang chạy trong chế độ DEBUG và tệp key có tồn tại không
# if settings.DEBUG and settings.FIRESTORE_CREDENTIALS_PATH.exists():
#     # Dùng tệp key cho môi trường phát triển cục bộ
#     db = firestore.Client.from_service_account_json(
#         settings.FIRESTORE_CREDENTIALS_PATH,
#         project=settings.FIRESTORE_PROJECT_ID # Tên project cho rõ ràng
#     )
#     print("✅ Firestore Client initialized using Service Account Key.")
# else:
#     # Dùng thông tin xác thực mặc định (áp dụng khi triển khai lên Cloud Run/GCE)
#     db = firestore.Client(project=settings.FIRESTORE_PROJECT_ID)
#     print("✅ Firestore Client initialized using Default Credentials.")


# aiotautotech_backend/firestore_client.py
from google.cloud import firestore
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_firestore_client():
    """
    Khởi tạo Firestore Client sử dụng Application Default Credentials (ADC).

    - Trên Cloud Run / GCE / GKE:
        Gán service account cho service, SDK sẽ tự lấy credentials.
    - Trên local:
        Chạy: `gcloud auth application-default login`
        hoặc dùng GOOGLE_APPLICATION_CREDENTIALS nếu bạn thật sự cần file JSON
        (nhưng khuyến nghị không commit file đó vào repo).
    """
    project_id = getattr(settings, "FIRESTORE_PROJECT_ID", None)

    if project_id:
        client = firestore.Client(project=project_id)
        logger.info(
            "✅ Firestore client initialized with project_id=%s using ADC.",
            project_id,
        )
    else:
        # Nếu không set project trong settings, để SDK tự đoán từ context gcloud
        client = firestore.Client()
        logger.info(
            "✅ Firestore client initialized using ADC (project_id auto-detected)."
        )

    return client


# Tạo instance dùng chung
db = get_firestore_client()
