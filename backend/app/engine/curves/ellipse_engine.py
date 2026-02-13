"""
Ellipse Engine — Focus-Directrix Conic Construction.

Ports ellipse.html:124-476 (350 lines of JS) to Python.
Produces 11 cumulative steps of RenderElements for canvas drawing.

Key math:
  - Vertex V: x_v = focus_dist / (1 + e)
  - V': x=V.x, y=focus_dist - V.x
  - Vertical lines at 0.5mm spacing from V
  - Arc intersection: sqrt(dist² - (focus_dist - x)²)
"""

from __future__ import annotations

import math

from app.schemas.projection import (
    LineElement, PointElement, LabelElement, ArcElement, ArrowElement, PolygonElement,
    StepInstruction,
)
from app.schemas.curve_schemas import CurveResponse, CurveMetadata


def parse_eccentricity(ecc_str: str) -> float:
    """Parse eccentricity from string — supports '3/5' or '0.6' format."""
    ecc_str = ecc_str.strip()
    if "/" in ecc_str:
        parts = ecc_str.split("/")
        if len(parts) == 2:
            num = float(parts[0])
            den = float(parts[1])
            if den != 0:
                return num / den
    return float(ecc_str)


def compute_ellipse(
    focus_dist: float = 80.0,
    eccentricity_str: str = "3/5",
    canvas_width: float = 1200.0,
    canvas_height: float = 700.0,
) -> CurveResponse:
    """
    Compute all 11 steps of the focus-directrix conic construction.

    Returns cumulative RenderElement arrays for each step.
    """
    e = parse_eccentricity(eccentricity_str)

    # Validate eccentricity range
    if e <= 0:
        raise ValueError("Eccentricity must be positive")
    if 0.8 < e < 1.0:
        e = 0.85  # Matches legacy: values between 0.8-1 cause overflow

    # Determine max lines based on curve type
    max_lines = 1800 if e < 1 else 300

    # Compute key points
    x_v = focus_dist / (1 + e)
    v = {"x": x_v, "y": 0.0}
    vp = {"x": x_v, "y": focus_dist - x_v}

    # Slant line extension
    dx = vp["x"]
    dy = vp["y"]
    factor = 250.0 / (abs(dx) if abs(dx) > 1e-9 else 1.0)
    x_ext = dx * factor
    y_ext = dy * factor

    # ── Define vertical lines ──
    line_data = []
    letter_count = 0
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    for i in range(1, max_lines + 1):
        x_val = x_v + i * 0.5
        t = x_val / vp["x"] if abs(vp["x"]) > 1e-9 else 0.0
        y_val = t * vp["y"]
        y_min = -80.0 if y_val >= 0 else y_val - 2.0
        y_max = y_val + 2.0 if y_val >= 0 else 80.0

        is_20th = (i % 20 == 0)
        axis_label = ""
        slant_label = ""
        if is_20th:
            if letter_count < len(letters):
                axis_label = letters[letter_count]
                slant_label = letters[letter_count] + "'"
            else:
                axis_label = f"L{i}"
                slant_label = f"L{i}'"
            letter_count += 1

        line_data.append({
            "i": i, "x_val": x_val, "y_min": y_min, "y_max": y_max,
            "is_20th": is_20th, "axis_label": axis_label,
            "slant_label": slant_label, "arcs": [],
        })

    # ── Compute arc intersections ──
    for obj in line_data:
        x_val = obj["x_val"]
        t = x_val / vp["x"] if abs(vp["x"]) > 1e-9 else 0.0
        y_val = t * vp["y"]
        dist = abs(y_val)
        eq = dist * dist - (focus_dist - x_val) ** 2
        if eq < 0:
            continue
        y0 = math.sqrt(eq)
        if y0 == 0:
            obj["arcs"].append({"x": x_val, "y": 0.0, "label": f'{obj["i"]}"'})
        else:
            obj["arcs"].append({"x": x_val, "y": y0, "label": f'{obj["i"]}"'})
            obj["arcs"].append({"x": x_val, "y": -y0, "label": f'{obj["i"]}~'})

    # ── Build step instructions (cumulative) ──
    step_texts = [
        "Click 'Next' to begin.",
        "1) Draw directrix (DD') in blue.",
        "2) Draw axis line from A (on directrix) ~250mm.",
        "3) Mark F so that AF=FocusDist. Dimension AF.",
        "4) Mark V with ratio VF/AV=e.",
        "5) Draw V→V' (vertical). Extend A→V' ~250mm.",
        "6) Draw vertical construction lines (0.5mm spacing, every 20th highlighted).",
        "7) For each highlighted line, measure arcs from F. Mark intersection points.",
        "8) Continue arc measurements for all lines.",
        "9) Join above-axis points V→1\"→2\"→... and below-axis V→1~→2~→...",
        "10) Final result: Conic curve with partial arcs on highlighted lines.",
        "11) Done. Press Reset to start again.",
    ]

    all_steps: list[StepInstruction] = []

    for step_num in range(1, 12):
        elements: list = []

        # Step 1: Directrix
        if step_num >= 1:
            elements.append(LineElement(x1=0, y1=-100, x2=0, y2=100, style="construction"))
            elements.append(PointElement(x=0, y=100, label="D"))
            elements.append(PointElement(x=0, y=-100, label="D'"))

        # Step 2: Axis line
        if step_num >= 2:
            elements.append(PointElement(x=0, y=0, label="A"))
            elements.append(LineElement(x1=0, y1=0, x2=250, y2=0, style="construction"))

        # Step 3: Focus F + dimension
        if step_num >= 3:
            elements.append(PointElement(x=focus_dist, y=0, label="F"))
            # Dimension line for AF
            elements.append(LineElement(x1=0, y1=-15, x2=focus_dist, y2=-15, style="construction"))
            elements.append(LineElement(x1=0, y1=0, x2=0, y2=-15, style="construction"))
            elements.append(LineElement(x1=focus_dist, y1=0, x2=focus_dist, y2=-15, style="construction"))
            elements.append(ArrowElement(from_x=focus_dist, from_y=-15, to_x=0, to_y=-15))
            elements.append(ArrowElement(from_x=0, from_y=-15, to_x=focus_dist, to_y=-15))
            elements.append(LabelElement(x=focus_dist / 2, y=-20, text=f"{focus_dist:.0f} mm"))

        # Step 4: Vertex V
        if step_num >= 4:
            elements.append(PointElement(x=v["x"], y=v["y"], label="V"))

        # Step 5: V→V' and slant extension
        if step_num >= 5:
            elements.append(LineElement(x1=v["x"], y1=0, x2=vp["x"], y2=vp["y"], style="construction"))
            elements.append(PointElement(x=vp["x"], y=vp["y"], label="V'"))
            elements.append(LineElement(x1=0, y1=0, x2=x_ext, y2=y_ext, style="construction"))

        # Step 6: Vertical construction lines
        if step_num >= 6:
            for obj in line_data:
                if obj["is_20th"]:
                    elements.append(LineElement(
                        x1=obj["x_val"], y1=obj["y_min"],
                        x2=obj["x_val"], y2=obj["y_max"],
                        style="construction",
                    ))
                    elements.append(PointElement(x=obj["x_val"], y=0, label=obj["axis_label"]))
                    t = obj["x_val"] / vp["x"] if abs(vp["x"]) > 1e-9 else 0
                    y_val = t * vp["y"]
                    elements.append(PointElement(x=obj["x_val"], y=y_val, label=obj["slant_label"]))

        # Step 7-8: Arc intersections
        if step_num >= 7:
            for obj in line_data:
                if not obj["arcs"]:
                    continue
                x_val = obj["x_val"]
                t = x_val / vp["x"] if abs(vp["x"]) > 1e-9 else 0
                y_val = t * vp["y"]
                dist = abs(y_val)

                for arc_pt in obj["arcs"]:
                    angle = math.atan2(arc_pt["y"], arc_pt["x"] - focus_dist)
                    d_spread = 5.0  # degrees
                    if obj["is_20th"]:
                        elements.append(ArcElement(
                            center_x=focus_dist, center_y=0,
                            radius=dist,
                            start_angle=math.degrees(angle) - d_spread,
                            end_angle=math.degrees(angle) + d_spread,
                        ))
                    if obj["is_20th"]:
                        elements.append(PointElement(
                            x=arc_pt["x"], y=arc_pt["y"],
                            label=arc_pt["label"],
                        ))

        # Step 10+: Final shape polyline
        if step_num >= 10:
            pts_above = []
            pts_below = []
            for obj in line_data:
                for p in obj["arcs"]:
                    if p["label"].endswith("~"):
                        pts_below.append(p)
                    else:
                        pts_above.append(p)

            pts_above.sort(key=lambda p: p["x"])
            pts_below.sort(key=lambda p: p["x"])

            # Top polyline: V → above points
            if pts_above:
                top_pts = [{"x": v["x"], "y": v["y"]}] + [{"x": p["x"], "y": p["y"]} for p in pts_above]
                elements.append(PolygonElement(points=top_pts, style="visible", closed=False))

            # Bottom polyline: V → below points
            if pts_below:
                bot_pts = [{"x": v["x"], "y": v["y"]}] + [{"x": p["x"], "y": p["y"]} for p in pts_below]
                elements.append(PolygonElement(points=bot_pts, style="visible", closed=False))

            # Re-add dimension
            elements.append(LineElement(x1=0, y1=-15, x2=focus_dist, y2=-15, style="construction"))
            elements.append(ArrowElement(from_x=focus_dist, from_y=-15, to_x=0, to_y=-15))
            elements.append(ArrowElement(from_x=0, from_y=-15, to_x=focus_dist, to_y=-15))
            elements.append(LabelElement(x=focus_dist / 2, y=-20, text=f"{focus_dist:.0f} mm"))

        all_steps.append(StepInstruction(
            step_number=step_num,
            title=f"Step {step_num}",
            description=step_texts[step_num] if step_num < len(step_texts) else "Done.",
            elements=elements,
        ))

    return CurveResponse(
        total_steps=11,
        steps=all_steps,
        metadata=CurveMetadata(
            curve_type="ellipse" if e < 1 else ("parabola" if abs(e - 1) < 0.001 else "hyperbola"),
            parameters={
                "focus_dist": focus_dist,
                "eccentricity": e,
                "vertex_x": round(x_v, 2),
                "max_lines": max_lines,
            },
        ),
    )
