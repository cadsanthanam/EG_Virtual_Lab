# COMPREHENSIVE SPECIFICATION FOR VIRTUAL LAB - PROJECTIONS OF STRAIGHT LINES

## OVERVIEW
This document provides detailed specifications for developing an interactive virtual lab to teach students how to draw projections of straight lines using first-angle projection method. The lab will guide students through step-by-step procedures for all cases of line orientations.

## UI/UX LAYOUT SPECIFICATIONS

### Screen Layout Structure
- **Left Panel (17% width)**: User input area containing:
  - Case selection dropdown
  - Dynamic input fields based on selected case
  - "Generate Projection" button
  - "Reset" button
  - "Step Through" mode toggle

- **Right Panel (83% width)**: Canvas and control area containing:
  - **Top Control Bar (5% height)**: Pan, Zoom In, Zoom Out, Fit to Screen, Next Step, Previous Step buttons
  - **Instruction Bar (10% height)**: Step-by-step instructions, concepts, and explanations for current step
  - **Drawing Canvas (85% height)**: Main animation/drawing area with grid and reference line (xy)

### Design Requirements
- Modern, clean UI/UX aesthetic
- Efficient space utilization
- Responsive controls
- Clear visual hierarchy
- Tooltips for all controls
- Color-coded elements (construction lines in light color, final projections in dark/bold)

## FIRST-ANGLE PROJECTION CONVENTION
- **Top View (TV)**: Always drawn BELOW the xy reference line
- **Front View (FV)**: Always drawn ABOVE the xy reference line
- **Reference Line (xy)**: Horizontal line drawn approximately at vertical center of canvas
- **Notation**: 
  - Top view points: lowercase letters (a, b, c, etc.)
  - Front view points: lowercase letters with SINGLE prime (a', b', c', etc.)
  - Intermediate positions: subscripts (a₁, b₁, a₁', b₁', etc.)
  - **STRICT POLICY**: 
    - NO double primes (a'', b'') - use only single prime for front view
    - NO mixing prime and subscript order - always: letter, subscript, then prime (e.g., a₁' not a'₁)
    - Projectors are unnamed (no labels like p₁, p₂)
    - Construction points use subscript 1, 2, 3... (e.g., b₁, b₂, b₃)
    - Final points have no subscript (a, b for top view; a', b' for front view)

## FUNDAMENTAL CONCEPTS

### 1. STRAIGHT LINE BASICS
- A straight line is defined by two endpoints (typically named A and B)
- Line properties:
  - **True Length (TL)**: Actual length of the line in 3D space
  - **Projected Length**: Length of projection on HP or VP (always ≤ TL)
  - **Inclination angles**: Angles with HP (θ) and VP (φ)
  - **Distance from planes**: Distance of line points from HP and VP

### 2. PROJECTION PRINCIPLES

**KEY RULE 1A**: When a line is PARALLEL to HP:
- Top view shows TRUE LENGTH
- Front view is parallel to xy line

**KEY RULE 1B**: When a line is PARALLEL to VP:
- Front view shows TRUE LENGTH
- Top view is parallel to xy line

**KEY RULE 1C**: When a line is PARALLEL to BOTH HP and VP:
- Both top view and front view show TRUE LENGTH
- Both projections are parallel to xy line
- The line is parallel to the xy direction in 3D space

**KEY RULE 2**: When a line is PERPENDICULAR to a plane:
- Its projection on that plane appears as a POINT
- The projection on the other plane shows TRUE LENGTH

**KEY RULE 3**: TRUE vs APPARENT INCLINATIONS:
- **True inclination with HP (θ)** is visible ONLY when the line is parallel to VP (front view shows true length and angle θ to xy)
- **True inclination with VP (φ)** is visible ONLY when the line is parallel to HP (top view shows true length and angle φ to xy)
- When a line is inclined to BOTH planes, the angles shown in projections are **APPARENT inclinations** (α in front view, β in top view), which are always less than the true inclinations
- Projection shows FORESHORTENED length when line is inclined to that plane

### 3. TRACES OF LINES
**Horizontal Trace (HT)**: Point where the line (or its extension) meets HP
- HT lies on the top view
- Front view of HT lies on xy line

**Vertical Trace (VT)**: Point where the line (or its extension) meets VP
- VT lies on the front view  
- Top view of VT lies on xy line

**Important**: 
- Lines parallel to a plane do NOT have a trace on that plane
- Lines in opposite quadrants have specific trace relationships

## CLASSIFICATION OF STRAIGHT LINES

### CASE 1: Line Parallel to BOTH HP and VP
**Characteristics**:
- All points equidistant from HP
- All points equidistant from VP
- Both projections show TRUE LENGTH
- Both projections parallel to xy line
- **Important**: Being parallel to BOTH HP and VP means the line is parallel to the xy direction in 3D space. This is a specific orientation, not "any direction parallel to planes."

### CASE 2A: Line Perpendicular to HP, Parallel to VP
**Characteristics**:
- Top view: Point (all points coincide)
- Front view: TRUE LENGTH, perpendicular to xy

### CASE 2B: Line Perpendicular to VP, Parallel to HP
**Characteristics**:
- Front view: Point (all points coincide)
- Top view: TRUE LENGTH, perpendicular to xy

### CASE 3A: Line Inclined to HP, Parallel to VP
**Characteristics**:
- Front view: TRUE LENGTH, inclined at angle θ to xy
- Top view: Parallel to xy, foreshortened length

### CASE 3B: Line Inclined to VP, Parallel to HP
**Characteristics**:
- Top view: TRUE LENGTH, inclined at angle φ to xy
- Front view: Parallel to xy, foreshortened length

### CASE 4: Line Inclined to BOTH HP and VP (Oblique Line)
**Characteristics**:
- Both projections show foreshortened lengths
- Neither projection parallel to xy
- Requires two-step construction method
- Has both HT and VT (unless line is parallel to either plane)

### CASE 5: Line on Profile Plane
**Characteristics**:
- Both projections perpendicular to xy
- Inclinations to HP and VP are complementary (θ + φ = 90°)
- Requires trapezoidal method for true length

## NUMERICAL TOLERANCES AND IMPLEMENTATION REQUIREMENTS

### Tolerance Specifications:
**CRITICAL**: All geometric comparisons and validations must use defined tolerances to prevent floating-point precision errors.

**Point Coincidence Tolerance**:
- Two points are considered coincident if distance between them ≤ 0.25 mm (or equivalent pixels)
- Use for checking if points lie on same projector
- Use for checking if point lies on a line

**Length Measurement Tolerance**:
- Display lengths rounded to 0.1 mm
- Validation checks: ±0.5 mm tolerance
- Example: If calculated length = 59.87 mm and expected = 60 mm, this passes validation

**Angle Measurement Tolerance**:
- Display angles rounded to 1 decimal place (e.g., 45.0°)
- Validation checks: ±0.5° tolerance
- Use for comparing calculated vs expected angles

**Line Parallelism Check**:
- Two lines considered parallel if angle between them < 0.5°
- Use for checking if projection is parallel to xy

**Line Perpendicularity Check**:
- Two lines considered perpendicular if |angle - 90°| < 0.5°
- Use for checking if projection is perpendicular to xy

### Coordinate System and Geometry Model:

**Single Source of Truth (SSOT)**:
```javascript
// Paper coordinate system
// Origin at canvas center
// xy line at y = 0
// Positive x to the right
// Positive y upward (for front view above xy)
// Negative y downward (for top view below xy)

const geometryModel = {
  scale: userZoom * baseScale, // mm to pixels conversion
  xyLineY: 0, // Always at y = 0 in paper coordinates
  // All calculations in mm, convert to px only for rendering
}
```

**Unit Conversion**:
- Input from user: mm
- Internal calculations: mm (maintains precision)
- Storage: mm
- Display to user: mm (rounded per tolerance specs)
- Canvas rendering: pixels (mm × scale)

### Trace Detection Safeguards:

**Parallel Plane Detection**:
```javascript
// Before attempting to find traces, check:
if (line.isParallelToHP()) {
  HT = null; // No horizontal trace exists
}
if (line.isParallelToVP()) {
  VT = null; // No vertical trace exists
}
```

**Trace at Infinity Handling**:
- If trace extends beyond canvas bounds (> 2× canvas size):
  - Display warning: "Trace lies beyond drawing area"
  - Offer auto-zoom option
  - Or display trace coordinates numerically

**Extension Line Limits**:
- Limit extension lines to 3× original line length
- If no intersection found within limit, report "Trace not found within bounds"

## DETAILED STEP-BY-STEP PROCEDURES

### STANDARD SETUP SUBROUTINE

This subroutine is referenced in multiple cases as "Standard setup" or "STEP 1-2: Standard..."

**Purpose**: Establish reference line and locate endpoint A with proper quadrant placement.

**Inputs Required**:
- h: Distance from HP (height of point above HP)
- d: Distance from VP (distance of point in front of VP)
- canvasWidth, canvasHeight: Drawing area dimensions

**Procedure**:

**STEP 1: Draw Reference Line (xy)**
```
1. Calculate xy line position:
   xyY = canvasHeight / 2 (vertical center)
   
2. Draw horizontal line from (margin, xyY) to (canvasWidth - margin, xyY)
   
3. Mark left end as 'x', right end as 'y'
   
4. Display: "Step 1: Drawing reference line xy for first-angle projection"
```

**STEP 2: Locate Endpoint A**
```
1. Calculate projector position using placement algorithm:
   xA = Math.max(margin + maxConstructionRadius,
                 Math.min(canvasWidth/4, 
                         canvasWidth - margin - maxConstructionRadius))
   where:
     margin = 50px (recommended)
     maxConstructionRadius = L_pixels (line length in pixels)

2. Draw vertical projector at x = xA

3. Determine 'a' position (top view):
   Quadrant logic based on d:
   - If d > 0 (in front of VP): y_a = xyY - d_pixels (below xy)
   - If d = 0 (on VP): y_a = xyY (on xy)
   - If d < 0 (behind VP): y_a = xyY + |d|_pixels (above xy, second quadrant)
   Mark point 'a' at (xA, y_a)

4. Determine 'a'' position (front view):
   - y_a' = xyY + h_pixels (above xy, since h is distance from HP)
   Mark point 'a'' at (xA, y_a')

5. Verify: Both a and a' lie on same vertical projector at x = xA

6. Display: "Step 2: Locating endpoint A - a is [d] mm from VP, a' is [h] mm from HP"
```

**Returns**:
- Coordinates of point a: (xA, y_a)
- Coordinates of point a': (xA, y_a')
- Projector x-position: xA

