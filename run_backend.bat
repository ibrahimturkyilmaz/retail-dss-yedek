@echo off
echo Backend baslatiliyor...
cd backend
call .\venv\Scripts\activate
uvicorn main:app --reload --port 8001
pause
