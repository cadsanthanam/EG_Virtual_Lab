"""
Solid type definitions and base vertex generation.

Provides the Solid abstraction and the edge-walking polygon vertex
generation algorithm ported from caseA.js:80-101.
"""

from __future__ import annotations

import math

from app.engine.geometry import Point, degrees_to_radians, get_sides_count


class Solid:
    """
    Represents a geometric solid (prism or pyramid) for projection computation.

    Encapsulates the solid's properties and provides vertex generation.
    """

    def __init__(self, solid_type: str) -> None:
        self.solid_type = solid_type
        self.sides = get_sides_count(solid_type)
        self._is_prism = "prism" in solid_type
        self._is_pyramid = "pyramid" in solid_type

    @property
    def is_prism(self) -> bool:
        return self._is_prism

    @property
    def is_pyramid(self) -> bool:
        return self._is_pyramid

    def compute_base_vertices(
        self,
        start_x: float,
        start_y: float,
        base_edge: float,
        edge_angle_rad: float,
    ) -> tuple[list[Point], Point]:
        """
        Generate polygon vertices using the edge-walking algorithm.

        Direct port of the vertex generation logic from:
          - caseA.js:80-101 (drawCaseA_TopViewPrism)
          - caseA.js:184-205 (drawCaseA_TopViewPyramid)

        The algorithm:
        1. Start at (start_x, start_y) with direction = edge_angle_rad
        2. Walk along each edge for `base_edge` length
        3. At each vertex, turn by the exterior angle (π - interior_angle)
        4. Interior angle = 180° - 360°/sides

        Args:
            start_x, start_y: Starting vertex position.
            base_edge: Length of each base edge.
            edge_angle_rad: Initial edge direction in radians (from horizontal).

        Returns:
            Tuple of (vertices list, centroid point).
        """
        sides = self.sides

        # Interior angle of regular polygon (caseA.js:81, 186)
        interior_angle_rad = degrees_to_radians(180.0 - 360.0 / sides)

        # Generate vertices by edge-walking (caseA.js:92-101)
        points: list[Point] = [Point(start_x, start_y)]
        current_x = start_x
        current_y = start_y
        current_angle = edge_angle_rad

        for _ in range(1, sides):
            current_x += base_edge * math.cos(current_angle)
            current_y += base_edge * math.sin(current_angle)
            points.append(Point(current_x, current_y))
            current_angle += math.pi - interior_angle_rad  # External angle

        # Compute centroid (caseA.js:103-110)
        center_x = sum(p.x for p in points) / len(points)
        center_y = sum(p.y for p in points) / len(points)
        centroid = Point(center_x, center_y)

        return points, centroid
