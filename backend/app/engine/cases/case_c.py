"""
Case C Engine — Axis Inclined to HP.

Direct port of caseC.js (836 lines). Phase I reuses the Case A engine
with auto-computed β. Phase II implements:
  - Final FV rotation around pivot (caseC.js:137-362)
  - Projectors and loci with intersection computation (caseC.js:460-619)
  - Final TV with convex hull visibility detection (caseC.js:624-835)

Functions ported:
  - computeCaseC_Beta()          → CaseCEngine.auto_compute_beta()       caseC.js:10-32
  - drawCaseCStep()              → CaseCEngine.compute_step()            caseC.js:37-132
  - drawCaseC_FinalFrontView()   → CaseCEngine._final_fv()              caseC.js:137-362
  - drawCaseC_ProjectorsAndLoci()→ CaseCEngine._projectors_and_loci()   caseC.js:460-619
  - drawCaseC_FinalTopView()     → CaseCEngine._final_tv()              caseC.js:624-835
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

from app.engine.config import DrawingConfig
from app.engine.geometry import (
    Point,
    convex_hull,
    build_hull_set,
    degrees_to_radians,
    is_edge_on_hull,
    is_on_convex_hull,
    point_in_polygon,
    segments_intersect,
)
from app.engine.renderer import RenderBuilder
from app.engine.solids import Solid
from app.engine.cases.case_a import CaseAEngine


# ============================================================
# Corner storage for Phase II
# ============================================================

@dataclass
class CaseCCorners:
    """Stores all computed Phase II corner positions."""
    # Final FV (rotated + translated)
    final_fv_base: list[dict] = field(default_factory=list)
    final_fv_top: list[dict] | None = None      # Prism only
    final_fv_apex: dict | None = None            # Pyramid only
    final_fv_pivot_offset: float = 0.0

    # Final TV (intersection of projectors and loci)
    final_tv: list[dict] = field(default_factory=list)
    final_tv_top: list[dict] | None = None       # Prism only
    final_tv_apex: dict | None = None            # Pyramid only


# ============================================================
# Case C Engine
# ============================================================

class CaseCEngine:
    """
    Computes all projection geometry for Case C (axis inclined to HP).

    Phase I (steps 1-5): Reuses CaseAEngine with auto-computed β.
    Phase II (steps 6-8): Final FV, projectors/loci, final TV.
    """

    TOTAL_STEPS = 8  # core.js:357-358

    def __init__(self, solid: Solid, config: DrawingConfig) -> None:
        self.solid = solid
        self.config = config
        self.corners = CaseCCorners()
        self.builder = RenderBuilder(config)

    @staticmethod
    def auto_compute_beta(solid_type: str, resting_on: str) -> float:
        """
        Auto-compute β from resting condition.

        Direct port of computeCaseC_Beta() from caseC.js:10-32.

        Args:
            solid_type: Solid type string.
            resting_on: 'base-edge' or 'base-corner'.

        Returns:
            Beta angle in degrees.
        """
        from app.engine.geometry import get_sides_count
        sides = get_sides_count(solid_type)

        if resting_on == "base-edge":
            # caseC.js:16-17
            return 90.0
        elif resting_on == "base-corner":
            # caseC.js:22-28 — shape-specific β
            beta_map = {
                3: 270.0,  # Triangle: vertical edge on LEFT, corner on RIGHT
                4: 45.0,   # Square: 45°
                5: 270.0,  # Pentagon: vertical edge on LEFT, corner on RIGHT
                6: 0.0,    # Hexagon: horizontal edge
            }
            return beta_map.get(sides, 0.0)

        # Default (caseC.js:31)
        return 90.0

    def compute_all_steps(
        self,
        base_edge: float,
        axis_length: float,
        edge_angle: float,
        axis_angle_hp: float,
        resting_on: str,
    ) -> list[dict]:
        """
        Compute all 8 steps of Case C projection.

        Port of drawCaseCStep() from caseC.js:37-132.

        Args:
            base_edge: Length of one base edge.
            axis_length: Length of solid axis.
            edge_angle: Original edge angle (saved/restored per caseC.js:43,131).
            axis_angle_hp: Axis inclination with HP in degrees.
            resting_on: Resting condition ('base-edge' or 'base-corner').

        Returns:
            List of StepInstruction dicts (8 steps).
        """
        # Auto-compute β for Phase I (caseC.js:43-44)
        beta = self.auto_compute_beta(self.solid.solid_type, resting_on)

        # Create CaseA engine for Phase I
        case_a = CaseAEngine(self.solid, self.config)
        edge_angle_rad = degrees_to_radians(beta)
        case_a._compute_top_view(base_edge, edge_angle_rad)

        steps: list[dict] = []

        for step in range(1, self.TOTAL_STEPS + 1):
            self.builder.reset()

            if step <= 5:
                # Phase I: reuse Case A (caseC.js:47-93)
                self._build_phase1_step(
                    step, case_a, base_edge, axis_length, beta, resting_on,
                )
            else:
                # Phase II: draw all Phase I first (caseC.js:98-106)
                self._draw_all_phase1(case_a, base_edge, axis_length, beta)

                # Then add Phase II elements (caseC.js:108-127)
                self._build_phase2_step(
                    step, case_a, base_edge, axis_length, axis_angle_hp,
                )

            steps.append(self.builder.build_step(
                step_number=step,
                title=self._step_title(step, axis_angle_hp, resting_on),
                description=self._step_description(
                    step, beta, axis_angle_hp, resting_on,
                ),
            ))

        return steps

    # ----------------------------------------------------------
    # Phase I (caseC.js:47-93)
    # ----------------------------------------------------------

    def _build_phase1_step(
        self,
        step: int,
        case_a: CaseAEngine,
        base_edge: float,
        axis_length: float,
        beta: float,
        resting_on: str,
    ) -> None:
        """Build Phase I step using Case A engine."""
        case_a.builder = self.builder  # Share the builder
        sides = self.solid.sides

        match step:
            case 1:  # caseC.js:51-55
                self.builder.add_xy_line()
            case 2:  # caseC.js:56-61
                self.builder.add_xy_line()
                self.builder.add_angle_indicator(beta)
            case 3:  # caseC.js:62-68
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    case_a._add_top_view_prism(beta)
                elif self.solid.is_pyramid:
                    case_a._add_top_view_pyramid()
            case 4:  # caseC.js:69-80
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    case_a._add_top_view_prism(beta)
                    case_a._add_projectors_prism(axis_length)
                elif self.solid.is_pyramid:
                    case_a._add_top_view_pyramid()
                    case_a._add_projectors_pyramid(axis_length)
            case 5:  # caseC.js:81-92
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    case_a._add_top_view_prism(beta)
                    case_a._add_front_view_prism(axis_length)
                elif self.solid.is_pyramid:
                    case_a._add_top_view_pyramid()
                    case_a._add_front_view_pyramid(axis_length)

    def _draw_all_phase1(
        self,
        case_a: CaseAEngine,
        base_edge: float,
        axis_length: float,
        beta: float,
    ) -> None:
        """Draw all Phase I elements (called before every Phase II step)."""
        case_a.builder = self.builder
        self.builder.add_xy_line()
        if self.solid.is_prism:
            case_a._add_top_view_prism(beta)
            case_a._add_front_view_prism(axis_length)
        elif self.solid.is_pyramid:
            case_a._add_top_view_pyramid()
            case_a._add_front_view_pyramid(axis_length)

    # ----------------------------------------------------------
    # Phase II (caseC.js:96-128)
    # ----------------------------------------------------------

    def _build_phase2_step(
        self,
        step: int,
        case_a: CaseAEngine,
        base_edge: float,
        axis_length: float,
        axis_angle_hp: float,
    ) -> None:
        """Build Phase II step (steps 6-8)."""
        match step:
            case 6:  # caseC.js:109-113
                self._final_fv(case_a, base_edge, axis_angle_hp)
            case 7:  # caseC.js:114-119
                self._final_fv(case_a, base_edge, axis_angle_hp)
                self._projectors_and_loci(case_a)
            case 8:  # caseC.js:120-127
                self._final_fv(case_a, base_edge, axis_angle_hp)
                self._projectors_and_loci(case_a)
                self._final_tv(case_a)

    # ----------------------------------------------------------
    # Final FV (caseC.js:137-362)
    # ----------------------------------------------------------

    def _final_fv(
        self,
        case_a: CaseAEngine,
        base_edge: float,
        axis_angle_hp: float,
    ) -> None:
        """
        Compute and render the final front view (rotated).

        Direct port of drawCaseC_FinalFrontView() from caseC.js:137-362.
        """
        theta = degrees_to_radians(axis_angle_hp)
        offset = 45.0 + 2.0 * base_edge  # caseC.js:141

        init_base = case_a.corners.front_view_base
        init_top = case_a.corners.front_view_top if self.solid.is_prism else None
        init_apex = case_a.corners.front_view_apex if self.solid.is_pyramid else None

        if not init_base:
            return

        n = len(init_base)

        # Find pivot: max X base corner on XY (caseC.js:151-158)
        pivot_idx = 0
        for i in range(1, n):
            if (init_base[i]["x"] > init_base[pivot_idx]["x"] or
                    (init_base[i]["x"] == init_base[pivot_idx]["x"]
                     and init_base[i]["y"] > init_base[pivot_idx]["y"])):
                pivot_idx = i
        pivot_x = init_base[pivot_idx]["x"]
        pivot_y = init_base[pivot_idx]["y"]

        def rotate_around_pivot(px: float, py: float) -> tuple[float, float]:
            """Port of rotateAroundPivot() from caseC.js:161-172."""
            dx = px - pivot_x
            dy = py - pivot_y
            cos_t = math.cos(theta)
            sin_t = math.sin(theta)
            return (
                pivot_x + dx * cos_t - dy * sin_t,
                pivot_y + dx * sin_t + dy * cos_t,
            )

        # Compute final base corners (caseC.js:175-184)
        final_base = []
        for i in range(n):
            rx, ry = rotate_around_pivot(init_base[i]["x"], init_base[i]["y"])
            final_base.append({
                "x": rx + offset, "y": ry,
                "label": f"{i + 1}₁'",
                "tv_y": init_base[i]["tv_y"],
            })

        # Compute final top/apex (caseC.js:186-209)
        final_top = None
        final_apex = None

        if self.solid.is_prism and init_top:
            final_top = []
            for i in range(n):
                rx, ry = rotate_around_pivot(init_top[i]["x"], init_top[i]["y"])
                final_top.append({
                    "x": rx + offset, "y": ry,
                    "label": f"{chr(97 + i)}₁'",
                    "tv_y": init_top[i]["tv_y"],
                })

        if self.solid.is_pyramid and init_apex:
            rx, ry = rotate_around_pivot(init_apex["x"], init_apex["y"])
            final_apex = {
                "x": rx + offset, "y": ry,
                "label": "o₁'",
            }

        # Store corners (caseC.js:211-215)
        self.corners.final_fv_base = final_base
        self.corners.final_fv_top = final_top
        self.corners.final_fv_apex = final_apex
        self.corners.final_fv_pivot_offset = offset

        # Visibility detection: same TV-based logic (caseC.js:239-267)
        center_y = (
            case_a.corners.center.y if case_a.corners.center
            else (case_a.corners.apex.y if case_a.corners.apex else 0)
        )
        tv_points = case_a.corners.top_view
        is_hidden = [tv_points[i].y < center_y for i in range(n)]

        # Silhouette override using final FV positions (caseC.js:248-267)
        all_x = [c["x"] for c in final_base]
        if final_top:
            all_x.extend(c["x"] for c in final_top)
        fv_min_x = min(all_x)
        fv_max_x = max(all_x)
        EPS = 0.5
        for i in range(n):
            if abs(final_base[i]["x"] - fv_min_x) < EPS or abs(final_base[i]["x"] - fv_max_x) < EPS:
                is_hidden[i] = False
            if final_top and (
                abs(final_top[i]["x"] - fv_min_x) < EPS
                or abs(final_top[i]["x"] - fv_max_x) < EPS
            ):
                is_hidden[i] = False

        # Draw edges (caseC.js:269-350)
        if self.solid.is_prism and final_top:
            self._draw_prism_fv_edges(final_base, final_top, is_hidden, n)
        elif self.solid.is_pyramid and final_apex:
            self._draw_pyramid_fv_edges(final_base, final_apex, is_hidden, n)

        # Axis construction line (caseC.js:352-361)
        base_cx = sum(c["x"] for c in final_base) / n
        base_cy = sum(c["y"] for c in final_base) / n
        if self.solid.is_prism and final_top:
            top_cx = sum(c["x"] for c in final_top) / n
            top_cy = sum(c["y"] for c in final_top) / n
            self.builder.add_line(base_cx, base_cy, top_cx, top_cy, style="construction")
        elif self.solid.is_pyramid and final_apex:
            self.builder.add_line(base_cx, base_cy, final_apex["x"], final_apex["y"], style="construction")

    def _draw_prism_fv_edges(
        self,
        final_base: list[dict],
        final_top: list[dict],
        is_hidden: list[bool],
        n: int,
    ) -> None:
        """Draw prism FV edges with visibility. Port of caseC.js:269-313."""
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Base edges (caseC.js:274-282)
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_base[j]["x"], final_base[j]["y"], style=style,
                    )

            # Top edges (caseC.js:284-292)
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        final_top[i]["x"], final_top[i]["y"],
                        final_top[j]["x"], final_top[j]["y"], style=style,
                    )

            # Vertical edges (caseC.js:294-300)
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_top[i]["x"], final_top[i]["y"], style=style,
                    )

        # Labels (caseC.js:303-313)
        for i in range(n):
            self.builder.add_point(
                final_base[i]["x"], final_base[i]["y"],
                label=final_base[i]["label"], label_offset_x=5, label_offset_y=15,
            )
            self.builder.add_point(
                final_top[i]["x"], final_top[i]["y"],
                label=final_top[i]["label"], label_offset_x=5, label_offset_y=-8,
            )

    def _draw_pyramid_fv_edges(
        self,
        final_base: list[dict],
        final_apex: dict,
        is_hidden: list[bool],
        n: int,
    ) -> None:
        """Draw pyramid FV edges with visibility. Port of caseC.js:315-350."""
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Base edges (caseC.js:320-328)
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_base[j]["x"], final_base[j]["y"], style=style,
                    )

            # Slant edges (caseC.js:330-336)
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_apex["x"], final_apex["y"], style=style,
                    )

        # Labels (caseC.js:339-349)
        for i in range(n):
            self.builder.add_point(
                final_base[i]["x"], final_base[i]["y"],
                label=final_base[i]["label"], label_offset_x=5, label_offset_y=15,
            )
        self.builder.add_point(
            final_apex["x"], final_apex["y"],
            label=final_apex["label"], label_offset_x=5, label_offset_y=-8,
        )

    # ----------------------------------------------------------
    # Projectors and Loci (caseC.js:460-619)
    # ----------------------------------------------------------

    def _projectors_and_loci(self, case_a: CaseAEngine) -> None:
        """
        Compute projectors, loci, and intersection points for final TV.

        Direct port of drawCaseC_ProjectorsAndLoci() from caseC.js:460-619.
        """
        init_tv = case_a.corners.top_view
        init_center = case_a.corners.center
        init_apex = case_a.corners.apex

        final_fv_base = self.corners.final_fv_base
        final_fv_top = self.corners.final_fv_top
        final_fv_apex = self.corners.final_fv_apex

        if not init_tv or not final_fv_base:
            return

        n = len(init_tv)

        # Compute extents for projector/loci lines (caseC.js:478-498)
        max_tv_y = max(pt.y for pt in init_tv)
        if init_center and init_center.y > max_tv_y:
            max_tv_y = init_center.y
        if init_apex and init_apex.y > max_tv_y:
            max_tv_y = init_apex.y
        max_tv_y += 20  # caseC.js:485

        max_fv_x = max(c["x"] for c in final_fv_base)
        if final_fv_top:
            max_fv_x = max(max_fv_x, max(c["x"] for c in final_fv_top))
        if final_fv_apex and final_fv_apex["x"] > max_fv_x:
            max_fv_x = final_fv_apex["x"]
        max_fv_x += 30  # caseC.js:498

        # 1. Vertical projectors from final FV (caseC.js:506-525)
        for pt in final_fv_base:
            self.builder.add_line(pt["x"], pt["y"], pt["x"], max_tv_y, style="construction")
        if self.solid.is_prism and final_fv_top:
            for pt in final_fv_top:
                self.builder.add_line(pt["x"], pt["y"], pt["x"], max_tv_y, style="construction")
        if self.solid.is_pyramid and final_fv_apex:
            self.builder.add_line(
                final_fv_apex["x"], final_fv_apex["y"],
                final_fv_apex["x"], max_tv_y, style="construction",
            )

        # 2. Horizontal loci from initial TV (caseC.js:528-546)
        for pt in init_tv:
            self.builder.add_line(pt.x, pt.y, max_fv_x, pt.y, style="construction")
        if self.solid.is_prism and init_center:
            self.builder.add_line(init_center.x, init_center.y, max_fv_x, init_center.y, style="construction")
        if self.solid.is_pyramid and init_apex:
            self.builder.add_line(init_apex.x, init_apex.y, max_fv_x, init_apex.y, style="construction")

        # 3. Compute intersection points — final TV corners (caseC.js:553-591)
        final_tv = []
        for i in range(n):
            # finalTV[i].x = finalFVBase[i].x, finalTV[i].y = initTV[i].y
            # (caseC.js:558-563)
            final_tv.append({
                "x": final_fv_base[i]["x"],
                "y": init_tv[i].y,
                "label": f"{i + 1}₁",
                "is_base": True,
            })

        final_tv_top = None
        final_tv_apex = None

        if self.solid.is_prism and final_fv_top:
            # caseC.js:569-578
            final_tv_top = []
            for i in range(n):
                final_tv_top.append({
                    "x": final_fv_top[i]["x"],
                    "y": init_tv[i].y,  # Same y as base (coincide in Case A TV)
                    "label": f"{chr(97 + i)}₁",
                })

        if self.solid.is_pyramid and final_fv_apex and init_apex:
            # caseC.js:580-586
            final_tv_apex = {
                "x": final_fv_apex["x"],
                "y": init_apex.y,
                "label": "o₁",
            }

        # Store (caseC.js:589-591)
        self.corners.final_tv = final_tv
        self.corners.final_tv_top = final_tv_top
        self.corners.final_tv_apex = final_tv_apex

        # 4. Mark intersection points (caseC.js:593-618)
        for pt in final_tv:
            self.builder.add_point(pt["x"], pt["y"], label=pt["label"])
        if final_tv_top:
            for pt in final_tv_top:
                self.builder.add_point(pt["x"], pt["y"], label=pt["label"],
                                       label_offset_x=5, label_offset_y=15)
        if final_tv_apex:
            self.builder.add_point(final_tv_apex["x"], final_tv_apex["y"],
                                   label=final_tv_apex["label"])

    # ----------------------------------------------------------
    # Final Top View (caseC.js:624-835)
    # ----------------------------------------------------------

    def _final_tv(self, case_a: CaseAEngine) -> None:
        """
        Compute and render the final top view with visibility.

        Direct port of drawCaseC_FinalTopView() from caseC.js:624-835.
        Uses convex hull for visibility detection.
        """
        final_tv = self.corners.final_tv
        final_tv_top = self.corners.final_tv_top
        final_tv_apex = self.corners.final_tv_apex

        if not final_tv:
            return

        n = len(final_tv)

        if self.solid.is_prism and final_tv_top:
            self._final_tv_prism(final_tv, final_tv_top, n)
        elif self.solid.is_pyramid and final_tv_apex:
            self._final_tv_pyramid(final_tv, final_tv_apex, n)

    def _final_tv_prism(
        self,
        final_tv: list[dict],
        final_tv_top: list[dict],
        n: int,
    ) -> None:
        """
        Prism final TV with convex hull visibility.

        Port of caseC.js:654-748 (prism path).

        Visibility algorithm:
        1. Compute convex hull of ALL final TV points
        2. Top surface edges → always visible
        3. Base edges → hull boundary → visible; else hidden if crosses
           top surface or midpoint inside top polygon
        4. Longer edges → hull boundary → visible; else hidden if crosses
           top surface or 2+ adjacent hidden base edges
        """
        # Convert to Points for geometry functions
        all_pts_raw = (
            [Point(p["x"], p["y"]) for p in final_tv]
            + [Point(p["x"], p["y"]) for p in final_tv_top]
        )

        # Convex hull (caseC.js:657-659)
        hull_pts = convex_hull(all_pts_raw)
        hull_set = build_hull_set(all_pts_raw)

        top_polygon = [Point(p["x"], p["y"]) for p in final_tv_top]

        # 1. Top surface edges — ALWAYS visible (caseC.js:694-699)
        for i in range(n):
            j = (i + 1) % n
            self.builder.add_line(
                final_tv_top[i]["x"], final_tv_top[i]["y"],
                final_tv_top[j]["x"], final_tv_top[j]["y"],
                style="visible",
            )

        # 2. Base edges (caseC.js:703-716)
        base_edge_hidden: list[bool] = []
        for i in range(n):
            j = (i + 1) % n
            p_a = Point(final_tv[i]["x"], final_tv[i]["y"])
            p_b = Point(final_tv[j]["x"], final_tv[j]["y"])

            if is_edge_on_hull(p_a, p_b, hull_pts):
                # Hull boundary → always visible (caseC.js:707-708)
                hidden = False
            else:
                # Hidden if crosses top surface or midpoint inside top (caseC.js:710-711)
                crosses = self._crosses_top_surface(p_a, p_b, top_polygon, n)
                mid = Point((p_a.x + p_b.x) / 2, (p_a.y + p_b.y) / 2)
                mid_inside = point_in_polygon(mid, top_polygon)
                hidden = crosses or mid_inside

            base_edge_hidden.append(hidden)
            style = "hidden" if hidden else "visible"
            self.builder.add_line(p_a.x, p_a.y, p_b.x, p_b.y, style=style)

        # 3. Longer edges (vertical/lateral) (caseC.js:720-736)
        for i in range(n):
            p_a = Point(final_tv[i]["x"], final_tv[i]["y"])
            p_b = Point(final_tv_top[i]["x"], final_tv_top[i]["y"])

            if is_edge_on_hull(p_a, p_b, hull_pts):
                # Hull boundary → always visible (caseC.js:722-723)
                hidden = False
            else:
                prev_i = (i - 1 + n) % n
                hidden_adjacent_count = 0
                if base_edge_hidden[prev_i]:
                    hidden_adjacent_count += 1
                if base_edge_hidden[i]:
                    hidden_adjacent_count += 1

                crosses = self._crosses_top_surface(p_a, p_b, top_polygon, n)
                hidden = crosses or hidden_adjacent_count >= 2

            style = "hidden" if hidden else "visible"
            self.builder.add_line(p_a.x, p_a.y, p_b.x, p_b.y, style=style)

        # Labels (caseC.js:738-748)
        for i in range(n):
            self.builder.add_point(
                final_tv[i]["x"], final_tv[i]["y"],
                label=final_tv[i]["label"], label_offset_x=5, label_offset_y=15,
            )
            self.builder.add_point(
                final_tv_top[i]["x"], final_tv_top[i]["y"],
                label=final_tv_top[i]["label"], label_offset_x=5, label_offset_y=-8,
            )

    def _final_tv_pyramid(
        self,
        final_tv: list[dict],
        final_tv_apex: dict,
        n: int,
    ) -> None:
        """
        Pyramid final TV with convex hull visibility.

        Port of caseC.js:750-834 (pyramid path).

        Visibility algorithm:
        1. Compute convex hull of base + apex
        2. Base edges → hull boundary → visible; else hidden if both
           endpoints off hull
        3. Slant edges → hull boundary → visible; else hidden if
           2+ adjacent hidden base edges
        """
        all_pts_raw = (
            [Point(p["x"], p["y"]) for p in final_tv]
            + [Point(final_tv_apex["x"], final_tv_apex["y"])]
        )

        hull_pts = convex_hull(all_pts_raw)
        hull_set = build_hull_set(all_pts_raw)

        # Base corner hull membership (caseC.js:771-774)
        base_on_hull = [
            is_on_convex_hull(Point(final_tv[i]["x"], final_tv[i]["y"]), hull_set)
            for i in range(n)
        ]

        # Base edges (caseC.js:778-787)
        base_edge_hidden: list[bool] = []
        for i in range(n):
            j = (i + 1) % n
            p_a = Point(final_tv[i]["x"], final_tv[i]["y"])
            p_b = Point(final_tv[j]["x"], final_tv[j]["y"])

            if is_edge_on_hull(p_a, p_b, hull_pts):
                hidden = False
            else:
                hidden = not base_on_hull[i] and not base_on_hull[j]

            base_edge_hidden.append(hidden)

        # Draw base edges (hidden first, then visible) (caseC.js:789-799)
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)
            for i in range(n):
                j = (i + 1) % n
                if base_edge_hidden[i] == draw_hidden:
                    style = "hidden" if base_edge_hidden[i] else "visible"
                    self.builder.add_line(
                        final_tv[i]["x"], final_tv[i]["y"],
                        final_tv[j]["x"], final_tv[j]["y"], style=style,
                    )

        # Slant edges (caseC.js:801-821)
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)
            for i in range(n):
                p_a = Point(final_tv[i]["x"], final_tv[i]["y"])
                apex_pt = Point(final_tv_apex["x"], final_tv_apex["y"])

                if is_edge_on_hull(p_a, apex_pt, hull_pts):
                    edge_hidden = False
                else:
                    prev_i = (i - 1 + n) % n
                    hidden_adj = 0
                    if base_edge_hidden[prev_i]:
                        hidden_adj += 1
                    if base_edge_hidden[i]:
                        hidden_adj += 1
                    edge_hidden = hidden_adj >= 2

                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        final_tv[i]["x"], final_tv[i]["y"],
                        final_tv_apex["x"], final_tv_apex["y"], style=style,
                    )

        # Labels (caseC.js:823-833)
        for i in range(n):
            self.builder.add_point(
                final_tv[i]["x"], final_tv[i]["y"],
                label=final_tv[i]["label"], label_offset_x=5, label_offset_y=15,
            )
        self.builder.add_point(
            final_tv_apex["x"], final_tv_apex["y"],
            label=final_tv_apex["label"], label_offset_x=5, label_offset_y=-8,
        )

    @staticmethod
    def _crosses_top_surface(
        p_a: Point,
        p_b: Point,
        top_polygon: list[Point],
        n: int,
    ) -> bool:
        """
        Check if segment (pA-pB) crosses any top-surface edge.

        Port of crossesTopSurface() from caseC.js:678-686.
        """
        for k in range(n):
            m = (k + 1) % n
            if segments_intersect(p_a, p_b, top_polygon[k], top_polygon[m]):
                return True
        return False

    # ----------------------------------------------------------
    # Step metadata
    # ----------------------------------------------------------

    @staticmethod
    def _step_title(step: int, axis_angle_hp: float, resting_on: str) -> str:
        """Step titles — port of updateInstructions() calls in caseC.js."""
        titles = {
            1: "Phase I - Step 1: Draw XY Reference Line",
            2: "Phase I - Step 2: Determine Base Orientation",
            3: "Phase I - Step 3: Draw Initial Top View (True Shape)",
            4: "Phase I - Step 4: Project to Initial Front View",
            5: "Phase I - Step 5: Complete Initial Front View",
            6: "Phase II - Step 6: Draw Final Front View (Axis Inclined)",
            7: "Phase II - Step 7: Project to Final Top View",
            8: "Phase II - Step 8: Complete Final Top View",
        }
        return titles.get(step, f"Step {step}")

    @staticmethod
    def _step_description(
        step: int,
        beta: float,
        axis_angle_hp: float,
        resting_on: str,
    ) -> str:
        """Step descriptions — port of updateInstructions() calls in caseC.js."""
        descriptions = {
            1: "Drawing the XY line. Phase I places the solid with axis ⊥ HP to get the initial views.",
            2: f"Initial position: edge angle β = {beta}° (auto-determined from resting condition: {resting_on}).",
            3: f"Drawing the solid base with β = {beta}°. This is the true shape in the initial position.",
            4: "Drawing projectors from initial TV to get the initial FV.",
            5: "Initial FV complete with visible and hidden edges. The axis is vertical (⊥ HP) here.",
            6: f"Rotating the initial FV by {axis_angle_hp}° about the lower-right pivot so the axis is inclined to HP.",
            7: "Drawing vertical projectors from final FV and horizontal loci from initial TV to find intersection points.",
            8: "Joining the intersection points to get the final TV with visible and hidden edges.",
        }
        return descriptions.get(step, "")
