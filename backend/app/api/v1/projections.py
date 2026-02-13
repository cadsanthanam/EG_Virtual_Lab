"""
Projections API v1 endpoints.

Provides the core computation endpoint that the frontend calls
to get pre-computed render instructions for projection drawing.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.projection import ProjectionRequest, ProjectionResponse
from app.services.projection_service import ProjectionService

router = APIRouter()


@router.post(
    "/compute",
    response_model=ProjectionResponse,
    summary="Compute projection render instructions",
    description=(
        "Accepts solid type, case type, and parameters. Returns pre-computed "
        "pixel coordinates and drawing primitives for each step. The frontend "
        "renders these instructions directly on canvas — zero math on client."
    ),
)
async def compute_projection(request: ProjectionRequest) -> ProjectionResponse:
    """
    Compute orthographic projection and return render instructions.

    The geometry engine computes all vertex positions, edge visibility,
    projector lines, and step sequences. The response contains everything
    the frontend needs to draw each step using Canvas 2D API.
    """
    try:
        service = ProjectionService()
        result = service.compute(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Projection computation failed: {str(e)}",
        )
