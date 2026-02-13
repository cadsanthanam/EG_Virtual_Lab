"""
Pydantic schemas for Curve Computation APIs (Ellipse, Cycloid).

Reuses the existing RenderElement union from projection.py for drawing primitives.
Each curve engine returns a CurveResponse containing cumulative step instructions.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.projection import (
    LineElement, PolygonElement, PointElement, LabelElement, ArcElement, ArrowElement,
    StepInstruction,
)


# ============================================================
# Ellipse Request/Response
# ============================================================

class EllipseRequest(BaseModel):
    """Request for focus-directrix conic construction."""
    focus_dist: float = Field(
        default=80.0,
        gt=0,
        le=500,
        description="Distance from directrix to focus (AF) in mm",
    )
    eccentricity: str = Field(
        default="3/5",
        description="Eccentricity as decimal or fraction (e.g. '0.6' or '3/5')",
    )
    canvas_width: float = Field(default=1200.0, gt=0)
    canvas_height: float = Field(default=700.0, gt=0)


# ============================================================
# Cycloid Request/Response
# ============================================================

class CycloidRequest(BaseModel):
    """Request for cycloid curve construction."""
    diameter: float = Field(
        default=100.0,
        gt=20,
        le=200,
        description="Diameter of the generating circle in mm",
    )
    canvas_width: float = Field(default=1200.0, gt=0)
    canvas_height: float = Field(default=700.0, gt=0)


# ============================================================
# Shared Response (same structure as ProjectionResponse)
# ============================================================

class CurveMetadata(BaseModel):
    """Metadata about the curve computation."""
    curve_type: str
    parameters: dict[str, float | str] = {}


class CurveResponse(BaseModel):
    """
    Complete curve computation result.
    Same philosophy as ProjectionResponse — cumulative steps with render elements.
    """
    total_steps: int = Field(..., ge=0)
    steps: list[StepInstruction]
    metadata: CurveMetadata
