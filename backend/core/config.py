import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Retail DSS API"
    PROJECT_VERSION: str = "1.0.0"
    
    # Veritabanı
    DATABASE_URL: str = os.getenv("DATABASE_URL") or "sqlite:///./retail.db"
    
    # Güvenlik & CORS
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # AI & Dış Servisler
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Check if testing mode
    TESTING: bool = os.getenv("TESTING", "False").lower() == "true"

settings = Settings()
