"""
Curves API v1 endpoints — Ellipse and Cycloid computation.

Same philosophy as projections: accepts parameters, returns pre-computed
render instructions. The frontend just draws.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.curve_schemas import (
    EllipseRequest, CycloidRequest, CurveResponse,
)
from app.engine.curves.ellipse_engine import compute_ellipse
from app.engine.curves.cycloid_engine import compute_cycloid

router = APIRouter()


@router.post(
    "/ellipse/compute",
    response_model=CurveResponse,
    summary="Compute ellipse (focus-directrix conic) render instructions",
)
async def compute_ellipse_endpoint(request: EllipseRequest) -> CurveResponse:
    """Compute 11-step focus-directrix conic construction."""
    try:
        return compute_ellipse(
            focus_dist=request.focus_dist,
            eccentricity_str=request.eccentricity,
            canvas_width=request.canvas_width,
            canvas_height=request.canvas_height,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Ellipse computation failed: {str(e)}"
        )


@router.post(
    "/cycloid/compute",
    response_model=CurveResponse,
    summary="Compute cycloid curve render instructions",
)
async def compute_cycloid_endpoint(request: CycloidRequest) -> CurveResponse:
    """Compute 10-step cycloid rolling circle construction."""
    try:
        return compute_cycloid(
            diameter=request.diameter,
            canvas_width=request.canvas_width,
            canvas_height=request.canvas_height,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Cycloid computation failed: {str(e)}"
        )
