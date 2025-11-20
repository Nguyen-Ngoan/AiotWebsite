# core_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
from google.cloud import firestore
# Import Firestore Client đã tạo
from aiotautotech_backend.firestore_client import db 

from .serializers import PostSerializer
from rest_framework.decorators import api_view

class PostListView(APIView):
    """
    Xử lý Lấy danh sách bài viết (GET) và Tạo bài viết (POST).
    """
    def get(self, request):
        """Lấy danh sách tất cả các bài viết từ Firestore."""
        try:
            # Lấy 50 bài viết mới nhất
            posts_ref = db.collection(u'posts').order_by(u'created_at', direction=firestore.Query.DESCENDING).limit(50)
            docs = posts_ref.stream()

            data = []
            for doc in docs:
                item = doc.to_dict()
                item['id'] = doc.id
                data.append(item)
            
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Lỗi Firestore: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    """
    Xử lý việc tạo một bài viết mới và lưu vào Cloud Firestore.
    """
    def post(self, request):
        # 1. Khởi tạo Serializer với dữ liệu nhận được
        serializer = PostSerializer(data=request.data)
        
        # 2. Xác thực dữ liệu
        if serializer.is_valid():
            # Lấy dữ liệu đã được xác thực
            post_data = serializer.validated_data
            
            # 3. Thêm các trường dữ liệu thời gian và trạng thái (metadata)
            post_data['created_at'] = datetime.now(timezone.utc)
            post_data['updated_at'] = datetime.now(timezone.utc)
            
            try:
                # 4. Lưu dữ liệu vào Cloud Firestore
                # Tham chiếu đến Collection 'posts'
                posts_ref = db.collection(u'posts')
                
                # Thêm tài liệu mới. Firestore tự động tạo ID.
                # doc_ref là một tham chiếu (reference) đến tài liệu vừa được tạo.
                doc_ref = posts_ref.add(post_data)
                
                # 5. Chuẩn bị dữ liệu trả về
                response_data = post_data
                response_data['id'] = doc_ref[1].id # doc_ref[1] là DocumentReference
                
                # Sử dụng lại Serializer để đảm bảo định dạng đầu ra chuẩn
                response_serializer = PostSerializer(response_data)
                
                # Trả về phản hồi thành công (HTTP 201 Created)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # Xử lý lỗi Firestore
                return Response(
                    {"error": f"Lỗi Firestore: {e}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # 6. Trả về lỗi nếu dữ liệu không hợp lệ (HTTP 400 Bad Request)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def root_view(request):
    """Trả về thông báo chào mừng và các endpoint có sẵn."""
    return Response({
        'status': 'Django API Backend đang hoạt động',
        'project': 'AiotAutotech API',
        'endpoints': {
            'list_create_posts': 'http://127.0.0.1:8000/api/posts/'
        }
    })
    