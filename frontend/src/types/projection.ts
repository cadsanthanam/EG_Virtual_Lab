/**
 * TypeScript types for the Projection Computation API.
 *
 * Exact mirror of backend Pydantic schemas in:
 *   backend/app/schemas/projection.py (lines 1-220)
 *
 * Every field name, type, and literal value matches the Python model.
 * The frontend has zero knowledge of projection geometry — it only
 * interprets these render instructions.
 */

// ============================================================
// Enums (as string union types)
// ============================================================

/** Maps to SolidType enum — projection.py:21-30 */
export type SolidType =
    | 'triangular-prism'
    | 'square-prism'
    | 'pentagonal-prism'
    | 'hexagonal-prism'
    | 'triangular-pyramid'
    | 'square-pyramid'
    | 'pentagonal-pyramid'
    | 'hexagonal-pyramid';

/** Maps to CaseType enum — projection.py:33-38 */
export type CaseType = 'A' | 'B' | 'C' | 'D';

/** Maps to RestingOn enum — projection.py:41-44 */
export type RestingOn = 'base-edge' | 'base-corner';

/** Style applied to lines and polygons — projection.py:123, 130 */
export type ElementStyle = 'visible' | 'hidden' | 'construction';

// ============================================================
// Render Element Types (discriminated union by 'type' field)
// ============================================================

/** Maps to LineElement — projection.py:116-123 */
export interface LineElement {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    style: ElementStyle;
}

/** Maps to PolygonElement — projection.py:126-131 */
export interface PolygonElement {
    type: 'polygon';
    points: Array<{ x: number; y: number }>;
    style: ElementStyle;
    closed: boolean;
}

/** Maps to PointElement — projection.py:134-140 */
export interface PointElement {
    type: 'point';
    x: number;
    y: number;
    label: string;
    radius: number;
}

/** Maps to LabelElement — projection.py:143-149 */
export interface LabelElement {
    type: 'label';
    x: number;
    y: number;
    text: string;
    font_size: number;
}

/** Maps to ArcElement — projection.py:152-159 */
export interface ArcElement {
    type: 'arc';
    center_x: number;
    center_y: number;
    radius: number;
    start_angle: number;
    end_angle: number;
}

/** Maps to ArrowElement — projection.py:162-168 */
export interface ArrowElement {
    type: 'arrow';
    from_x: number;
    from_y: number;
    to_x: number;
    to_y: number;
}

/** Discriminated union — projection.py:172 */
export type RenderElement =
    | LineElement
    | PolygonElement
    | PointElement
    | LabelElement
    | ArcElement
    | ArrowElement;

// ============================================================
// Response Types
// ============================================================

/** Maps to StepInstruction — projection.py:179-192 */
export interface StepInstruction {
    step_number: number;
    title: string;
    description: string;
    elements: RenderElement[];
}

/** Maps to SolidProperties — projection.py:195-200 */
export interface SolidProperties {
    sides: number;
    is_prism: boolean;
    is_pyramid: boolean;
    circumradius: number | null;
}

/** Maps to ProjectionMetadata — projection.py:203-207 */
export interface ProjectionMetadata {
    computed_beta: number | null;
    computed_xy_length: number;
    solid_properties: SolidProperties;
}

/** Maps to ProjectionResponse — projection.py:210-219 */
export interface ProjectionResponse {
    total_steps: number;
    steps: StepInstruction[];
    metadata: ProjectionMetadata;
}

// ============================================================
// Request Type
// ============================================================

/** Maps to ProjectionRequest — projection.py:51-109 */
export interface ProjectionRequest {
    solid_type: SolidType;
    case_type: CaseType;
    base_edge: number;
    axis_length: number;
    edge_angle: number;
    axis_angle_hp: number;
    axis_angle_vp: number;
    resting_on: RestingOn;
    canvas_width: number;
    canvas_height: number;
}

// ============================================================
// UI Configuration Constants
// ============================================================

/** Solid type options for the select dropdown — matches HTML lines 88-100 */
export const SOLID_OPTIONS: Array<{ value: SolidType; label: string }> = [
    { value: 'triangular-prism', label: 'Triangular Prism' },
    { value: 'square-prism', label: 'Square Prism' },
    { value: 'pentagonal-prism', label: 'Pentagonal Prism' },
    { value: 'hexagonal-prism', label: 'Hexagonal Prism' },
    { value: 'triangular-pyramid', label: 'Triangular Pyramid' },
    { value: 'square-pyramid', label: 'Square Pyramid' },
    { value: 'pentagonal-pyramid', label: 'Pentagonal Pyramid' },
    { value: 'hexagonal-pyramid', label: 'Hexagonal Pyramid' },
];

/** Case type options — matches HTML lines 106-112 */
export const CASE_OPTIONS: Array<{ value: CaseType; label: string }> = [
    { value: 'A', label: 'Case A — Axis ⊥ HP' },
    { value: 'B', label: 'Case B — Axis ⊥ VP' },
    { value: 'C', label: 'Case C — Axis Inclined to HP' },
    { value: 'D', label: 'Case D — Axis Inclined to VP' },
];

/** Resting condition options */
export const RESTING_OPTIONS: Array<{ value: RestingOn; label: string }> = [
    { value: 'base-edge', label: 'Resting on Base Edge' },
    { value: 'base-corner', label: 'Resting on Base Corner' },
];
