# ==============================================================================
# Airborne Aviation Academy - Student Dashboard & AeroBot GCR Deployment
# Project: airborne-aviation-505100 | Region: asia-south1
# ==============================================================================

$SERVICE_NAME = "airborne-student-dashboard"
$PROJECT_ID = "airborne-aviation-505100"
$REGION = "asia-south1"
$SERVICE_ACCOUNT = "airborne-run-sa@airborne-aviation-505100.iam.gserviceaccount.com"
$CHATBOT_URL = "https://airborne-chatbot-368523757732.asia-south1.run.app"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Building & Deploying $SERVICE_NAME to Google Cloud Run ($REGION)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Build and Deploy from local source using Cloud Build
gcloud run deploy $SERVICE_NAME `
    --source . `
    --project $PROJECT_ID `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --service-account $SERVICE_ACCOUNT `
    --set-env-vars "GCP_PROJECT=$PROJECT_ID,GCP_REGION=$REGION,GCR_CHATBOT_SERVICE_URL=$CHATBOT_URL" `
    --set-secrets "DATABASE_URL=DATABASE_URL:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,API_SHARED_SECRET=API_SHARED_SECRET:latest" `
    --min-instances 0 `
    --max-instances 10 `
    --memory 512Mi `
    --cpu 1 `
    --timeout 300

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n Migrating 100% traffic to the latest build revision..." -ForegroundColor Cyan
    gcloud run services update-traffic $SERVICE_NAME `
        --to-latest `
        --platform managed `
        --region $REGION `
        --project $PROJECT_ID

    $SERVICE_URL = (gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')
    $LATEST_REV = (gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.latestReadyRevisionName)')
    $TRAFFIC = (gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.traffic[0].percent)')

    Write-Host "`n Deployment & Traffic Migration successful!" -ForegroundColor Green
    Write-Host "Live Cloud Run URL: $SERVICE_URL" -ForegroundColor Yellow
    Write-Host "Active Revision: $LATEST_REV" -ForegroundColor Green
    Write-Host "Traffic Allocated: $TRAFFIC%" -ForegroundColor Green
} else {
    Write-Host "`n Deployment encountered an error. Check Cloud Build logs." -ForegroundColor Red
}
