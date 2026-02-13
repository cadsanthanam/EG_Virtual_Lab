"""
Projection Service — Orchestrator.

The main service that the API endpoint calls. It validates the request,
selects the appropriate engine (A/B/C/D), computes all steps, and
returns a ProjectionResponse.

Ports the orchestration logic from:
  - generateProjection() in core.js:297-326
  - Step count logic from core.js:347-363
"""

from __future__ import annotations

from app.engine.config import DrawingConfig
from app.engine.solids import Solid
from app.engine.cases.case_a import CaseAEngine
from app.engine.cases.case_b import CaseBEngine
from app.engine.cases.case_c import CaseCEngine
from app.engine.cases.case_d import CaseDEngine
from app.schemas.projection import (
    ProjectionMetadata,
    ProjectionRequest,
    ProjectionResponse,
    SolidProperties,
)


class ProjectionService:
    """
    Service layer for projection computation.

    Orchestrates the geometry engine based on the request parameters.
    """

    def compute(self, request: ProjectionRequest) -> ProjectionResponse:
        """
        Compute projection for the given request.

        Port of generateProjection() from core.js:297-326.
        """
        # Create solid and config
        solid = Solid(request.solid_type.value)
        config = DrawingConfig()

        # Set up canvas dimensions
        config.setup_canvas(request.canvas_width, request.canvas_height)

        # Set up XY line length based on case type (core.js:310-315)
        config.setup_xy_line_length(request.case_type.value, request.axis_length)

        # Select and run engine
        case_type = request.case_type.value
        computed_beta: float | None = None

        match case_type:
            case "A":
                engine = CaseAEngine(solid, config)
                steps = engine.compute_all_steps(
                    base_edge=request.base_edge,
                    axis_length=request.axis_length,
                    edge_angle=request.edge_angle,
                )

            case "B":
                engine = CaseBEngine(solid, config)
                steps = engine.compute_all_steps(
                    base_edge=request.base_edge,
                    axis_length=request.axis_length,
                    edge_angle=request.edge_angle,
                )

            case "C":
                computed_beta = CaseCEngine.auto_compute_beta(
                    request.solid_type.value, request.resting_on.value,
                )
                engine = CaseCEngine(solid, config)
                steps = engine.compute_all_steps(
                    base_edge=request.base_edge,
                    axis_length=request.axis_length,
                    edge_angle=request.edge_angle,
                    axis_angle_hp=request.axis_angle_hp,
                    resting_on=request.resting_on.value,
                )

            case "D":
                engine = CaseDEngine(solid, config)
                steps = engine.compute_all_steps(
                    base_edge=request.base_edge,
                    axis_length=request.axis_length,
                    edge_angle=request.edge_angle,
                    axis_angle_hp=request.axis_angle_hp,
                    axis_angle_vp=request.axis_angle_vp,
                    resting_on=request.resting_on.value,
                )

            case _:
                raise ValueError(f"Unknown case type: {case_type}")

        # Build metadata
        metadata = ProjectionMetadata(
            computed_beta=computed_beta,
            computed_xy_length=config.xy_line_length,
            solid_properties=SolidProperties(
                sides=solid.sides,
                is_prism=solid.is_prism,
                is_pyramid=solid.is_pyramid,
            ),
        )

        return ProjectionResponse(
            total_steps=len(steps),
            steps=steps,
            metadata=metadata,
        )
