# core_api/utils.py
import re
import unicodedata
import base64
from typing import Union, Tuple, Optional, Dict, Any


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


class GcodeParser:
    """
    Utility class to parse G-code files and extract metadata like thumbnails.
    Compatible with PrusaSlicer, OrcaSlicer, SuperSlicer, and derivatives.
    """
    CHUNK_SIZE = 100 * 1024  # 100KB

    def __init__(self, file_content: Union[bytes, str]):
        self.full_size = len(file_content)
        
        # 1. OPTIMIZATION: Slice HEAD and TAIL if file is too large
        if len(file_content) > (self.CHUNK_SIZE * 2):
            if isinstance(file_content, bytes):
                head = file_content[:self.CHUNK_SIZE]
                tail = file_content[-self.CHUNK_SIZE:]
                # Decode safely
                self.content = head.decode('utf-8', errors='ignore') + "\n...SKIPPED...\n" + tail.decode('utf-8', errors='ignore')
            else:
                # String input
                self.content = file_content[:self.CHUNK_SIZE] + "\n...SKIPPED...\n" + file_content[-self.CHUNK_SIZE:]
        else:
            if isinstance(file_content, bytes):
                self.content = file_content.decode('utf-8', errors='ignore')
            else:
                self.content = file_content

    def _parse_time(self, time_str: str) -> float:
        """Parses '1d 2h', '12345' (sec), or 'R45' (M73) to minutes."""
        if not time_str: return 0.0
        clean = time_str.strip()
        
        # Simple digits (Seconds or Minutes depending on source context, but assuming standard mixed input)
        # If it's pure digits and looks like seconds (Cura), divide by 60
        if clean.replace('.', '', 1).isdigit():
             return float(clean) / 60.0

        days = 0.0; hours = 0.0; minutes = 0.0; seconds = 0.0
        
        d_match = re.search(r'(\d+)d', clean)
        h_match = re.search(r'(\d+)h', clean)
        m_match = re.search(r'(\d+)m', clean)
        s_match = re.search(r'(\d+)s', clean)
        
        if d_match: days = float(d_match.group(1))
        if h_match: hours = float(h_match.group(1))
        if m_match: minutes = float(m_match.group(1))
        if s_match: seconds = float(s_match.group(1))
            
        return (days * 1440) + (hours * 60) + minutes + (seconds / 60.0)

    def extract_metadata(self) -> Dict[str, Any]:
        """Extracts metadata with flexible regex and verbose logging."""
        
        def get_val(patterns: list, type_func: Any = str, default: Any = None) -> Any:
            for p in patterns:
                match = re.search(p, self.content, re.IGNORECASE)
                if match:
                    try: return type_func(match.group(1).strip())
                    except: continue
            return default

        print(f"--- GCODE PARSING DEBUG (Size: {self.full_size/1024:.2f} KB) ---")

        # 1. TIME EXTRACTION
        time_source = "None"
        estimated_time = 0.0
        
        # Priority A: Slicer Comments (Orca/Cura)
        time_str = get_val([
            r';\s*estimated\s+printing\s+time\s*[=:]\s*(.*)', # Orca
            r';TIME\s*[=:]\s*(\d+)'                           # Cura
        ])
        
        if time_str:
            time_source = "Slicer Comment"
            estimated_time = self._parse_time(time_str)
        else:
            # Priority B: M73 Command (M73 Pxxx Rminutes)
            # Look for M73 command with 'R' (Remaining time) usually at start
            m73_match = re.search(r'M73\s+P\d+\s+R(\d+)', self.content)
            if m73_match:
                time_source = "M73 Command"
                estimated_time = float(m73_match.group(1))

        print(f"[Time] Source: {time_source} | Value: {estimated_time:.2f} min")

        # 2. FILAMENT & TECH PARAMS
        # Regex uses [=:] for flexibility
        weight_g = get_val([r';\s*(?:total\s+)?filament\s+used\s+\[g\]\s*[=:]\s*([\d.]+)'], float, 0.0)
        filament_mm = get_val([r';\s*(?:total\s+)?filament\s+used\s+\[mm\]\s*[=:]\s*([\d.]+)', r';\s*Filament\s+used\s*[=:]\s*([\d.]+)mm'], float, 0.0)
        
        length_m = filament_mm / 1000.0 if filament_mm > 0 else 0.0
        if length_m == 0:
            length_m = get_val([r';\s*Filament\s+used\s*[=:]\s*([\d.]+)m'], float, 0.0)

        # Fallback Weight Calculation
        if weight_g == 0 and length_m > 0:
            weight_g = length_m * 3.0 # Est for PLA

        material = get_val([r';\s*filament_type\s*[=:]\s*(.*)', r';Material\s*[=:]\s*(.*)'])
        machine = get_val([
            r';\s*printer_model\s*[=:]\s*(.*)',
            r';\s*TARGET_MACHINE\.NAME\s*[=:]\s*(.*)' # Cura
        ])
        
        # Tech Params
        layer_h = get_val([r';\s*layer_height\s*[=:]\s*([\d.]+)'], float, 0.0)
        nozzle = get_val([r';\s*nozzle_diameter\s*[=:]\s*([\d.]+)'], float, 0.0)
        infill = get_val([r';\s*sparse_infill_density\s*[=:]\s*(.*)'])
        walls = get_val([r';\s*wall_loops\s*[=:]\s*(\d+)'], int, 0)
        
        bed_temp = get_val([r';\s*bed_temperature\s*[=:]\s*([\d.]+)'], float)
        if bed_temp is None:
            bed_temp = get_val([r'M140\s+S(\d+)'], float, 0.0)
            
        nozzle_temp = get_val([r';\s*nozzle_temperature\s*[=:]\s*([\d.]+)'], float)
        if nozzle_temp is None:
            nozzle_temp = get_val([r'M104\s+S(\d+)'], float, 0.0)

        has_support = bool(re.search(r';\s*(?:enable_support|support_material)\s*[=:]\s*1', self.content))

        # 3. PRINT SUMMARY TABLE
        print("-" * 40)
        print(f"{'PARAM':<20} | {'VALUE':<20}")
        print("-" * 40)
        print(f"{'Machine':<20} | {machine}")
        print(f"{'Material':<20} | {material}")
        print(f"{'Time (min)':<20} | {estimated_time:.2f}")
        print(f"{'Weight (g)':<20} | {weight_g:.2f}")
        print(f"{'Layer Height':<20} | {layer_h}")
        print(f"{'Nozzle':<20} | {nozzle}")
        print("-" * 40)

        return {
            "estimated_time_min": round(estimated_time, 2),
            "filament_weight_g": round(weight_g, 2),
            "filament_length_m": round(length_m, 2),
            "filament_type": material,
            "machine_model": machine,
            "tech_params": {
                "layer_height": layer_h,
                "nozzle_diameter": nozzle,
                "bed_temp": int(bed_temp),
                "nozzle_temp": int(nozzle_temp),
                "infill_density": infill,
                "wall_loops": walls,
                "has_support": has_support,
                "material": material,
                "machine": machine
            }
        }

    def parse(self) -> Dict[str, Any]:
        """
        Main entry point to extract both thumbnail and metadata.
        """
        thumb = self.extract_thumbnail()
        metadata = self.extract_metadata()
        
        return {
            "thumbnail_bytes": thumb[0] if thumb else None,
            "thumbnail_ext": thumb[1] if thumb else None,
            "metadata": metadata
        }

    def extract_thumbnail(self) -> Optional[Tuple[bytes, str]]:
        """
        Extracts the largest thumbnail from the G-code header.
        Returns: (thumbnail_bytes, extension) or None
        """
        # Regex to find thumbnail blocks
        # Matches start line: ; thumbnail begin <width>x<height> <len>
        # Matches content: lines starting with ;
        # Matches end line: ; thumbnail end
        # Supports optional _JPG suffix found in some slicers (e.g. QIDI)
        # Regex for Orca/Prusa/Cura(Script)
        # Handles ; thumbnail begin ... and ; thumbnail_JPG begin ...
        pattern = re.compile(
            r';\s*thumbnail(?:_JPG)?\s+begin\s+(?P<width>\d+)x(?P<height>\d+)[^\n]*\n(?P<data>.*?);\s*thumbnail(?:_JPG)?\s+end',
            re.DOTALL | re.IGNORECASE
        )

        matches = []
        for match in pattern.finditer(self.content):
            try:
                matches.append({
                    'area': int(match.group('width')) * int(match.group('height')),
                    'width': int(match.group('width')),
                    'height': int(match.group('height')),
                    'data': match.group('data')
                })
            except: continue

        print(f"[Thumbnail] Found {len(matches)} embedded images.")

        if not matches:
            return None

        # Select the thumbnail with the largest resolution
        best = max(matches, key=lambda x: x['area'])
        print(f"[Thumbnail] Selected largest: {best['width']}x{best['height']} px.")
        
        # Clean up the base64 data
        # 1. Remove comment characters (; ) from the beginning of lines
        # 2. Remove all whitespace (newlines, spaces)
        clean_b64 = re.sub(r'(?m)^;\s*', '', best['data']).replace('\n', '').replace(' ', '')
        
        try:
            # Check signature
            decoded = base64.b64decode(clean_b64)
            ext = 'png'
            if decoded.startswith(b'\xff\xd8'): ext = 'jpg'
            return decoded, ext
        except Exception as e:
            print(f"[Thumbnail] Decode error: {e}")
            return None
