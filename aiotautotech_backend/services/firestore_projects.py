from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict, field
from datetime import datetime
from django.conf import settings
from google.cloud import firestore
from django.utils.text import slugify

# Khởi tạo client (tương tự như firestore_products.py)
_db = firestore.Client(project=settings.FIRESTORE_PROJECT_ID)

# ==============================================================================
# 1. DATA MODELS (Dataclasses)
# ==============================================================================

@dataclass
class BOMItem:
    """
    Đại diện cho một linh kiện trong dự án.
    Áp dụng Denormalization: Lưu snapshot tên và giá để giảm query.
    """
    product_id: str
    quantity: int
    product_name: str          # Snapshot: Tên linh kiện tại thời điểm thêm
    unit_price: float          # Snapshot: Giá tại thời điểm thêm
    usage_note: str = ""
    is_optional: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class InstructionStep:
    """
    Đại diện cho một bước hướng dẫn.
    """
    order: int
    title: str
    content: str
    image_url: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class ProjectData:
    """
    Data Transfer Object cho việc tạo/update Project.
    """
    title: str
    description: str
    video_url: str = ""
    thumbnail_url: str = ""
    slug: str = ""         # Nếu không truyền sẽ tự generate từ title
    tags: List[str] = field(default_factory=list)
    # New fields
    complexity_mechanical: int = 1
    complexity_electrical: int = 1
    complexity_software: int = 1
    estimated_hours: int = 0
    required_skills: List[str] = field(default_factory=list)
    

# ==============================================================================
# 2. PROJECT SERVICE
# ==============================================================================

