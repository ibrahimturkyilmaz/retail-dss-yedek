import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'retail.db')
print(f"DB Path: {db_path}")
print(f"DB Exists: {os.path.exists(db_path)}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Show current sales columns
cursor.execute("PRAGMA table_info(sales)")
cols = cursor.fetchall()
print("\nCurrent 'sales' columns:")
for c in cols:
    print(f"  {c}")

# Check if 'amount' exists and 'quantity' doesn't
col_names = [c[1] for c in cols]
print(f"\nColumn names: {col_names}")

if 'amount' in col_names and 'quantity' not in col_names:
    print("\n>> Renaming 'amount' to 'quantity' via ALTER TABLE...")
    cursor.execute("ALTER TABLE sales RENAME COLUMN amount TO quantity")
    conn.commit()
    print(">> Done! Column renamed successfully.")
elif 'quantity' in col_names:
    print("\n>> 'quantity' column already exists. No action needed.")
elif 'amount' not in col_names and 'quantity' not in col_names:
    print("\n>> Neither 'amount' nor 'quantity' found. Table may need recreation.")
    cursor.execute("DROP TABLE IF EXISTS sales")
    conn.commit()
    print(">> Table dropped. It will be recreated on next server start.")

# Verify
cursor.execute("PRAGMA table_info(sales)")
cols = cursor.fetchall()
if cols:
    print("\nVerified 'sales' columns:")
    for c in cols:
        print(f"  {c}")
else:
    print("\nTable 'sales' dropped, will be recreated on next startup.")

conn.close()
print("\nDone!")
