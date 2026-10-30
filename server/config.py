import os

# Dynamic Port Binding for Cloud Run
PORT = int(os.environ.get("PORT", os.environ.get("APP_PORT", 8080)))

# Project & Region
GCP_PROJECT = os.environ.get("GCP_PROJECT", "airborne-aviation-505100")
GCP_REGION = os.environ.get("GCP_REGION", "asia-south1")

# Main GCR Admin Panel Cloud SQL Database Configuration
# Primary: Google Cloud SQL (airborne-aviation-505100:asia-south1:airborne-db) injected via Cloud Run Secret Manager
DEFAULT_PROD_DB_URL = os.environ.get(
    "PROD_DATABASE_URL",
    "postgresql+psycopg2://airborne_app_user:AirborneDB2026@34.93.180.179:5432/airbornedb?sslmode=require"
)
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///airborne_students.db")

# Main GCR Admin Panel URL & Org ID
ORG_ID = os.environ.get("ORG_ID", "340e4b30-22bc-44f2-be56-85b061daaddd")
ADMIN_PANEL_URL = os.environ.get(
    "ADMIN_PANEL_URL",
    "https://airborne-admin-368523757732.asia-south1.run.app"
)

# External GCR Chatbot Project Integration
GCR_CHATBOT_SERVICE_URL = os.environ.get(
    "GCR_CHATBOT_SERVICE_URL", 
    "https://airborne-chatbot-368523757732.asia-south1.run.app"
)

# Authentication secrets for service-to-service communication
INTERNAL_RAG_SHARED_SECRET = os.environ.get("INTERNAL_RAG_SHARED_SECRET", "airborne-rag-secure-token-2026")
API_SHARED_SECRET = os.environ.get("API_SHARED_SECRET", "airborne-api-shared-secret-2026")

# Gemini API Key if fallback local AI reasoning is called
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
