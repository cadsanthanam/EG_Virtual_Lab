"""
Unit tests for geometry utility functions.

Validates the Python port against known inputs/outputs from the JS implementation.
Tests cover: trig, rotation, side count, convex hull, segment intersection,
point-in-polygon, and hull edge detection.
"""

import math
import pytest

from app.engine.geometry import (
    Point,
    build_hull_set,
    convex_hull,
    degrees_to_radians,
    get_sides_count,
    is_edge_on_hull,
    is_on_convex_hull,
    is_prism,
    is_pyramid,
    point_in_polygon,
    radians_to_degrees,
    rotate_point,
    segments_intersect,
)


# ============================================================
# Trigonometry
# ============================================================

class TestTrigonometry:
    def test_degrees_to_radians_0(self):
        assert degrees_to_radians(0) == pytest.approx(0.0)

    def test_degrees_to_radians_90(self):
        assert degrees_to_radians(90) == pytest.approx(math.pi / 2)

    def test_degrees_to_radians_180(self):
        assert degrees_to_radians(180) == pytest.approx(math.pi)

    def test_degrees_to_radians_360(self):
        assert degrees_to_radians(360) == pytest.approx(2 * math.pi)

    def test_radians_to_degrees_pi(self):
        assert radians_to_degrees(math.pi) == pytest.approx(180.0)

    def test_radians_to_degrees_half_pi(self):
        assert radians_to_degrees(math.pi / 2) == pytest.approx(90.0)

    def test_roundtrip(self):
        """degrees → radians → degrees should be identity."""
        for deg in [0, 30, 45, 60, 90, 120, 180, 270, 360]:
            assert radians_to_degrees(degrees_to_radians(deg)) == pytest.approx(deg)


# ============================================================
# Rotation
# ============================================================

class TestRotation:
    def test_rotate_90_degrees(self):
        """Rotating (1, 0) around origin by 90° should give (0, 1)."""
        result = rotate_point(1, 0, 0, 0, math.pi / 2)
        assert result.x == pytest.approx(0.0, abs=1e-10)
        assert result.y == pytest.approx(1.0, abs=1e-10)

    def test_rotate_180_degrees(self):
        """Rotating (1, 0) around origin by 180° should give (-1, 0)."""
        result = rotate_point(1, 0, 0, 0, math.pi)
        assert result.x == pytest.approx(-1.0, abs=1e-10)
        assert result.y == pytest.approx(0.0, abs=1e-10)

    def test_rotate_around_non_origin(self):
        """Rotating (3, 2) around (2, 2) by 90° should give (2, 3)."""
        result = rotate_point(3, 2, 2, 2, math.pi / 2)
        assert result.x == pytest.approx(2.0, abs=1e-10)
        assert result.y == pytest.approx(3.0, abs=1e-10)

    def test_rotate_360_identity(self):
        """Full rotation should return to original position."""
        result = rotate_point(5, 3, 1, 1, 2 * math.pi)
        assert result.x == pytest.approx(5.0, abs=1e-10)
        assert result.y == pytest.approx(3.0, abs=1e-10)


# ============================================================
# Side Count
# ============================================================

class TestSideCount:
    def test_triangular_prism(self):
        assert get_sides_count("triangular-prism") == 3

    def test_square_pyramid(self):
        assert get_sides_count("square-pyramid") == 4

    def test_pentagonal_prism(self):
        assert get_sides_count("pentagonal-prism") == 5

    def test_hexagonal_pyramid(self):
        assert get_sides_count("hexagonal-pyramid") == 6

    def test_unknown_raises(self):
        with pytest.raises(ValueError):
            get_sides_count("unknown-solid")

    def test_is_prism(self):
        assert is_prism("hexagonal-prism") is True
        assert is_prism("hexagonal-pyramid") is False

    def test_is_pyramid(self):
        assert is_pyramid("square-pyramid") is True
        assert is_pyramid("square-prism") is False


# ============================================================
# Convex Hull
# ============================================================

