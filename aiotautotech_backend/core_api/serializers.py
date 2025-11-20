# core_api/serializers.py
from rest_framework import serializers

class PostSerializer(serializers.Serializer):
    """
    Serializer cho dữ liệu bài viết.
    Firestore là NoSQL, nên ta chỉ định nghĩa các trường dữ liệu.
    """
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()
    author = serializers.CharField(max_length=100, required=False)
    created_at = serializers.DateTimeField(read_only=True) # Firestore sẽ tự thêm
    
    # Bạn không cần phương thức create() ở đây vì ta sẽ xử lý logic lưu
    # vào Firestore trực tiếp trong View.