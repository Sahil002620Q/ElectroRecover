import sqlite3
import json
import os

DB_FILE = "backend/marketplace.db"

listings = [
    {
        "seller_id": 1,
        "title": "Raspberry Pi 4 Model B - 8GB RAM",
        "category": "Microcontroller",
        "brand": "Raspberry Pi",
        "model": "4B",
        "condition": "used",
        "price": 45.00,
        "location": "San Francisco, CA",
        "description": "Gently used Raspberry Pi 4. Perfect for your next project.",
        "working_parts": "All components",
        "photos": json.dumps(["/static/images/raspberry_pi.png"])
    },
    {
        "seller_id": 1,
        "title": "16GB DDR4 RAM Stick - Corsair Vengeance",
        "category": "Components",
        "brand": "Corsair",
        "model": "Vengeance LPX",
        "condition": "used",
        "price": 30.00,
        "location": "New York, NY",
        "description": "High-performance DDR4 RAM. Selling because of upgrade.",
        "working_parts": "Functional",
        "photos": json.dumps(["/static/images/ram.png"])
    },
    {
        "seller_id": 1,
        "title": "NVIDIA GeForce RTX 3080 - Minor Artifacts",
        "category": "Components",
        "brand": "NVIDIA",
        "model": "RTX 3080",
        "condition": "broken",
        "price": 250.00,
        "location": "Austin, TX",
        "description": "GPU shows artifacts under load. Good for someone who can repair or needs parts.",
        "working_parts": "Fans, LEDs, cooler",
        "photos": json.dumps(["/static/images/gpu.png"])
    },
    {
        "seller_id": 1,
        "title": "Samsung 970 EVO Plus 1TB NVMe SSD",
        "category": "Storage",
        "brand": "Samsung",
        "model": "970 EVO Plus",
        "condition": "used",
        "price": 60.00,
        "location": "Seattle, WA",
        "description": "Fast NVMe storage. Barely used, low TBW.",
        "working_parts": "Full functionality",
        "photos": json.dumps(["/static/images/ssd.png"])
    }
]

# Ensure we are in the root directory relative to the script's intended execution
# or just use absolute paths if possible. Since I run from root, relative is fine.

if not os.path.exists(DB_FILE):
    # Try alternate path if running from backend dir
    if os.path.exists("marketplace.db"):
        DB_FILE = "marketplace.db"
    else:
        print(f"Error: Database file {DB_FILE} not found.")
        exit(1)

conn = sqlite3.connect(DB_FILE)
c = conn.cursor()

for item in listings:
    c.execute('''INSERT INTO listings (seller_id, title, category, brand, model, condition, price, location, description, working_parts, photos)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (item["seller_id"], item["title"], item["category"], item["brand"], item["model"], 
               item["condition"], item["price"], item["location"], item["description"], 
               item["working_parts"], item["photos"]))

conn.commit()
conn.close()
print("Seed data inserted!")
