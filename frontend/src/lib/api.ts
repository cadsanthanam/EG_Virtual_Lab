/**
 * API Client — Thin fetch wrapper for the projection/curve backend.
 *
 * Communicates with:
 *   POST /api/v1/projections/compute
 *   POST /api/v1/curves/ellipse/compute
 *   POST /api/v1/curves/cycloid/compute
 *
 * The API returns pre-computed pixel coordinates and drawing instructions.
 * This client adds error handling and type safety; it performs zero geometry.
 */

import type { ProjectionRequest, ProjectionResponse, StepInstruction } from '@/types/projection';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Shared CurveResponse type (mirrors backend CurveResponse). */
export interface CurveResponse {
    total_steps: number;
    steps: StepInstruction[];
    metadata: {
        curve_type: string;
        parameters: Record<string, number | string>;
    };
}

/**
 * Generic fetch helper with error handling.
 */
async function apiPost<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let detail = `Server error: ${response.status}`;
        try {
            const errBody = await response.json();
            if (errBody.detail) {
                detail = typeof errBody.detail === 'string'
                    ? errBody.detail
                    : JSON.stringify(errBody.detail);
            }
        } catch {
            detail = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(detail);
    }

    return response.json() as Promise<T>;
}

/**
 * Compute projection by sending parameters to the backend engine.
 */
export async function computeProjection(
    request: ProjectionRequest,
): Promise<ProjectionResponse> {
    return apiPost<ProjectionResponse>(
        `${API_BASE}/api/v1/projections/compute`,
        request,
    );
}

/**
 * Compute ellipse (focus-directrix conic) construction.
 */
export async function computeEllipse(params: {
    focus_dist: number;
    eccentricity: string;
}): Promise<CurveResponse> {
    return apiPost<CurveResponse>(
        `${API_BASE}/api/v1/curves/ellipse/compute`,
        params,
    );
}

/**
 * Compute cycloid curve construction.
 */
export async function computeCycloid(params: {
    diameter: number;
}): Promise<CurveResponse> {
    return apiPost<CurveResponse>(
        `${API_BASE}/api/v1/curves/cycloid/compute`,
        params,
    );
}

/**
 * Health check — verifies the backend is reachable.
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) return false;
        const data = await response.json();
        return data.status === 'healthy';
    } catch {
        return false;
    }
}

