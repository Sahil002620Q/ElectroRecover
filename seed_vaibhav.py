import requests
import json
import time

# Update this to your deployed Render URL
API_BASE_URL = "https://electro-recover-api.onrender.com"

user_data = {
    "name": "Vaibhav",
    "email": "sxmax.n03@gmail.com",
    "password": "sahil999n",
    "role": "seller",
    "location": "New Delhi, India",
    "phone": "+91 9876543210"
}

def seed():
    print(f"Connecting to {API_BASE_URL}...")
    
    # 1. Register User
    try:
        reg_res = requests.post(f"{API_BASE_URL}/auth/register", json=user_data)
        if reg_res.status_code == 201 or reg_res.status_code == 200:
            print("Successfully registered Vaibhav!")
            token = reg_res.json()["access_token"]
        else:
            # Maybe already exists, try login
            print(f"Registration failed ({reg_res.status_code}), trying login...")
            login_res = requests.post(f"{API_BASE_URL}/auth/login", json={
                "email": user_data["email"],
                "password": user_data["password"]
            })
            if login_res.status_code == 200:
                print("Login successful!")
                token = login_res.json()["access_token"]
            else:
                print(f"Login failed: {login_res.text}")
                return
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add Listings
    listings = [
        {
            "title": "Broken Screen iPhone 13 Pro",
            "category": "Smartphone",
            "brand": "Apple",
            "model": "13 Pro",
            "condition": "broken",
            "price": 350.00,
            "location": "New Delhi",
            "description": "Dropped once, screen is cracked but internals are perfectly fine. Good for parts or repair.",
            "working_parts": "Motherboard, Camera, Battery",
            "photos": ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500"]
        },
        {
            "title": "Gaming Laptop - Motherboard Issue",
            "category": "Laptop",
            "brand": "ASUS",
            "model": "ROG Zephyrus",
            "condition": "broken",
            "price": 500.00,
            "location": "Noida",
            "description": "Won't turn on. Repair shop says motherboard needs replacement. Screen and keyboard are mint.",
            "working_parts": "Screen, Keyboard, 16GB RAM, 1TB SSD",
            "photos": ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500"]
        },
        {
            "title": "Premium Blog: TechReview.com",
            "category": "Website",
            "website_url": "https://techreview-demo.com",
            "monthly_revenue": 120.0,
            "monthly_traffic": 5000,
            "tech_stack": "WordPress",
            "price": 1200.00,
            "location": "Remote",
            "description": "Established tech blog with 100+ articles. Passive income from AdSense.",
            "photos": ["https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500"]
        }
    ]

    for item in listings:
        res = requests.post(f"{API_BASE_URL}/listings/", json=item, headers=headers)
        if res.status_code == 201:
            print(f"Added listing: {item['title']}")
        else:
            print(f"Failed to add {item['title']}: {res.text}")

if __name__ == "__main__":
    seed()