**Usage in Case Descriptions**:
When a case description states "Standard setup" or "STEP 1-2: Standard...", it means:
1. Execute Standard Setup Subroutine with given h and d values
2. Obtain a, a', and xA coordinates
3. Proceed with case-specific steps

---

---

## **CASE 1: LINE PARALLEL TO BOTH HP AND VP**

### Input Required:
1. Line length (L)
2. Distance from HP (h)
3. Distance from VP (d)
4. One endpoint specification (optional: distance along xy)

### Drawing Procedure:

**STEP 1: Draw Reference Line**
- Draw xy line horizontally across canvas center
- Length should be minimum 1.5 × line length
- Mark 'x' on left end, 'y' on right end
- Display: "Step 1: Drawing reference line xy for first-angle projection"

**STEP 2: Locate End A**
- Draw a vertical projector at convenient position (see note on placement algorithm below)
- Mark point 'a' at distance d below xy (this is top view of A - distance from VP)
- Mark point 'a'' at distance h above xy (this is front view of A - distance from HP)
- Ensure a and a' are on same projector
- Display: "Step 2: Locating endpoint A - a is d mm below xy (from VP), a' is h mm above xy (from HP)"
- Highlight: Projector line in dotted style

**Note on Projector Placement Algorithm**:
```
xA = Math.max(margin + L, Math.min(canvasWidth/4, canvasWidth - margin - L))
where margin = 50px (recommended), L = line length in pixels
```

**STEP 3: Draw Top View**
- From point a, draw horizontal line (parallel to xy) towards right
- Length = L (true length)
- Mark endpoint as 'b'
- Display: "Step 3: Drawing top view ab parallel to xy with true length L mm"
- Highlight: Line ab in bold

**STEP 4: Draw Front View**
- From point a', draw horizontal line (parallel to xy) towards right
- Length = L (true length)
- Mark endpoint as 'b''
- Ensure b and b' lie on same vertical projector
- Draw vertical projector through b and b'
- Display: "Step 4: Drawing front view a'b' parallel to xy with true length L mm"
- Highlight: Line a'b' in bold, projector through b in dotted

**STEP 5: Finalize**
- Darken lines ab and a'b'
- Add dimension arrows showing:
  - Distance of a from xy = d (distance from VP)
  - Distance of a' from xy = h (distance from HP)
  - Length of ab = L
  - Length of a'b' = L
