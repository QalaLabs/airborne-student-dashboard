# Airborne Aviation Academy — local student portal (frontend + backend)
# Frontend: http://127.0.0.1:5173
# Backend:  http://127.0.0.1:8080

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$env:DATABASE_URL = "sqlite:///./airborne_students.db"
$env:ENV = "development"

Write-Host "Starting Airborne backend on :8080 (SQLite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$PSScriptRoot'; `$env:DATABASE_URL='sqlite:///./airborne_students.db'; `$env:ENV='development'; python -m uvicorn server.main:app --host 127.0.0.1 --port 8080 --reload"
)

Start-Sleep -Seconds 2

Write-Host "Starting Airborne frontend on :5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$PSScriptRoot'; npm run dev -- --host 127.0.0.1 --port 5173"
)

Write-Host ""
Write-Host "Open: http://127.0.0.1:5173/" -ForegroundColor Green
Write-Host "Cadet: AA-CPL-2026-084 / cadet2026" -ForegroundColor Yellow
Write-Host "Admin: admin@airborneaviation.in / admin2026" -ForegroundColor Yellow
