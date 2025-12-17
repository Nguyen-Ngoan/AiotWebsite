# backend/services/pricing_service.py
from typing import Dict, Any
from django.conf import settings
from google.cloud import firestore

# Khởi tạo client (giống các service khác)
_db = firestore.Client(project=settings.FIRESTORE_PROJECT_ID)

class PricingService:
    """
    Service để tính toán giá động cho các bộ phận in 3D.
    """
    def __init__(self):
        """
        Khởi tạo các collection reference.
        """
        self.configs_collection = _db.collection("system_configs")
        self.machines_collection = _db.collection("machine_groups")
        self.filaments_collection = _db.collection("filaments")

    def calculate_printed_part_price(self, part_data: Dict[str, Any], selected_material_type: str) -> Dict[str, Any]:
        """
        Tính toán giá của một bộ phận in 3D dựa trên vật liệu được chọn.

        Args:
            part_data: Dữ liệu của sản phẩm (part), chứa 'print_profiles'.
            selected_material_type: Loại vật liệu người dùng chọn (e.g., "PETG").

        Returns:
            Một dictionary chứa 'total_price' và 'breakdown' chi tiết.

        Raises:
            ValueError: Nếu không tìm thấy profile, config, hoặc dữ liệu cần thiết.
        """
        # 1. Tìm print profile phù hợp
        print_profiles = part_data.get("print_profiles", [])
        profile = next((p for p in print_profiles if p.get("material_type") == selected_material_type), None)

        if not profile:
            raise ValueError(f"Print profile for material '{selected_material_type}' not found.")

        # 2. Fetch dữ liệu từ Firestore
        # a. Lấy cấu hình chi phí hệ thống
        costs_doc = self.configs_collection.document("printing_costs").get()
        if not costs_doc.exists:
            raise ValueError("System config 'printing_costs' not found in 'system_configs' collection.")
        system_costs = costs_doc.to_dict()

        # b. Lấy thông tin nhóm máy in
        machine_ref_path = profile.get("machine_group_ref")
        if not machine_ref_path:
            raise ValueError("Machine group reference is missing in the print profile.")
        
        machine_doc = _db.document(machine_ref_path).get()
        if not machine_doc.exists:
            raise ValueError(f"Machine group document at '{machine_ref_path}' not found.")
        machine_data = machine_doc.to_dict()

        # c. Lấy thông tin giá nhựa in
        filament_query = self.filaments_collection.where("material_type", "==", selected_material_type).limit(1)
        filament_docs = list(filament_query.stream())
        if not filament_docs:
            raise ValueError(f"No filament found for material type '{selected_material_type}'.")
        filament_data = filament_docs[0].to_dict()

        # 3. Trích xuất các giá trị để tính toán
        estimated_time_min = profile.get("estimated_time_min", 0)
        filament_weight_g = profile.get("filament_weight_g", 0.0)
        labor_time_min = profile.get("labor_time_min", 0)

        power_consumption_kw = machine_data.get("power_consumption_kw", 0.0)
        hourly_operating_cost = machine_data.get("hourly_operating_cost", 0)
        
        electricity_rate_kwh = system_costs.get("electricity_rate_kwh", 0)
        labor_cost_per_hour = system_costs.get("labor_cost_per_hour", 0)
        failure_rate_multiplier = system_costs.get("failure_rate_multiplier", 1.0)

        cost_per_spool = filament_data.get("cost_per_spool", 0)
        spool_weight_g = filament_data.get("spool_weight_g", 1000)
        if spool_weight_g == 0:
            raise ValueError("Filament spool_weight_g cannot be zero.")

        # 4. Tính toán chi phí
        print_time_hr = estimated_time_min / 60.0
        labor_time_hr = labor_time_min / 60.0

        electricity_cost = print_time_hr * power_consumption_kw * electricity_rate_kwh
        machine_cost = print_time_hr * hourly_operating_cost
        material_cost = (filament_weight_g / spool_weight_g) * cost_per_spool
        labor_cost = labor_time_hr * labor_cost_per_hour

        subtotal = electricity_cost + machine_cost + material_cost + labor_cost
        total_price = subtotal * failure_rate_multiplier

        # 5. Chuẩn bị output
        breakdown = {
            "electricity_cost": electricity_cost,
            "machine_cost": machine_cost,
            "material_cost": material_cost,
            "labor_cost": labor_cost,
            "subtotal": subtotal,
            "failure_rate_multiplier": failure_rate_multiplier,
            "raw_total": total_price,
        }

        return {
            "total_price": int(round(total_price)),
            "breakdown": breakdown
        }