- Display: "Final: Both projections show true length and are parallel to xy"

### Verification Points:
- ab = a'b' = L (true length)
- ab || xy (parallel)
- a'b' || xy (parallel)
- All points maintain constant distance from respective planes

---

## **CASE 2A: LINE PERPENDICULAR TO HP, PARALLEL TO VP**

### Input Required:
1. Line length (L)
2. Distance from VP (d)
3. Position of lower end (distance above HP = 0 or specify value)

### Drawing Procedure:

**STEP 1: Draw Reference Line**
- Draw xy line horizontally
- Display: "Step 1: Drawing reference line xy"

**STEP 2: Locate End B (on HP)**
- Draw vertical projector
- Mark 'b' at distance d below xy
- Mark 'b'' ON xy line (height from HP = 0)
- Display: "Step 2: Endpoint B on HP - b is d mm below xy, b' is on xy"

**STEP 3: Draw Top View**
- Since line perpendicular to HP, all points project to same point
- Mark 'a' coinciding with 'b'
- Display: "Step 3: Line perpendicular to HP projects as POINT in top view"
- Highlight: Point a(b) with small circle

**STEP 4: Draw Front View**
- From b' on xy, draw vertical line upward (perpendicular to xy)
- Length = L (true length)
- Mark endpoint as 'a''
- Distance of a' above xy = L
- Display: "Step 4: Front view shows TRUE LENGTH perpendicular to xy"
- Highlight: Line a'b' in bold

**STEP 5: Finalize**
- Darken a'b'
- Show dimensions
- Display: "Final: Top view is a point; front view shows true length perpendicular to xy"

### Key Concept Display:
"When line is perpendicular to a plane, its projection on that plane is a POINT"

---

## **CASE 2B: LINE PERPENDICULAR TO VP, PARALLEL TO HP**

### Input Required:
1. Line length (L)
2. Distance from HP (h)
3. Distance from VP (d) - can be 0 (on VP), positive (in front of VP), or negative (behind VP)

### Drawing Procedure:

**STEP 1: Draw Reference Line**
- Draw xy line horizontally
- Display: "Step 1: Drawing reference line xy"

**STEP 2: Locate End C Based on Quadrant**
- Draw vertical projector
- **Placement logic for 'c' (top view)**:
  - If d > 0 (in front of VP): Mark 'c' at distance d BELOW xy
  - If d = 0 (on VP): Mark 'c' ON xy line
  - If d < 0 (behind VP): Mark 'c' at distance |d| ABOVE xy (second quadrant)
- **Placement for 'c'' (front view)**: Mark 'c'' at distance h ABOVE xy
- Display: "Step 2: Endpoint C located - c is at d mm from xy (based on position relative to VP), c' is h mm above xy"

**STEP 3: Draw Front View**
- Since line perpendicular to VP, all points project to same point
- Mark 'd'' coinciding with 'c''
- Display: "Step 3: Line perpendicular to VP projects as POINT in front view"
- Highlight: Point c'(d') with small circle

**STEP 4: Draw Top View**
- From c, draw vertical line (perpendicular to xy)
  - If c is below xy: draw line further downward
  - If c is on xy: draw line downward
  - If c is above xy: draw line further upward (or downward to show full length)
- Length = L (true length)
- Mark endpoint as 'd'
- Display: "Step 4: Top view shows TRUE LENGTH perpendicular to xy"
- Highlight: Line cd in bold

**STEP 5: Finalize**
- Darken cd
- Show dimensions
- Display: "Final: Front view is a point; top view shows true length perpendicular to xy"

---

## **CASE 3A: LINE INCLINED TO HP, PARALLEL TO VP**

### Input Required:
1. Line length (L)
2. Inclination with HP (θ)
3. Distance from VP (d)
4. Distance of one endpoint from HP (h)

### Drawing Procedure:

**STEP 1: Draw Reference Line**
- Standard xy line

**STEP 2: Locate End A**
- Draw projector
- Mark 'a' at distance d below xy
- Mark 'a'' at distance h above xy

**STEP 3: Draw Front View (True Length)**
- From a', draw line at angle θ to xy
- Length = L (this is true length since parallel to VP)
- Mark endpoint as 'b''
- Display: "Step 3: Front view shows TRUE LENGTH at angle θ to xy (inclination with HP)"
- Highlight: Angle indicator showing θ

**STEP 4: Draw Top View (Parallel to xy)**
- From a, draw horizontal line parallel to xy
- Draw vertical projector from b'
- Mark intersection of horizontal line from 'a' and projector from 'b'' as point 'b'
- The length ab will be foreshortened (< L)
- Display: "Step 4: Top view parallel to xy with foreshortened length"
- Highlight: ab parallel to xy

**STEP 5: Verification and Annotation**
- Measure and display: ab < L (apparent length)
- a'b' = L (true length)
- Angle θ measured in front view
- **Trigonometric Validation**: 
  - Expected: ab = L × cos(θ)
  - Verify this relationship holds (tolerance ±0.5mm)
- Display: "Final: Front view shows true length and inclination; top view shows foreshortened length"
- Display formula: "Top view length = L × cos(θ)"

### Alternative Method (Rotation Method):

**STEP 3 Alternative: Two-Phase Construction**
- **Phase 1**: Assume line parallel to both planes
  - Draw ab₁ = L parallel to xy from 'a'
  - Draw a'b₁' = L parallel to xy from 'a''
  - Display: "Intermediate: Line assumed parallel to both planes"

- **Phase 2**: Rotate to required inclination
  - From a', draw line at angle θ to xy
  - With center a', radius a'b₁', draw arc
  - Arc intersects line at angle θ at point 'b''
  - Display: "Rotation: Line rotated to angle θ with HP"
  
**STEP 4**: Complete top view by projection from b'

---

## **CASE 3B: LINE INCLINED TO VP, PARALLEL TO HP**

### Input Required:
1. Line length (L)
2. Inclination with VP (φ)
3. Distance from HP (h)
4. Distance of one endpoint from VP (d)

### Drawing Procedure:

**STEP 1-2**: Standard reference line and locate endpoint A

**STEP 3: Draw Top View (True Length)**
- From a, draw line at angle φ to xy
- Length = L (true length since parallel to HP)
- Mark endpoint as 'b'
- Display: "Step 3: Top view shows TRUE LENGTH at angle φ to xy (inclination with VP)"

