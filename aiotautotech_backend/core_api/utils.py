# core_api/utils.py
import re
import unicodedata
import base64
from typing import Union, Tuple, Optional


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
    def __init__(self, file_content: Union[bytes, str]):
        if isinstance(file_content, bytes):
            # Decode bytes to string, ignoring errors to handle binary sections in G-code
            self.content = file_content.decode('utf-8', errors='ignore')
        else:
            self.content = file_content

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
        pattern = re.compile(
            r';\s*thumbnail(?:_JPG)?\s+begin\s+(?P<width>\d+)x(?P<height>\d+)[^\n]*\n(?P<data>.*?);\s*thumbnail(?:_JPG)?\s+end',
            re.DOTALL | re.IGNORECASE
        )

        matches = []
        for match in pattern.finditer(self.content):
            try:
                width = int(match.group('width'))
                height = int(match.group('height'))
                raw_data = match.group('data')
                matches.append({
                    'width': width,
                    'height': height,
                    'area': width * height,
                    'raw_data': raw_data
                })
            except (ValueError, IndexError):
                continue

        if not matches:
            return None

        # Select the thumbnail with the largest resolution
        largest_thumbnail = max(matches, key=lambda x: x['area'])
        
        # Clean up the base64 data
        # 1. Remove comment characters (; ) from the beginning of lines
        # 2. Remove all whitespace (newlines, spaces)
        clean_base64 = re.sub(r'(?m)^;\s*', '', largest_thumbnail['raw_data'])
        clean_base64 = re.sub(r'\s+', '', clean_base64)
        
        try:
            thumbnail_bytes = base64.b64decode(clean_base64)
        except Exception:
            return None

        if not thumbnail_bytes:
            return None

        # Detect image extension based on file signature (magic bytes)
        extension = 'png' # Default for most slicers (Orca, Prusa, SuperSlicer)
        
        if thumbnail_bytes.startswith(b'\xff\xd8'):
            extension = 'jpg'
        elif thumbnail_bytes.startswith(b'\x89PNG'):
            extension = 'png'
            
        return thumbnail_bytes, extension