class TestConvexHull:
    def test_square(self):
        """Hull of a square should be the 4 corners."""
        pts = [Point(0, 0), Point(1, 0), Point(1, 1), Point(0, 1)]
        hull = convex_hull(pts)
        assert len(hull) == 4

    def test_triangle(self):
        """Hull of 3 non-collinear points is the triangle itself."""
        pts = [Point(0, 0), Point(4, 0), Point(2, 3)]
        hull = convex_hull(pts)
        assert len(hull) == 3

    def test_with_interior_point(self):
        """Interior points should NOT appear on hull."""
        pts = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4), Point(2, 2)]
        hull = convex_hull(pts)
        assert len(hull) == 4  # Interior point excluded

    def test_collinear_points(self):
        """Collinear points should give 2 hull vertices."""
        pts = [Point(0, 0), Point(1, 0), Point(2, 0)]
        hull = convex_hull(pts)
        assert len(hull) == 2

    def test_single_point(self):
        pts = [Point(5, 5)]
        hull = convex_hull(pts)
        assert len(hull) == 1

    def test_hexagon(self):
        """Regular hexagon should have 6 hull vertices."""
        pts = [
            Point(math.cos(math.pi * i / 3), math.sin(math.pi * i / 3))
            for i in range(6)
        ]
        hull = convex_hull(pts)
        assert len(hull) == 6


# ============================================================
# Hull Membership
# ============================================================

class TestHullMembership:
    def test_on_hull(self):
        pts = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4), Point(2, 2)]
        hull_set = build_hull_set(pts)
        assert is_on_convex_hull(Point(0, 0), hull_set) is True
        assert is_on_convex_hull(Point(4, 4), hull_set) is True

    def test_not_on_hull(self):
        pts = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4), Point(2, 2)]
        hull_set = build_hull_set(pts)
        assert is_on_convex_hull(Point(2, 2), hull_set) is False


class TestEdgeOnHull:
    def test_edge_on_hull(self):
        hull_pts = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4)]
        assert is_edge_on_hull(Point(0, 0), Point(4, 0), hull_pts) is True
        assert is_edge_on_hull(Point(4, 0), Point(0, 0), hull_pts) is True  # Reverse

    def test_edge_not_on_hull(self):
        hull_pts = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4)]
        # Diagonal is not a hull edge
        assert is_edge_on_hull(Point(0, 0), Point(4, 4), hull_pts) is False


# ============================================================
# Segment Intersection
# ============================================================

class TestSegmentIntersection:
    def test_crossing(self):
        """Two segments that cross in the middle."""
        assert segments_intersect(
            Point(0, 0), Point(4, 4),
            Point(0, 4), Point(4, 0),
        ) is True

    def test_parallel(self):
        """Parallel segments don't intersect."""
        assert segments_intersect(
            Point(0, 0), Point(4, 0),
            Point(0, 1), Point(4, 1),
        ) is False

    def test_shared_endpoint(self):
        """Segments sharing an endpoint should NOT register as crossing."""
        assert segments_intersect(
            Point(0, 0), Point(2, 2),
            Point(2, 2), Point(4, 0),
        ) is False

    def test_non_intersecting(self):
        """Disjoint segments."""
        assert segments_intersect(
            Point(0, 0), Point(1, 0),
            Point(2, 0), Point(3, 0),
        ) is False

    def test_t_intersection(self):
        """T-intersection (touching at endpoint of one) should NOT register."""
        assert segments_intersect(
            Point(0, 0), Point(4, 0),
            Point(2, -2), Point(2, 0),
        ) is False


# ============================================================
# Point-in-Polygon
# ============================================================

class TestPointInPolygon:
    def test_inside_square(self):
        square = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4)]
        assert point_in_polygon(Point(2, 2), square) is True

    def test_outside_square(self):
        square = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4)]
        assert point_in_polygon(Point(5, 5), square) is False

    def test_inside_triangle(self):
        tri = [Point(0, 0), Point(6, 0), Point(3, 6)]
        assert point_in_polygon(Point(3, 2), tri) is True

    def test_outside_triangle(self):
        tri = [Point(0, 0), Point(6, 0), Point(3, 6)]
        assert point_in_polygon(Point(0, 6), tri) is False

    def test_far_outside(self):
        square = [Point(0, 0), Point(4, 0), Point(4, 4), Point(0, 4)]
        assert point_in_polygon(Point(-10, -10), square) is False
