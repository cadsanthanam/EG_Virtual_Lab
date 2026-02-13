"""
Case A Engine — Axis Perpendicular to HP.

Direct port of caseA.js (606 lines). All drawing functions are translated
into pure computation functions that return render instructions via RenderBuilder.

Functions ported:
  - drawCaseAStep()            → CaseAEngine.compute_step()       caseA.js:10-66
  - drawCaseA_TopViewPrism()   → CaseAEngine._top_view_prism()    caseA.js:71-171
  - drawCaseA_TopViewPyramid() → CaseAEngine._top_view_pyramid()  caseA.js:176-265
  - drawCaseA_ProjectorsPrism()  → CaseAEngine._projectors_prism()  caseA.js:270-310
  - drawCaseA_ProjectorsPyramid()→ CaseAEngine._projectors_pyramid() caseA.js:315-353
  - drawCaseA_FrontViewPrism()   → CaseAEngine._front_view_prism()  caseA.js:358-487
  - drawCaseA_FrontViewPyramid() → CaseAEngine._front_view_pyramid() caseA.js:492-605
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
# Corner storage (maps to state.corners in core.js:26)
# ============================================================

@dataclass
class CaseACorners:
    """
    Stores all computed corner positions for Case A.

    Direct equivalent of state.corners in core.js:26.
    Populated during top view computation, consumed by projectors and front view.
    """
    # Top View
    top_view: list[Point] = field(default_factory=list)
    center: Point | None = None    # Prism center
    apex: Point | None = None      # Pyramid apex (centroid in TV)

    # Front View
    front_view_base: list[dict] = field(default_factory=list)
    front_view_top: list[dict] = field(default_factory=list)     # Prism only
    front_view_apex: dict | None = None                           # Pyramid only


# ============================================================
# Labels
# ============================================================

def _prism_tv_label(index: int) -> str:
    """Generate prism top-view label: a(1), b(2), etc. Port of caseA.js:98."""
    return f"{chr(97 + index)}({index + 1})"


def _prism_fv_base_label(index: int) -> str:
    """Generate prism FV base label: 1', 2', etc. Port of caseA.js:373."""
    return f"{index + 1}'"


def _prism_fv_top_label(index: int) -> str:
    """Generate prism FV top label: a', b', etc. Port of caseA.js:379."""
    return f"{chr(97 + index)}'"


def _pyramid_tv_label(index: int) -> str:
    """Generate pyramid top-view label: 1, 2, etc. Port of caseA.js:202."""
    return str(index + 1)


def _pyramid_fv_base_label(index: int) -> str:
    """Generate pyramid FV base label: 1', 2', etc. Port of caseA.js:505."""
    return f"{index + 1}'"


# ============================================================
# Case A Engine
# ============================================================

class CaseAEngine:
    """
    Computes all projection geometry for Case A (axis ⊥ HP).

    Usage:
        engine = CaseAEngine(solid, config)
        steps = engine.compute_all_steps(base_edge, axis_length, edge_angle)
    """

    TOTAL_STEPS = 5  # core.js:351

    def __init__(self, solid: Solid, config: DrawingConfig) -> None:
        self.solid = solid
        self.config = config
        self.corners = CaseACorners()
        self.builder = RenderBuilder(config)

    def compute_all_steps(
        self,
        base_edge: float,
        axis_length: float,
        edge_angle: float,
    ) -> list[dict]:
        """
        Compute all 5 steps of Case A projection.

        Port of drawCaseAStep() from caseA.js:10-66.
        Each step is cumulative — it includes all drawing from previous steps.

        Args:
            base_edge: Length of one base edge.
            axis_length: Length of solid axis.
            edge_angle: Edge angle with VP in degrees.

        Returns:
            List of StepInstruction dicts (5 steps).
        """
        sides = self.solid.sides
        edge_angle_rad = degrees_to_radians(edge_angle)

        # Pre-compute geometry (needed for all steps from 3 onward)
        self._compute_top_view(base_edge, edge_angle_rad)

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

    def _compute_top_view(self, base_edge: float, edge_angle_rad: float) -> None:
        """Pre-compute top view vertices and store in self.corners."""
        cfg = self.config

        # Starting point (caseA.js:76-77)
        start_x = cfg.xy_line_start_x + 40
        start_y = cfg.xy_line_y + 30 + base_edge

        # Generate vertices using Solid's edge-walking algorithm
        vertices, centroid = self.solid.compute_base_vertices(
            start_x, start_y, base_edge, edge_angle_rad,
        )

        self.corners.top_view = vertices

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
        """
        Build render elements for a specific step.

        Port of drawCaseAStep() switch statement, caseA.js:15-65.
        """
        match step:
            case 1:
                # Step 1: XY line only (caseA.js:16-20)
                self.builder.add_xy_line()

            case 2:
                # Step 2: XY line + angle indicator (caseA.js:22-27)
                self.builder.add_xy_line()
                self.builder.add_angle_indicator(edge_angle)

            case 3:
                # Step 3: XY line + top view (caseA.js:29-38)
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    self._add_top_view_prism(edge_angle)
                elif self.solid.is_pyramid:
                    self._add_top_view_pyramid()

            case 4:
                # Step 4: XY + TV + projectors (caseA.js:40-51)
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    self._add_top_view_prism(edge_angle)
                    self._add_projectors_prism(axis_length)
                elif self.solid.is_pyramid:
                    self._add_top_view_pyramid()
                    self._add_projectors_pyramid(axis_length)

            case 5:
                # Step 5: XY + TV + FV (caseA.js:53-64)
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    self._add_top_view_prism(edge_angle)
                    self._add_front_view_prism(axis_length)
                elif self.solid.is_pyramid:
                    self._add_top_view_pyramid()
                    self._add_front_view_pyramid(axis_length)

    # ----------------------------------------------------------
    # Top View — Prism (caseA.js:71-171)
    # ----------------------------------------------------------

    def _add_top_view_prism(self, edge_angle: float) -> None:
        """
        Add prism top view render elements.

        Port of drawCaseA_TopViewPrism() from caseA.js:71-171.
        """
        points = self.corners.top_view
        center = self.corners.center
        cfg = self.config

        # Draw polygon edges (caseA.js:122-133)
        self.builder.add_polygon(points, style="visible", closed=True)

        # Corner labels (caseA.js:136-148)
        for i, pt in enumerate(points):
            self.builder.add_point(pt.x, pt.y, label=_prism_tv_label(i))

        # Center point 'O' (caseA.js:150-154)
        if center:
            self.builder.add_point(center.x, center.y, label="O")

        # Reference lines and angle indicator (caseA.js:157-170)
        # Horizontal reference from first point to XY (caseA.js:159)
        ref_line_end = points[0].x + 30
        self.builder.add_line(
            points[0].x, cfg.xy_line_y, ref_line_end, cfg.xy_line_y,
            style="construction",
        )
        # Vertical reference from first point to XY (caseA.js:162)
        self.builder.add_line(
            points[0].x, points[0].y, points[0].x, cfg.xy_line_y,
            style="construction",
        )
        # Angle arc (caseA.js:165)
        self.builder.add_arc(points[0].x, cfg.xy_line_y, 20, 0, edge_angle)
        # Angle label (caseA.js:169)
        self.builder.add_point(
            points[0].x + 25, cfg.xy_line_y + 15,
            label=f"{edge_angle}°",
        )

    # ----------------------------------------------------------
    # Top View — Pyramid (caseA.js:176-265)
    # ----------------------------------------------------------

    def _add_top_view_pyramid(self) -> None:
        """
        Add pyramid top view render elements.

        Port of drawCaseA_TopViewPyramid() from caseA.js:176-265.
        """
        points = self.corners.top_view
        apex = self.corners.apex

        # Draw base edges (polygon) (caseA.js:226-236)
        self.builder.add_polygon(points, style="visible", closed=True)

        # Draw slant edges: each vertex → apex (caseA.js:238-244)
        if apex:
            for pt in points:
                self.builder.add_line(pt.x, pt.y, apex.x, apex.y, style="visible")

        # Corner labels (caseA.js:252-256)
        for i, pt in enumerate(points):
            self.builder.add_point(pt.x, pt.y, label=_pyramid_tv_label(i))

        # Apex label 'o' (caseA.js:259-263)
        if apex:
            self.builder.add_point(apex.x, apex.y, label="o")

    # ----------------------------------------------------------
    # Projectors — Prism (caseA.js:270-310)
    # ----------------------------------------------------------

    def _add_projectors_prism(self, axis_length: float) -> None:
        """
        Add prism projector lines from TV to FV area.

        Port of drawCaseA_ProjectorsPrism() from caseA.js:270-310.
        """
        points = self.corners.top_view
        center = self.corners.center
        cfg = self.config

        # Vertical projectors from each TV corner (caseA.js:280-285)
        for pt in points:
            self.builder.add_line(
                pt.x, pt.y, pt.x, cfg.xy_line_y - axis_length,
                style="construction",
            )

        # Center projector (caseA.js:288-291)
        if center:
            self.builder.add_line(
                center.x, center.y, center.x, cfg.xy_line_y - axis_length,
                style="construction",
            )

        # XY intersection points with labels (caseA.js:296-308)
        for i, pt in enumerate(points):
            label = f"{i + 1}'"
            self.builder.add_point(pt.x, cfg.xy_line_y, label=label,
                                   label_offset_x=5, label_offset_y=-8)

    # ----------------------------------------------------------
    # Projectors — Pyramid (caseA.js:315-353)
    # ----------------------------------------------------------

    def _add_projectors_pyramid(self, axis_length: float) -> None:
        """
        Add pyramid projector lines from TV to FV area.

        Port of drawCaseA_ProjectorsPyramid() from caseA.js:315-353.
        """
        points = self.corners.top_view
        apex = self.corners.apex
        cfg = self.config

        # Vertical projectors from each corner (caseA.js:325-330)
        for pt in points:
            self.builder.add_line(
                pt.x, pt.y, pt.x, cfg.xy_line_y - axis_length,
                style="construction",
            )

        # Apex projector (caseA.js:333-336)
        if apex:
            self.builder.add_line(
                apex.x, apex.y, apex.x, cfg.xy_line_y - axis_length,
                style="construction",
            )

        # XY intersection labels (caseA.js:345-351)
        for i, pt in enumerate(points):
            self.builder.add_point(pt.x, cfg.xy_line_y, label=f"{i + 1}'",
                                   label_offset_x=5, label_offset_y=-8)

    # ----------------------------------------------------------
    # Front View — Prism (caseA.js:358-487)
    # ----------------------------------------------------------

    def _add_front_view_prism(self, axis_length: float) -> None:
        """
        Add prism front view with visibility detection.

        Port of drawCaseA_FrontViewPrism() from caseA.js:358-487.

        Visibility algorithm (caseA.js:388-404):
        - isHidden[i] = points[i].y < centerY
          (corners between center and XY line are on the far side → hidden)
        - Silhouette override: outermost vertical edges (at minX/maxX)
          are ALWAYS visible regardless of TV position
        """
        points = self.corners.top_view
        center = self.corners.center
        cfg = self.config
        n = len(points)

        if not center:
            return

        center_y = center.y

        # Build FV corners (caseA.js:365-382)
        base_corners = []
        top_corners = []
        for i in range(n):
            pt = points[i]
            base_corners.append({
                "x": pt.x, "y": cfg.xy_line_y,
                "label": _prism_fv_base_label(i),
                "tv_y": pt.y,
            })
            top_corners.append({
                "x": pt.x, "y": cfg.xy_line_y - axis_length,
                "label": _prism_fv_top_label(i),
                "tv_y": pt.y,
            })

        # Store for Case C reuse
        self.corners.front_view_base = base_corners
        self.corners.front_view_top = top_corners

        # Visibility detection (caseA.js:388-393)
        is_hidden = [points[i].y < center_y for i in range(n)]

        # Silhouette override (caseA.js:395-404)
        all_x = [c["x"] for c in base_corners]
        min_x = min(all_x)
        max_x = max(all_x)
        EPS = 0.5
        for i in range(n):
            if abs(base_corners[i]["x"] - min_x) < EPS or abs(base_corners[i]["x"] - max_x) < EPS:
                is_hidden[i] = False

        # Draw edges: hidden first, then visible (caseA.js:425-462)
        # This ensures visible lines draw on top of hidden at overlaps.
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Base edges (caseA.js:428-438)
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

            # Top edges (caseA.js:440-451)
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        top_corners[i]["x"], top_corners[i]["y"],
                        top_corners[j]["x"], top_corners[j]["y"],
                        style=style,
                    )

            # Vertical edges (caseA.js:453-462)
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        base_corners[i]["x"], base_corners[i]["y"],
                        top_corners[i]["x"], top_corners[i]["y"],
                        style=style,
                    )

        # Corner labels (caseA.js:464-482)
        for i in range(n):
            self.builder.add_point(
                base_corners[i]["x"], base_corners[i]["y"],
                label=base_corners[i]["label"],
                label_offset_x=5, label_offset_y=15,
            )
            self.builder.add_point(
                top_corners[i]["x"], top_corners[i]["y"],
                label=top_corners[i]["label"],
                label_offset_x=5, label_offset_y=-8,
            )

        # Axis construction line (caseA.js:484-486)
        self.builder.add_line(
            center.x, cfg.xy_line_y,
            center.x, cfg.xy_line_y - axis_length,
            style="construction",
        )

    # ----------------------------------------------------------
    # Front View — Pyramid (caseA.js:492-605)
    # ----------------------------------------------------------

    def _add_front_view_pyramid(self, axis_length: float) -> None:
        """
        Add pyramid front view with visibility detection.

        Port of drawCaseA_FrontViewPyramid() from caseA.js:492-605.
        Same visibility logic as prism but with slant edges to apex.
        """
        points = self.corners.top_view
        apex_tv = self.corners.apex
        cfg = self.config
        n = len(points)

        if not apex_tv:
            return

        center_y = apex_tv.y  # caseA.js:496

        # Build FV base corners (caseA.js:500-508)
        base_corners = []
        for i in range(n):
            base_corners.append({
                "x": points[i].x, "y": cfg.xy_line_y,
                "label": _pyramid_fv_base_label(i),
                "tv_y": points[i].y,
            })

        # Apex in FV (caseA.js:511-515)
        apex_fv = {
            "x": apex_tv.x,
            "y": cfg.xy_line_y - axis_length,
            "label": "o'",
        }

        # Store for Case C reuse
        self.corners.front_view_base = base_corners
        self.corners.front_view_apex = apex_fv

        # Visibility detection (caseA.js:522-525)
        is_hidden = [points[i].y < center_y for i in range(n)]

        # Silhouette override (caseA.js:527-536)
        all_x = [c["x"] for c in base_corners]
        min_x = min(all_x)
        max_x = max(all_x)
        EPS = 0.5
        for i in range(n):
            if abs(base_corners[i]["x"] - min_x) < EPS or abs(base_corners[i]["x"] - max_x) < EPS:
                is_hidden[i] = False

        # Draw edges: hidden first, then visible (caseA.js:557-581)
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Base edges (caseA.js:559-570)
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

            # Slant edges (caseA.js:572-581)
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        base_corners[i]["x"], base_corners[i]["y"],
                        apex_fv["x"], apex_fv["y"],
                        style=style,
                    )

        # Corner labels (caseA.js:583-601)
        for i in range(n):
            self.builder.add_point(
                base_corners[i]["x"], base_corners[i]["y"],
                label=base_corners[i]["label"],
                label_offset_x=5, label_offset_y=15,
            )

        # Apex label (caseA.js:596-600)
        self.builder.add_point(
            apex_fv["x"], apex_fv["y"],
            label=apex_fv["label"],
            label_offset_x=5, label_offset_y=-8,
        )

        # Axis construction line (caseA.js:603-604)
        self.builder.add_line(
            apex_tv.x, cfg.xy_line_y,
            apex_fv["x"], apex_fv["y"],
            style="construction",
        )

    # ----------------------------------------------------------
    # Step metadata
    # ----------------------------------------------------------

    @staticmethod
    def _step_title(step: int, sides: int) -> str:
        """Step titles — port of updateInstructions() calls in caseA.js:17-55."""
        titles = {
            1: "Step 1: Draw XY Reference Line",
            2: "Step 2: Determine Base Orientation",
            3: "Step 3: Draw True Shape in Top View",
            4: "Step 4: Project to Front View",
            5: "Step 5: Complete Projection with Visible and Hidden Edges",
        }
        return titles.get(step, f"Step {step}")

    def _step_description(self, step: int, edge_angle: float, sides: int) -> str:
        """Step descriptions — port of updateInstructions() calls in caseA.js."""
        solid_type = self.solid.solid_type
        match step:
            case 1:
                return (
                    "Drawing the reference line (XY line) for first angle projection. "
                    "Top View will be below this line, Front View above."
                )
            case 2:
                return (
                    f"The solid axis is perpendicular to HP. One base edge will be "
                    f"at {edge_angle}° to VP (XY line)."
                )
            case 3:
                return (
                    f"Drawing the {solid_type} base ({sides}-sided polygon) below "
                    f"the XY line. This is the true shape."
                )
            case 4:
                return (
                    "Drawing vertical projectors from each corner in the top view "
                    "to create the front view."
                )
            case 5:
                return (
                    "Completing the front view by identifying visible edges "
                    "(solid lines) and hidden edges (dashed lines)."
                )
            case _:
                return ""