class ProjectService:
    def __init__(self):
        self.collection = _db.collection("projects")
        self.products_collection = _db.collection("products")

    def _calculate_estimated_cost(self, bom_list: List[Dict[str, Any]]) -> float:
        """
        Tính tổng chi phí dự kiến dựa trên danh sách BOM.
        Chỉ tính các linh kiện không phải optional (tùy logic business).
        """
        total = 0.0
        for item in bom_list:
            # Nếu item là optional, có thể chọn không cộng vào giá base
            if not item.get("is_optional", False):
                qty = item.get("quantity", 0)
                price = item.get("unit_price", 0)
                total += qty * price
        return total

    def create_project(self, data: ProjectData) -> Dict[str, Any]:
        """
        Tạo mới một dự án.
        """
        # 1. Xử lý Slug
        if not data.slug:
            data.slug = slugify(data.title)
        
        # Kiểm tra trùng slug (Optional: có thể bỏ qua nếu chấp nhận rủi ro thấp)
        existing = self.collection.where("slug", "==", data.slug).limit(1).stream()
        if any(existing):
            raise ValueError(f"Project with slug '{data.slug}' already exists.")

        # 2. Chuẩn bị dữ liệu
        now = datetime.utcnow()
        project_payload = {
            "title": data.title,
            "slug": data.slug,
            "description": data.description,
            "video_url": data.video_url,
            "thumbnail_url": data.thumbnail_url,
            "tags": data.tags,
            "complexity_mechanical": data.complexity_mechanical,
            "complexity_electrical": data.complexity_electrical,
            "complexity_software": data.complexity_software,
            "estimated_hours": data.estimated_hours,
            "required_skills": data.required_skills,
            "created_at": now,
            "updated_at": now,
            # Khởi tạo các mảng rỗng
            "bom": [],
            "steps": [],
            "attachments": [], # List document_ids hoặc URLs
            "estimated_cost": 0.0,
            "view_count": 0
        }

        # 3. Lưu vào Firestore
        doc_ref = self.collection.document()
        doc_ref.set(project_payload)
        
        # Trả về dữ liệu kèm ID
        project_payload["id"] = doc_ref.id
        return project_payload

    def add_bom_item(self, project_id: str, product_id: str, quantity: int, usage_note: str = "", is_optional: bool = False) -> Dict[str, Any]:
        """
        Thêm linh kiện vào BOM của dự án.
        Tự động lookup thông tin Product để snapshot tên và giá.
        Tự động tính lại estimated_cost.
        """
        # 1. Lấy Project Reference
        project_ref = self.collection.document(project_id)
        
        # Sử dụng Transaction để đảm bảo tính nhất quán khi tính toán giá
        transaction = _db.transaction()
        
        @firestore.transactional
        def update_in_transaction(transaction, project_ref, product_id, quantity, usage_note, is_optional):
            # A. Read Project
            project_snapshot = project_ref.get(transaction=transaction)
            if not project_snapshot.exists:
                raise ValueError("Project not found")
            
            project_data = project_snapshot.to_dict()
            current_bom = project_data.get("bom", [])

            # B. Read Product (để lấy snapshot giá & tên)
            product_ref = self.products_collection.document(product_id)
            product_snapshot = product_ref.get(transaction=transaction)
            
            if not product_snapshot.exists:
                raise ValueError(f"Product {product_id} not found")
            
            prod_data = product_snapshot.to_dict()
            
            # C. Tạo BOM Item mới
            new_item = BOMItem(
                product_id=product_id,
                quantity=quantity,
                product_name=prod_data.get("title", "Unknown Product"),
                unit_price=float(prod_data.get("base_price", 0) or 0),
                usage_note=usage_note,
                is_optional=is_optional
            )

            # D. Logic Merge: Nếu product_id đã tồn tại trong BOM -> Update số lượng hay Thêm mới?
            # Ở đây chọn cách: Thêm mới vào list (cho phép 1 linh kiện xuất hiện nhiều lần với usage_note khác nhau)
            # Hoặc bạn có thể check duplicate để cộng dồn quantity.
            current_bom.append(new_item.to_dict())

            # E. Tính lại giá
            new_cost = self._calculate_estimated_cost(current_bom)

            # F. Update
            transaction.update(project_ref, {
                "bom": current_bom,
                "estimated_cost": new_cost,
                "updated_at": datetime.utcnow()
            })
            
            return current_bom

        return update_in_transaction(transaction, project_ref, product_id, quantity, usage_note, is_optional)

    def get_project_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """
        Lấy chi tiết dự án theo Slug.
        Vì BOM và Steps đã nhúng (embedded) trong document, ta chỉ cần 1 query.
        """
        query = self.collection.where("slug", "==", slug).limit(1)
        docs = list(query.stream())
        
        if not docs:
            return None
            
        doc = docs[0]
        data = doc.to_dict()
        data["id"] = doc.id
        
        # Xử lý dữ liệu hiển thị nếu cần (ví dụ convert timestamp sang string)
        return data

    def add_instruction_step(self, project_id: str, step: InstructionStep) -> None:
        """
        Thêm một bước hướng dẫn vào mảng 'steps'.
        """
        project_ref = self.collection.document(project_id)
        # Sử dụng ArrayUnion để thêm vào mảng
        project_ref.update({
            "steps": firestore.ArrayUnion([step.to_dict()]),
            "updated_at": datetime.utcnow()
        })

    def update_project(self, slug: str, data: ProjectData) -> Dict[str, Any]:
        """
        Cập nhật thông tin cơ bản của dự án.
        """
        # 1. Tìm document theo slug hiện tại
        query = self.collection.where("slug", "==", slug).limit(1)
        docs = list(query.stream())
        if not docs:
            raise ValueError("Project not found")
        
        doc = docs[0]
        doc_ref = self.collection.document(doc.id)
        
        # 2. Chuẩn bị dữ liệu update
        update_payload = {
            "title": data.title,
            "description": data.description,
            "video_url": data.video_url,
            "tags": data.tags,
            "complexity_mechanical": data.complexity_mechanical,
            "complexity_electrical": data.complexity_electrical,
            "complexity_software": data.complexity_software,
            "estimated_hours": data.estimated_hours,
            "required_skills": data.required_skills,
            "updated_at": datetime.utcnow()
        }

        # Chỉ update slug nếu có thay đổi và không rỗng
        if data.slug and data.slug != slug:
             existing = self.collection.where("slug", "==", data.slug).limit(1).stream()
             if any(existing):
                 raise ValueError(f"Slug '{data.slug}' already exists.")
             update_payload["slug"] = data.slug

        if data.thumbnail_url:
            update_payload["thumbnail_url"] = data.thumbnail_url

        # 3. Thực hiện update
        doc_ref.update(update_payload)
        
        # 4. Trả về dữ liệu mới
        new_doc = doc_ref.get()
        res = new_doc.to_dict()
        res["id"] = new_doc.id
        return res