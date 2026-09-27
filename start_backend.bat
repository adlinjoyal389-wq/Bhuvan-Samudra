@echo off
echo Starting Bhuvan-Samudra ORCA Backend on http://localhost:8000 ...
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
