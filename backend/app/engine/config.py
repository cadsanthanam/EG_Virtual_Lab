"""
Drawing configuration for the geometry engine.

Direct port of the config object from core.js:36-50.
All visual properties (colors, line widths, fonts) are defined here.
Canvas-dependent values (xy_line_y, xy_line_start_x) are computed at
request time based on the provided canvas dimensions.
"""

from dataclasses import dataclass, field


@dataclass
class DrawingConfig:
    """
    Drawing configuration for projection rendering.

    Port of core.js:36-50 config object. Canvas-dependent values are
    computed by setup_canvas() based on the request's canvas dimensions.
    """

    # XY line layout
    xy_line_length: float = 200.0
    xy_line_y: float = 0.0         # Set by setup_canvas()
    xy_line_start_x: float = 0.0   # Set by setup_canvas()
    scale: float = 1.0

    # Line widths (core.js:41-43)
    visible_line_width: float = 1.5
    hidden_line_width: float = 1.0
    construction_line_width: float = 0.5

    # Colors (core.js:44-49)
    visible_color: str = "#0f172a"
    hidden_color: str = "#64748b"
    construction_color: str = "#cbd5e1"
    xy_line_color: str = "#1e293b"
    label_color: str = "#0f172a"

    # Font (core.js:48)
    label_font_size: float = 12.0

    # Canvas dimensions (set per request)
    canvas_width: float = 1200.0
    canvas_height: float = 700.0

    def setup_canvas(self, canvas_width: float, canvas_height: float) -> None:
        """
        Compute canvas-dependent layout values.

        Port of setupCanvas() from core.js:62-73.
        Calculates the XY line position based on canvas center.
        """
        self.canvas_width = canvas_width
        self.canvas_height = canvas_height
        self.xy_line_y = canvas_height / 2.0
        self.xy_line_start_x = (canvas_width - self.xy_line_length) / 2.0

    def setup_xy_line_length(
        self,
        case_type: str,
        axis_length: float,
    ) -> None:
        """
        Compute dynamic XY line length based on case type.

        Port of logic from generateProjection() in core.js:310-315.
        Case C/D need more space for initial + final views side by side.
        """
        if case_type in ("C", "D"):
            self.xy_line_length = max(8.0 * axis_length, 500.0)
        else:
            self.xy_line_length = max(5.0 * axis_length, 300.0)
        self.xy_line_start_x = (self.canvas_width - self.xy_line_length) / 2.0
