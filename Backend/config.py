import os
from dotenv import load_dotenv

load_dotenv()

# Configuration values for the backend
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://mongo:27017/quickCommerceDB')
SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
