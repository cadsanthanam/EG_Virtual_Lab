"""
Case B Engine — Axis Perpendicular to VP.

In Case B the solid axis is perpendicular to the Vertical Plane (VP).
This means:
  - Front View (above XY): shows the TRUE SHAPE of the base polygon
  - Top View (below XY): shows the projected rectangle (prism) or triangle (pyramid)

The geometry is the mirror of Case A (axis ⊥ HP) with TV↔FV swapped:
  Case A: TV = true shape (below XY), FV = projection (above XY)
  Case B: FV = true shape (above XY), TV = projection (below XY)

Visibility detection in the TV uses the FV x-coordinate relative to the
centroid — vertices whose FV.x > center_x are on the far side → hidden.

5 cumulative steps:
  1. Draw XY line
  2. Edge angle indicator
  3. Front view — true shape polygon
  4. Projectors from FV to TV
  5. Top view with visible/hidden edges
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

from app.engine.config import DrawingConfig
from app.engine.geometry import Point, degrees_to_radians
from app.engine.renderer import RenderBuilder
from app.engine.solids import Solid


# ============================================================
# Corner storage
# ============================================================

@dataclass
class CaseBCorners:
    """
    Stores all computed corner positions for Case B.

    Front view (true shape) is stored during polygon computation.
    Top view (projection) is computed from FV positions.
    """
    # Front View — true shape polygon (above XY)
    front_view: list[Point] = field(default_factory=list)
    center: Point | None = None    # Prism center (FV)
    apex: Point | None = None      # Pyramid apex (FV)

    # Top View — projected view (below XY)
    top_view_front: list[dict] = field(default_factory=list)    # Near side (y = xy_line_y)
    top_view_back: list[dict] = field(default_factory=list)     # Prism: far side
    top_view_apex: dict | None = None                           # Pyramid: apex in TV


# ============================================================
# Labels
# ============================================================

def _prism_fv_label(index: int) -> str:
    """Prism FV label: a'(1'), b'(2'), etc."""
    return f"{chr(97 + index)}'({index + 1}')"


def _prism_tv_front_label(index: int) -> str:
    """Prism TV near-side label: 1, 2, etc."""
    return str(index + 1)


def _prism_tv_back_label(index: int) -> str:
    """Prism TV far-side label: a, b, etc."""
    return chr(97 + index)


def _pyramid_fv_label(index: int) -> str:
    """Pyramid FV label: 1', 2', etc."""
    return f"{index + 1}'"


def _pyramid_tv_base_label(index: int) -> str:
    """Pyramid TV base label: 1, 2, etc."""
    return str(index + 1)


# ============================================================
# Case B Engine
# ============================================================

class CaseBEngine:
    """
    Computes all projection geometry for Case B (axis ⊥ VP).

    Usage:
        engine = CaseBEngine(solid, config)
        steps = engine.compute_all_steps(base_edge, axis_length, edge_angle)
    """

    TOTAL_STEPS = 5

    def __init__(self, solid: Solid, config: DrawingConfig) -> None:
        self.solid = solid
        self.config = config
        self.corners = CaseBCorners()
        self.builder = RenderBuilder(config)

    def compute_all_steps(
        self,
        base_edge: float,
        axis_length: float,
        edge_angle: float,
    ) -> list[dict]:
        """
        Compute all 5 steps of Case B projection.

        Args:
            base_edge: Length of one base edge.
            axis_length: Length of solid axis.
            edge_angle: Edge angle with HP in degrees.

        Returns:
            List of StepInstruction dicts (5 steps).
        """
        sides = self.solid.sides
        edge_angle_rad = degrees_to_radians(edge_angle)

        # Pre-compute true shape polygon in FV area
        self._compute_front_view(base_edge, edge_angle_rad)

        steps: list[dict] = []

        for step in range(1, self.TOTAL_STEPS + 1):
            self.builder.reset()
            self._build_step(step, base_edge, axis_length, edge_angle, sides)
            steps.append(self.builder.build_step(
                step_number=step,
                title=self._step_title(step, sides),
                description=self._step_description(step, edge_angle, sides),
            ))

        return steps

    def _compute_front_view(self, base_edge: float, edge_angle_rad: float) -> None:
        """
        Pre-compute the true shape polygon ABOVE the XY line (FV area).

        The polygon is placed in the front view region (y < xy_line_y).
        Starting point is offset from XY line upward.
        """
        cfg = self.config

        # Starting point: above XY line, left side
        # Place polygon so that its bottom edge is close to XY line
        start_x = cfg.xy_line_start_x + 40
        start_y = cfg.xy_line_y - 30 - base_edge  # Above XY line

        # Generate vertices using Solid's edge-walking algorithm
        vertices, centroid = self.solid.compute_base_vertices(
            start_x, start_y, base_edge, edge_angle_rad,
        )

        self.corners.front_view = vertices

        if self.solid.is_prism:
            self.corners.center = centroid
        if self.solid.is_pyramid:
            self.corners.apex = centroid

    def _build_step(
        self,
        step: int,
        base_edge: float,
        axis_length: float,
        edge_angle: float,
        sides: int,
    ) -> None:
        """Build render elements for a specific step."""
        match step:
            case 1:
                # Step 1: XY line only
                self.builder.add_xy_line()

            case 2:
                # Step 2: XY line + angle indicator
                self.builder.add_xy_line()
                self.builder.add_angle_indicator(edge_angle)

            case 3:
                # Step 3: XY line + front view (true shape)
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    self._add_front_view_prism(edge_angle)
                elif self.solid.is_pyramid:
                    self._add_front_view_pyramid()

            case 4:
                # Step 4: XY + FV + projectors
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    self._add_front_view_prism(edge_angle)
                    self._add_projectors_prism(axis_length)
                elif self.solid.is_pyramid:
                    self._add_front_view_pyramid()
                    self._add_projectors_pyramid(axis_length)

            case 5:
                # Step 5: XY + FV + TV with visibility
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    self._add_front_view_prism(edge_angle)
                    self._add_top_view_prism(axis_length)
                elif self.solid.is_pyramid:
                    self._add_front_view_pyramid()
                    self._add_top_view_pyramid(axis_length)

    # ----------------------------------------------------------
    # Front View — Prism (true shape above XY)
    # ----------------------------------------------------------

    def _add_front_view_prism(self, edge_angle: float) -> None:
        """
        Add prism front view — true shape polygon above XY line.

        Mirrors Case A's _add_top_view_prism but placed above XY.
        """
        points = self.corners.front_view
        center = self.corners.center
        cfg = self.config

        # Draw polygon edges
        self.builder.add_polygon(points, style="visible", closed=True)

        # Corner labels
        for i, pt in enumerate(points):
            self.builder.add_point(pt.x, pt.y, label=_prism_fv_label(i))

        # Center point 'O''
        if center:
            self.builder.add_point(center.x, center.y, label="O'")

        # Reference lines and angle indicator
        # Vertical reference from first point down to XY
        self.builder.add_line(
            points[0].x, points[0].y, points[0].x, cfg.xy_line_y,
            style="construction",
        )
        # Horizontal reference along XY from first point
        ref_line_end = points[0].x + 30
        self.builder.add_line(
            points[0].x, cfg.xy_line_y, ref_line_end, cfg.xy_line_y,
            style="construction",
        )
        # Angle arc (measuring edge angle from XY upward)
        self.builder.add_arc(points[0].x, cfg.xy_line_y, 20, -edge_angle, 0)
        # Angle label
        self.builder.add_point(
            points[0].x + 25, cfg.xy_line_y - 15,
            label=f"{edge_angle}°",
        )

    # ----------------------------------------------------------
    # Front View — Pyramid (true shape above XY)
    # ----------------------------------------------------------

    def _add_front_view_pyramid(self) -> None:
        """
        Add pyramid front view — true shape with slant edges to apex.
        """
        points = self.corners.front_view
        apex = self.corners.apex

        # Draw base edges (polygon)
        self.builder.add_polygon(points, style="visible", closed=True)

        # Draw slant edges: each vertex → apex
        if apex:
            for pt in points:
                self.builder.add_line(pt.x, pt.y, apex.x, apex.y, style="visible")

        # Corner labels
        for i, pt in enumerate(points):
            self.builder.add_point(pt.x, pt.y, label=_pyramid_fv_label(i))

        # Apex label 'o''
        if apex:
            self.builder.add_point(apex.x, apex.y, label="o'")

    # ----------------------------------------------------------
    # Projectors — Prism (FV to TV)
    # ----------------------------------------------------------

    def _add_projectors_prism(self, axis_length: float) -> None:
        """
        Add prism projector lines from FV down to TV area.

        Vertical projectors drop from each FV corner through XY line
        into the TV region.
        """
        points = self.corners.front_view
        center = self.corners.center
        cfg = self.config

        # Vertical projectors from each FV corner to TV area
        for pt in points:
            self.builder.add_line(
                pt.x, pt.y, pt.x, cfg.xy_line_y + axis_length,
                style="construction",
            )

        # Center projector
        if center:
            self.builder.add_line(
                center.x, center.y, center.x, cfg.xy_line_y + axis_length,
                style="construction",
            )

        # XY intersection points with labels
        for i, pt in enumerate(points):
            label = f"{i + 1}"
            self.builder.add_point(pt.x, cfg.xy_line_y, label=label,
                                   label_offset_x=5, label_offset_y=15)

    # ----------------------------------------------------------
    # Projectors — Pyramid (FV to TV)
    # ----------------------------------------------------------

    def _add_projectors_pyramid(self, axis_length: float) -> None:
        """
        Add pyramid projector lines from FV down to TV area.
        """
        points = self.corners.front_view
        apex = self.corners.apex
        cfg = self.config

        # Vertical projectors from each corner
        for pt in points:
            self.builder.add_line(
                pt.x, pt.y, pt.x, cfg.xy_line_y + axis_length,
                style="construction",
            )

        # Apex projector
        if apex:
            self.builder.add_line(
                apex.x, apex.y, apex.x, cfg.xy_line_y + axis_length,
                style="construction",
            )

        # XY intersection labels
        for i, pt in enumerate(points):
            self.builder.add_point(pt.x, cfg.xy_line_y, label=f"{i + 1}",
                                   label_offset_x=5, label_offset_y=15)

    # ----------------------------------------------------------
    # Top View — Prism with visibility (below XY)
    # ----------------------------------------------------------

    def _add_top_view_prism(self, axis_length: float) -> None:
        """
        Add prism top view with visibility detection.

        The TV of a prism with axis ⊥ VP is a rectangle.
        - Front edge (near): at y = xy_line_y (on XY line)
        - Back edge (far): at y = xy_line_y + axis_length
        - Width: bounded by FV polygon's x-extent

        Visibility: vertices whose FV.x is closer to the viewer
        (farther from center) are visible. Vertices behind the
        center in FV are hidden in the TV.
        """
        points = self.corners.front_view
        center = self.corners.center
        cfg = self.config
        n = len(points)

        if not center:
            return

        center_x = center.x

        # Build TV corners — each FV vertex maps to front + back TV positions
        front_corners = []  # At XY line (y = xy_line_y)
        back_corners = []   # At y = xy_line_y + axis_length

        for i in range(n):
            pt = points[i]
            front_corners.append({
                "x": pt.x, "y": cfg.xy_line_y,
                "label": _prism_tv_front_label(i),
                "fv_x": pt.x,
            })
            back_corners.append({
                "x": pt.x, "y": cfg.xy_line_y + axis_length,
                "label": _prism_tv_back_label(i),
                "fv_x": pt.x,
            })

        # Store for potential Case D reuse
        self.corners.top_view_front = front_corners
        self.corners.top_view_back = back_corners

        # Visibility detection:
        # In Case B, hidden edges in TV correspond to FV vertices
        # that are behind the center (farther from viewer).
        # In screen coords, vertices with FV x > center_x are farther
        # from the XY line's perspective.
        is_hidden = [points[i].x > center_x for i in range(n)]

        # Silhouette override: outermost y-values are always visible
        all_y = [c["y"] for c in front_corners]
        # Since all front corners have the same y (xy_line_y),
        # use the FV's y extent for silhouette
        fv_y_vals = [pt.y for pt in points]
        min_fv_y = min(fv_y_vals)
        max_fv_y = max(fv_y_vals)
        EPS = 0.5
        for i in range(n):
            if abs(points[i].y - min_fv_y) < EPS or abs(points[i].y - max_fv_y) < EPS:
                is_hidden[i] = False

        # Draw edges: hidden first, then visible
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Front edges (on XY line)
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        front_corners[i]["x"], front_corners[i]["y"],
                        front_corners[j]["x"], front_corners[j]["y"],
                        style=style,
                    )

            # Back edges
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        back_corners[i]["x"], back_corners[i]["y"],
                        back_corners[j]["x"], back_corners[j]["y"],
                        style=style,
                    )

            # Depth edges (connecting front to back)
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        front_corners[i]["x"], front_corners[i]["y"],
                        back_corners[i]["x"], back_corners[i]["y"],
                        style=style,
                    )

        # Corner labels
        for i in range(n):
            self.builder.add_point(
                front_corners[i]["x"], front_corners[i]["y"],
                label=front_corners[i]["label"],
                label_offset_x=5, label_offset_y=15,
            )
            self.builder.add_point(
                back_corners[i]["x"], back_corners[i]["y"],
                label=back_corners[i]["label"],
                label_offset_x=5, label_offset_y=15,
            )

        # Axis construction line (center depth line)
        self.builder.add_line(
            center.x, cfg.xy_line_y,
            center.x, cfg.xy_line_y + axis_length,
            style="construction",
        )

    # ----------------------------------------------------------
    # Top View — Pyramid with visibility (below XY)
    # ----------------------------------------------------------

    def _add_top_view_pyramid(self, axis_length: float) -> None:
        """
        Add pyramid top view with visibility detection.

        The TV of a pyramid with axis ⊥ VP shows the base edge
        at y = xy_line_y and the apex at y = xy_line_y + axis_length.
        """
        points = self.corners.front_view
        apex_fv = self.corners.apex
        cfg = self.config
        n = len(points)

        if not apex_fv:
            return

        center_x = apex_fv.x

        # Build TV base corners (on XY line)
        base_corners = []
        for i in range(n):
            base_corners.append({
                "x": points[i].x, "y": cfg.xy_line_y,
                "label": _pyramid_tv_base_label(i),
                "fv_x": points[i].x,
            })

        # Apex in TV: directly below center, at depth = axis_length
        apex_tv = {
            "x": apex_fv.x,
            "y": cfg.xy_line_y + axis_length,
            "label": "o",
        }

        # Store
        self.corners.top_view_front = base_corners
        self.corners.top_view_apex = apex_tv

        # Visibility detection
        is_hidden = [points[i].x > center_x for i in range(n)]

        # Silhouette override
        fv_y_vals = [pt.y for pt in points]
        min_fv_y = min(fv_y_vals)
        max_fv_y = max(fv_y_vals)
        EPS = 0.5
        for i in range(n):
            if abs(points[i].y - min_fv_y) < EPS or abs(points[i].y - max_fv_y) < EPS:
                is_hidden[i] = False

        # Draw edges
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Base edges
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        base_corners[i]["x"], base_corners[i]["y"],
                        base_corners[j]["x"], base_corners[j]["y"],
                        style=style,
                    )

            # Slant edges (base → apex)
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        base_corners[i]["x"], base_corners[i]["y"],
                        apex_tv["x"], apex_tv["y"],
                        style=style,
                    )

        # Corner labels
        for i in range(n):
            self.builder.add_point(
                base_corners[i]["x"], base_corners[i]["y"],
                label=base_corners[i]["label"],
                label_offset_x=5, label_offset_y=15,
            )

        # Apex label
        self.builder.add_point(
            apex_tv["x"], apex_tv["y"],
            label=apex_tv["label"],
            label_offset_x=5, label_offset_y=15,
        )

        # Axis construction line
        self.builder.add_line(
            apex_fv.x, cfg.xy_line_y,
            apex_tv["x"], apex_tv["y"],
            style="construction",
        )

    # ----------------------------------------------------------
    # Step metadata
    # ----------------------------------------------------------

    @staticmethod
    def _step_title(step: int, sides: int) -> str:
        """Step titles for Case B."""
        titles = {
            1: "Step 1: Draw XY Reference Line",
            2: "Step 2: Determine Base Orientation",
            3: "Step 3: Draw True Shape in Front View",
            4: "Step 4: Project to Top View",
            5: "Step 5: Complete Projection with Visible and Hidden Edges",
        }
        return titles.get(step, f"Step {step}")

    def _step_description(self, step: int, edge_angle: float, sides: int) -> str:
        """Step descriptions for Case B."""
        solid_type = self.solid.solid_type
        match step:
            case 1:
                return (
                    "Drawing the reference line (XY line) for first angle projection. "
                    "Front View will be above this line, Top View below."
                )
            case 2:
                return (
                    f"The solid axis is perpendicular to VP. One base edge will be "
                    f"at {edge_angle}° to HP (XY line)."
                )
            case 3:
                return (
                    f"Drawing the {solid_type} base ({sides}-sided polygon) above "
                    f"the XY line. This is the true shape in the Front View."
                )
            case 4:
                return (
                    "Drawing vertical projectors from each corner in the front view "
                    "to create the top view below the XY line."
                )
            case 5:
                return (
                    "Completing the top view by identifying visible edges "
                    "(solid lines) and hidden edges (dashed lines)."
                )
            case _:
                return ""