**STEP 4: Draw Front View (Parallel to xy)**
- From a', draw horizontal line parallel to xy
- Draw vertical projector from b
- Mark intersection as 'b''
- Length a'b' will be foreshortened
- Display: "Step 4: Front view parallel to xy with foreshortened length"

**STEP 5: Verification and Finalize**
- Measure and display: a'b' < L (apparent length)
- ab = L (true length)
- Angle φ measured in top view
- **Trigonometric Validation**:
  - Expected: a'b' = L × cos(φ)
  - Verify this relationship holds (tolerance ±0.5mm)
- Display: "Final: Top view shows true length and inclination; front view shows foreshortened length"
- Display formula: "Front view length = L × cos(φ)"

### Special Case: Line Crossing Quadrants
If one end is in first quadrant and other in second quadrant:

**Modified Input**: Specify point C on VP at height h₁ from HP, and distances AC and CB

**STEP 1**: Draw c on xy, c' at h₁ above xy

**STEP 2**: From c, draw line at angle φ on left side (second quadrant) for distance AC
- Mark 'a'
- Project to get 'a'' on parallel line through c'

**STEP 3**: Extend line from c on right side (first quadrant) for distance CB
- Mark 'b'
- Project to get 'b'' on parallel line through c'

**STEP 4**: Complete and finalize both quadrant projections

---

## **CASE 4: LINE INCLINED TO BOTH HP AND VP (OBLIQUE LINE)**

This is the most complex case requiring two-step construction.

### Input Required:
1. Line length (L)
2. Inclination with HP (θ)
3. Inclination with VP (φ)
4. Position of endpoint A (distance from HP = h, distance from VP = d)

### Fundamental Principle:
**Two-Step Rotation Method**:
- Step 1: Assume line inclined to HP, parallel to VP → Get length of top view
- Step 2: Assume line inclined to VP, parallel to HP → Get length of front view
- Step 3: Use both lengths to construct final position

### Drawing Procedure:

**PHASE I: PRELIMINARY CONSTRUCTION (Assumed Positions)**

**STEP 1: Draw Reference Line and Locate A**
- Standard xy and mark a, a'

**STEP 2: Assume Line Inclined to HP ONLY (Parallel to VP)**
- From a', draw line at angle θ to xy
- Length = L
- Mark point b₁'
- Display: "Intermediate Step: Line assumed inclined θ to HP, parallel to VP"
- Highlight: a'b₁' in light color/dashed

**STEP 3: Get Corresponding Top View Length**
- Draw horizontal line from a parallel to xy
- Drop projector from b₁'
- Mark intersection as b₁
- Measure length ab₁ (this is the length of final top view)
- Display: "Length of final top view = ab₁ = [value] mm"
- Store: TV_length = ab₁

**STEP 4: Assume Line Inclined to VP ONLY (Parallel to HP)**
- From a, draw line at angle φ to xy  
- Length = L
- Mark point b₂
- Display: "Intermediate Step: Line assumed inclined φ to VP, parallel to HP"
- Highlight: ab₂ in light color/dashed

**STEP 5: Get Corresponding Front View Length**
- Draw horizontal line from a' parallel to xy
- Drop projector from b₂
- Mark intersection as b₂'
- Measure length a'b₂' (this is the length of final front view)
- Display: "Length of final front view = a'b₂' = [value] mm"
- Store: FV_length = a'b₂'

**PHASE II: CONSTRUCT FINAL POSITION**

**STEP 6: Draw Locus Lines**
- Through b₁', draw horizontal line (locus of b' in front view)
- Through b₂, draw horizontal line (locus of b in top view)
- Display: "Step 6: Locus lines for final position of point B"
- Highlight: Locus lines in different color (e.g., light blue)

**Why Locus Lines are Horizontal**:
- In front view, b' moves on a horizontal locus because point B's height above HP (distance from HP) remains constant during rotation of the top view about point A
- In top view, b moves on a horizontal locus because point B's distance in front of VP remains constant during rotation of the front view about point A
- These constraints create the horizontal locus lines

**STEP 7: Locate Final Position of B in Front View**
- Center at a'
- Radius = FV_length (= a'b₂')
- Draw arc to intersect locus line through b₁'
- **Arc Intersection Disambiguation**: If arc intersects locus at two points, choose the intersection that:
  1. Lies to the right of A's projector (positive x direction), AND
  2. Keeps B in the first quadrant (or specified quadrant based on problem)
- Mark chosen intersection as 'b''
- Display: "Step 7: Locating b' using front view length"
- Animate: Arc drawing

**STEP 8: Locate Final Position of B in Top View**
- Center at a
- Radius = TV_length (= ab₁)
- Draw arc to intersect locus line through b₂
- **Arc Intersection Disambiguation**: If arc intersects locus at two points, choose the intersection that:
  1. Lies to the right of A's projector (positive x direction), AND
  2. Aligns with b' from Step 7 (same vertical projector)
- Mark chosen intersection as 'b'
- Verify: b and b' are on same projector
- Display: "Step 8: Locating b using top view length"
- Animate: Arc drawing

**STEP 9: Draw Final Projections**
- Join a and b for final top view
- Join a' and b' for final front view
- Display: "Step 9: Final projections of oblique line"
- Highlight: Final lines in bold

**STEP 10: Verify and Annotate**
- Verify projectors align
- Measure apparent angles:
  - α = angle of a'b' with xy (apparent angle with HP)
  - β = angle of ab with xy (apparent angle with VP)
- Display: "Final: Oblique line with apparent angles α and β"
- Note: α < θ (actual), β < φ (actual)

### Alternative Construction Notes:
**Construction Simplification**: 
- Steps 2-5 can be drawn simultaneously
- Use light construction lines
- Final step emphasizes actual projections

**Verification Points**:
- ab ≠ a'b' (both foreshortened)
- ab < L and a'b' < L
- True length can be found by rotation method
- Apparent angles α and β can be measured

---

## **SPECIAL CASE: LINE LYING ON PROFILE PLANE**

### Definition:
**Profile Plane**: A plane that is perpendicular to both HP and VP. A line lying in a profile plane has the following characteristics:
- Both projections (top view and front view) are perpendicular to xy
- The inclinations with HP and VP are complementary: θ + φ = 90°
- The profile plane appears as a line perpendicular to xy in both views

### Identification:
- When θ + φ = 90° (complementary angles)
- Both projections perpendicular to xy

### Input Required:
1. Line length (L)
2. Inclination with HP (θ) [automatically φ = 90° - θ]
3. Position of endpoint

