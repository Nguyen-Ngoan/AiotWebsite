#!/usr/bin/env bash
set -e

# Cấu hình nhanh
PROJECT_ID="aiotautotech"
REGION="asia-southeast1"
SERVICE_NAME="aiotautotech-backend"

echo ">>> Deploy BACKEND to Cloud Run: $SERVICE_NAME ($PROJECT_ID, $REGION)"

# Đảm bảo gcloud đang dùng đúng project & region
gcloud config set project "$PROJECT_ID" >/dev/null
gcloud config set run/region "$REGION" >/dev/null

# Luôn cd về thư mục chứa script (chính là thư mục backend)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Deploy backend: build từ source + deploy
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars SECRET_KEY="${SECRET_KEY:-change-me-secret-key}" \
  --set-env-vars FIRESTORE_PROJECT_ID="$PROJECT_ID"

echo ">>> Backend deployed!"

# In ra URL backend
BACKEND_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --platform managed \
  --region "$REGION" \
  --format 'value(status.url)')

echo ">>> Backend URL: $BACKEND_URL"
echo ">>> API base:    ${BACKEND_URL}/api"
