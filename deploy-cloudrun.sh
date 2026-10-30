#!/usr/bin/env bash
set -e

SERVICE_NAME="airborne-student-dashboard"
PROJECT_ID="airborne-aviation-505100"
REGION="asia-south1"
CLOUDSQL_INSTANCE="airborne-aviation-505100:asia-south1:airborne-db"

echo "=========================================================="
echo "Deploying $SERVICE_NAME to Google Cloud Run ($REGION)..."
echo "=========================================================="

gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --add-cloudsql-instances "$CLOUDSQL_INSTANCE" \
    --set-env-vars "GCP_PROJECT=$PROJECT_ID,GCP_REGION=$REGION" \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,API_SHARED_SECRET=API_SHARED_SECRET:latest" \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
echo "Live Cloud Run Dashboard URL: $SERVICE_URL"
