# core_api/views_printing.py

from typing import Any, Dict
from django.utils import timezone
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.text import slugify

from aiotautotech_backend.firestore_client import db
from services.pricing_service import PricingService

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def _serialize_system_config(doc):
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "electricity_rate_kwh": data.get("electricity_rate_kwh", 0),
        "labor_cost_per_hour": data.get("labor_cost_per_hour", 0),
        "failure_rate_multiplier": data.get("failure_rate_multiplier", 1.0),
        "updated_at": data.get("updated_at"),
    }

def _serialize_machine_group(doc):
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "name": data.get("name", ""),
        "description": data.get("description", ""),
        "hourly_operating_cost": data.get("hourly_operating_cost", 0),
        "power_consumption_kw": data.get("power_consumption_kw", 0.0),
        "bed_size_mm": data.get("bed_size_mm", []),
        "compatible_materials": data.get("compatible_materials", []),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }

def _serialize_filament(doc):
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "name": data.get("name", ""),
        "brand": data.get("brand", ""),
        "material_type": data.get("material_type", ""),
        "color_hex": data.get("color_hex", ""),
        "spool_weight_g": data.get("spool_weight_g", 1000),
        "cost_per_spool": data.get("cost_per_spool", 0),
        "stock_qty": data.get("stock_qty", 0),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }

def _serialize_printed_part(doc):
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "title": data.get("title", ""),
        "slug": data.get("slug", ""),
        "design_file_ref": data.get("design_file_ref", ""),
        "thumbnail_url": data.get("thumbnail_url", ""),
        "print_profiles": data.get("print_profiles", []),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }

# ==============================================================================
# SYSTEM CONFIG VIEWS
# ==============================================================================

class PrintingSystemConfigView(APIView):
    """
    GET: Lấy cấu hình chi phí in 3D.
    POST: Tạo hoặc cập nhật cấu hình chi phí in 3D.
    """
    def get(self, request, *args, **kwargs):
        doc_ref = db.collection("system_configs").document("printing_costs")
        doc = doc_ref.get()
        if not doc.exists:
            # Return a default structure if not found
            return Response({
                "id": "printing_costs",
                "electricity_rate_kwh": 0,
                "labor_cost_per_hour": 0,
                "failure_rate_multiplier": 1.0,
                "updated_at": None,
            })
        return Response(_serialize_system_config(doc))

    def post(self, request, *args, **kwargs):
        data = request.data or {}
        doc_ref = db.collection("system_configs").document("printing_costs")

        try:
            payload = {
                "electricity_rate_kwh": int(data.get("electricity_rate_kwh", 0)),
                "labor_cost_per_hour": int(data.get("labor_cost_per_hour", 0)),
                "failure_rate_multiplier": float(data.get("failure_rate_multiplier", 1.0)),
                "updated_at": timezone.now(),
            }
            # .set() will create or overwrite
            doc_ref.set(payload)
            return Response(_serialize_system_config(doc_ref.get()), status=status.HTTP_200_OK)
        except (ValueError, TypeError) as e:
            return Response({"error": f"Invalid data type: {e}"}, status=status.HTTP_400_BAD_REQUEST)

# ==============================================================================
# MACHINE GROUP VIEWS
# ==============================================================================

class MachineGroupListView(APIView):
    """
    GET: Lấy danh sách nhóm máy in.
    POST: Tạo nhóm máy in mới.
    """
    def get(self, request, *args, **kwargs):
        query = db.collection("machine_groups").order_by("name").limit(100)
        docs = query.stream()
        results = [_serialize_machine_group(doc) for doc in docs]
        return Response(results)

    def post(self, request, *args, **kwargs):
        data = request.data or {}
        name = (data.get("name") or "").strip()
        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)

        doc_id = slugify(name)
        doc_ref = db.collection("machine_groups").document(doc_id)

        if doc_ref.get().exists:
            return Response({"error": f"Machine group with slug '{doc_id}' already exists."}, status=status.HTTP_409_CONFLICT)

        try:
            now = timezone.now()
            payload = {
                "name": name,
                "description": data.get("description", ""),
                "hourly_operating_cost": int(data.get("hourly_operating_cost", 0)),
                "power_consumption_kw": float(data.get("power_consumption_kw", 0.0)),
                "bed_size_mm": data.get("bed_size_mm", []),
                "compatible_materials": data.get("compatible_materials", []),
                "created_at": now,
                "updated_at": now,
            }
            doc_ref.set(payload)
            return Response(_serialize_machine_group(doc_ref.get()), status=status.HTTP_201_CREATED)
        except (ValueError, TypeError) as e:
            return Response({"error": f"Invalid data type: {e}"}, status=status.HTTP_400_BAD_REQUEST)

