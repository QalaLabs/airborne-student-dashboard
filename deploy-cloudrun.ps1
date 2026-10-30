# ==============================================================================
# Airborne Aviation Academy - Student Dashboard & AeroBot GCR Deployment
# Project: airborne-aviation-505100 | Region: asia-south1
# ==============================================================================

$SERVICE_NAME = "airborne-student-dashboard"
$PROJECT_ID = "airborne-aviation-505100"
$REGION = "asia-south1"
$CLOUDSQL_INSTANCE = "airborne-aviation-505100:asia-south1:airborne-db"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Deploying $SERVICE_NAME to Google Cloud Run ($REGION)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Build and Deploy from local source using Cloud Build
gcloud run deploy $SERVICE_NAME `
    --source . `
    --project $PROJECT_ID `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --add-cloudsql-instances $CLOUDSQL_INSTANCE `
    --set-env-vars "GCP_PROJECT=$PROJECT_ID,GCP_REGION=$REGION" `
    --set-secrets "DATABASE_URL=DATABASE_URL:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,API_SHARED_SECRET=API_SHARED_SECRET:latest" `
    --min-instances 0 `
    --max-instances 10 `
    --memory 512Mi `
    --cpu 1 `
    --timeout 300

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n Deployment successful!" -ForegroundColor Green
    $SERVICE_URL = (gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')
    Write-Host "Live Cloud Run Dashboard URL: $SERVICE_URL" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Deployment encountered an error. Check Cloud Build logs." -ForegroundColor Red
}
