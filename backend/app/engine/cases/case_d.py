"""
Case D Engine — Axis Inclined to both HP and VP.

This is the most complex projection case. The solid axis makes angle α
with HP and angle φ with VP, requiring a three-phase construction:

  Phase I   (Steps 1-5):  Initial position — axis ⊥ HP (reuse CaseAEngine)
  Phase II  (Steps 6-8):  Tilt axis at angle α to HP (reuse CaseCEngine logic)
  Phase III (Steps 9-11): Tilt axis at angle φ to VP (horizontal rotation of
                           Phase II TV, then project up to get final FV)

The Phase III construction:
  Step 9:  Rotate Phase II's final TV about its rightmost base corner
           by angle φ. This is a horizontal rotation in the TV plane.
  Step 10: Draw vertical projectors from Phase III TV upward to FV area,
           and horizontal loci from Phase II FV to the right.
           Find intersection points → Phase III final FV.
  Step 11: Complete final FV with visible/hidden edges.

11 cumulative steps total.
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
from app.engine.cases.case_c import CaseCEngine


# ============================================================
# Corner storage for Phase III
# ============================================================

@dataclass
class CaseDCorners:
    """Stores Phase III corner positions."""
    # Phase III TV (rotated from Phase II TV)
    phase3_tv: list[dict] = field(default_factory=list)
    phase3_tv_top: list[dict] | None = None      # Prism only
    phase3_tv_apex: dict | None = None            # Pyramid only

    # Phase III FV (from intersection of projectors and loci)
    phase3_fv_base: list[dict] = field(default_factory=list)
    phase3_fv_top: list[dict] | None = None       # Prism only
    phase3_fv_apex: dict | None = None             # Pyramid only


# ============================================================
# Case D Engine
# ============================================================

class CaseDEngine:
    """
    Computes all projection geometry for Case D (axis inclined to both).

    Phase I (steps 1-5):   Reuses CaseAEngine with auto-computed β.
    Phase II (steps 6-8):  Reuses CaseCEngine logic for HP inclination.
    Phase III (steps 9-11): VP inclination — rotates TV, projects to FV.
    """

    TOTAL_STEPS = 11

    def __init__(self, solid: Solid, config: DrawingConfig) -> None:
        self.solid = solid
        self.config = config
        self.corners = CaseDCorners()
        self.builder = RenderBuilder(config)
        # Sub-engines for delegation
        self._case_c: CaseCEngine | None = None
        self._case_a: CaseAEngine | None = None

    def compute_all_steps(
        self,
        base_edge: float,
        axis_length: float,
        edge_angle: float,
        axis_angle_hp: float,
        axis_angle_vp: float,
        resting_on: str,
    ) -> list[dict]:
        """
        Compute all 11 steps of Case D projection.

        Args:
            base_edge: Length of one base edge.
            axis_length: Length of solid axis.
            edge_angle: Original edge angle (unused, auto-computed via β).
            axis_angle_hp: Axis angle with HP in degrees (α).
            axis_angle_vp: Axis angle with VP in degrees (φ).
            resting_on: Resting condition ('base-edge' or 'base-corner').

        Returns:
            List of StepInstruction dicts (11 steps).
        """
        # --- Phase I + II: delegate to CaseCEngine ---
        # CaseC handles steps 1-8 (Phase I = Case A steps 1-5, Phase II = steps 6-8)
        self._case_c = CaseCEngine(self.solid, self.config)
        beta = CaseCEngine.auto_compute_beta(self.solid.solid_type, resting_on)

        # Create Case A engine for Phase I geometry
        self._case_a = CaseAEngine(self.solid, self.config)
        edge_angle_rad = degrees_to_radians(beta)
        self._case_a._compute_top_view(base_edge, edge_angle_rad)

        steps: list[dict] = []

        for step in range(1, self.TOTAL_STEPS + 1):
            self.builder.reset()

            if step <= 5:
                # Phase I: Case A initial position
                self._build_phase1_step(step, base_edge, axis_length, beta)
            elif step <= 8:
                # Phase II: Case C rotation (HP angle)
                self._draw_all_phase1(base_edge, axis_length, beta)
                self._build_phase2_step(
                    step, base_edge, axis_length, axis_angle_hp,
                )
            else:
                # Phase III: VP angle rotation
                self._draw_all_phases12(
                    base_edge, axis_length, beta, axis_angle_hp,
                )
                self._build_phase3_step(
                    step, base_edge, axis_length,
                    axis_angle_hp, axis_angle_vp,
                )

            steps.append(self.builder.build_step(
                step_number=step,
                title=self._step_title(step),
                description=self._step_description(
                    step, beta, axis_angle_hp, axis_angle_vp, resting_on,
                ),
            ))

        return steps

    # ----------------------------------------------------------
    # Phase I (Steps 1-5): delegate to Case A
    # ----------------------------------------------------------

    def _build_phase1_step(
        self,
        step: int,
        base_edge: float,
        axis_length: float,
        beta: float,
    ) -> None:
        """Build Phase I step using Case A engine."""
        case_a = self._case_a
        if not case_a:
            return
        case_a.builder = self.builder

        match step:
            case 1:
                self.builder.add_xy_line()
            case 2:
                self.builder.add_xy_line()
                self.builder.add_angle_indicator(beta)
            case 3:
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    case_a._add_top_view_prism(beta)
                elif self.solid.is_pyramid:
                    case_a._add_top_view_pyramid()
            case 4:
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    case_a._add_top_view_prism(beta)
                    case_a._add_projectors_prism(axis_length)
                elif self.solid.is_pyramid:
                    case_a._add_top_view_pyramid()
                    case_a._add_projectors_pyramid(axis_length)
            case 5:
                self.builder.add_xy_line()
                if self.solid.is_prism:
                    case_a._add_top_view_prism(beta)
                    case_a._add_front_view_prism(axis_length)
                elif self.solid.is_pyramid:
                    case_a._add_top_view_pyramid()
                    case_a._add_front_view_pyramid(axis_length)

    def _draw_all_phase1(
        self,
        base_edge: float,
        axis_length: float,
        beta: float,
    ) -> None:
        """Draw all Phase I elements."""
        case_a = self._case_a
        if not case_a:
            return
        case_a.builder = self.builder
        self.builder.add_xy_line()
        if self.solid.is_prism:
            case_a._add_top_view_prism(beta)
            case_a._add_front_view_prism(axis_length)
        elif self.solid.is_pyramid:
            case_a._add_top_view_pyramid()
            case_a._add_front_view_pyramid(axis_length)

    # ----------------------------------------------------------
    # Phase II (Steps 6-8): delegate to Case C geometry
    # ----------------------------------------------------------

    def _build_phase2_step(
        self,
        step: int,
        base_edge: float,
        axis_length: float,
        axis_angle_hp: float,
    ) -> None:
        """Build Phase II step using Case C sub-engine."""
        case_c = self._case_c
        case_a = self._case_a
        if not case_c or not case_a:
            return
        case_c.builder = self.builder

        match step:
            case 6:
                case_c._final_fv(case_a, base_edge, axis_angle_hp)
            case 7:
                case_c._final_fv(case_a, base_edge, axis_angle_hp)
                case_c._projectors_and_loci(case_a)
            case 8:
                case_c._final_fv(case_a, base_edge, axis_angle_hp)
                case_c._projectors_and_loci(case_a)
                case_c._final_tv(case_a)

    def _draw_all_phases12(
        self,
        base_edge: float,
        axis_length: float,
        beta: float,
        axis_angle_hp: float,
    ) -> None:
        """Draw all Phase I + Phase II elements."""
        self._draw_all_phase1(base_edge, axis_length, beta)

        case_c = self._case_c
        case_a = self._case_a
        if not case_c or not case_a:
            return
        case_c.builder = self.builder

        case_c._final_fv(case_a, base_edge, axis_angle_hp)
        case_c._projectors_and_loci(case_a)
        case_c._final_tv(case_a)

    # ----------------------------------------------------------
    # Phase III (Steps 9-11): VP rotation
    # ----------------------------------------------------------

    def _build_phase3_step(
        self,
        step: int,
        base_edge: float,
        axis_length: float,
        axis_angle_hp: float,
        axis_angle_vp: float,
    ) -> None:
        """Build Phase III step (VP angle rotation)."""
        match step:
            case 9:
                self._rotate_tv_for_vp(axis_angle_vp, base_edge)
            case 10:
                self._rotate_tv_for_vp(axis_angle_vp, base_edge)
                self._phase3_projectors_and_loci()
            case 11:
                self._rotate_tv_for_vp(axis_angle_vp, base_edge)
                self._phase3_projectors_and_loci()
                self._phase3_final_fv()

    def _rotate_tv_for_vp(self, axis_angle_vp: float, base_edge: float) -> None:
        """
        Rotate Phase II final TV by VP angle φ.

        The rotation is in the TV plane (x-y plane below XY line).
        Pivot: rightmost base corner from Phase II TV.
        Rotation angle: φ (axis_angle_vp) counterclockwise.
        """
        case_c = self._case_c
        if not case_c:
            return

        phase2_tv = case_c.corners.final_tv
        phase2_tv_top = case_c.corners.final_tv_top
        phase2_tv_apex = case_c.corners.final_tv_apex

        if not phase2_tv:
            return

        n = len(phase2_tv)
        phi = degrees_to_radians(axis_angle_vp)
        offset = 45.0 + 2.0 * base_edge

        # Find pivot: rightmost base corner in Phase II TV
        pivot_idx = 0
        for i in range(1, n):
            if (phase2_tv[i]["x"] > phase2_tv[pivot_idx]["x"] or
                    (phase2_tv[i]["x"] == phase2_tv[pivot_idx]["x"]
                     and phase2_tv[i]["y"] > phase2_tv[pivot_idx]["y"])):
                pivot_idx = i
        pivot_x = phase2_tv[pivot_idx]["x"]
        pivot_y = phase2_tv[pivot_idx]["y"]

        def rotate_around_pivot(px: float, py: float) -> tuple[float, float]:
            dx = px - pivot_x
            dy = py - pivot_y
            cos_p = math.cos(phi)
            sin_p = math.sin(phi)
            return (
                pivot_x + dx * cos_p - dy * sin_p,
                pivot_y + dx * sin_p + dy * cos_p,
            )

        # Rotate base corners
        phase3_tv = []
        for i in range(n):
            rx, ry = rotate_around_pivot(
                phase2_tv[i]["x"], phase2_tv[i]["y"],
            )
            phase3_tv.append({
                "x": rx + offset, "y": ry,
                "label": f"{i + 1}₂",
                "phase2_y": phase2_tv[i]["y"],
            })

        # Rotate top/apex
        phase3_tv_top = None
        phase3_tv_apex = None

        if self.solid.is_prism and phase2_tv_top:
            phase3_tv_top = []
            for i in range(n):
                rx, ry = rotate_around_pivot(
                    phase2_tv_top[i]["x"], phase2_tv_top[i]["y"],
                )
                phase3_tv_top.append({
                    "x": rx + offset, "y": ry,
                    "label": f"{chr(97 + i)}₂",
                    "phase2_y": phase2_tv_top[i]["y"],
                })

        if self.solid.is_pyramid and phase2_tv_apex:
            rx, ry = rotate_around_pivot(
                phase2_tv_apex["x"], phase2_tv_apex["y"],
            )
            phase3_tv_apex = {
                "x": rx + offset, "y": ry,
                "label": "o₂",
                "phase2_y": phase2_tv_apex["y"],
            }

        # Store
        self.corners.phase3_tv = phase3_tv
        self.corners.phase3_tv_top = phase3_tv_top
        self.corners.phase3_tv_apex = phase3_tv_apex

        # Draw the rotated TV polygon (all visible for now — final visibility at Step 11)
        self._draw_phase3_tv_simple()

    def _draw_phase3_tv_simple(self) -> None:
        """Draw Phase III TV with simple visibility (all edges visible initially)."""
        phase3_tv = self.corners.phase3_tv
        phase3_tv_top = self.corners.phase3_tv_top
        phase3_tv_apex = self.corners.phase3_tv_apex

        if not phase3_tv:
            return

        n = len(phase3_tv)

        if self.solid.is_prism and phase3_tv_top:
            # Base polygon
            for i in range(n):
                j = (i + 1) % n
                self.builder.add_line(
                    phase3_tv[i]["x"], phase3_tv[i]["y"],
                    phase3_tv[j]["x"], phase3_tv[j]["y"],
                    style="visible",
                )
            # Top polygon
            for i in range(n):
                j = (i + 1) % n
                self.builder.add_line(
                    phase3_tv_top[i]["x"], phase3_tv_top[i]["y"],
                    phase3_tv_top[j]["x"], phase3_tv_top[j]["y"],
                    style="visible",
                )
            # Lateral edges
            for i in range(n):
                self.builder.add_line(
                    phase3_tv[i]["x"], phase3_tv[i]["y"],
                    phase3_tv_top[i]["x"], phase3_tv_top[i]["y"],
                    style="visible",
                )
            # Labels
            for i in range(n):
                self.builder.add_point(
                    phase3_tv[i]["x"], phase3_tv[i]["y"],
                    label=phase3_tv[i]["label"],
                    label_offset_x=5, label_offset_y=15,
                )
                self.builder.add_point(
                    phase3_tv_top[i]["x"], phase3_tv_top[i]["y"],
                    label=phase3_tv_top[i]["label"],
                    label_offset_x=5, label_offset_y=-8,
                )

        elif self.solid.is_pyramid and phase3_tv_apex:
            # Base polygon
            for i in range(n):
                j = (i + 1) % n
                self.builder.add_line(
                    phase3_tv[i]["x"], phase3_tv[i]["y"],
                    phase3_tv[j]["x"], phase3_tv[j]["y"],
                    style="visible",
                )
            # Slant edges
            for i in range(n):
                self.builder.add_line(
                    phase3_tv[i]["x"], phase3_tv[i]["y"],
                    phase3_tv_apex["x"], phase3_tv_apex["y"],
                    style="visible",
                )
            # Labels
            for i in range(n):
                self.builder.add_point(
                    phase3_tv[i]["x"], phase3_tv[i]["y"],
                    label=phase3_tv[i]["label"],
                    label_offset_x=5, label_offset_y=15,
                )
            self.builder.add_point(
                phase3_tv_apex["x"], phase3_tv_apex["y"],
                label=phase3_tv_apex["label"],
                label_offset_x=5, label_offset_y=-8,
            )

    def _phase3_projectors_and_loci(self) -> None:
        """
        Compute Phase III projectors and loci.

        Vertical projectors: from Phase III TV corners upward to FV area.
        Horizontal loci: from Phase II FV corners (final_fv_base/top/apex) rightward.
        Intersection: Phase III FV corners = (TV.x, FV.y) from corresponding corners.
        """
        case_c = self._case_c
        if not case_c:
            return

        phase3_tv = self.corners.phase3_tv
        phase3_tv_top = self.corners.phase3_tv_top
        phase3_tv_apex = self.corners.phase3_tv_apex

        phase2_fv_base = case_c.corners.final_fv_base
        phase2_fv_top = case_c.corners.final_fv_top
        phase2_fv_apex = case_c.corners.final_fv_apex

        if not phase3_tv or not phase2_fv_base:
            return

        n = len(phase3_tv)
        cfg = self.config

        # Compute extents
        max_tv_y = max(pt["y"] for pt in phase3_tv)
        if phase3_tv_top:
            max_tv_y = max(max_tv_y, max(pt["y"] for pt in phase3_tv_top))
        if phase3_tv_apex and phase3_tv_apex["y"] > max_tv_y:
            max_tv_y = phase3_tv_apex["y"]
        max_tv_y += 20

        max_fv_x = max(pt["x"] for pt in phase3_tv)
        if phase3_tv_top:
            max_fv_x = max(max_fv_x, max(pt["x"] for pt in phase3_tv_top))
        if phase3_tv_apex and phase3_tv_apex["x"] > max_fv_x:
            max_fv_x = phase3_tv_apex["x"]
        max_fv_x += 30

        # 1. Vertical projectors from Phase III TV upward
        for pt in phase3_tv:
            self.builder.add_line(
                pt["x"], pt["y"], pt["x"], cfg.xy_line_y - 150,
                style="construction",
            )
        if self.solid.is_prism and phase3_tv_top:
            for pt in phase3_tv_top:
                self.builder.add_line(
                    pt["x"], pt["y"], pt["x"], cfg.xy_line_y - 150,
                    style="construction",
                )
        if self.solid.is_pyramid and phase3_tv_apex:
            self.builder.add_line(
                phase3_tv_apex["x"], phase3_tv_apex["y"],
                phase3_tv_apex["x"], cfg.xy_line_y - 150,
                style="construction",
            )

        # 2. Horizontal loci from Phase II FV rightward
        for pt in phase2_fv_base:
            self.builder.add_line(
                pt["x"], pt["y"], max_fv_x, pt["y"],
                style="construction",
            )
        if self.solid.is_prism and phase2_fv_top:
            for pt in phase2_fv_top:
                self.builder.add_line(
                    pt["x"], pt["y"], max_fv_x, pt["y"],
                    style="construction",
                )
        if self.solid.is_pyramid and phase2_fv_apex:
            self.builder.add_line(
                phase2_fv_apex["x"], phase2_fv_apex["y"],
                max_fv_x, phase2_fv_apex["y"],
                style="construction",
            )

        # 3. Compute intersection points — Phase III FV
        # FV corner[i] = (phase3_tv[i].x, phase2_fv_base[i].y)
        phase3_fv_base = []
        for i in range(n):
            phase3_fv_base.append({
                "x": phase3_tv[i]["x"],
                "y": phase2_fv_base[i]["y"],
                "label": f"{i + 1}₂'",
            })

        phase3_fv_top = None
        phase3_fv_apex = None

        if self.solid.is_prism and phase3_tv_top and phase2_fv_top:
            phase3_fv_top = []
            for i in range(n):
                phase3_fv_top.append({
                    "x": phase3_tv_top[i]["x"],
                    "y": phase2_fv_top[i]["y"],
                    "label": f"{chr(97 + i)}₂'",
                })

        if self.solid.is_pyramid and phase3_tv_apex and phase2_fv_apex:
            phase3_fv_apex = {
                "x": phase3_tv_apex["x"],
                "y": phase2_fv_apex["y"],
                "label": "o₂'",
            }

        # Store
        self.corners.phase3_fv_base = phase3_fv_base
        self.corners.phase3_fv_top = phase3_fv_top
        self.corners.phase3_fv_apex = phase3_fv_apex

        # Mark intersection points
        for pt in phase3_fv_base:
            self.builder.add_point(pt["x"], pt["y"], label=pt["label"])
        if phase3_fv_top:
            for pt in phase3_fv_top:
                self.builder.add_point(pt["x"], pt["y"], label=pt["label"],
                                       label_offset_x=5, label_offset_y=-8)
        if phase3_fv_apex:
            self.builder.add_point(
                phase3_fv_apex["x"], phase3_fv_apex["y"],
                label=phase3_fv_apex["label"],
                label_offset_x=5, label_offset_y=-8,
            )

    def _phase3_final_fv(self) -> None:
        """
        Draw the Phase III final FV with visibility detection.

        Uses the same visibility approach as Case A/C:
        - Determine which corners are hidden based on TV depth
        - Silhouette override for outermost edges
        - 2-pass rendering (hidden first, visible second)
        """
        phase3_fv_base = self.corners.phase3_fv_base
        phase3_fv_top = self.corners.phase3_fv_top
        phase3_fv_apex = self.corners.phase3_fv_apex

        phase3_tv = self.corners.phase3_tv
        phase3_tv_top = self.corners.phase3_tv_top
        phase3_tv_apex = self.corners.phase3_tv_apex

        if not phase3_fv_base or not phase3_tv:
            return

        n = len(phase3_fv_base)

        # Visibility: use Phase III TV y-coordinates
        # Corners with smaller y (closer to XY line) are nearer → visible
        # Corners with larger y (farther from XY line) are farther → hidden
        center_y = sum(pt["y"] for pt in phase3_tv) / n
        if self.solid.is_prism and phase3_tv_top:
            center_y = (center_y + sum(pt["y"] for pt in phase3_tv_top) / n) / 2

        is_hidden = [phase3_tv[i]["y"] > center_y for i in range(n)]

        # Silhouette override: outermost x in FV
        all_x = [c["x"] for c in phase3_fv_base]
        if phase3_fv_top:
            all_x.extend(c["x"] for c in phase3_fv_top)
        if phase3_fv_apex:
            all_x.append(phase3_fv_apex["x"])
        min_x = min(all_x)
        max_x = max(all_x)
        EPS = 0.5
        for i in range(n):
            if (abs(phase3_fv_base[i]["x"] - min_x) < EPS
                    or abs(phase3_fv_base[i]["x"] - max_x) < EPS):
                is_hidden[i] = False

        if self.solid.is_prism and phase3_fv_top:
            self._draw_phase3_prism_fv(
                phase3_fv_base, phase3_fv_top, is_hidden, n,
            )
        elif self.solid.is_pyramid and phase3_fv_apex:
            self._draw_phase3_pyramid_fv(
                phase3_fv_base, phase3_fv_apex, is_hidden, n,
            )

    def _draw_phase3_prism_fv(
        self,
        final_base: list[dict],
        final_top: list[dict],
        is_hidden: list[bool],
        n: int,
    ) -> None:
        """Draw Phase III prism FV with visibility."""
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Base edges
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_base[j]["x"], final_base[j]["y"], style=style,
                    )

            # Top edges
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        final_top[i]["x"], final_top[i]["y"],
                        final_top[j]["x"], final_top[j]["y"], style=style,
                    )

            # Vertical (lateral) edges
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_top[i]["x"], final_top[i]["y"], style=style,
                    )

        # Labels
        for i in range(n):
            self.builder.add_point(
                final_base[i]["x"], final_base[i]["y"],
                label=final_base[i]["label"],
                label_offset_x=5, label_offset_y=15,
            )
            self.builder.add_point(
                final_top[i]["x"], final_top[i]["y"],
                label=final_top[i]["label"],
                label_offset_x=5, label_offset_y=-8,
            )

        # Axis construction line
        base_cx = sum(c["x"] for c in final_base) / n
        base_cy = sum(c["y"] for c in final_base) / n
        top_cx = sum(c["x"] for c in final_top) / n
        top_cy = sum(c["y"] for c in final_top) / n
        self.builder.add_line(base_cx, base_cy, top_cx, top_cy, style="construction")

    def _draw_phase3_pyramid_fv(
        self,
        final_base: list[dict],
        final_apex: dict,
        is_hidden: list[bool],
        n: int,
    ) -> None:
        """Draw Phase III pyramid FV with visibility."""
        for render_pass in range(2):
            draw_hidden = (render_pass == 0)

            # Base edges
            for i in range(n):
                j = (i + 1) % n
                edge_hidden = is_hidden[i] and is_hidden[j]
                if edge_hidden == draw_hidden:
                    style = "hidden" if edge_hidden else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_base[j]["x"], final_base[j]["y"], style=style,
                    )

            # Slant edges
            for i in range(n):
                if is_hidden[i] == draw_hidden:
                    style = "hidden" if is_hidden[i] else "visible"
                    self.builder.add_line(
                        final_base[i]["x"], final_base[i]["y"],
                        final_apex["x"], final_apex["y"], style=style,
                    )

        # Labels
        for i in range(n):
            self.builder.add_point(
                final_base[i]["x"], final_base[i]["y"],
                label=final_base[i]["label"],
                label_offset_x=5, label_offset_y=15,
            )
        self.builder.add_point(
            final_apex["x"], final_apex["y"],
            label=final_apex["label"],
            label_offset_x=5, label_offset_y=-8,
        )

        # Axis construction line
        base_cx = sum(c["x"] for c in final_base) / n
        base_cy = sum(c["y"] for c in final_base) / n
        self.builder.add_line(
            base_cx, base_cy, final_apex["x"], final_apex["y"],
            style="construction",
        )

    # ----------------------------------------------------------
    # Step metadata
    # ----------------------------------------------------------

    @staticmethod
    def _step_title(step: int) -> str:
        """Step titles for Case D."""
        titles = {
            1: "Phase I - Step 1: Draw XY Reference Line",
            2: "Phase I - Step 2: Determine Base Orientation",
            3: "Phase I - Step 3: Draw Initial Top View (True Shape)",
            4: "Phase I - Step 4: Project to Initial Front View",
            5: "Phase I - Step 5: Complete Initial Front View",
            6: "Phase II - Step 6: Draw Final FV (Axis Inclined to HP)",
            7: "Phase II - Step 7: Project to Intermediate Top View",
            8: "Phase II - Step 8: Complete Intermediate Top View",
            9: "Phase III - Step 9: Rotate TV for VP Inclination",
            10: "Phase III - Step 10: Project to Final Front View",
            11: "Phase III - Step 11: Complete Final Front View",
        }
        return titles.get(step, f"Step {step}")

    @staticmethod
    def _step_description(
        step: int,
        beta: float,
        axis_angle_hp: float,
        axis_angle_vp: float,
        resting_on: str,
    ) -> str:
        """Step descriptions for Case D."""
        descriptions = {
            1: "Drawing the XY line. Phase I places the solid with axis ⊥ HP.",
            2: f"Initial position: β = {beta}° (from resting condition: {resting_on}).",
            3: f"Drawing initial true shape with β = {beta}°.",
            4: "Drawing projectors from initial TV to initial FV.",
            5: "Initial FV complete. Axis is vertical (⊥ HP) in this position.",
            6: f"Rotating FV by {axis_angle_hp}° so axis inclines to HP at α = {axis_angle_hp}°.",
            7: "Drawing projectors and loci to find intermediate TV.",
            8: "Intermediate TV complete (axis inclined to HP only).",
            9: f"Rotating intermediate TV by {axis_angle_vp}° so axis inclines to VP at φ = {axis_angle_vp}°.",
            10: "Drawing projectors from rotated TV and loci from Phase II FV to find final FV.",
            11: "Final FV complete with visible and hidden edges. Axis is now inclined to both HP and VP.",
        }
        return descriptions.get(step, "")