class MachineGroupDetailView(APIView):
    """
    GET, PUT, DELETE cho một nhóm máy in cụ thể.
    """
    def get_object(self, doc_id: str):
        doc_ref = db.collection("machine_groups").document(doc_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise Http404
        return doc

    def get(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        return Response(_serialize_machine_group(doc))

    def put(self, request, doc_id: str, *args, **kwargs):
        doc_ref = self.get_object(doc_id).reference
        data = request.data or {}
        update_data: Dict[str, Any] = {}

        # Build update payload
        if "name" in data: update_data["name"] = data["name"]
        if "description" in data: update_data["description"] = data["description"]
        if "hourly_operating_cost" in data: update_data["hourly_operating_cost"] = int(data["hourly_operating_cost"])
        if "power_consumption_kw" in data: update_data["power_consumption_kw"] = float(data["power_consumption_kw"])
        if "bed_size_mm" in data: update_data["bed_size_mm"] = data["bed_size_mm"]
        if "compatible_materials" in data: update_data["compatible_materials"] = data["compatible_materials"]

        if not update_data:
            return Response({"error": "No data to update"}, status=status.HTTP_400_BAD_REQUEST)

        update_data["updated_at"] = timezone.now()
        doc_ref.update(update_data)
        return Response(_serialize_machine_group(doc_ref.get()))

    def delete(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ==============================================================================
# FILAMENT VIEWS
# ==============================================================================

class FilamentListView(APIView):
    def get(self, request, *args, **kwargs):
        query = db.collection("filaments").order_by("name").limit(100)
        docs = query.stream()
        results = [_serialize_filament(doc) for doc in docs]
        return Response(results)

    def post(self, request, *args, **kwargs):
        data = request.data or {}
        if not data.get("name"):
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            now = timezone.now()
            payload = {
                "name": data.get("name", ""),
                "brand": data.get("brand", ""),
                "material_type": data.get("material_type", ""),
                "color_hex": (data.get("color_hex") or "").strip(),
                "spool_weight_g": int(data.get("spool_weight_g", 1000)),
                "cost_per_spool": int(data.get("cost_per_spool", 0)),
                "stock_qty": int(data.get("stock_qty", 0)),
                "created_at": now,
                "updated_at": now,
            }
            doc_ref = db.collection("filaments").document()
            doc_ref.set(payload)
            return Response(_serialize_filament(doc_ref.get()), status=status.HTTP_201_CREATED)
        except (ValueError, TypeError) as e:
            return Response({"error": f"Invalid data type: {e}"}, status=status.HTTP_400_BAD_REQUEST)


class FilamentDetailView(APIView):
    def get_object(self, doc_id: str):
        doc_ref = db.collection("filaments").document(doc_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise Http404
        return doc

    def get(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        return Response(_serialize_filament(doc))

    def put(self, request, doc_id: str, *args, **kwargs):
        doc_ref = self.get_object(doc_id).reference
        data = request.data or {}
        update_data: Dict[str, Any] = {}

        if "name" in data: update_data["name"] = data["name"]
        if "brand" in data: update_data["brand"] = data["brand"]
        if "material_type" in data: update_data["material_type"] = data["material_type"]
        if "color_hex" in data: update_data["color_hex"] = (data["color_hex"] or "").strip()
        if "spool_weight_g" in data: update_data["spool_weight_g"] = int(data["spool_weight_g"])
        if "cost_per_spool" in data: update_data["cost_per_spool"] = int(data["cost_per_spool"])
        if "stock_qty" in data: update_data["stock_qty"] = int(data["stock_qty"])

        if not update_data:
            return Response({"error": "No data to update"}, status=status.HTTP_400_BAD_REQUEST)

        update_data["updated_at"] = timezone.now()
        doc_ref.update(update_data)
        return Response(_serialize_filament(doc_ref.get()))

    def delete(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PrintedPartPublicDetailView(APIView):
    """
    GET /api/printing/parts/by-slug/<slug>/
    Public endpoint to get part details + dynamic pricing.
    """
    def get(self, request, slug: str, *args, **kwargs):
        # 1. Query by slug
        query = db.collection("printed_parts").where("slug", "==", slug).limit(1)
        docs = list(query.stream())

        if not docs:
            raise Http404

        doc = docs[0]
        part_data = _serialize_printed_part(doc)

        # 2. Fetch Technical Doc details if ref exists
        design_ref_id = part_data.get("design_file_ref")
        tech_doc_data = None
        if design_ref_id:
            # Handle if it's a path (e.g. "technical_docs/123") or just ID ("123")
            clean_id = design_ref_id.split("/")[-1] if "/" in design_ref_id else design_ref_id
            if clean_id:
                td_doc = db.collection("technical_docs").document(clean_id).get()
                if td_doc.exists:
                    td_data = td_doc.to_dict()
                    tech_doc_data = {
                        "id": td_doc.id,
                        "title": td_data.get("title", ""),
                        "url": td_data.get("url", ""),
                        "thumbnail_url": td_data.get("thumbnail_url", ""),
                        "doc_type": td_data.get("doc_type", "")
                    }

        part_data["technical_doc"] = tech_doc_data

        # 3. Calculate Pricing
        pricing_service = PricingService()
        profiles = part_data.get("print_profiles", [])

        for profile in profiles:
            material_type = profile.get("material_type")
            if material_type:
                try:
                    price_info = pricing_service.calculate_printed_part_price(
                        part_data=part_data,
                        selected_material_type=material_type
                    )
                    profile["calculated_price"] = price_info.get("total_price")
                    profile["price_breakdown"] = price_info.get("breakdown")
                except Exception as e:
                    # Log error or just set null if pricing fails (e.g. missing config)
                    profile["calculated_price"] = None
                    profile["price_error"] = str(e)

        return Response(part_data)

# ==============================================================================
# PRINTED PART VIEWS
# ==============================================================================

class PrintedPartListView(APIView):
    def get(self, request, *args, **kwargs):
        query = db.collection("printed_parts").order_by("title").limit(100)
        docs = query.stream()
        results = [_serialize_printed_part(doc) for doc in docs]
        return Response(results)

    def post(self, request, *args, **kwargs):
        data = request.data or {}
        title = (data.get("title") or "").strip()
        if not title:
            return Response({"error": "Title is required"}, status=status.HTTP_400_BAD_REQUEST)

        slug = data.get("slug") or slugify(title)
        now = timezone.now()
        payload = {
            "title": title,
            "slug": slug,
            "design_file_ref": data.get("design_file_ref", ""),
            "thumbnail_url": data.get("thumbnail_url", ""),
            "print_profiles": data.get("print_profiles", []),
            "created_at": now,
            "updated_at": now,
        }
        doc_ref = db.collection("printed_parts").document()
        doc_ref.set(payload)
        return Response(_serialize_printed_part(doc_ref.get()), status=status.HTTP_201_CREATED)


class PrintedPartDetailView(APIView):
    def get_object(self, doc_id: str):
        doc_ref = db.collection("printed_parts").document(doc_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise Http404
        return doc

    def get(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        part_data = _serialize_printed_part(doc)

        # Initialize pricing service
        pricing_service = PricingService()

        # Calculate price for each profile
        if "print_profiles" in part_data and isinstance(part_data["print_profiles"], list):
            for profile in part_data["print_profiles"]:
                material_type = profile.get("material_type")
                if material_type:
                    try:
                        price_info = pricing_service.calculate_printed_part_price(
                            part_data=doc.to_dict(), # Pass original dict to service
                            selected_material_type=material_type
                        )
                        profile["estimated_price"] = price_info.get("total_price")
                        profile["price_breakdown"] = price_info.get("breakdown")
                    except ValueError as e:
                        profile["estimated_price"] = None
                        profile["price_breakdown"] = {"error": str(e)}

        return Response(part_data)

    def put(self, request, doc_id: str, *args, **kwargs):
        doc_ref = self.get_object(doc_id).reference
        data = request.data or {}
        update_data: Dict[str, Any] = {}

        if "title" in data: update_data["title"] = data["title"]
        if "slug" in data: update_data["slug"] = data["slug"]
        if "design_file_ref" in data: update_data["design_file_ref"] = data["design_file_ref"]
        if "thumbnail_url" in data: update_data["thumbnail_url"] = data["thumbnail_url"]
        if "print_profiles" in data: update_data["print_profiles"] = data["print_profiles"]

        if not update_data:
            return Response({"error": "No data to update"}, status=status.HTTP_400_BAD_REQUEST)

        update_data["updated_at"] = timezone.now()
        doc_ref.update(update_data)
        return Response(_serialize_printed_part(doc_ref.get()))

    def delete(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)