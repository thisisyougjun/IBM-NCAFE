import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
BACKEND_BASE_URL: str = os.getenv("BACKEND_BASE_URL", "http://localhost:8081")
