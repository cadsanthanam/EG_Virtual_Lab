/**
 * Lab State Store — Zustand store for projection lab state management.
 *
 * Ports the JS `state` object from core.js:13-32 to Zustand.
 * Provides all input parameters, projection result, step navigation,
 * and canvas controls (zoom/pan) with typed actions.
 */

import { create } from 'zustand';
import { computeProjection } from '@/lib/api';
import type {
    CaseType,
    ProjectionRequest,
    ProjectionResponse,
    RestingOn,
    SolidType,
} from '@/types/projection';

// ============================================================
// State Interface
// ============================================================

export interface LabState {
    // Input parameters — maps to core.js:13-23 state object
    solidType: SolidType | '';
    caseType: CaseType | '';
    baseEdge: number;
    axisLength: number;
    edgeAngle: number;
    axisAngleHP: number;
    axisAngleVP: number;
    restingOn: RestingOn;

    // Projection result
    projectionResponse: ProjectionResponse | null;
    currentStep: number;
    totalSteps: number;
    isLoading: boolean;
    error: string | null;

    // Canvas controls — maps to core.js:27-32
    zoom: number;
    panX: number;
    panY: number;

    // Actions
    setSolidType: (value: SolidType | '') => void;
    setCaseType: (value: CaseType | '') => void;
    setBaseEdge: (value: number) => void;
    setAxisLength: (value: number) => void;
    setEdgeAngle: (value: number) => void;
    setAxisAngleHP: (value: number) => void;
    setAxisAngleVP: (value: number) => void;
    setRestingOn: (value: RestingOn) => void;
    generate: (canvasWidth: number, canvasHeight: number) => Promise<void>;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetAll: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    setPan: (panX: number, panY: number) => void;
}

// ============================================================
// Store
// ============================================================

export const useLabStore = create<LabState>((set, get) => ({
    // Default values — match core.js:16-22
    solidType: '',
    caseType: '',
    baseEdge: 40,
    axisLength: 80,
    edgeAngle: 30,
    axisAngleHP: 45,
    axisAngleVP: 0,
    restingOn: 'base-edge',

    // Result state
    projectionResponse: null,
    currentStep: 0,
    totalSteps: 0,
    isLoading: false,
    error: null,

    // Canvas controls — match core.js:27-29
    zoom: 1,
    panX: 0,
    panY: 0,

    // ---- Input setters ----
    setSolidType: (value) => set({ solidType: value }),
    setCaseType: (value) => set({ caseType: value }),
    setBaseEdge: (value) => set({ baseEdge: value }),
    setAxisLength: (value) => set({ axisLength: value }),
    setEdgeAngle: (value) => set({ edgeAngle: value }),
    setAxisAngleHP: (value) => set({ axisAngleHP: value }),
    setAxisAngleVP: (value) => set({ axisAngleVP: value }),
    setRestingOn: (value) => set({ restingOn: value }),

    // ---- Generate projection ----
    generate: async (canvasWidth, canvasHeight) => {
        const state = get();

        if (!state.solidType || !state.caseType) {
            set({ error: 'Please select both a solid type and a case type.' });
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const request: ProjectionRequest = {
                solid_type: state.solidType,
                case_type: state.caseType,
                base_edge: state.baseEdge,
                axis_length: state.axisLength,
                edge_angle: state.edgeAngle,
                axis_angle_hp: state.axisAngleHP,
                axis_angle_vp: state.axisAngleVP,
                resting_on: state.restingOn,
                canvas_width: canvasWidth,
                canvas_height: canvasHeight,
            };

            const response = await computeProjection(request);

            set({
                projectionResponse: response,
                currentStep: 1,
                totalSteps: response.total_steps,
                isLoading: false,
                error: null,
            });
        } catch (err) {
            set({
                isLoading: false,
                error: err instanceof Error ? err.message : 'Unknown error occurred',
            });
        }
    },

    // ---- Step navigation ----
    nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
            set({ currentStep: currentStep + 1 });
        }
    },

    prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
        }
    },

    goToStep: (step) => {
        const { totalSteps } = get();
        if (step >= 1 && step <= totalSteps) {
            set({ currentStep: step });
        }
    },

    // ---- Reset ----
    resetAll: () => {
        set({
            solidType: '',
            caseType: '',
            baseEdge: 40,
            axisLength: 80,
            edgeAngle: 30,
            axisAngleHP: 45,
            axisAngleVP: 0,
            restingOn: 'base-edge',
            projectionResponse: null,
            currentStep: 0,
            totalSteps: 0,
            isLoading: false,
            error: null,
            zoom: 1,
            panX: 0,
            panY: 0,
        });
    },

    // ---- Canvas controls ----
    zoomIn: () => set((s) => ({ zoom: Math.min(s.zoom * 1.2, 5) })),
    zoomOut: () => set((s) => ({ zoom: Math.max(s.zoom / 1.2, 0.2) })),
    resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
    setPan: (panX, panY) => set({ panX, panY }),
}));
