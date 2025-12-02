import pymongo
import sys

try:
    client = pymongo.MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=5000)
    print("Attempting to connect...")
    info = client.server_info()
    print("Connection successful!")
    print(info)
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
