import sqlite3
try:
    conn = sqlite3.connect('backend/retail.db')
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS sales")
    print("Table 'sales' dropped successfully.")
    conn.commit()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
