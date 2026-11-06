#!/usr/bin/env bash
set -e

SERVICE_NAME="airborne-student-dashboard"
PROJECT_ID="airborne-aviation-505100"
REGION="asia-south1"
SERVICE_ACCOUNT="airborne-run-sa@airborne-aviation-505100.iam.gserviceaccount.com"
CHATBOT_URL="https://airborne-voice-assistant-368523757732.asia-south1.run.app"

echo "=========================================================="
echo "Building & Deploying $SERVICE_NAME to Google Cloud Run ($REGION)..."
echo "=========================================================="

gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --service-account "$SERVICE_ACCOUNT" \
    --set-env-vars "GCP_PROJECT=$PROJECT_ID,GCP_REGION=$REGION,GCR_CHATBOT_SERVICE_URL=$CHATBOT_URL" \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,API_SHARED_SECRET=API_SHARED_SECRET:latest" \
    --min-instances 0 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300

echo "Migrating 100% traffic to the latest build revision..."
gcloud run services update-traffic "$SERVICE_NAME" \
    --to-latest \
    --platform managed \
    --region "$REGION" \
    --project "$PROJECT_ID"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
LATEST_REV=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.latestReadyRevisionName)')

echo "Deployment & Traffic Migration successful!"
echo "Live Cloud Run URL: $SERVICE_URL"
echo "Active Revision: $LATEST_REV"
