
from database import engine
from sqlalchemy import text

def add_column():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN calendar_url VARCHAR"))
            print("Migration successful: Added calendar_url to users table.")
    except Exception as e:
        print(f"Migration failed (maybe column exists): {e}")

if __name__ == "__main__":
    add_column()
