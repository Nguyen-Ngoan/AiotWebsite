#!/usr/bin/env bash
set -e

########################################
# CẤU HÌNH CƠ BẢN
########################################

# Có thể override từ bên ngoài:
#   PROJECT_ID=... REGION=... SERVICE_NAME=... ./db.sh

PROJECT_ID="${PROJECT_ID:-aiotautotech}"
REGION="${REGION:-asia-southeast1}"
SERVICE_NAME="${SERVICE_NAME:-aiotautotech-backend}"

########################################
# CẤU HÌNH FRONTEND / BACKEND
########################################

# FRONTEND_ORIGINS mặc định (ngăn cách bằng dấu phẩy – CORS friendly)
FRONTEND_ORIGINS_DEFAULT="https://aiotautotech.com,https://www.aiotautotech.com,https://aiotautotech-frontend-476438747148.asia-southeast1.run.app,http://localhost:3000"
FRONTEND_ORIGINS="${FRONTEND_ORIGINS:-$FRONTEND_ORIGINS_DEFAULT}"

# SECRET_KEY (nên set từ biến môi trường / Secret Manager khi deploy thật)
SECRET_KEY="${SECRET_KEY:-%9uwmst5f!o&\*ccc-=@1v&@7^9@tu%vneaecg0#))u&#c3v^bo}"

########################################
# CẤU HÌNH CLOUDFLARE R2
########################################

# Bạn thay các giá trị ... cho đúng với R2 của bạn
R2_BUCKET_NAME="${R2_BUCKET_NAME:-aiotautotech}"
R2_ACCOUNT_ID="${R2_ACCOUNT_ID:-de158de4efc0b5dcbb268f4483912cfc}"

# KHÔNG nên commit thẳng key thật lên git, chỉ để demo
R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID:-a278905ec66de947b5ddf0d5cb8dd1b5}"
R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY:-f76cfbfbb1843b49460033cd82344aaad94864f5b90f1abaef02133ee46e9708}"

# Public URL của bucket hoặc custom domain CDN
R2_PUBLIC_BASE_URL="${R2_PUBLIC_BASE_URL:-https://cdn.aiotautotech.com}"
CDN_URL="${CDN_URL:-https://cdn.aiotautotech.com}"

########################################
# THÔNG TIN TRIỂN KHAI
########################################

echo ">>> Deploy BACKEND to Cloud Run: $SERVICE_NAME ($PROJECT_ID, $REGION)"
echo ">>> FRONTEND_ORIGINS: $FRONTEND_ORIGINS"
echo ">>> SECRET_KEY: (đã set, không in giá trị thật ở đây)"
echo ">>> R2_BUCKET_NAME: $R2_BUCKET_NAME"
echo ">>> R2_ACCOUNT_ID:  $R2_ACCOUNT_ID"
echo ">>> R2_PUBLIC_BASE_URL: $R2_PUBLIC_BASE_URL"

########################################
# CẤU HÌNH GCLOUD
########################################

gcloud config set core/project "$PROJECT_ID"
gcloud config set run/region "$REGION"

########################################
# DEPLOY LÊN CLOUD RUN
########################################

# Lưu ý:
# - Dùng ^;^ để chọn dấu ; làm separator giữa các ENV VARS
#   => Giá trị có chứa "https://..." và dấu phẩy "," vẫn an toàn.
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars="^;^SECRET_KEY=$SECRET_KEY;FIRESTORE_PROJECT_ID=$PROJECT_ID;FRONTEND_ORIGINS=$FRONTEND_ORIGINS;R2_BUCKET_NAME=$R2_BUCKET_NAME;R2_ACCOUNT_ID=$R2_ACCOUNT_ID;R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID;R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY;R2_PUBLIC_BASE_URL=$R2_PUBLIC_BASE_URL;CDN_URL=$CDN_URL"

echo ">>> Backend deployed!"

########################################
# IN RA URL BACKEND
########################################

BACKEND_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --platform managed \
  --region "$REGION" \
  --format 'value(status.url)')

echo ">>> Backend URL: $BACKEND_URL"
echo ">>> API base:    ${BACKEND_URL}/api"