### Drawing Procedure:

**STEP 1-2**: Standard setup, locate endpoint P

**STEP 3: Determine Top View Length**
- Assume line inclined θ to HP, parallel to VP
- From p', draw line at angle θ to xy, length L
- Project to get pq₁ (top view length when parallel to VP)
- Display: "Step 3: Determining top view length"

**STEP 4: Determine Front View Length**  
- Assume line inclined φ=(90°-θ) to VP, parallel to HP
- From p, draw line at angle φ to xy, length L
- Project to get p'q₁' (front view length when parallel to HP)
- Display: "Step 4: Determining front view length"

**STEP 5: Draw Final Projections PERPENDICULAR to xy**
- From p, draw vertical line (perpendicular to xy) downward
- Length = pq₁ (from step 3)
- Mark endpoint 'q'
- From p', draw vertical line (perpendicular to xy) upward
- Length = p'q₁' (from step 4)
- Mark endpoint 'q''
- Display: "Step 5: Final projections perpendicular to xy (profile plane)"

**STEP 6: Finalize**
- Both pq and p'q' perpendicular to xy
- Verify q and q' on same projector

---

## **TRACES OF STRAIGHT LINES**

### When to Determine Traces:
- Line inclined to both planes (has both HT and VT)
- Line inclined to one plane only (has one trace only)
- Lines parallel to a plane do NOT have trace on that plane

### Method 1: Direct Intersection Method

**To find HORIZONTAL TRACE (HT):**

**STEP 1: Extend Front View to xy**
- Extend front view line a'b' until it meets xy line
- Mark meeting point as h'
- Display: "Step 1: Extending front view to meet xy line"

**STEP 2: Project to Top View**
- From h', draw vertical projector downward
- Mark intersection with extended top view line as 'HT'
- Display: "Step 2: HT is where extended top view meets projector from h'"
- Highlight: HT in special color (e.g., red)

**To find VERTICAL TRACE (VT):**

**STEP 1: Extend Top View to xy**
- Extend top view line ab until it meets xy line
- Mark meeting point as v
- Display: "Step 1: Extending top view to meet xy line"

**STEP 2: Project to Front View**
- From v, draw vertical projector upward
- Mark intersection with extended front view line as 'VT'
- Display: "Step 2: VT is where extended front view meets projector from v"
- Highlight: VT in special color (e.g., blue)

### Method 2: Trapezoidal Method (for True Length and Inclinations)

This method is used when:
1. Both projections given, need to find true length and inclinations
2. Line lies on profile plane
3. Need to verify calculations

**Principle**: 
- Create trapezoids from projections
- Rotate trapezoids to show true length
- Intersection of true length with projection gives traces

### For finding TRUE LENGTH and INCLINATIONS from given projections:

**GIVEN**: Top view ab and front view a'b'

**STEP 1: Draw Perpendiculars from Front View**
- At a', draw perpendicular to a'b' (on same side as ab)
- At b', draw perpendicular to a'b' (on same side)
- Display: "Step 1: Perpendiculars from front view endpoints"

**STEP 2: Transfer Top View Distances**
- Measure distance of a from xy = x₁
- On perpendicular from a', mark point A₁ at distance x₁ from a'
- Measure distance of b from xy = x₂
- On perpendicular from b', mark point B₁ at distance x₂ from b'
- Display: "Step 2: Transferring distances from top view"

**STEP 3: Join to Get True Length**
- Join A₁ and B₁
- Length A₁B₁ = TRUE LENGTH of line
- Display: "Step 3: True length = A₁B₁ = [value] mm"
- Highlight: A₁B₁ in bold

**STEP 4: Find True Inclination with VP**
- Angle between A₁B₁ and a'b' = φ (true inclination with VP)
- Display: "Step 4: True inclination with VP = φ = [value]°"
- Show angle indicator

**STEP 5: Find VT**
- Extend A₁B₁ and a'b'
- Mark intersection as VT
- Display: "Step 5: Vertical Trace located"

**STEP 6: Draw Perpendiculars from Top View**
- At a, draw perpendicular to ab
- At b, draw perpendicular to ab

**STEP 7: Transfer Front View Distances**
- Measure distance of a' from xy = y₁
- On perpendicular from a, mark point A₂ at distance y₁ from a
- Measure distance of b' from xy = y₂
- On perpendicular from b, mark point B₂ at distance y₂ from b

**STEP 8: Verify True Length**
- Join A₂ and B₂
- Length A₂B₂ should equal A₁B₁ (verification)
- Display: "Step 8: Verification - A₂B₂ = A₁B₁ = [value] mm"

**STEP 9: Find True Inclination with HP**
- Angle between A₂B₂ and ab = θ (true inclination with HP)
- Display: "Step 9: True inclination with HP = θ = [value]°"

**STEP 10: Find HT**
- Extend A₂B₂ and ab
- Mark intersection as HT
- Display: "Step 10: Horizontal Trace located"

### Special Cases for Traces:

**Case: Endpoints in Opposite Quadrants**
- When endpoint A in first quadrant, endpoint B in third quadrant
- Draw perpendiculars in OPPOSITE directions
- At a', draw perpendicular upward; at b', draw perpendicular downward
- Continue with standard trapezoidal method

**Case: Line Perpendicular to xy (Profile Plane)**
- Both projections perpendicular to xy
- Trapezoidal method essential for finding true length
- HT and VT coincide at intersection of perpendiculars with xy

---

## **PROBLEMS WITH GIVEN TRACES**

### Problem Type: Given one trace and inclination, find projections

**GIVEN**: 
- Line length L
- Inclination θ with HP  
- Front view length (or top view length)
- VT position (20 mm below HP)
- One endpoint A at h mm above HP

### Solution Procedure:

**STEP 1-2**: Standard setup, mark a at d below xy, a' at h above xy

**STEP 3: Draw Given Front View**
- From a', draw line at angle θ to xy
- Length = given front view length
- Mark endpoint b'
- Display: "Step 3: Given front view drawn"

**STEP 4: Locate VT**
- Extend a'b' downward
- Mark VT at 20 mm below xy (on extended line)
- Display: "Step 4: Vertical Trace marked at given position"

**STEP 5: Use Trace to Find True Inclination**
- From VT, draw line at given inclination with VP (φ)
- This gives the true spatial orientation
- Display: "Step 5: True orientation from VT and angle φ"

