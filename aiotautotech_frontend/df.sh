#!/usr/bin/env bash
set -e

PROJECT_ID="aiotautotech"
REGION="asia-southeast1"
FRONTEND_SERVICE="aiotautotech-frontend"

echo ">>> Deploy FRONTEND to Cloud Run: $FRONTEND_SERVICE ($PROJECT_ID, $REGION)"

# Đảm bảo gcloud dùng đúng project & region
gcloud config set project "$PROJECT_ID" >/dev/null
gcloud config set run/region "$REGION" >/dev/null

# Luôn cd về thư mục chứa script (chính là thư mục frontend)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Deploy frontend: build từ source + deploy
gcloud run deploy "$FRONTEND_SERVICE" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated

echo ">>> Frontend deployed!"

FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" \
  --platform managed \
  --region "$REGION" \
  --format 'value(status.url)')

echo ">>> Frontend URL: $FRONTEND_URL"
