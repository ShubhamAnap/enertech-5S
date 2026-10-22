from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.plants import router as plants_router
from app.api.activities import router as activities_router
from app.api.red_tags import router as red_tags_router
from app.api.audits import router as audits_router
from app.api.reports import router as reports_router
from app.api.management import router as management_router
from app.seed import seed_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize and seed database on startup
    try:
        await seed_data()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise 5S Activity Management, Before/After Evidence Tracking & Plant Zone Auditing API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(plants_router, prefix=settings.API_V1_PREFIX)
app.include_router(activities_router, prefix=settings.API_V1_PREFIX)
app.include_router(red_tags_router, prefix=settings.API_V1_PREFIX)
app.include_router(audits_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(management_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "platform": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
