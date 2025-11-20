# Dockerfile Backend
FROM python:3.11-slim
WORKDIR /app

# Sao chép và cài đặt dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ dự án
COPY . .

# Thiết lập biến môi trường bắt buộc của Cloud Run
ENV PORT 8080 
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE aiotautotech_backend.settings

# Lệnh chạy ứng dụng (sử dụng Gunicorn là tối ưu nhất cho Production)
CMD exec gunicorn aiotautotech_backend.wsgi:application --bind 0.0.0.0:$PORT