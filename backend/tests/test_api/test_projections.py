"""
Integration tests for the Projections API.

Tests the full request → response flow for all case types.
Uses FastAPI's TestClient for synchronous testing.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# ============================================================
# Health Check
# ============================================================

class TestHealthCheck:
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


# ============================================================
# Case A — Axis Perpendicular to HP
# ============================================================

class TestCaseA:
    def test_hexagonal_prism(self):
        """Full Case A with hexagonal prism — 5 steps expected."""
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "hexagonal-prism",
            "case_type": "A",
            "base_edge": 40,
            "axis_length": 80,
            "edge_angle": 30,
            "canvas_width": 1200,
            "canvas_height": 700,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 5
        assert len(data["steps"]) == 5

        # Verify step structure
        for step in data["steps"]:
            assert "step_number" in step
            assert "title" in step
            assert "description" in step
            assert "elements" in step
            assert len(step["elements"]) > 0

        # Step 1 should have XY line elements
        step1_types = {e["type"] for e in data["steps"][0]["elements"]}
        assert "line" in step1_types
        assert "label" in step1_types

        # Step 5 should have the most elements (full drawing)
        assert len(data["steps"][4]["elements"]) > len(data["steps"][0]["elements"])

        # Verify metadata
        meta = data["metadata"]
        assert meta["solid_properties"]["sides"] == 6
        assert meta["solid_properties"]["is_prism"] is True
        assert meta["solid_properties"]["is_pyramid"] is False

    def test_square_pyramid(self):
        """Case A with square pyramid."""
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "square-pyramid",
            "case_type": "A",
            "base_edge": 50,
            "axis_length": 100,
            "edge_angle": 45,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 5
        assert data["metadata"]["solid_properties"]["is_pyramid"] is True

    def test_triangular_prism(self):
        """Case A with triangular prism."""
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "triangular-prism",
            "case_type": "A",
            "base_edge": 45,
            "axis_length": 90,
            "edge_angle": 0,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 5
        assert data["metadata"]["solid_properties"]["sides"] == 3

    def test_pentagonal_pyramid(self):
        """Case A with pentagonal pyramid."""
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "pentagonal-pyramid",
            "case_type": "A",
            "base_edge": 35,
            "axis_length": 70,
            "edge_angle": 60,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 5
        assert data["metadata"]["solid_properties"]["sides"] == 5


# ============================================================
# Case C — Axis Inclined to HP
# ============================================================

class TestCaseC:
    def test_hexagonal_prism(self):
        """Full Case C with hexagonal prism — 8 steps expected."""
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "hexagonal-prism",
            "case_type": "C",
            "base_edge": 40,
            "axis_length": 80,
            "edge_angle": 30,
            "axis_angle_hp": 45,
            "resting_on": "base-edge",
            "canvas_width": 1200,
            "canvas_height": 700,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 8
        assert len(data["steps"]) == 8

        # Verify computed beta
        assert data["metadata"]["computed_beta"] == 90.0

        # Steps 6-8 (Phase II) should have more elements
        assert len(data["steps"][7]["elements"]) > len(data["steps"][4]["elements"])

    def test_triangular_pyramid_base_corner(self):
        """Case C with triangular pyramid resting on base corner."""
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "triangular-pyramid",
            "case_type": "C",
            "base_edge": 50,
            "axis_length": 100,
            "edge_angle": 0,
            "axis_angle_hp": 30,
            "resting_on": "base-corner",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 8
        assert data["metadata"]["computed_beta"] == 270.0  # Triangle base-corner

    def test_square_prism_base_edge(self):
        """Case C with square prism resting on base edge."""
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "square-prism",
            "case_type": "C",
            "base_edge": 30,
            "axis_length": 60,
            "edge_angle": 0,
            "axis_angle_hp": 60,
            "resting_on": "base-edge",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 8
        assert data["metadata"]["computed_beta"] == 90.0


# ============================================================
# Case B & D — Stubs
# ============================================================

class TestStubs:
    def test_case_b_returns_valid(self):
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "hexagonal-prism",
            "case_type": "B",
            "base_edge": 40,
            "axis_length": 80,
            "edge_angle": 30,
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 5

    def test_case_d_returns_valid(self):
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "hexagonal-prism",
            "case_type": "D",
            "base_edge": 40,
            "axis_length": 80,
            "edge_angle": 30,
            "axis_angle_hp": 45,
            "axis_angle_vp": 30,
            "resting_on": "base-edge",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["total_steps"] == 8


# ============================================================
# Validation
# ============================================================

class TestValidation:
    def test_invalid_solid_type(self):
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "invalid-solid",
            "case_type": "A",
            "base_edge": 40,
            "axis_length": 80,
            "edge_angle": 30,
        })
        assert response.status_code == 422

    def test_negative_base_edge(self):
        response = client.post("/api/v1/projections/compute", json={
            "solid_type": "hexagonal-prism",
            "case_type": "A",
            "base_edge": -5,
            "axis_length": 80,
            "edge_angle": 30,
        })
        assert response.status_code == 422

    def test_missing_required_field(self):
        response = client.post("/api/v1/projections/compute", json={
            "case_type": "A",
            "base_edge": 40,
        })
        assert response.status_code == 422
