"""
Render instruction builder.

Translates computed geometry into the JSON render instruction format
that the frontend canvas renderer interprets. Each method appends
RenderElement dicts to an internal list, which can then be serialized
into StepInstruction responses.

This module is the bridge between the geometry engine (pure math)
and the API response (drawing primitives).
"""

from __future__ import annotations

from app.engine.config import DrawingConfig
from app.engine.geometry import Point


class RenderBuilder:
    """
    Builds render instruction elements for a single step.

    Usage:
        builder = RenderBuilder(config)
        builder.add_xy_line()
        builder.add_line(x1, y1, x2, y2, style="visible")
        step = builder.build_step(1, "Title", "Description")
        builder.reset()
    """

    def __init__(self, config: DrawingConfig) -> None:
        self.config = config
        self._elements: list[dict] = []

    def reset(self) -> None:
        """Clear all elements for the next step."""
        self._elements = []

    @property
    def elements(self) -> list[dict]:
        """Current elements list (read-only copy)."""
        return list(self._elements)

    # ----------------------------------------------------------
    # XY Line (core.js:395-421)
    # ----------------------------------------------------------

    def add_xy_line(self) -> None:
        """
        Add the XY reference line with labels and arrows.

        Port of drawXYLine() from core.js:395-421.
        Draws a horizontal line with 'X' and 'Y' labels at endpoints
        and arrow indicators.
        """
        cfg = self.config
        start_x = cfg.xy_line_start_x
        end_x = start_x + cfg.xy_line_length
        y = cfg.xy_line_y

        # Main XY line (core.js:405-408)
        self._elements.append({
            "type": "line",
            "x1": start_x,
            "y1": y,
            "x2": end_x,
            "y2": y,
            "style": "visible",
        })

        # Labels (core.js:411-414)
        self._elements.append({
            "type": "label",
            "x": start_x - 15,
            "y": y + 5,
            "text": "X",
            "font_size": cfg.label_font_size,
        })
        self._elements.append({
            "type": "label",
            "x": end_x + 10,
            "y": y + 5,
            "text": "Y",
            "font_size": cfg.label_font_size,
        })

        # Arrow indicators (core.js:417-418)
        self._elements.append({
            "type": "arrow",
            "from_x": start_x,
            "from_y": y,
            "to_x": start_x - 10,
            "to_y": y,
        })
        self._elements.append({
            "type": "arrow",
            "from_x": end_x,
            "from_y": y,
            "to_x": end_x + 10,
            "to_y": y,
        })

    # ----------------------------------------------------------
    # Line (core.js:437-460)
    # ----------------------------------------------------------

    def add_line(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        style: str = "visible",
    ) -> None:
        """
        Add a line element.

        Port of drawLine() from core.js:437-460.
        Style can be 'visible', 'hidden', or 'construction'.
        """
        self._elements.append({
            "type": "line",
            "x1": x1,
            "y1": y1,
            "x2": x2,
            "y2": y2,
            "style": style,
        })

    # ----------------------------------------------------------
    # Point (core.js:462-475)
    # ----------------------------------------------------------

    def add_point(
        self,
        x: float,
        y: float,
        label: str = "",
        label_offset_x: float = 5.0,
        label_offset_y: float = -5.0,
    ) -> None:
        """
        Add a point with optional label.

        Port of drawPoint() from core.js:462-475.
        Default label offset is +5x, -5y (above-right).
        """
        self._elements.append({
            "type": "point",
            "x": x,
            "y": y,
            "label": "",
            "radius": 2.0,
        })
        if label:
            self._elements.append({
                "type": "label",
                "x": x + label_offset_x,
                "y": y + label_offset_y,
                "text": label,
                "font_size": self.config.label_font_size,
            })

    # ----------------------------------------------------------
    # Polygon
    # ----------------------------------------------------------

    def add_polygon(
        self,
        points: list[Point],
        style: str = "visible",
        closed: bool = True,
    ) -> None:
        """Add a polygon element from a list of Points."""
        self._elements.append({
            "type": "polygon",
            "points": [{"x": p.x, "y": p.y} for p in points],
            "style": style,
            "closed": closed,
        })

    # ----------------------------------------------------------
    # Arc (core.js:499-510)
    # ----------------------------------------------------------

    def add_arc(
        self,
        center_x: float,
        center_y: float,
        radius: float,
        start_angle_deg: float,
        end_angle_deg: float,
    ) -> None:
        """
        Add an arc element.

        Port of drawAngleArc() from core.js:499-510.
        Angles are in degrees.
        """
        self._elements.append({
            "type": "arc",
            "center_x": center_x,
            "center_y": center_y,
            "radius": radius,
            "start_angle": start_angle_deg,
            "end_angle": end_angle_deg,
        })

    # ----------------------------------------------------------
    # Arrow (core.js:423-435)
    # ----------------------------------------------------------

    def add_arrow(
        self,
        from_x: float,
        from_y: float,
        to_x: float,
        to_y: float,
    ) -> None:
        """
        Add an arrow head element.

        Port of drawArrow() from core.js:423-435.
        """
        self._elements.append({
            "type": "arrow",
            "from_x": from_x,
            "from_y": from_y,
            "to_x": to_x,
            "to_y": to_y,
        })

    # ----------------------------------------------------------
    # Angle Indicator (core.js:512-525)
    # ----------------------------------------------------------

    def add_angle_indicator(self, edge_angle: float) -> None:
        """
        Add angle indicator text.

        Port of drawAngleIndicator() from core.js:512-525.
        Shows the edge angle β in the top-right area.
        """
        cfg = self.config
        note_x = cfg.xy_line_start_x + cfg.xy_line_length + 20
        note_y = cfg.xy_line_y + 30

        self._elements.append({
            "type": "label",
            "x": note_x,
            "y": note_y,
            "text": f"Edge angle β = {edge_angle}°",
            "font_size": cfg.label_font_size,
        })
        self._elements.append({
            "type": "label",
            "x": note_x,
            "y": note_y + 15,
            "text": "(Angle between base edge and VP)",
            "font_size": cfg.label_font_size,
        })

    # ----------------------------------------------------------
    # Build Step
    # ----------------------------------------------------------

    def build_step(
        self,
        step_number: int,
        title: str,
        description: str,
    ) -> dict:
        """
        Build a StepInstruction dict from the accumulated elements.

        Returns a dict matching the StepInstruction Pydantic model.
        """
        return {
            "step_number": step_number,
            "title": title,
            "description": description,
            "elements": list(self._elements),
        }
