"""
Direct script to create super admin and test user in Cosmos DB
Run from Backend directory: python create_users_direct.py
"""
import os
import sys
import bcrypt
from datetime import datetime, timezone
from azure.cosmos import CosmosClient, exceptions
from dotenv import load_dotenv

# Load environment variables
load_dotenv("unified.env")

COSMOS_ENDPOINT = os.getenv("COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("COSMOS_KEY")
COSMOS_DATABASE_NAME = os.getenv("COSMOS_DATABASE_NAME")

def encrypt_password(plain_password: str):
    """Encrypt password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def main():
    try:
        # Connect to Cosmos DB
        client = CosmosClient(url=COSMOS_ENDPOINT, credential=COSMOS_KEY)
        database = client.get_database_client(COSMOS_DATABASE_NAME)
        user_container = database.get_container_client("gi_users")
        
        print("✓ Connected to Cosmos DB")
        print(f"✓ Database: {COSMOS_DATABASE_NAME}")
        
        # Check existing users
        try:
            existing = list(user_container.read_all_items())
            print(f"✓ Found {len(existing)} existing users")
            for user in existing:
                print(f"  - {user.get('email')} ({user.get('role')})")
        except Exception as e:
            print(f"✗ Error reading users: {e}")
        
        # Create Super Admin
        super_admin_password = os.getenv('SUPER_ADMIN_PASSWORD', 'Affine@2025')
        super_admin = {
            "id": "1",
            "numericId": 1,
            "name": "Super Admin",
            "email": "super_admin@affine.ai",
            "password": encrypt_password(super_admin_password),
            "role": "superAdmin",
            "status": 1,
            "categories": [],
            "db_connection_id": "1",
            "tables_list": ["Inventory", "Invoice_2", "Order", "shipping"],
            "access_token": "",
            "expiration_time": "",
            "last_logged_in": "",
            "jwt_token": "",
            "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            "updated_by": None,
            "updated_at": None
        }
        
        # Try to create super admin
        try:
            user_container.create_item(body=super_admin)
            print("\n✓ Super Admin created successfully!")
            print(f"  Email: super_admin@affine.ai")
            print(f"  Password: {super_admin_password}")
        except exceptions.CosmosResourceExistsError:
            print("\n⚠ Super Admin already exists, updating...")
            user_container.upsert_item(body=super_admin)
            print("✓ Super Admin updated!")
        
        # Create Test User
        test_password = "Test@123456"
        test_user = {
            "id": "2",
            "numericId": 2,
            "name": "Test User",
            "email": "testuser@affine.ai",
            "password": encrypt_password(test_password),
            "role": "User",
            "status": 1,
            "categories": [],
            "db_connection_id": "1",
            "tables_list": ["Inventory", "Invoice_2", "Order", "shipping"],
            "access_token": "",
            "expiration_time": "",
            "last_logged_in": "",
            "jwt_token": "",
            "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            "updated_by": None,
            "updated_at": None
        }
        
        try:
            user_container.create_item(body=test_user)
            print("\n✓ Test User created successfully!")
            print(f"  Email: testuser@affine.ai")
            print(f"  Password: {test_password}")
        except exceptions.CosmosResourceExistsError:
            print("\n⚠ Test User already exists, updating...")
            user_container.upsert_item(body=test_user)
            print("✓ Test User updated!")
        
        # Verify users were created
        print("\n--- Final User List ---")
        final_users = list(user_container.read_all_items())
        for user in final_users:
            print(f"✓ {user.get('email')} - Role: {user.get('role')} - Status: {user.get('status')}")
        
        print("\n✓ Done! You can now login with any of these credentials.")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
