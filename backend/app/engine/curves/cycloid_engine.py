"""
Cycloid Engine — Rolling Circle Curve Construction.

Ports cycloid.html:133-692 (560 lines of JS) to Python.
Produces 10 cumulative steps of RenderElements for canvas drawing.

Key math:
  - Circle divided into 8 equal parts at 45° increments
  - Baseline length = π × diameter (circumference)
  - Centers O1-O8 at equal baseline divisions
  - Arc intersection: x = center_x ± sqrt(r² - (y_target - center_y)²)
  - Bezier control points for smooth curve joining
"""

from __future__ import annotations

import math

from app.schemas.projection import (
    LineElement, PointElement, LabelElement, ArcElement, PolygonElement,
    StepInstruction,
)
from app.schemas.curve_schemas import CurveResponse, CurveMetadata


def compute_cycloid(
    diameter: float = 100.0,
    canvas_width: float = 1200.0,
    canvas_height: float = 700.0,
) -> CurveResponse:
    """
    Compute all 10 steps of the cycloid construction.

    Coordinate system: (0,0) at bottom-left of circle = start point.
    Y-axis points UP (standard math convention, frontend flips).
    """
    radius = diameter / 2
    circumference = math.pi * diameter

    # Starting position — circle bottom center
    start_x = 150.0
    start_y = 350.0  # baseline y-coordinate (screen coords, y-down)

    # ── Compute circle division points (8 equal parts) ──
    # In screen coords (y-down), point 1 = bottom, going clockwise
    circle_points = []
    for i in range(8):
        angle = math.pi * 0.5 - (math.pi * 2 / 8 * i)
        x = start_x + radius * math.cos(angle)
        y = (start_y - radius) + radius * math.sin(angle)
        circle_points.append({"x": x, "y": y, "angle": angle})

    # ── Compute baseline division points (8 equal parts) ──
    segment_length = circumference / 8
    baseline_points = []
    for i in range(9):  # 0 to 8
        x = start_x + segment_length * i
        baseline_points.append({"x": x, "y": start_y})

    # ── Compute centers O, O1-O8 ──
    center_y = start_y - radius  # All centers at same height
    centers = [{"x": start_x, "y": center_y}]  # O
    for i in range(1, 9):
        centers.append({"x": baseline_points[i]["x"], "y": center_y})

    # ── Compute cycloid points (a, b, c, d, e, f, g, h, i) ──
    cycloid_points = []

    # Point 'a' — bottom of circle (on baseline)
    cycloid_points.append({"x": circle_points[0]["x"], "y": circle_points[0]["y"], "label": "a"})

    # Points b, c, d (from O1, O2, O3 — left side: x = center_x - dx)
    for idx, label in [(1, "b"), (2, "c"), (3, "d")]:
        if idx < len(centers):
            target_y = circle_points[idx]["y"]
            dy_sq = (target_y - centers[idx]["y"]) ** 2
            r_sq = radius ** 2
            if r_sq >= dy_sq:
                dx = math.sqrt(r_sq - dy_sq)
                px = centers[idx]["x"] - dx
                cycloid_points.append({"x": px, "y": target_y, "label": label})

    # Point 'e' — top of circle from O4
    cycloid_points.append({
        "x": centers[4]["x"],
        "y": centers[4]["y"] - radius,
        "label": "e",
    })

    # Points f, g, h (from O5, O6, O7 — right side: x = center_x + dx)
    for idx, label in [(5, "f"), (6, "g"), (7, "h")]:
        if idx < len(centers):
            target_y = circle_points[idx]["y"]
            dy_sq = (target_y - centers[idx]["y"]) ** 2
            r_sq = radius ** 2
            if r_sq >= dy_sq:
                dx = math.sqrt(r_sq - dy_sq)
                px = centers[idx]["x"] + dx
                cycloid_points.append({"x": px, "y": target_y, "label": label})

    # Point 'i' — bottom of circle from O8
    cycloid_points.append({
        "x": centers[8]["x"],
        "y": centers[8]["y"] + radius,
        "label": "i",
    })

    # ── Step descriptions ──
    step_texts = [
        "Step 1: Draw a circle of given diameter and mark the center as O.",
        "Step 2: Divide the circle into 8 equal parts and name each division (1-8) clockwise from bottom.",
        "Step 3: Draw a baseline from bottom point (1) for length = circumference of the circle.",
        "Step 4: Divide baseline into 8 equal parts. Draw vertical line at end point with height = diameter.",
        "Step 5: Draw horizontal lines from upper circle points (1-4) parallel to baseline.",
        "Step 6: Continue horizontal lines from lower circle points (5-8).",
        "Step 7: Draw vertical lines from baseline divisions. Mark center-line intersections as O1-O8.",
        "Step 8: From centers O, O1, O2, draw arcs to mark cycloid points a, b, c, d.",
        "Step 9: From centers O4-O7, draw arcs to mark points e, f, g, h, i.",
        "Step 10: Join all points with a smooth curve to complete the cycloid.",
    ]

    all_steps: list[StepInstruction] = []

    for step_num in range(1, 11):
        elements: list = []

        # ── Step 1: Circle + center O ──
        if step_num >= 1:
            elements.append(ArcElement(
                center_x=start_x, center_y=start_y - radius,
                radius=radius, start_angle=0, end_angle=360,
            ))
            elements.append(PointElement(x=start_x, y=start_y - radius, label="O"))

        # ── Step 2: Circle division points ──
        if step_num >= 2:
            for i, cp in enumerate(circle_points):
                elements.append(PointElement(x=cp["x"], y=cp["y"], label=str(i + 1)))

        # ── Step 3: Baseline ──
        if step_num >= 3:
            elements.append(LineElement(
                x1=start_x, y1=start_y,
                x2=start_x + circumference, y2=start_y,
                style="visible",
            ))
            elements.append(LabelElement(
                x=start_x + circumference / 2 - 80, y=start_y + 20,
                text=f"Baseline (πd = {circumference:.1f}mm)",
            ))

        # ── Step 4: Baseline divisions + end vertical ──
        if step_num >= 4:
            for i, bp in enumerate(baseline_points):
                elements.append(PointElement(
                    x=bp["x"], y=bp["y"],
                    label="1" if i == 0 else f"{i}'",
                ))
            # Vertical line at end
            elements.append(LineElement(
                x1=baseline_points[8]["x"], y1=baseline_points[8]["y"],
                x2=baseline_points[8]["x"], y2=baseline_points[8]["y"] - diameter,
                style="construction",
            ))
            elements.append(LabelElement(
                x=baseline_points[8]["x"] + 5,
                y=baseline_points[8]["y"] - diameter,
                text="8'",
            ))

        # ── Step 5: Horizontal lines from upper circle points (0-3) ──
        if step_num >= 5:
            for i in range(4):
                elements.append(LineElement(
                    x1=circle_points[i]["x"], y1=circle_points[i]["y"],
                    x2=baseline_points[8]["x"], y2=circle_points[i]["y"],
                    style="construction",
                ))

        # ── Step 6: Horizontal lines from lower circle points (4-7) ──
        if step_num >= 6:
            for i in range(4, 8):
                elements.append(LineElement(
                    x1=circle_points[i]["x"], y1=circle_points[i]["y"],
                    x2=baseline_points[8]["x"], y2=circle_points[i]["y"],
                    style="construction",
                ))

        # ── Step 7: Vertical lines + centers O1-O8 ──
        if step_num >= 7:
            for i in range(1, 9):
                x = baseline_points[i]["x"]
                elements.append(LineElement(
                    x1=x, y1=start_y,
                    x2=x, y2=start_y - diameter,
                    style="construction",
                ))
                elements.append(PointElement(
                    x=centers[i]["x"], y=centers[i]["y"],
                    label=f"O{i}",
                ))

        # ── Step 8: Arcs from O, O1, O2, O3 → points a, b, c, d ──
        if step_num >= 8:
            # Point a (already on circle)
            elements.append(PointElement(
                x=cycloid_points[0]["x"], y=cycloid_points[0]["y"],
                label="a",
            ))

            # Points b, c, d with arcs
            for pt_idx, center_idx in [(1, 1), (2, 2), (3, 3)]:
                if pt_idx < len(cycloid_points):
                    pt = cycloid_points[pt_idx]
                    c = centers[center_idx]
                    angle = math.atan2(pt["y"] - c["y"], pt["x"] - c["x"])
                    elements.append(ArcElement(
                        center_x=c["x"], center_y=c["y"],
                        radius=radius,
                        start_angle=math.degrees(angle) - 30,
                        end_angle=math.degrees(angle) + 30,
                    ))
                    elements.append(PointElement(
                        x=pt["x"], y=pt["y"], label=pt["label"],
                    ))

        # ── Step 9: Arcs from O4-O8 → points e, f, g, h, i ──
        if step_num >= 9:
            # Point e (top, from O4)
            e_pt = cycloid_points[4]
            elements.append(ArcElement(
                center_x=centers[4]["x"], center_y=centers[4]["y"],
                radius=radius,
                start_angle=-90 - 30, end_angle=-90 + 30,
            ))
            elements.append(PointElement(x=e_pt["x"], y=e_pt["y"], label="e"))

            # Points f, g, h (from O5, O6, O7)
            for pt_idx, center_idx in [(5, 5), (6, 6), (7, 7)]:
                if pt_idx < len(cycloid_points):
                    pt = cycloid_points[pt_idx]
                    c = centers[center_idx]
                    angle = math.atan2(pt["y"] - c["y"], pt["x"] - c["x"])
                    elements.append(ArcElement(
                        center_x=c["x"], center_y=c["y"],
                        radius=radius,
                        start_angle=math.degrees(angle) - 30,
                        end_angle=math.degrees(angle) + 30,
                    ))
                    elements.append(PointElement(
                        x=pt["x"], y=pt["y"], label=pt["label"],
                    ))

            # Point i (bottom, from O8)
            i_pt = cycloid_points[-1]
            elements.append(ArcElement(
                center_x=centers[8]["x"], center_y=centers[8]["y"],
                radius=radius,
                start_angle=90 - 30, end_angle=90 + 30,
            ))
            elements.append(PointElement(x=i_pt["x"], y=i_pt["y"], label="i"))

        # ── Step 10: Smooth curve through all cycloid points ──
        if step_num >= 10:
            curve_pts = [{"x": p["x"], "y": p["y"]} for p in cycloid_points]
            elements.append(PolygonElement(points=curve_pts, style="visible", closed=False))
            elements.append(LabelElement(
                x=(cycloid_points[0]["x"] + cycloid_points[-1]["x"]) / 2 - 50,
                y=(cycloid_points[0]["y"] + cycloid_points[4]["y"]) / 2 - 20,
                text="Cycloid Curve (Complete)",
                font_size=14,
            ))

        all_steps.append(StepInstruction(
            step_number=step_num,
            title=f"Step {step_num}",
            description=step_texts[step_num - 1],
            elements=elements,
        ))

    return CurveResponse(
        total_steps=10,
        steps=all_steps,
        metadata=CurveMetadata(
            curve_type="cycloid",
            parameters={
                "diameter": diameter,
                "radius": radius,
                "circumference": round(circumference, 2),
            },
        ),
    )
