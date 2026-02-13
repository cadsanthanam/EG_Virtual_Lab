"""
Geometry utility functions.

Direct port of mathematical utilities from:
  - core.js:530-556 (trig, rotation, side count)
  - caseC.js:364-455 (convex hull, segment intersection, point-in-polygon)

All functions are pure — they take coordinates in, return coordinates out.
No side effects, no canvas operations, no state mutation.
"""

from __future__ import annotations

import math
from typing import NamedTuple


# ============================================================
# Data Types
# ============================================================

class Point(NamedTuple):
    """2D point with x, y coordinates."""
    x: float
    y: float


class LabeledPoint(NamedTuple):
    """2D point with label and optional metadata."""
    x: float
    y: float
    label: str


# ============================================================
# Trigonometric Utilities (core.js:530-536)
# ============================================================

def degrees_to_radians(degrees: float) -> float:
    """Convert degrees to radians. Port of core.js:530-532."""
    return degrees * math.pi / 180.0


def radians_to_degrees(radians: float) -> float:
    """Convert radians to degrees. Port of core.js:534-536."""
    return radians * 180.0 / math.pi


# ============================================================
# Point Rotation (core.js:538-548)
# ============================================================

def rotate_point(
    x: float,
    y: float,
    center_x: float,
    center_y: float,
    angle: float,
) -> Point:
    """
    Rotate a point around a center by a given angle (in radians).

    Direct port of rotatePoint() from core.js:538-548.

    Args:
        x, y: Point to rotate.
        center_x, center_y: Center of rotation.
        angle: Rotation angle in radians.

    Returns:
        Rotated point.
    """
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    dx = x - center_x
    dy = y - center_y
    return Point(
        x=center_x + dx * cos_a - dy * sin_a,
        y=center_y + dx * sin_a + dy * cos_a,
    )


# ============================================================
# Solid Utilities (core.js:550-556)
# ============================================================

def get_sides_count(solid_type: str) -> int:
    """
    Get the number of sides for a solid type.

    Direct port of getSidesCount() from core.js:550-556.

    Args:
        solid_type: Solid type string (e.g., 'hexagonal-prism').

    Returns:
        Number of sides (3, 4, 5, or 6).

    Raises:
        ValueError: If solid type is not recognized.
    """
    if "triangular" in solid_type:
        return 3
    if "square" in solid_type:
        return 4
    if "pentagonal" in solid_type:
        return 5
    if "hexagonal" in solid_type:
        return 6
    raise ValueError(f"Unknown solid type: {solid_type}")


def is_prism(solid_type: str) -> bool:
    """Check if solid type is a prism."""
    return "prism" in solid_type


def is_pyramid(solid_type: str) -> bool:
    """Check if solid type is a pyramid."""
    return "pyramid" in solid_type


# ============================================================
# Convex Hull — Andrew's Monotone Chain (caseC.js:364-401)
# ============================================================

def convex_hull(points: list[Point]) -> list[Point]:
    """
    Compute the convex hull of a set of 2D points.

    Uses Andrew's Monotone Chain algorithm.
    Direct port of convexHull() from caseC.js:367-401.

    Args:
        points: List of 2D points.

    Returns:
        Vertices of the convex hull in CCW order.
    """
    # Sort by x, then by y (caseC.js:370)
    pts = sorted(points, key=lambda p: (p.x, p.y))
    n = len(pts)
    if n <= 2:
        return list(pts)

    def cross(o: Point, a: Point, b: Point) -> float:
        """Cross product of vectors OA and OB. Port of caseC.js:374-376."""
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

    # Lower hull (caseC.js:378-385)
    lower: list[Point] = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)

    # Upper hull (caseC.js:387-394)
    upper: list[Point] = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)

    # Remove last point of each half (repeated) (caseC.js:396-398)
    lower.pop()
    upper.pop()

    return lower + upper


def build_hull_set(points: list[Point]) -> set[str]:
    """
    Build a set of coordinate keys for fast hull membership testing.

    Port of buildHullSet() from caseC.js:409-416.

    Args:
        points: List of all points (hull will be computed from these).

    Returns:
        Set of "x,y" strings (rounded to 2 decimal places) for hull vertices.
    """
    hull = convex_hull(points)
    return {f"{p.x:.2f},{p.y:.2f}" for p in hull}