**STEP 6: Draw Perpendiculars and Complete Construction**
- From a' and b', draw perpendiculars to a'b'
- Mark distances from xy on these perpendiculars
- Join to get true length line
- Display: "Step 6: Trapezoidal construction"

**STEP 7: Project to Get Final Top View**
- From intersection points, project downward
- Locate 'b' on projected line
- Join a and b
- Display: "Step 7: Final top view obtained"

**STEP 8: Find Remaining Trace (HT)**
- Use standard trace finding method
- Display: "Step 8: Horizontal Trace located"

---

## **LINE LYING ON AUXILIARY VERTICAL PLANE (AVP)**

**⚠️ RESTRICTION NOTE**: This procedure applies to a SPECIFIC case where:
1. The AVP is perpendicular to HP, AND
2. The line's inclination with HP (θ) is measurable in front view

This matches the IIT material Problem 4.18. For general AVP cases requiring auxiliary view construction, this should be moved to an "Auxiliary Views" module in future enhancement.

### Definition:
An AVP is a plane perpendicular to HP but inclined to VP at a specific angle (ψ)

### Applicability:
- Use this method ONLY when the line lies in an AVP that is perpendicular to HP
- The front view will show the true inclination with HP
- General AVP problems may require auxiliary projection planes

### Input Required:
1. Line length (L)
2. Inclination with HP (θ)
3. AVP inclination with VP (ψ)
4. Position of endpoint

### Drawing Procedure:

**STEP 1-2**: Standard setup

**STEP 3: Identify AVP Orientation**
- AVP appears as a line in top view, inclined at ψ to xy
- Display: "Step 3: AVP inclined ψ degrees to VP"

**STEP 4: Draw Front View**
- From a', draw line at angle θ to xy
- Length = L (true length since line in plane perpendicular to HP)
- Mark b'
- Project to get b₁ on line parallel to xy through a

**STEP 5: Draw Final Top View on AVP**
- From a, draw line at angle ψ to xy (this is the AVP line)
- With center a, radius ab₁, draw arc
- Arc intersects AVP line at b
- Join ab
- Display: "Step 5: Top view lies on AVP inclined at ψ"

**STEP 6: Complete Front View**
- Draw horizontal line through b₁'
- Project from b to intersect this line
- Mark as b'
- Join a'b'
- Display: "Step 6: Final front view obtained"

---

## **ROTATION METHOD FOR TRUE LENGTH**

When given projections ab and a'b', to find true length:

### Method 1: Rotate to Make Parallel to HP

**STEP 1: Rotate Top View to Make Parallel to xy**
- Keep 'a' fixed
- Rotate ab about a to make it parallel to xy
- New position: ab₁ parallel to xy
- Display: "Step 1: Rotating top view to be parallel to xy"
- Animate: Rotation arc

**STEP 2: Project for New Front View**
- Draw horizontal locus line through b' (locus during rotation)
- Project from b₁ upward
- Mark intersection as b₁'
- Join a'b₁'
- Display: "Step 2: New front view after rotation"

**STEP 3: Measure True Length**
- Length a'b₁' = TRUE LENGTH
- **Explanation**: Rotating the top view ab to be parallel to xy means the line is now parallel to VP (the line has no component perpendicular to VP). When a line is parallel to VP, the front view shows true length.
- Display: "True Length = a'b₁' = [value] mm"

**STEP 4: Measure True Inclination with HP**
- Angle between a'b₁' and xy = θ (true inclination with HP)
- Display: "True inclination with HP = θ = [value]°"

### Method 2: Rotate to Make Parallel to VP

**STEP 1: Rotate Front View to Make Parallel to xy**
- Keep a' fixed
- Rotate a'b' about a' to make it parallel to xy
- New position: a'b₂' parallel to xy

**STEP 2: Project for New Top View**
- Draw horizontal locus line through b
- Project from b₂' downward
- Mark intersection as b₂
- Join ab₂

**STEP 3: Measure True Length**
- Length ab₂ = TRUE LENGTH
- **Explanation**: Rotating the front view a'b' to be parallel to xy means the line is now parallel to HP (the line has no component perpendicular to HP). When a line is parallel to HP, the top view shows true length.
- Display: "True Length = ab₂ = [value] mm"

**STEP 4: Measure True Inclination with VP**
- Angle between ab₂ and xy = φ (true inclination with VP)

---

## ANIMATION AND INTERACTION SPECIFICATIONS

### Step-by-Step Animation Sequence:

**For Each Step:**
1. **Dim previous elements** to 30% opacity (except xy line and current relevant points)
2. **Highlight current step elements** in bright color
3. **Animate construction**:
   - Lines: Draw from start point to end point (duration: 1 second)
   - Arcs: Sweep from start angle to end angle (duration: 1.5 seconds)
   - Points: Fade in with pulse effect (duration: 0.5 seconds)
   - Projectors: Dashed line drawing upward/downward (duration: 0.8 seconds)
4. **Display instruction text** in instruction bar with current step highlighted
5. **Add labels** with fade-in effect
6. **Pause** for user to read/understand (auto-advance after 3 seconds, or manual next)

### Interactive Features:

1. **Step Navigation**:
   - Next Step: Advances to next construction step
   - Previous Step: Goes back to previous step
   - Jump to Step: Dropdown to select specific step
   - Auto-play: Automatically advances through all steps
   - Pause/Play: Controls auto-play

2. **Canvas Controls**:
   - Pan: Click and drag to move canvas
   - Zoom: Mouse wheel or +/- buttons
   - Fit to Screen: Automatically fits drawing to visible area
   - Reset View: Returns to original view

3. **Measurement Tools**:
   - Distance: Click two points to measure distance
   - Angle: Click three points to measure angle
   - Show/Hide Dimensions: Toggle dimension display
   - Show/Hide Construction Lines: Toggle construction line visibility

4. **Visual Aids**:
   - Grid: Toggle background grid
   - Snap to Grid: Enable/disable grid snapping
   - Highlight Current: Emphasize elements in current step
   - Color Coding:
     - Construction lines: Light gray (120, 120, 120)
     - Final projections: Dark blue/black (0, 0, 0)
     - Top view: Blue (0, 100, 200)
     - Front view: Red (200, 0, 0)
     - Projectors: Dashed gray
     - Locus lines: Light blue (100, 200, 255)
     - Arcs: Green (0, 150, 0)
     - Traces: Orange/Red (255, 100, 0)

5. **Labels and Annotations**:
   - Point labels: Small text near points
   - Dimension labels: Outside object with arrow leaders
   - Angle labels: Arc with angle value
   - Step labels: Number in circle for step sequence

