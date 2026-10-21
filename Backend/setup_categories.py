"""
Script to create and assign categories to users
Run from Backend directory: python setup_categories.py
"""
import os
import sys
import uuid
from datetime import datetime, timezone
from azure.cosmos import CosmosClient, exceptions
from dotenv import load_dotenv

# Load environment variables
load_dotenv("unified.env")

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME")

def main():
    try:
        # Connect to Cosmos DB
        client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
        database = client.get_database_client(COSMOS_DATABASE_NAME)
        category_container = database.get_container_client("gi_category")
        user_container = database.get_container_client("gi_users")
        
        print("✓ Connected to Cosmos DB")
        print(f"✓ Database: {COSMOS_DATABASE_NAME}")
        
        # Check existing categories
        print("\n--- Current Categories ---")
        try:
            existing_categories = list(category_container.read_all_items())
            print(f"✓ Found {len(existing_categories)} existing categories:")
            for cat in existing_categories:
                print(f"  - {cat.get('category_name')} (ID: {cat.get('id')}) - Status: {cat.get('status')}")
        except Exception as e:
            print(f"✗ Error reading categories: {e}")
            existing_categories = []
        
        # Create default categories if none exist
        if len(existing_categories) == 0:
            print("\n--- Creating Default Categories ---")
            default_categories = [
                {
                    "id": str(uuid.uuid4()),
                    "category_name": "Finance",
                    "category_code": "FIN",
                    "status": 1,
                    "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                },
                {
                    "id": str(uuid.uuid4()),
                    "category_name": "HR",
                    "category_code": "HR",
                    "status": 1,
                    "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                },
                {
                    "id": str(uuid.uuid4()),
                    "category_name": "Operations",
                    "category_code": "OPS",
                    "status": 1,
                    "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                },
                {
                    "id": str(uuid.uuid4()),
                    "category_name": "Sales",
                    "category_code": "SALES",
                    "status": 1,
                    "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                },
            ]
            
            for category in default_categories:
                try:
                    category_container.create_item(body=category)
                    print(f"  ✓ Created category: {category['category_name']} (ID: {category['id']})")
                except Exception as e:
                    print(f"  ✗ Error creating {category['category_name']}: {e}")
            
            existing_categories = default_categories
        
        # Assign all active categories to all users
        print("\n--- Assigning Categories to Users ---")
        active_categories = [cat for cat in existing_categories if cat.get('status') == 1]
        active_category_ids = [cat['id'] for cat in active_categories]
        
        print(f"✓ Active categories to assign: {len(active_category_ids)}")
        for cat_id in active_category_ids:
            cat_name = next((c['category_name'] for c in active_categories if c['id'] == cat_id), cat_id)
            print(f"  - {cat_name} (ID: {cat_id})")
        
        # Update all users with categories
        try:
            all_users = list(user_container.read_all_items())
            print(f"\n✓ Found {len(all_users)} users to update")
            
            for user in all_users:
                user['categories'] = active_category_ids
                user_container.upsert_item(body=user)
                print(f"  ✓ Updated {user.get('email')} with {len(active_category_ids)} categories")
            
            print("\n✓ All users have been assigned categories!")
            
        except Exception as e:
            print(f"✗ Error updating users: {e}")
            sys.exit(1)
        
        # Verify
        print("\n--- Final Status ---")
        final_users = list(user_container.read_all_items())
        for user in final_users:
            print(f"✓ {user.get('email')} - Categories: {len(user.get('categories', []))} assigned")
        
        print("\n✓ Setup complete! Users can now select categories when uploading documents.")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