def is_on_convex_hull(pt: Point, hull_set: set[str]) -> bool:
    """
    Check if a point is on the convex hull using a pre-built coordinate set.

    Port of isOnConvexHull() from caseC.js:403-407.

    Args:
        pt: Point to check.
        hull_set: Set from build_hull_set().

    Returns:
        True if point is on the hull.
    """
    key = f"{pt.x:.2f},{pt.y:.2f}"
    return key in hull_set


def is_edge_on_hull(
    p_a: Point,
    p_b: Point,
    hull_pts: list[Point],
    eps: float = 1.0,
) -> bool:
    """
    Check if an edge (p_a, p_b) lies on the convex hull boundary.

    Port of isEdgeOnHull() from caseC.js:662-675 and caseC.js:756-769.
    Checks if the edge endpoints match consecutive hull vertices (in either direction).

    Args:
        p_a, p_b: Edge endpoints.
        hull_pts: Ordered convex hull vertices.
        eps: Tolerance for floating-point comparison.

    Returns:
        True if edge is on hull boundary.
    """
    n = len(hull_pts)
    for k in range(n):
        m = (k + 1) % n
        hk, hm = hull_pts[k], hull_pts[m]
        # Check both directions: pA→pB matches hull[k]→hull[m] or reverse
        if (
            abs(p_a.x - hk.x) < eps and abs(p_a.y - hk.y) < eps
            and abs(p_b.x - hm.x) < eps and abs(p_b.y - hm.y) < eps
        ) or (
            abs(p_a.x - hm.x) < eps and abs(p_a.y - hm.y) < eps
            and abs(p_b.x - hk.x) < eps and abs(p_b.y - hk.y) < eps
        ):
            return True
    return False


# ============================================================
# Segment Intersection (caseC.js:422-440)
# ============================================================

def segments_intersect(
    p1: Point,
    p2: Point,
    p3: Point,
    p4: Point,
) -> bool:
    """
    Check if two line segments properly cross each other.

    Excludes shared endpoints / touching at endpoints.
    Direct port of segmentsIntersect() from caseC.js:424-440.

    Uses the cross-product orientation test:
    - Compute d1, d2 = orientations of p1, p2 w.r.t. segment p3-p4
    - Compute d3, d4 = orientations of p3, p4 w.r.t. segment p1-p2
    - Proper intersection iff endpoints are on strictly opposite sides

    Args:
        p1, p2: First segment endpoints.
        p3, p4: Second segment endpoints.

    Returns:
        True if segments properly cross.
    """
    EPS = 1e-9

    def cross_2d(o: Point, a: Point, b: Point) -> float:
        """Port of cross2D() from caseC.js:426-428."""
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

    d1 = cross_2d(p3, p4, p1)
    d2 = cross_2d(p3, p4, p2)
    d3 = cross_2d(p1, p2, p3)
    d4 = cross_2d(p1, p2, p4)

    # Proper intersection: endpoints on strictly opposite sides (caseC.js:435-438)
    if (
        ((d1 > EPS and d2 < -EPS) or (d1 < -EPS and d2 > EPS))
        and ((d3 > EPS and d4 < -EPS) or (d3 < -EPS and d4 > EPS))
    ):
        return True
    return False


# ============================================================
# Point-in-Polygon (caseC.js:442-455)
# ============================================================

def point_in_polygon(pt: Point, polygon: list[Point]) -> bool:
    """
    Check if a point is inside a polygon using ray-casting algorithm.

    Direct port of isPointInsidePolygon() from caseC.js:442-455.

    Args:
        pt: Point to test.
        polygon: List of polygon vertices (ordered).

    Returns:
        True if point is inside the polygon.
    """
    inside = False
    n = len(polygon)
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i].x, polygon[i].y
        xj, yj = polygon[j].x, polygon[j].y
        if ((yi > pt.y) != (yj > pt.y)) and (
            pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi
        ):
            inside = not inside
        j = i
    return inside