### Drawing Style Specifications:

**Line Styles**:
- **Solid lines**: Final projections (lineWidth: 2)
- **Dashed lines**: Hidden edges/construction (lineWidth: 1, dash: [5, 5])
- **Dotted lines**: Projectors (lineWidth: 1, dash: [2, 3])
- **Dash-dot lines**: Center lines, axes (lineWidth: 1, dash: [10, 5, 2, 5])

**Point Styles**:
- **Endpoints**: Small filled circles (radius: 3)
- **Construction points**: Small open circles (radius: 2)
- **Traces**: Larger filled circles with different color (radius: 4)

**Text Styles**:
- **Labels**: Sans-serif, 12px, black
- **Dimensions**: Sans-serif, 11px, dark gray
- **Instructions**: Sans-serif, 14px, black, bold for keywords

---

## INPUT VALIDATION AND ERROR HANDLING

### Validation Rules:

**General**:
- Line length L > 0
- All distances ≥ 0
- Angles: 0° < θ < 90°, 0° < φ < 90°

**Case-Specific**:

**Case 1** (Parallel to both):
- No angle inputs required
- Distances must be positive

**Case 2** (Perpendicular to one):
- Only one distance from plane required
- Verify perpendicularity conditions

**Case 3** (Inclined to one):
- Angle must be in valid range
- Check single inclination input

**Case 4** (Oblique):
- Both angles required
- Verify θ + φ ≠ 90° (not profile plane)
- If θ + φ = 90°, switch to special case

**Trace Problems**:
- Trace positions must be valid
- Cannot have both traces on same side of xy

### Error Messages:

Display clear, user-friendly error messages:
- "Line length must be greater than 0"
- "Angle must be between 0° and 90°"
- "Sum of angles equals 90° - this is a profile plane case. Switching to special method."
- "Invalid trace position - must be on opposite side of endpoint"

### Edge Cases:

1. **Very small values**: Warn if dimensions < 10 mm (hard to visualize)
2. **Very large values**: Auto-scale if dimensions > canvas size
3. **Nearly perpendicular**: If angle < 5° or > 85°, show warning
4. **Coincident points**: Check for division by zero in calculations

---

## DATA STRUCTURE SPECIFICATIONS

### For Implementation:

```javascript
// Main data structure for a line problem
const lineProblem = {
  // Problem identification
  caseType: "CASE_1" | "CASE_2A" | "CASE_2B" | "CASE_3A" | "CASE_3B" | "CASE_4" | "CASE_5",
  
  // Input parameters
  input: {
    lineLength: Number,        // L in mm
    inclinationHP: Number,     // θ in degrees (if applicable)
    inclinationVP: Number,     // φ in degrees (if applicable)
    distanceFromHP: Number,    // h in mm
    distanceFromVP: Number,    // d in mm
    htPosition: Number,        // HT position (if given)
    vtPosition: Number,        // VT position (if given)
    frontViewLength: Number,   // If given instead of inclination
    topViewLength: Number,     // If given instead of inclination
  },
  
  // Calculated/derived values
  calculated: {
    trueLength: Number,
    apparentAngleHP: Number,   // α - apparent angle in front view
    apparentAngleVP: Number,   // β - apparent angle in top view
    topViewLength: Number,
    frontViewLength: Number,
    htPosition: {x: Number, y: Number},
    vtPosition: {x: Number, y: Number},
  },
  
  // Drawing elements
  elements: {
    // Reference line
    xyLine: {
      startX: Number,
      startY: Number,
      endX: Number,
      endY: Number,
    },
    
    // Endpoints
    pointA: {
      top: {x: Number, y: Number, label: "a"},
      front: {x: Number, y: Number, label: "a'"},
    },
    pointB: {
      top: {x: Number, y: Number, label: "b"},
      front: {x: Number, y: Number, label: "b'"},
    },
    
    // Projections
    topView: {
      points: [{x: Number, y: Number}],
      isParallelToXY: Boolean,
      isPerpendicularToXY: Boolean,
      length: Number,
      angle: Number,
    },
    frontView: {
      points: [{x: Number, y: Number}],
      isParallelToXY: Boolean,
      isPerpendicularToXY: Boolean,
      length: Number,
      angle: Number,
    },
    
    // Construction elements (for case 4)
    intermediate: {
      point_b1: {x: Number, y: Number},
      point_b1_prime: {x: Number, y: Number},
      point_b2: {x: Number, y: Number},
      point_b2_prime: {x: Number, y: Number},
      locus_lines: [{x1, y1, x2, y2}],
    },
    
    // Traces
    traces: {
      HT: {x: Number, y: Number} | null,
      VT: {x: Number, y: Number} | null,
    },
  },
  
  // Animation steps
  steps: [
    {
      id: Number,
      description: String,
      elements: [String],        // IDs of elements to draw in this step
      highlight: [String],       // IDs of elements to highlight
      instruction: String,       // Text to display in instruction bar
      duration: Number,          // Animation duration in ms
    }
  ],
};
```

---

## EXPORT AND SAVE FEATURES

### Export Options:

1. **Export as Image**:
   - PNG format
   - High resolution (300 DPI)
   - Include all labels and dimensions
   - Option to include/exclude construction lines

2. **Export as PDF**:
   - Vector format for scalability
   - Include problem statement
   - Include step-by-step procedure as separate page
   - Option for multiple cases in single PDF

3. **Save Session**:
   - Save current input values
   - Save drawing state
   - Allow reload for later continuation

4. **Print Layout**:
   - A4 size optimized
   - Include reference measurements
   - Include student name field
   - Include date and problem number

---

## LEARNING AIDS AND TOOLTIPS

### Concept Tooltips (on hover):

**xy line**: "Reference line separating top view (below) from front view (above) in first-angle projection"

**Top View**: "Projection of object on Horizontal Plane (HP) as viewed from above"

**Front View**: "Projection of object on Vertical Plane (VP) as viewed from front"

**True Length**: "Actual length of the line in 3D space, shown when line is parallel to a plane"

**Foreshortened**: "Reduced apparent length when line is inclined to a plane"

**Projector**: "Imaginary line perpendicular to plane, connecting points in different views"

**HT (Horizontal Trace)**: "Point where line meets HP (shown in top view, front view on xy)"

**VT (Vertical Trace)**: "Point where line meets VP (shown in front view, top view on xy)"

**Apparent Angle**: "Angle shown in projection (less than true angle when inclined to both planes)"

