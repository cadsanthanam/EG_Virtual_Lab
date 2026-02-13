"""
EG Virtual Lab — FastAPI Application Entry Point.

Provides the geometry computation API for the Engineering Graphics Virtual Lab.
All projection logic runs server-side; the frontend receives pre-computed
render instructions (pixel coordinates + drawing primitives) as JSON.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1 import projections, curves

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Backend geometry engine for Engineering Graphics Virtual Lab. "
        "Computes orthographic projections of solids and returns render "
        "instructions for frontend canvas rendering."
    ),
)

# CORS middleware — allows frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(
    projections.router,
    prefix="/api/v1/projections",
    tags=["projections"],
)

app.include_router(
    curves.router,
    prefix="/api/v1/curves",
    tags=["curves"],
)


@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }
