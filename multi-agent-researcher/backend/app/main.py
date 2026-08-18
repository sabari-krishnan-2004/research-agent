import os
import sys

# Ensure backend directory is in the Python search path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Add backend/app to search path so uvicorn reloader can locate 'main'
app_dir = os.path.dirname(os.path.abspath(__file__))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router as api_router

app = FastAPI(
    title="Autonomous Multi-Agent Research Engine API",
    description="FastAPI Backend for LangGraph-powered real-time SSE researcher pipeline",
    version="1.0.0"
)

# CORS configuration to allow local React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev simplicity, allow all. Can restrict to specific client ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API endpoints
app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy", "config_loaded": bool(settings.OPENAI_API_KEY and settings.TAVILY_API_KEY)}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