### Help Documentation:

**Include comprehensive help section with**:
1. Introduction to projections
2. First-angle vs third-angle comparison
3. Reading projections
4. Common mistakes and how to avoid them
5. Practice problems with solutions
6. Video tutorials for each case
7. Glossary of terms

---

## ASSESSMENT AND FEEDBACK

### Built-in Assessment:

1. **Quiz Mode**:
   - Generate random problems
   - Student provides input values for pre-drawn projections
   - Automatic checking of answers
   - Immediate feedback with corrections

2. **Practice Mode**:
   - Unlimited practice problems
   - Hints available on demand
   - Step-by-step solutions available
   - Progress tracking

3. **Challenge Mode**:
   - Complex multi-step problems
   - Time limits
   - Scoring system
   - Leaderboard (optional)

### Feedback Types:

**Immediate Feedback**:
- Green checkmark for correct values
- Red X with correction for incorrect values
- Yellow warning for values that are close but not exact

**Step-by-Step Feedback**:
- After each construction step, verify correctness
- Highlight errors in construction
- Suggest corrections

**Final Assessment**:
- Overall accuracy score
- Time taken
- Areas needing improvement
- Recommended practice problems

---

## ACCESSIBILITY FEATURES

### Essential Accessibility:

1. **Keyboard Navigation**:
   - Tab through input fields
   - Arrow keys for step navigation
   - Spacebar for play/pause
   - Number keys for quick step jump

2. **Screen Reader Support**:
   - Alt text for all visual elements
   - ARIA labels for interactive elements
   - Descriptive text for animations

3. **Visual Adjustments**:
   - High contrast mode
   - Adjustable text size
   - Colorblind-friendly palette option
   - Zoom without loss of clarity

4. **Alternative Formats**:
   - Text descriptions of visual content
   - Audio narration option
   - Printable worksheets
   - Braille-friendly export (coordinate listings)

---

## PERFORMANCE OPTIMIZATION

### Rendering Optimization:

1. **Canvas Management**:
   - Use layered canvases (background, construction, final, labels)
   - Redraw only changed layers
   - Implement dirty region tracking

2. **Animation Smoothness**:
   - Use requestAnimationFrame
   - Maintain 60 FPS target
   - Implement frame skipping for slow devices

3. **Memory Management**:
   - Limit undo/redo history
   - Clean up unused objects
   - Implement lazy loading for assets

### Loading Strategy:

1. **Progressive Loading**:
   - Load essential UI first
   - Load drawing libraries asynchronously
   - Lazy load help documentation

2. **Caching**:
   - Cache common calculations
   - Store rendered elements
   - Browser cache for static assets

---

## TESTING AND VALIDATION

### Test Cases for Each Case Type:

**Case 1 (Parallel to both)**:
1. Standard case: L=70mm, h=30mm, d=40mm
2. Edge case: Very small distance (h=5mm)
3. Edge case: Very large distance (h=100mm)

**Case 2A (Perpendicular to HP)**:
1. Standard case: L=60mm, d=20mm, lower end on HP
2. Variation: Lower end above HP

**Case 2B (Perpendicular to VP)**:
1. Standard case: L=40mm, h=15mm, near end on VP
2. Variation: Near end away from VP

**Case 3A (Inclined to HP)**:
1. Standard case: L=70mm, θ=45°, d=10mm, h=20mm
2. Small angle: θ=15°
3. Large angle: θ=75°
4. Line crossing quadrants

**Case 3B (Inclined to VP)**:
1. Standard case: L=75mm, φ=30°, h=10mm, d=20mm
2. Line crossing quadrants

**Case 4 (Oblique)**:
1. Standard case: L=80mm, θ=40°, φ=30°
2. Complementary angles (profile): θ=50°, φ=40°
3. Both angles small: θ=20°, φ=25°
4. Both angles large: θ=70°, φ=65°
5. One end on HP, other on VP

**Case 5 (Profile plane)**:
1. Standard case: L=65mm, θ=50°, φ=40°
2. Verification: θ + φ = 90°

**Trace Problems**:
1. Given VT, find HT
2. Given HT, find VT
3. Given both traces, verify projections

### Validation Tests:

**Geometric Validation**:
- Verify projectors are truly perpendicular to xy
- Check that parallel lines remain parallel
- Verify angle calculations
- Check distance calculations
- Validate true length calculations

**Visual Validation**:
- Check label positioning (no overlaps)
- Verify line weights and styles
- Check color contrast
- Validate dimension arrow placement

**Mathematical Validation**:
- Pythagorean theorem for true length
- Trigonometric calculations for projections
- Vector calculations for rotations
- Precision to 2 decimal places

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Functionality (MVP)
1. UI layout and input forms
2. Case 1: Parallel to both planes
3. Case 2A and 2B: Perpendicular cases
4. Basic canvas rendering
5. Step-by-step animation framework
6. Export as image

### Phase 2: Advanced Cases
1. Case 3A and 3B: Single inclination
2. Case 4: Oblique lines (two-step method)
3. Traces (HT and VT)
4. Rotation method for true length
5. Enhanced animations

### Phase 3: Special Cases and Methods
1. Case 5: Profile plane
2. Trapezoidal method
3. Lines crossing quadrants
4. AVP cases
5. Problems with given traces

### Phase 4: Enhanced Features
1. Measurement tools
2. Interactive problem solving
3. Quiz and practice modes
4. Export to PDF
5. Save/load sessions

### Phase 5: Polish and Optimization
1. Accessibility features
2. Performance optimization
3. Additional help content
4. Video tutorials
5. Mobile responsiveness

---

## CONCLUSION

This specification provides a comprehensive framework for developing an interactive virtual lab for teaching projections of straight lines. The implementation should follow first-angle projection conventions, provide clear step-by-step animations, and offer multiple interaction modes for different learning styles.

The AI agent implementing this specification should:
1. Follow the exact step sequences outlined for each case
2. Use consistent naming conventions and notation
3. Implement proper validation and error handling
4. Create smooth, understandable animations
5. Provide clear visual feedback at each step
6. Ensure mathematical accuracy in all calculations
7. Maintain educational clarity over visual complexity

Key success factors:
- Accuracy of geometric constructions
- Clarity of step-by-step instructions
- Quality of animations and visual feedback
- Usability of interface
- Robustness of input validation
- Educational effectiveness

This virtual lab should serve as an effective learning tool that allows students to understand and practice projections of straight lines at their own pace, with immediate feedback and comprehensive guidance at every step.