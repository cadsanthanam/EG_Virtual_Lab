"""
Pydantic schemas for the Projection Computation API.

Defines the request/response contracts. The frontend sends a ProjectionRequest
and receives a ProjectionResponse containing pre-computed render instructions.
The frontend has zero knowledge of projection geometry — it just draws.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


# ============================================================
# Enums
# ============================================================

class SolidType(str, Enum):
    """Supported solid types — maps to getSidesCount() in core.js:550-556."""
    TRIANGULAR_PRISM = "triangular-prism"
    SQUARE_PRISM = "square-prism"
    PENTAGONAL_PRISM = "pentagonal-prism"
    HEXAGONAL_PRISM = "hexagonal-prism"
    TRIANGULAR_PYRAMID = "triangular-pyramid"
    SQUARE_PYRAMID = "square-pyramid"
    PENTAGONAL_PYRAMID = "pentagonal-pyramid"
    HEXAGONAL_PYRAMID = "hexagonal-pyramid"


class CaseType(str, Enum):
    """Projection case types."""
    A = "A"  # Axis perpendicular to HP
    B = "B"  # Axis perpendicular to VP
    C = "C"  # Axis inclined to HP
    D = "D"  # Axis inclined to both HP and VP


class RestingOn(str, Enum):
    """Resting condition for Case C/D — from addRestingInputCaseC() core.js:190-207."""
    BASE_EDGE = "base-edge"
    BASE_CORNER = "base-corner"


# ============================================================
# Request
# ============================================================

class ProjectionRequest(BaseModel):
    """
    Input parameters for projection computation.

    Maps directly to the state object in core.js:13-33 and the dynamic
    inputs created by updateDynamicInputs() in core.js:135-168.
    """
    solid_type: SolidType = Field(
        ...,
        description="Type of solid (e.g., 'hexagonal-prism')",
    )
    case_type: CaseType = Field(
        ...,
        description="Projection case (A, B, C, or D)",
    )
    base_edge: float = Field(
        default=40.0,
        gt=0,
        le=200,
        description="Length of one base edge in drawing units",
    )
    axis_length: float = Field(
        default=80.0,
        gt=0,
        le=400,
        description="Length of solid axis in drawing units",
    )
    edge_angle: float = Field(
        default=30.0,
        ge=0,
        le=90,
        description="Edge angle with VP in degrees (Case A)",
    )
    axis_angle_hp: float = Field(
        default=45.0,
        ge=0,
        le=90,
        description="Axis inclination with HP in degrees (Case C/D)",
    )
    axis_angle_vp: float = Field(
        default=0.0,
        ge=0,
        le=90,
        description="Axis inclination with VP in degrees (Case D)",
    )
    resting_on: RestingOn = Field(
        default=RestingOn.BASE_EDGE,
        description="Resting condition for Case C/D",
    )
    canvas_width: float = Field(
        default=1200.0,
        gt=0,
        description="Available canvas width in pixels",
    )
    canvas_height: float = Field(
        default=700.0,
        gt=0,
        description="Available canvas height in pixels",
    )


# ============================================================
# Render Elements (discriminated union by 'type' field)
# ============================================================

class LineElement(BaseModel):
    """A line segment — maps to drawLine() in core.js:437-460."""
    type: Literal["line"] = "line"
    x1: float
    y1: float
    x2: float
    y2: float
    style: Literal["visible", "hidden", "construction"] = "visible"


class PolygonElement(BaseModel):
    """A closed/open polygon — maps to polygon drawing in caseA.js:122-133."""
    type: Literal["polygon"] = "polygon"
    points: list[dict[str, float]]  # [{"x": ..., "y": ...}, ...]
    style: Literal["visible", "hidden", "construction"] = "visible"
    closed: bool = True


class PointElement(BaseModel):
    """A labeled point — maps to drawPoint() in core.js:462-475."""
    type: Literal["point"] = "point"
    x: float
    y: float
    label: str = ""
    radius: float = 2.0


class LabelElement(BaseModel):
    """A text label — for annotations not attached to a point."""
    type: Literal["label"] = "label"
    x: float
    y: float
    text: str
    font_size: float = 12.0


class ArcElement(BaseModel):
    """An arc — maps to drawAngleArc() in core.js:499-510."""
    type: Literal["arc"] = "arc"
    center_x: float
    center_y: float
    radius: float
    start_angle: float  # in degrees
    end_angle: float  # in degrees


class ArrowElement(BaseModel):
    """An arrow head — maps to drawArrow() in core.js:423-435."""
    type: Literal["arrow"] = "arrow"
    from_x: float
    from_y: float
    to_x: float
    to_y: float


# Discriminated union type
RenderElement = LineElement | PolygonElement | PointElement | LabelElement | ArcElement | ArrowElement


# ============================================================
# Response
# ============================================================

class StepInstruction(BaseModel):
    """
    One step in the projection sequence.

    Each step contains all elements needed to render that step on canvas.
    Steps are cumulative — step N includes all drawing from steps 1..N.
    This matches the behavior of drawStep() in core.js:365-383.
    """
    step_number: int = Field(..., ge=1)
    title: str
    description: str
    elements: list[
        LineElement | PolygonElement | PointElement | LabelElement | ArcElement | ArrowElement
    ]


class SolidProperties(BaseModel):
    """Computed properties of the solid for frontend display."""
    sides: int
    is_prism: bool
    is_pyramid: bool
    circumradius: float | None = None


class ProjectionMetadata(BaseModel):
    """Metadata about the computation result."""
    computed_beta: float | None = None
    computed_xy_length: float
    solid_properties: SolidProperties


class ProjectionResponse(BaseModel):
    """
    Complete projection computation result.

    Contains pre-computed render instructions for each step.
    The frontend iterates over steps and renders elements via Canvas 2D API.
    """
    total_steps: int = Field(..., ge=0)
    steps: list[StepInstruction]
    metadata: ProjectionMetadata
