# core_api/views_printing.py

from typing import Any, Dict
from django.utils import timezone
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.text import slugify
from rest_framework.parsers import MultiPartParser
from django.conf import settings
import boto3
import io
from PIL import Image

from aiotautotech_backend.firestore_client import db
from services.pricing_service import PricingService
from .serializers import ProductImageUploadSerializer
from storage.r2 import delete_files_from_r2

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
        "texture": data.get("texture", ""),
        "spool_weight_g": data.get("spool_weight_g", 1000),
        "cost_per_spool": data.get("cost_per_spool", 0),
        "stock_qty": data.get("stock_qty", 0),
        "density_g_cm3": data.get("density_g_cm3", 1.24),
        "diameter_mm": data.get("diameter_mm", 1.75),
        "print_temp_min": data.get("print_temp_min", 0),
        "print_temp_max": data.get("print_temp_max", 0),
        "bed_temp_min": data.get("bed_temp_min", 0),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }

def _serialize_printed_part(doc):
    data = doc.to_dict() or {}
    
    # Backward compatibility: map old design_file_id/ref to stl_file_id if not present
    stl_file_id = data.get("stl_file_id", "")
    if not stl_file_id:
        stl_file_id = data.get("design_file_id", "") or data.get("design_file_ref", "")

    return {
        "id": doc.id,
        "title": data.get("title", ""),
        "slug": data.get("slug", ""),        
        "step_file_id": data.get("step_file_id", ""),
        "stl_file_id": stl_file_id,
        "gcode_file_ids": data.get("gcode_file_ids", []),
        "thumbnail_url": data.get("thumbnail_url", ""),
        "print_profiles": data.get("print_profiles", []),
        "images": data.get("images", []),
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
            density = float(data.get("density_g_cm3", 1.24))
            if density <= 0:
                density = 1.24

            now = timezone.now()
            payload = {
                "name": data.get("name", ""),
                "brand": data.get("brand", ""),
                "material_type": data.get("material_type", ""),
                "color_hex": (data.get("color_hex") or "").strip(),
                "texture": (data.get("texture") or "").strip(),
                "spool_weight_g": int(data.get("spool_weight_g", 1000)),
                "cost_per_spool": int(data.get("cost_per_spool", 0)),
                "stock_qty": int(data.get("stock_qty", 0)),
                "density_g_cm3": density,
                "diameter_mm": float(data.get("diameter_mm", 1.75)),
                "print_temp_min": int(data.get("print_temp_min", 0)),
                "print_temp_max": int(data.get("print_temp_max", 0)),
                "bed_temp_min": int(data.get("bed_temp_min", 0)),
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
        if "texture" in data: update_data["texture"] = (data["texture"] or "").strip()
        if "spool_weight_g" in data: update_data["spool_weight_g"] = int(data["spool_weight_g"])
        if "cost_per_spool" in data: update_data["cost_per_spool"] = int(data["cost_per_spool"])
        if "stock_qty" in data: update_data["stock_qty"] = int(data["stock_qty"])
        if "density_g_cm3" in data:
            d = float(data["density_g_cm3"])
            if d > 0:
                update_data["density_g_cm3"] = d
        if "diameter_mm" in data: update_data["diameter_mm"] = float(data["diameter_mm"])
        if "print_temp_min" in data: update_data["print_temp_min"] = int(data["print_temp_min"])
        if "print_temp_max" in data: update_data["print_temp_max"] = int(data["print_temp_max"])
        if "bed_temp_min" in data: update_data["bed_temp_min"] = int(data["bed_temp_min"])

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

        # 2. Fetch Technical Doc details (STL and STEP)
        def get_doc_details(doc_id):
            if not doc_id:
                return None
            clean_id = doc_id.split("/")[-1] if "/" in doc_id else doc_id
            if clean_id:
                td_doc = db.collection("technical_docs").document(clean_id).get()
                if td_doc.exists:
                    td_data = td_doc.to_dict()
                    return {
                        "id": td_doc.id,
                        "title": td_data.get("title", ""),
                        "url": td_data.get("url", ""),
                        "thumbnail_url": td_data.get("thumbnail_url", ""),
                        "doc_type": td_data.get("doc_type", ""),
                        "metadata": td_data.get("metadata", {})
                    }
            return None

        part_data["stl_file"] = get_doc_details(part_data.get("stl_file_id"))
        part_data["step_file"] = get_doc_details(part_data.get("step_file_id"))

        part_data["gcode_files"] = []
        if part_data.get("gcode_file_ids"):
            part_data["gcode_files"] = [
                d for d in [get_doc_details(gid) for gid in part_data["gcode_file_ids"]] if d
            ]

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
            "step_file_id": data.get("step_file_id", ""),
            "stl_file_id": data.get("stl_file_id", ""),
            "gcode_file_ids": data.get("gcode_file_ids", []),
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
        if "step_file_id" in data: update_data["step_file_id"] = data["step_file_id"]
        if "stl_file_id" in data: update_data["stl_file_id"] = data["stl_file_id"]
        if "gcode_file_ids" in data: update_data["gcode_file_ids"] = data["gcode_file_ids"]
        if "thumbnail_url" in data: update_data["thumbnail_url"] = data["thumbnail_url"]
        if "print_profiles" in data: update_data["print_profiles"] = data["print_profiles"]
        if "images" in data:
            images = data.get("images") or []
            if isinstance(images, list):
                update_data["images"] = images
                # Logic: If an image in the list has isPrimary: true, automatically update the root thumbnail_url
                primary_img = next((img for img in images if img.get("isPrimary")), None)
                if primary_img:
                    update_data["thumbnail_url"] = primary_img.get("url_thumb")

        if not update_data:
            return Response({"error": "No data to update"}, status=status.HTTP_400_BAD_REQUEST)

        update_data["updated_at"] = timezone.now()
        doc_ref.update(update_data)
        return Response(_serialize_printed_part(doc_ref.get()))

    def delete(self, request, doc_id: str, *args, **kwargs):
        doc = self.get_object(doc_id)
        doc.reference.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PrintedPartImageUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, part_id):
        try:
            file = request.FILES.get("file")
            if not file:
                return Response({"error": "No file uploaded"}, status=400)

            # Reuse ProductImageUploadSerializer
            serializer = ProductImageUploadSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            seo_file_name = validated_data.get("seo_file_name") or file.name.rsplit(".", 1)[0]

            img = Image.open(file).convert("RGBA")
            SIZES = {
                "large":  (1200, 800),
                "medium": (900, 600),
                "thumb":  (360, 240),
            }

            resized_files = {}
            for key, (w, h) in SIZES.items():
                buf = io.BytesIO()
                resized = img.resize((w, h), Image.Resampling.LANCZOS)
                resized.save(buf, format="WEBP", quality=90)
                buf.seek(0)
                resized_files[key] = buf

            session = boto3.session.Session()
            s3 = session.client(
                "s3",
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            )

            base_name = slugify(seo_file_name)
            folder = f"images/printed_parts/{part_id}"
            urls = {}

            for key, buf in resized_files.items():
                r2_key = f"{folder}/{base_name}-{key}.webp"
                s3.upload_fileobj(
                    buf,
                    settings.R2_BUCKET_NAME,
                    r2_key,
                    ExtraArgs={"ContentType": "image/webp"}
                )
                urls[key] = f"{settings.CDN_URL}/{r2_key}"

            doc_ref = db.collection("printed_parts").document(part_id)
            doc = doc_ref.get()
            if not doc.exists:
                 return Response({"error": "Part not found"}, status=404)
            
            data = doc.to_dict() or {}
            images = data.get("images", [])
            
            is_primary = validated_data.get("is_primary", False)
            if not images:
                is_primary = True

            new_img_meta = {
                "id": base_name,
                "fileName": base_name,
                "type": validated_data.get("type", "gallery"),
                "isPrimary": is_primary,
                "url": urls["large"],
                "url_medium": urls["medium"],
                "url_thumb": urls["thumb"],
                "alt": validated_data.get("alt", ""),
                "title": validated_data.get("title", ""),
            }

            if is_primary:
                for img in images:
                    img["isPrimary"] = False

            images.append(new_img_meta)
            
            update_payload = {"images": images}
            if is_primary:
                update_payload["thumbnail_url"] = urls["thumb"]

            doc_ref.update(update_payload)

            return Response({"images": images}, status=200)

        except Exception as e:
            print("Printed Part Image Upload error:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrintedPartImageDeleteView(APIView):
    def delete(self, request, part_id: str):
        file_name = request.data.get("fileName")
        if not file_name:
            return Response({"error": "fileName is required"}, status=status.HTTP_400_BAD_REQUEST)

        folder = f"images/printed_parts/{part_id}"
        keys_to_delete = [
            f"{folder}/{file_name}-large.webp",
            f"{folder}/{file_name}-medium.webp",
            f"{folder}/{file_name}-thumb.webp",
        ]

        try:
            delete_files_from_r2(keys_to_delete)
            
            doc_ref = db.collection("printed_parts").document(part_id)
            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                images = data.get("images", [])
                new_images = [img for img in images if img.get("fileName") != file_name]
                doc_ref.update({"images": new_images})

            return Response({"message": "Files scheduled for deletion from R2.", "deleted_keys": keys_to_delete}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error calling R2 deletion for printed part {part_id}: {e}")
            return Response({"error": "Failed to delete files from storage."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)