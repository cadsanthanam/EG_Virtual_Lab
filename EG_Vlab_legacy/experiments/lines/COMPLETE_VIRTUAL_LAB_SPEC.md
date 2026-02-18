# Virtual Lab — Projections of Straight Lines
## Complete Comprehensive Development Specification v3.0

> **Enterprise-Grade Parser · Pedagogical Architecture · Full Implementation Guide**  
> **Projection System:** First Angle Projection  
> **Pedagogical Model:** Procedure-Faithful Simulation  
> **Document Type:** Authoritative Reference for All Development  
> **Last Updated:** February 2024  
> **Version:** 3.0.0

---

## Executive Summary

This document provides **complete technical specifications** for developing an enterprise-grade, pedagogically sound virtual laboratory for teaching "Projections of Straight Lines" in First Angle Projection.

### Core Innovation

Traditional educational software silently converts student data to a standard format, then draws using a generic algorithm. **This lab is different**: it simulates the exact procedure a student would use at their drawing board with their specific data combination.

**Example:**
- Student gives: `L_TV = 65mm, θ = 30°` (Top View length, not True Length)
- Traditional approach: Computes `TL = 65/cos(30°) = 75mm` silently → draws as if TL was given
- **Our approach**: Identifies `PROC-15` → Draws TV of 65mm directly → Shows TL emerging from geometric construction

### Three Fundamental Principles

1. **5-Data Rule**: Every problem requires exactly 5 independent data items
2. **No Silent Inference**: Parser extracts only what's given; renderer constructs geometrically
3. **Procedure Fidelity**: 28 unique drawing procedures, one per data combination

### Document Scope

- **18 sections** covering philosophy, architecture, implementation
- **22 data types** fully catalogued with extraction patterns
- **28 drawing procedures** specified with step-by-step pedagogy
- **25 regression tests** with verification logic
- **13 critical bugs** documented with fixes
- **443 textbook problems** analyzed for coverage

---

## Table of Contents

### Part I — Foundation
1. [Core Philosophy](#1-core-philosophy)
2. [The 5-Data Rule — Mathematical Proof](#2-the-5-data-rule)
3. [Unified Case Framework](#3-unified-case-framework)

### Part II — Data & Procedures
4. [Complete Data Type Catalogue — 22 Types](#4-complete-data-type-catalogue)
5. [All Valid 5-Data Combinations — 28 Procedures](#5-all-valid-combinations)
6. [Case Detection Algorithm](#6-case-detection-algorithm)

### Part III — Parser Implementation
7. [NLP Parser — Architecture and Rules](#7-nlp-parser-architecture)
8. [Extractor — All Pattern Rules](#8-extractor-pattern-rules)
9. [Classifier — Combination Matching](#9-classifier-combination-matching)
10. [Validator — Domain Rules](#10-validator-domain-rules)

### Part IV — Renderer Implementation
11. [Renderer — Procedure-Faithful Drawing](#11-renderer-architecture)
12. [Step-by-Step Procedures with Pedagogy](#12-step-by-step-procedures)

### Part V — Integration & Testing
13. [Stable Output Shape](#13-stable-output-shape)
14. [Test Suite — 25 Problems](#14-test-suite)
15. [Pedagogical Design Guidelines](#15-pedagogical-design-guidelines)

### Part VI — Deployment
16. [Bug Registry — All Known Bugs](#16-bug-registry)
17. [Implementation Checklist](#17-implementation-checklist)
18. [File Architecture](#18-file-architecture)

### Appendices
- [Appendix A — Confidence Scoring](#appendix-a)
- [Appendix B — All 28 PROC-IDs Quick Reference](#appendix-b)
- [Appendix C — Common Textbook Phrasings](#appendix-c)
- [Appendix D — Algorithm Pseudocode](#appendix-d)
- [Appendix E — Error Message Templates](#appendix-e)
- [Appendix F — Integration Guide](#appendix-f)
- [Appendix G — Future Enhancements](#appendix-g)

---

## 1. Core Philosophy

### 1.1 The Fundamental Contract

This is a **teaching and learning laboratory**, not a calculation tool. The virtual lab must simulate the **exact drawing procedure** a student would perform at their drawing board, given their specific problem data.

#### The Problem with Traditional Approach

```
TRADITIONAL EDUCATIONAL SOFTWARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input: Student provides L_TV=65mm, θ=30°

Step 1 (HIDDEN from student):
  Parser computes: TL = L_TV / cos(θ) = 65 / cos(30°) = 75.06mm

Step 2 (HIDDEN from student):
  Parser infers: φ = unknown, sets to default

Step 3 (SHOWN to student):
  Renderer draws: Using TL=75mm as if it was originally given
  
Result: Student sees a correct drawing
Problem: Student learned WRONG procedure (not the one for L_TV+θ)
```

#### Our Direct-Draw Approach

```
THIS VIRTUAL LAB:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input: Student provides L_TV=65mm, θ=30°, h_A=10mm, d_A=20mm, φ=0

Step 1 (TRANSPARENT):
  Parser identifies: Combination {L_TV, θ, φ=0, h_A, d_A}
  → Maps to PROC-15

Step 2 (TRANSPARENT):
  Renderer executes PROC-15:
    ① Draw XY line
    ② Mark a at d_A=20mm below, a' at h_A=10mm above
    ③ Draw TV: ab HORIZONTAL (because φ=0), length L_TV=65mm
    ④ From a', draw at θ=30° to XY
    ⑤ Intersection with projector from b gives b'
    ⑥ Measure a'b' → THIS is TL (found by construction)

Result: Student sees the EXACT procedure for L_TV+θ combination
Learning: WHY TV is horizontal when φ=0
          HOW TL emerges from the geometric construction
          The right triangle relationship: TL·cos(θ) = L_TV
```

### 1.2 The Three Laws

**LAW 1 — No Silent Inference**

The parser NEVER computes a geometric value not explicitly given.

| Responsibility | Parser | Renderer |
|---|---|---|
| Extract "TL=80mm" from text | ✅ | — |
| Extract "L_TV=65mm" from text | ✅ | — |
| Compute TL from L_TV and θ | ❌ NEVER | ✅ Geometrically |
| Infer φ=0 from "∥VP" keyword | ✅ (keyword IS data) | — |
| Derive h_B from h_A and midpoint | ❌ NEVER | ✅ Geometrically |

**LAW 2 — Procedure Fidelity**

Every unique 5-data combination has its own drawing procedure.

Example:
- `{TL, θ, φ, h_A, d_A}` → PROC-01 (rotating line method with both angles)
- `{L_TV, θ, φ, h_A, d_A}` → PROC-13 (TV drawn first, different method)
- `{TL, θ, φ=0, h_A, d_A}` → PROC-07 (single inclination, simplified)

Same case type (all are Case D/oblique), but **three different procedures**.

**LAW 3 — Pedagogical Transparency**

Every step shows WHY, not just WHAT.

```javascript
// Example step from PROC-15
{
  id: 2,
  title: "Draw Top View horizontal",
  text: "Draw TV: line ab parallel to XY, length L_TV=65mm.",
  why: "When φ=0 (line is parallel to VP), every point on the line " +
       "is at the same distance from VP. The top view, which maps " +
       "distances from VP, therefore appears as a horizontal line."
}
```

---

## 2. The 5-Data Rule

### 2.1 Proof by Degrees of Freedom

A line segment AB in 3D space requires 6 parameters: `(x_A, y_A, z_A, x_B, y_B, z_B)`.

In First Angle Projection, the x-coordinates (distances from Profile Plane) are **not required** for drawing FV and TV. Only y (depth from VP) and z (height above HP) matter.

This reduces to 4 positional parameters:
- `y_A` (depth of A from VP) = `d_A`
- `z_A` (height of A above HP) = `h_A`
- `y_B` (depth of B from VP) = `d_B`
- `z_B` (height of B above HP) = `h_B`

However, these 4 parameters are **not independent** if the line has a known length. The minimum independent set is:

**5 Independent Parameters:**
1. `h_A` — height of one endpoint (A) above HP
2. `d_A` — depth of one endpoint (A) from VP
3. `TL` — true length of the line
4. `θ` — true inclination to HP
5. `φ` — true inclination to VP

**Mathematical proof that this is sufficient:**
- From `h_A, d_A`: we know position of A in both views
- From `TL, θ, φ`: we can construct both endpoints using rotating line method
- `h_B` and `d_B` are **derived**, not independent

### 2.2 The Slot System

A "data slot" is one independent parameter. Most data items consume 1 slot, but some consume 2:

| Given Data | Slots | Explanation |
|---|---|---|
| "TL = 80mm" | 1 | One parameter (true length) |
| "θ = 30°" | 1 | One parameter (angle to HP) |
| "h_A = 10mm" | 1 | One parameter (height of A) |
| "d_A = 20mm" | 1 | One parameter (depth of A) |
| "on both HP and VP" | **2** | Sets TWO parameters: h=0 AND d=0 |
| "15mm from both planes" | **2** | Sets TWO parameters: h=15 AND d=15 |
| "intersects XY at A" | **2** | Sets TWO parameters: h_A=0 AND d_A=0 |
| "parallel to HP" | 1 | Sets one parameter: θ=0 |
| "equidistant" | 1 flag | Constraint (h=d), not a value |

**Critical Implementation Rule:**

```javascript
function countSlots(data) {
  let slots = 0;
  
  // Count each non-null numeric field
  if (data.TL) slots++;
  if (data.theta) slots++;
  // ... etc for all 18 data types
  
  // Special conditions that already set 2 fields are already counted above
  // (e.g., ON_BOTH sets h_A=0 and d_A=0, which are counted as 2 slots)
  
  return slots;
}

// Validation
if (slots < 5) return { sufficient: false, missing: [...] };
if (slots === 5) return { sufficient: true };
if (slots > 5) return { sufficient: true, overconstrained: true };
```

### 2.3 Over-Determined Problems

Some textbook problems give 6+ data items. This is **pedagogically valid** — the extra data serves as a **verification check**.

Example:
```
Given: TL=80mm, θ=30°, φ=40°, h_A=10mm, d_A=20mm, L_TV=69mm
Slots: 6 (over-determined by 1)

Procedure:
1. Draw using the primary 5: {TL, θ, φ, h_A, d_A}
2. After construction, measure TV length
3. Verify: measured L_TV ≈ 69mm ✓
4. Annotate: "Check: L_TV = 69mm (verified)"
```

---

## 3. Unified Case Framework

### 3.1 All Cases as Oblique Variants

**Key Insight:** The oblique line (Case D with θ>0, φ>0, θ+φ<90) is the **general case**. All other cases are special instances obtained by setting boundary values.

```
                    OBLIQUE LINE (CASE D)
                    θ > 0, φ > 0, θ+φ < 90
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    Set φ=0            Set θ+φ=90         Set θ=0
        │                  │                  │
    CASE C              CASE D★             CASE B
  (∥ to VP)         (Profile Plane)       (∥ to HP)
  θ>0, φ=0           θ+φ=90             θ=0, φ>0
        │                                    │
   Set θ=90                             Set φ=90
        │                                    │
    CASE 2A                              CASE 2B
    (⊥ HP)                               (⊥ VP)
        │                                    │
        └────────── Set θ=0, φ=0 ───────────┘
                        │
                    CASE A
                (∥ both HP and VP)
```

### 3.2 Complete Case Taxonomy

| Case | θ Value | φ Value | Geometric Meaning | FV Shows | TV Shows |
|---|---|---|---|---|---|
| **A** | 0° | 0° | Line parallel to both HP and VP | TL, horizontal | TL, horizontal |
| **B** | 0° | >0°, <90° | Line parallel to HP, inclined to VP | L_FV, horizontal | TL at angle φ |
| **C** | >0°, <90° | 0° | Line inclined to HP, parallel to VP | TL at angle θ | L_TV, horizontal |
| **D** | >0° | >0°, θ+φ<90° | **General oblique line** | L_FV < TL at β | L_TV < TL at α |
| **D★** | >0° | >0°, θ+φ=90° | Profile plane line | L_FV at β | L_TV at α |
| **2A** | 90° | 0° | Line perpendicular to HP (vertical) | TL, vertical | **Point** |
| **2B** | 0° | 90° | Line perpendicular to VP | **Point** | TL, horizontal |

### 3.3 Domain Invariants (Must Always Hold)

```
V01:  TL > 0                          [true length must be positive]
V02:  0° ≤ θ ≤ 90°                    [inclination to HP bounded]
V03:  0° ≤ φ ≤ 90°                    [inclination to VP bounded]
V04:  θ + φ ≤ 90°                     [geometric constraint]
V05:  L_TV ≤ TL                       [projection ≤ true length]
V06:  L_FV ≤ TL                       [projection ≤ true length]
V07:  L_TV = TL · cos(θ)   [when φ=0] [exact relationship]
V08:  L_FV = TL · cos(φ)   [when θ=0] [exact relationship]

CRITICAL (most common bugs):
V09:  ∥ HP → θ = 0         [NOT φ = 0] ← FIX THIS
V10:  ∥ VP → φ = 0         [NOT θ = 0] ← FIX THIS
V11:  ⊥ HP → θ = 90        [perpendicular]
V12:  ⊥ VP → φ = 90        [perpendicular]
```

**Why V09-V10 are critical:**

"Parallel to HP" means the line makes 0° angle **with** HP.
→ The angle **to** HP is θ
→ Therefore θ = 0

Common bug: Setting φ=0 instead (thinking "parallel to horizontal = no VP angle")
**This is wrong.** Parallel to HP affects θ, not φ.

---

## 4. Complete Data Type Catalogue

### 4.1 The 18 Numerical Data Types

| ID | Symbol | Name | Physical Meaning | Typical Textbook Phrases |
|---|---|---|---|---|
| **D01** | TL | True Length | Actual 3D length of the line segment | "80mm long", "AB 80mm", "line of length 80mm", "true length 80mm", "80mm in length", "AB is 80mm" |
| **D02** | θ | Inclination to HP | True angle the line makes with the Horizontal Plane | "inclined at 30° to HP", "30° to HP", "makes 30° with HP", "30 deg to HP", "makes an angle of 30° to HP" |
| **D03** | φ | Inclination to VP | True angle the line makes with the Vertical Plane | "40° to VP", "inclined at 40° to VP", "makes 40° with VP", "40 deg to VP", "40 degrees to VP" |
| **D04** | h_A | Height of endpoint A | Perpendicular distance of point A above HP (vertical coordinate) | "end A 10mm above HP", "A is 10mm above HP", "one end 10mm above HP", "10mm above HP", "endpoint A, 10mm above HP" |
| **D05** | d_A | Depth of endpoint A | Perpendicular distance of point A in front of VP (depth coordinate) | "A 30mm in front of VP", "30mm infront of VP", "end A 30mm from VP", "A is 30mm in front of VP" |
| **D06** | h_B | Height of endpoint B | Perpendicular distance of point B above HP | "end B 60mm above HP", "other end 60mm above HP", "B is 60mm above HP", "Q is 40mm above HP" |
| **D07** | d_B | Depth of endpoint B | Perpendicular distance of point B in front of VP | "B 50mm in front of VP", "other end 50mm from VP", "end B 50mm in front of VP" |
| **D08** | L_TV | Top View Length | Projected length of the line in the horizontal (plan) view | "top view 65mm", "plan 65mm", "plan measures 65mm", "top view of 75mm line is 65mm", "top view length of 70mm", "plan is 65mm long" |
| **D09** | L_FV | Front View Length | Projected length of the line in the vertical (elevation) view | "front view 50mm", "elevation 50mm", "elevation measures 50mm", "front view length of 50mm", "front view is 50mm" |
| **D10** | α (alpha) | TV angle with XY | **Apparent** angle that the top view makes with the XY line (NOT a true angle) | "plan makes 35° with XY", "top view inclined 35° to XY", "plan inclined at 45° to XY", "TV makes 45° with XY" |
| **D11** | β (beta) | FV angle with XY | **Apparent** angle that the front view makes with the XY line (NOT a true angle) | "front view inclined at 50° to XY", "elevation makes 45° with XY", "FV inclined 50° to XY", "elevation at 45° to XY" |
| **D12** | Δx (delta_X) | Projector Distance | Horizontal distance between the two vertical projectors passing through A and B | "distance between end projectors 45mm", "projectors 45mm apart", "end projectors 60mm", "projectors are 60mm apart" |
| **D13** | h_mid | Midpoint Height | Height of the midpoint M of the line above HP | "midpoint 60mm above HP", "mid-point is 60mm above HP", "midpoint of AB is 60mm above HP", "centre of line 60mm above HP" |
| **D14** | d_mid | Midpoint Depth | Depth of the midpoint M of the line in front of VP | "midpoint 50mm in front of VP", "mid-point 50mm from VP" |
| **D15** | VT_h | VT Height | Height of the Vertical Trace (where extended line meets VP) above HP | "VT is 15mm above HP", "vertical trace 15mm above HP", "VT at 15mm" |
| **D16** | HT_d | HT Depth | Depth of the Horizontal Trace (where extended line meets HP) in front of VP | "HT is 10mm in front of VP", "horizontal trace 10mm from VP" |
| **D17** | L_SV | Side View Length | Projected length in the Side (Profile) View | "side view 40mm", "profile view length 40mm" **(rare in problems)** |
| **D18** | γ (gamma) | Inclination to PP | True angle the line makes with the Profile Plane | "inclined at 20° to profile plane" **(very rare in problems)** |

### 4.2 The 13 Special Condition Flags

| ID | Flag Name | Trigger Keywords/Phrases | Slots Consumed | Sets Values |
|---|---|---|---|---|
| **SK01** | PARALLEL_HP | "parallel to HP", "∥ HP", "∥ to HP", "parallel to horizontal plane" | 1 slot | θ = 0° |
| **SK02** | PARALLEL_VP | "parallel to VP", "∥ VP", "∥ to VP", "parallel to vertical plane" | 1 slot | φ = 0° |
| **SK03** | PERP_HP | "perpendicular to HP", "⊥ HP", "vertical line", "⊥ to HP" | 1 slot | θ = 90° |
| **SK04** | PERP_VP | "perpendicular to VP", "⊥ VP", "⊥ to VP" | 1 slot | φ = 90° |
| **SK05** | ON_HP | "A is in HP", "A on HP", "A lies in HP", "end A in HP", "one end in HP" | 1 slot | h_A = 0 (or h_B = 0) |
| **SK06** | ON_VP | "B is in VP", "B on VP", "end B in VP", "B lies on VP" | 1 slot | d_B = 0 (or d_A = 0) |
| **SK07** | ON_BOTH | "end D on both HP and VP", "D lies on HP and VP", "D is on HP and VP", "on both reference planes" | **2 slots** | h = 0 **AND** d = 0 |
| **SK08** | N_FROM_BOTH | "15mm from both HP and VP", "25mm away from both planes", "15mm from each reference plane", "15mm from both reference planes" | **2 slots** | h = N **AND** d = N |
| **SK09** | EQUAL_DIST | "equidistant from both planes", "equal distances from both HP and VP", "equal distances from reference planes" | 1 flag slot | Constraint: h = d (unknown value) |
| **SK10** | ON_XY | "intersects XY at A", "line meets XY at A", "passes through XY at A", "A is on XY line" | **2 slots** | h_A = 0 **AND** d_A = 0 |
| **SK11** | MIDPOINT | "midpoint", "mid-point", "centre of line", "midpoint of AB" | **0 slots** | Context flag: routes next positions to D13/D14 |
| **SK12** | TRACE_REQ | "mark the traces", "find HT and VT", "show the traces", "horizontal trace", "vertical trace" | **0 slots** | Modifier flag: appends trace steps |
| **SK13** | FIRST_QUAD | "in first quadrant", "1st quadrant", "first quadrant" | **0 slots** | Context flag: confirms h > 0, d > 0 |

### 4.3 Critical Disambiguation Rules

**RULE 1: L_TV vs TL**

```
"top view length of 70mm"    → L_TV = 70mm  (D08)
"70mm long"                  → TL = 70mm    (D01)
"AB 70mm"                    → TL = 70mm    (D01)
"top view is 70mm"           → L_TV = 70mm  (D08)
"70mm in top view"           → L_TV = 70mm  (D08)
```

**RULE 2: d_A vs L_FV**

```
"30mm in front of VP"        → d_A = 30mm   (D05) DEPTH
"front view 30mm"            → L_FV = 30mm  (D09) LENGTH
"30mm in front view"         → L_FV = 30mm  (D09) LENGTH
```

**RULE 3: True angles vs Apparent angles**

```
"30° to HP"                  → θ = 30°      (D02) TRUE ANGLE
"plan makes 30° with XY"     → α = 30°      (D10) APPARENT ANGLE
"front view at 30° to XY"    → β = 30°      (D11) APPARENT ANGLE
```

**RULE 4: Midpoint context**

```
"midpoint 60mm above HP"     → h_mid = 60mm (D13) NOT h_A
"60mm above HP" [no midpoint]→ h_A = 60mm   (D04)
```

---

## 5. All Valid Combinations — 28 Procedures

### 5.1 Master Table of All PROC-IDs

| PROC-ID | 5 Data Items Given | Case | Drawing Method | Pedagogical Focus |
|---|---|---|---|---|
| **PROC-01** | TL, θ, φ, h_A, d_A | D | Rotating line from end A | **MASTER PROCEDURE** — foundation for all others |
| **PROC-02** | TL, θ, φ, h_B, d_B | D | Rotating line from end B | Either endpoint can be reference |
| **PROC-03** | TL, θ, φ, h_A, d_B | D | Cross-endpoint mix | Partial endpoint data handling |
| **PROC-04** | TL, θ, φ, h_B, d_A | D | Cross-endpoint mix | Symmetric to PROC-03 |
| **PROC-05** | TL, θ, φ, h_mid, d_mid | D | Midpoint-centered method | Half-arcs from midpoint |
| **PROC-06** | TL, θ, φ, h_mid, d_A | D | Midpoint + one endpoint | Mixed reference points |
| **PROC-07** | TL, θ, φ=0, h_A, d_A | C | FV at θ; TV horizontal | Case C: Shows why TV is always horizontal |
| **PROC-08** | TL, θ=0, φ, h_A, d_A | B | TV at φ; FV horizontal | Case B: Shows why FV is always horizontal |
| **PROC-09** | TL, θ=90, φ=0, h_A, d_A | 2A | TV = point; FV = vertical line | Case 2A: Why TV collapses to a point |
| **PROC-10** | TL, θ=90, φ=0, h_A, d_A | 2A | (Variant of PROC-09) | Same as PROC-09 |
| **PROC-11** | TL, θ=0, φ=90, h_A, d_A | 2B | FV = point; TV = horizontal line | Case 2B: Why FV collapses to a point |
| **PROC-12** | TL, θ=0, φ=0, h_A, d_A | A | Both views horizontal | Case A: Simplest — both projections show TL |
| **PROC-13** | L_TV, θ, φ, h_A, d_A | D | Draw TV first (L_TV given) | TL emerges from construction |
| **PROC-14** | L_FV, θ, φ, h_A, d_A | D | Draw FV first (L_FV given) | TL emerges from construction |
| **PROC-15** | L_TV, θ, φ=0, h_A, d_A | C | TV horizontal (L_TV), FV at θ | Case C with TV length given |
| **PROC-16** | L_FV, θ=0, φ, h_A, d_A | B | FV horizontal (L_FV), TV at φ | Case B with FV length given |
| **PROC-17** | L_TV, L_FV, h_A, d_A, Δx | D | Two-arc intersection method | Both view lengths + projector distance |
| **PROC-18** | L_TV, L_FV, h_A=0, d_A, Δx | D | Arc method with A on HP | Special: endpoint on HP (h_A=0) |
| **PROC-19** | TL, α, β, h_A, d_A | D | Apparent angles directly | True angles found by rotating |
| **PROC-20** | L_TV, α, h_A, d_A, h_B | D | TV at α; h_B locates b' | TV angle + TV length + one height |
| **PROC-21** | L_FV, β, h_A, d_A, d_B | D | FV at β; d_B locates b | FV angle + FV length + one depth |
| **PROC-22** | TL, α, h_A, d_A, h_B | D | TL + apparent TV angle | Mix of true length and apparent angle |
| **PROC-23** | TL, β, h_A, d_A, d_B | D | TL + apparent FV angle | Symmetric to PROC-22 |
| **PROC-24** | TL, h_A, d_A, h_B, d_B | D | Both endpoints; find θ and φ | Inverse problem: find inclinations |
| **PROC-25** | h_A, d_A, h_B, d_B, Δx | D | All positions; find TL | Most general inverse: find TL and angles |
| **PROC-26** | TL, h_A, d_A, h_B, Δx | D | Partial endpoints + TL + Δx | One endpoint full, one partial |
| **PROC-27** | TL, h_A, d_A, d_B, Δx | D | Partial endpoints + TL + Δx | Symmetric to PROC-26 |
| **PROC-28** | [Any above] + SK12 | any | Base PROC + trace appendix | Trace-finding appended to any procedure |

*(Note: PROC-28 is not a standalone procedure but a modifier that adds trace-finding steps to any base PROC when SK12 flag is detected)*

### 5.2 PROC Selection Priority Order

When matching extracted data to a PROC-ID, use this **strict priority order** (most specific first):

```javascript
function selectProcId(givenData) {
  // Check midpoint procedures first (very specific)
  if (has('h_mid') && has('d_mid') && has('TL') && has('theta') && has('phi'))
    return 'PROC-05';
  
  // Both endpoints fully specified
  if (has('h_A') && has('d_A') && has('h_B') && has('d_B')) {
    if (has('delta_X')) return 'PROC-25';  // Find TL
    if (has('TL'))      return 'PROC-24';  // Find angles
  }
  
  // Both view lengths
  if (has('L_TV') && has('L_FV')) {
    if (has('delta_X') && has('h_A') && has('d_A')) return 'PROC-17';
    if (has('h_A') && has('d_A') && h_A === 0)     return 'PROC-18';
  }
  
  // Projected length + both angles
  if (has('L_TV') && has('theta') && has('phi') && has('h_A') && has('d_A'))
    return phi === 0 ? 'PROC-15' : 'PROC-13';
  
  if (has('L_FV') && has('theta') && has('phi') && has('h_A') && has('d_A'))
    return theta === 0 ? 'PROC-16' : 'PROC-14';
  
  // Standard oblique (TL + both angles)
  if (has('TL') && has('theta') && has('phi')) {
    if (has('h_A') && has('d_A')) return 'PROC-01';
    if (has('h_B') && has('d_B')) return 'PROC-02';
    if (has('h_A') && has('d_B')) return 'PROC-03';
    if (has('h_B') && has('d_A')) return 'PROC-04';
  }
  
  // Apparent angles
  if (has('TL') && has('alpha') && has('beta') && has('h_A') && has('d_A'))
    return 'PROC-19';
  
  // Special cases (perpendicular/parallel)
  if (theta === 90 && phi === 0 && has('TL')) return 'PROC-09';
  if (theta === 0 && phi === 90 && has('TL')) return 'PROC-11';
  if (theta === 0 && phi === 0 && has('TL'))  return 'PROC-12';
  
  // Single angle cases
  if (has('TL') && has('theta') && phi === 0 && has('h_A') && has('d_A'))
    return 'PROC-07';
  
  if (has('TL') && theta === 0 && has('phi') && has('h_A') && has('d_A'))
    return 'PROC-08';
  
  return null;  // Unrecognized combination
}
```

---

## 6. Case Detection Algorithm

### 6.1 Implementation

```javascript
function detectCase(resolvedTheta, resolvedPhi) {
  // resolvedTheta and resolvedPhi are after SK flag resolution
  // e.g., PARALLEL_HP → theta=0
  
  const theta = resolvedTheta;
  const phi = resolvedPhi;
  const TOLERANCE = 0.5;  // degrees
  
  // Priority 1: Perpendicular cases
  if (Math.abs(theta - 90) < TOLERANCE)
    return 'Case 2A';  // ⊥ HP
  
  if (Math.abs(phi - 90) < TOLERANCE)
    return 'Case 2B';  // ⊥ VP
  
  // Priority 2: Profile plane
  if (theta != null && phi != null) {
    if (Math.abs((theta + phi) - 90) < TOLERANCE)
      return 'Case D★';  // Profile Plane
  }
  
  // Priority 3: General oblique
  if (theta > 0 && phi > 0)
    return 'Case D';  // Oblique
  
  // Priority 4: Single inclination
  if (theta > 0 && Math.abs(phi) < TOLERANCE)
    return 'Case C';  // Inclined to HP, ∥ VP
  
  if (Math.abs(theta) < TOLERANCE && phi > 0)
    return 'Case B';  // ∥ HP, inclined to VP
  
  // Priority 5: Parallel to both
  if (Math.abs(theta) < TOLERANCE && Math.abs(phi) < TOLERANCE)
    return 'Case A';  // ∥ both
  
  // If angles not available
  return null;  // Case determined after drawing
}
```

---

## 7. NLP Parser Architecture

### 7.1 The 5-Stage Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│ STAGE 1: NORMALIZE TEXT                                     │
├──────────────────────────────────────────────────────────────┤
│ Input:  Raw problem text from student                       │
│ Output: Normalized text (standard symbols, units, spelling) │
│ Tasks:                                                       │
│   • Fix degree symbols: "40 deg" → "40°"                   │
│   • Unit conversion: "8cm" → "80mm"                        │
│   • Plane names: "h.p." → "HP"                             │
│   • Spelling: "infront" → "in front"                       │
│   • Synonyms: "plan" → "top view"                          │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 2: EXTRACT ALL ENTITIES                               │
├──────────────────────────────────────────────────────────────┤
│ Input:  Normalized text                                     │
│ Output: Array of {type, value, confidence, sourceText}      │
│ Tasks:                                                       │
│   • Extract paired angles (θ and φ together)               │
│   • Extract individual angles                               │
│   • Extract lengths (TL, L_TV, L_FV, Δx)                   │
│   • Extract positions (h_A, d_A, h_B, d_B)                 │
│   • Extract special keywords (∥, ⊥, on HP, etc.)           │
│ CRITICAL: Extract ONLY what is explicitly stated           │
│           Zero inference at this stage                      │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 3: RESOLVE SPECIAL CONDITIONS                         │
├──────────────────────────────────────────────────────────────┤
│ Input:  Extracted entities including SK flags               │
│ Output: Numeric values set from keywords                    │
│ Tasks:                                                       │
│   • SK01 (PARALLEL_HP) → θ = 0                             │
│   • SK02 (PARALLEL_VP) → φ = 0                             │
│   • SK03 (PERP_HP) → θ = 90                                │
│   • SK04 (PERP_VP) → φ = 90                                │
│   • SK05 (ON_HP) → h_A = 0 (or h_B=0)                      │
│   • SK07 (ON_BOTH) → h = 0 AND d = 0 (2 slots)            │
│   • SK08 (N_FROM_BOTH) → h = N AND d = N (2 slots)        │
│   • SK10 (ON_XY) → h_A = 0 AND d_A = 0 (2 slots)          │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 4: MATCH TO PROC-ID                                   │
├──────────────────────────────────────────────────────────────┤
│ Input:  Resolved data set with all values                   │
│ Output: procId, caseType, slotsConsumed                     │
│ Tasks:                                                       │
│   • Count data slots (remember 2-slot items)               │
│   • Match against 28 PROC combinations                     │
│   • Detect case type from angles                           │
│   • Assess completeness                                    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ STAGE 5: VALIDATE                                           │
├──────────────────────────────────────────────────────────────┤
│ Input:  givenData + procId                                  │
│ Output: {valid, errors, warnings}                           │
│ Tasks:                                                       │
│   • Check domain rules V01-V17                             │
│   • Detect conflicts (e.g., ∥HP but θ≠0)                  │
│   • Geometric validation (TL>0, L_TV≤TL, etc.)           │
│   • Generate meaningful error messages                     │
└──────────────────────────────────────────────────────────────┘
                          ↓
                   ParseResult
```

### 7.2 Architectural Constraints (Non-Negotiable)

The parser modules must **NEVER**:

❌ Compute TL from L_TV and θ  
❌ Compute θ from TL and L_TV  
❌ Derive h_B from h_A and midpoint  
❌ Infer φ when only θ is given  
❌ Set any "default" value  
❌ Fill missing slots to "make it work"  
❌ Perform trigonometric calculations  

The only exception: **Resolving SK flags** (e.g., SK01 → θ=0) is NOT inference because the keyword explicitly states the value.

---

## 8. Extractor Pattern Rules

### 8.1 Degree Normalization (BUG-01 FIX — CRITICAL)

**THE BUG:**
```javascript
// Current (WRONG):
text.replace(/(\d+)\s*deg/gi, '$1°')

Input:  "40 deg to VP"
Output: "40°g to VP"    // ❌ WRONG - trailing 'g' captured
```

**THE FIX:**
```javascript
// Correct — use negative lookahead
text.replace(/(\d+(?:\.\d+)?)\s*deg(?![a-z])/gi, '$1°')
//                                   ^^^^^^^^
//                              prevents matching "deg" in "degree"

Input:  "40 deg to VP"
Output: "40° to VP"     // ✅ CORRECT
```

**Complete degree normalization sequence:**

```javascript
function normalizeDegrees(text) {
  // Step 1: "degrees" or "degree" (full word)
  text = text.replace(/(\d+(?:\.\d+)?)\s*degrees?\b/gi, '$1°');
  
  // Step 2: "deg" with negative lookahead
  text = text.replace(/(\d+(?:\.\d+)?)\s*deg(?![a-z])/gi, '$1°');
  
  // Step 3: Unicode variants
  text = text.replace(/˚/g, '°');  // U+02DA ring above
  text = text.replace(/º/g, '°');  // U+00BA masculine ordinal
  
  return text;
}

// Test cases (all must pass):
normalizeDegrees("40 degree to VP")  === "40° to VP"  // ✅
normalizeDegrees("40 degrees to VP") === "40° to VP"  // ✅
normalizeDegrees("40 deg to VP")     === "40° to VP"  // ✅
normalizeDegrees("40° to VP")        === "40° to VP"  // ✅
normalizeDegrees("40º to VP")        === "40° to VP"  // ✅
normalizeDegrees("40˚ to VP")        === "40° to VP"  // ✅
```

### 8.2 Endpoint Extraction (BUG-02 FIX — CRITICAL)

**THE BUG:**
```javascript
// Current (WRONG):
/\bA\b/g.test("A straight line AB")  // ❌ matches article "A"
```

**THE FIX:**
```javascript
function extractEndpoints(normalized) {
  const endpoints = [];
  const seen = new Set();
  
  // Priority 1: Two-letter line label
  const labelPattern = /(?:straight\s+)?line\s+([A-Z])[-\s]*([A-Z])/gi;
  for (const m of normalized.matchAll(labelPattern)) {
    if (!seen.has(m[1])) { endpoints.push(m[1]); seen.add(m[1]); }
    if (!seen.has(m[2])) { endpoints.push(m[2]); seen.add(m[2]); }
  }
  
  // Priority 2: "AB 80mm", "AB of length"
  const implicitLabel = /\b([A-Z])([A-Z])\s+(?:is\s+)?(?:\d+|of\s+length)/gi;
  for (const m of normalized.matchAll(implicitLabel)) {
    if (!seen.has(m[1])) { endpoints.push(m[1]); seen.add(m[1]); }
    if (!seen.has(m[2])) { endpoints.push(m[2]); seen.add(m[2]); }
  }
  
  // Priority 3: Explicit "end A", "endpoint A"
  const explicitPattern = /(?:end|endpoint|point|one\s+end)\s+([A-Z])\b/gi;
  for (const m of normalized.matchAll(explicitPattern)) {
    if (!seen.has(m[1])) { endpoints.push(m[1]); seen.add(m[1]); }
  }
  
  // NEVER: scan for single letter "A" - that's the bug
  
  return endpoints.length >= 2 ? {primary: endpoints[0], secondary: endpoints[1]} : null;
}

// Test cases:
extractEndpoints("A straight line AB 80mm")  // {primary:'A', secondary:'B'} ✅
extractEndpoints("line PQ of 70mm")          // {primary:'P', secondary:'Q'} ✅
extractEndpoints("AB 80mm long")             // {primary:'A', secondary:'B'} ✅
extractEndpoints("end A 10mm above HP")      // {primary:'A', secondary:null} ✅
```

### 8.3 Paired Angle Extraction (HIGHEST PRIORITY)

Paired angles must **always** be extracted before individual angles to ensure correct θ/φ assignment.

```javascript
function extractPairedAngles(text) {
  const pairs = [];
  
  // Pattern A: "30° to HP and 40° to VP"
  const patA = /(\d+(?:\.\d+)?)\s*°\s+(?:to|with)\s+HP\s+and\s+(\d+(?:\.\d+)?)\s*°\s+(?:to|with)\s+VP/gi;
  for (const m of text.matchAll(patA)) {
    pairs.push({
      theta: parseFloat(m[1]),
      phi: parseFloat(m[2]),
      source: m[0],
      confidence: 0.98,
      pattern: 'A'
    });
  }
  
  // Pattern B: "40° to VP and 30° to HP" (REVERSED - common in textbooks)
  const patB = /(\d+(?:\.\d+)?)\s*°\s+(?:to|with)\s+VP\s+and\s+(\d+(?:\.\d+)?)\s*°\s+(?:to|with)\s+HP/gi;
  for (const m of text.matchAll(patB)) {
    pairs.push({
      theta: parseFloat(m[2]),  // ← NOTE: swapped
      phi: parseFloat(m[1]),    // ← NOTE: swapped
      source: m[0],
      confidence: 0.98,
      pattern: 'B'
    });
  }
  
  // Pattern C: "inclined at 30° and 40° to HP and VP"
  const patC = /inclined\s+at\s+(\d+(?:\.\d+)?)\s*°\s+and\s+(\d+(?:\.\d+)?)\s*°\s+to\s+HP\s+and\s+VP/gi;
  for (const m of text.matchAll(patC)) {
    pairs.push({
      theta: parseFloat(m[1]),
      phi: parseFloat(m[2]),
      source: m[0],
      confidence: 0.98,
      pattern: 'C'
    });
  }
  
  // Pattern D: "inclined at 30° to HP and 40° to VP"
  const patD = /inclined\s+at\s+(\d+(?:\.\d+)?)\s*°\s+to\s+HP\s+and\s+(\d+(?:\.\d+)?)\s*°\s+to\s+VP/gi;
  for (const m of text.matchAll(patD)) {
    pairs.push({
      theta: parseFloat(m[1]),
      phi: parseFloat(m[2]),
      source: m[0],
      confidence: 0.98,
      pattern: 'D'
    });
  }
  
  // Pattern E: "makes 30° with HP and 40° with VP"
  const patE = /makes\s+(\d+(?:\.\d+)?)\s*°\s+with\s+HP\s+and\s+(\d+(?:\.\d+)?)\s*°\s+with\s+VP/gi;
  for (const m of text.matchAll(patE)) {
    pairs.push({
      theta: parseFloat(m[1]),
      phi: parseFloat(m[2]),
      source: m[0],
      confidence: 0.98,
      pattern: 'E'
    });
  }
  
  return pairs.length > 0 ? pairs[0] : null;  // Return first match
}
```

### 8.4 Position Extraction (Relational Format)

```javascript
function extractPositions(text, endpoints) {
  const positions = [];
  
  // Pattern 1: Explicit endpoint + value + HP
  const expHP = /(?:end|endpoint|point)?\s*([A-Z])\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(above|below)\s+(?:the\s+)?HP/gi;
  for (const m of text.matchAll(expHP)) {
    positions.push({
      type: 'distance_hp',
      endpoint: m[1],
      value: parseFloat(m[2]),
      sign: m[3] === 'above' ? '+' : '-',
      keyword: m[3],
      sourceText: m[0],
      confidence: 0.97
    });
  }
  
  // Pattern 2: Explicit endpoint + value + VP
  const expVP = /(?:end|endpoint|point)?\s*([A-Z])\s+(?:is\s+)?(\d+(?:\.\d+)?)\s*mm\s+(in\s+front\s+of|behind)\s+(?:the\s+)?VP/gi;
  for (const m of text.matchAll(expVP)) {
    positions.push({
      type: 'distance_vp',
      endpoint: m[1],
      value: parseFloat(m[2]),
      sign: m[3] === 'in front of' ? '+' : '-',
      keyword: m[3],
      sourceText: m[0],
      confidence: 0.97
    });
  }
  
  // Pattern 3: Implicit (no endpoint letter) - assign to first available
  const implHP = /(\d+(?:\.\d+)?)\s*mm\s+(above|below)\s+(?:the\s+)?HP/gi;
  const implVP = /(\d+(?:\.\d+)?)\s*mm\s+(in\s+front\s+of|behind)\s+(?:the\s+)?VP/gi;
  // ... extract and assign to first unassigned endpoint
  
  // Pattern 4: "Nmm from both HP and VP" (BUG-07 FIX)
  const bothPlanes = /(\d+(?:\.\d+)?)\s*mm\s+from\s+both\s+(?:the\s+)?HP\s+and\s+(?:the\s+)?VP/gi;
  for (const m of text.matchAll(bothPlanes)) {
    positions.push({
      type: 'from_both_planes',
      value: parseFloat(m[1]),
      setsH: true,
      setsD: true,
      sourceText: m[0],
      confidence: 0.98,
      slotsConsumed: 2  // ← CRITICAL: 2 slots
    });
  }
  
  // Pattern 5: "equidistant from both planes"
  if (/equi(?:distant|distanced)\s+from\s+both/gi.test(text)) {
    positions.push({
      type: 'equidistant',
      constraint: 'h_equals_d',
      sourceText: 'equidistant from both planes',
      confidence: 0.95,
      slotsConsumed: 1  // flag only
    });
  }
  
  // Pattern 6: "on both HP and VP"
  if (/(?:on|in|lies\s+(?:on|in))\s+both\s+HP\s+and\s+VP/gi.test(text)) {
    positions.push({
      type: 'on_both_planes',
      value: 0,
      setsH: true,
      setsD: true,
      sourceText: 'on both HP and VP',
      confidence: 0.99,
      slotsConsumed: 2  // ← CRITICAL: 2 slots
    });
  }
  
  return positions;
}
```

### 8.5 Midpoint Extraction (BUG-06 FIX)

```javascript
function extractMidpoint(text) {
  // Pattern: "midpoint of AB is 60mm above HP and 50mm in front of VP"
  const midpointPattern = /mid[-\s]?point.*?(\d+(?:\.\d+)?)\s*mm\s+(above|below)\s+(?:the\s+)?HP.*?(\d+(?:\.\d+)?)\s*mm\s+(in\s+front\s+of|behind)\s+(?:the\s+)?VP/gi;
  
  for (const m of text.matchAll(midpointPattern)) {
    return {
      h_mid: parseFloat(m[1]) * (m[2] === 'above' ? 1 : -1),
      d_mid: parseFloat(m[3]) * (m[4] === 'in front of' ? 1 : -1),
      sourceText: m[0],
      confidence: 0.96,
      isMidpoint: true  // ← Routes to D13/D14, not D04/D05
    };
  }
  
  // Also check for "midpoint" keyword alone - sets context
  if (/mid[-\s]?point|centre\s+of\s+(?:the\s+)?line/gi.test(text)) {
    return { contextFlag: 'MIDPOINT' };
  }
  
  return null;
}
```

### 8.6 Complete Extraction Patterns Summary

| Data Type | Primary Pattern | Context Check | Confidence |
|---|---|---|---|
| TL (D01) | `/(\d+)\s*mm\s+long/` | Near line label | 0.97 |
| θ (D02) | `/(\d+)\s*°\s+to\s+HP/` | After "inclined" | 0.95 |
| φ (D03) | `/(\d+)\s*°\s+to\s+VP/` | After "inclined" | 0.95 |
| h_A (D04) | `/end\s+A\s+(\d+)\s*mm\s+above\s+HP/` | Endpoint named | 0.97 |
| L_TV (D08) | `/top\s+view\s+(\d+)\s*mm/` | "top view" or "plan" | 0.92 |
| L_FV (D09) | `/front\s+view\s+(\d+)\s*mm/` | "front view" or "elevation" | 0.92 |
| α (D10) | `/plan\s+makes\s+(\d+)\s*°\s+with\s+XY/` | "XY" present | 0.90 |
| Δx (D12) | `/projectors\s+(\d+)\s*mm\s+apart/` | "projector" keyword | 0.93 |

---

## 9. Classifier — Combination Matching

### 9.1 Slot Counter (Critical Implementation)

```javascript
function countSlots(extractedData) {
  let slots = 0;
  const slotRecord = {};
  
  // Count each non-null numeric field = 1 slot
  const numericFields = [
    'TL', 'theta', 'phi', 'alpha', 'beta',
    'h_A', 'd_A', 'h_B', 'd_B',
    'L_TV', 'L_FV', 'delta_X',
    'h_mid', 'd_mid', 'VT_h', 'HT_d',
    'L_SV', 'gamma'
  ];
  
  numericFields.forEach(field => {
    if (extractedData[field] !== null && extractedData[field] !== undefined) {
      slots++;
      slotRecord[field] = 1;
    }
  });
  
  // Special conditions that set 2 values are already counted above
  // (e.g., ON_BOTH sets h=0 and d=0, which are counted as 2 slots)
  // So no additional counting needed
  
  // However, track which items consumed 2 slots for reporting
  extractedData.special?.forEach(sk => {
    if (['ON_BOTH', 'N_FROM_BOTH', 'ON_XY'].includes(sk.type)) {
      slotRecord[sk.type] = 2;  // Mark as 2-slot item
    }
  });
  
  return {
    total: slots,
    record: slotRecord,
    dataTypes: Object.keys(slotRecord)
  };
}
```

### 9.2 Completeness Assessment (Per-PROC)

```javascript
const PROC_REQUIREMENTS = {
  'PROC-01': {
    required: ['TL', 'theta', 'phi', 'h_A', 'd_A'],
    description: 'Standard oblique from endpoint A'
  },
  'PROC-05': {
    required: ['TL', 'theta', 'phi', 'h_mid', 'd_mid'],
    description: 'Oblique with midpoint given'
  },
  'PROC-07': {
    required: ['TL', 'theta', 'h_A', 'd_A'],
    special: 'phi_must_be_zero',
    description: 'Case C: inclined to HP, parallel to VP'
  },
  'PROC-13': {
    required: ['L_TV', 'theta', 'phi', 'h_A', 'd_A'],
    description: 'Oblique with top view length given'
  },
  'PROC-17': {
    required: ['L_TV', 'L_FV', 'h_A', 'd_A', 'delta_X'],
    description: 'Both view lengths + projector distance'
  },
  'PROC-24': {
    required: ['TL', 'h_A', 'd_A', 'h_B', 'd_B'],
    description: 'Both endpoints; find inclinations'
  },
  'PROC-25': {
    required: ['h_A', 'd_A', 'h_B', 'd_B', 'delta_X'],
    description: 'All positions; find TL and inclinations'
  },
  // ... all 28 PROCs
};

function assessCompleteness(extractedData, procId) {
  if (!procId) {
    return {
      sufficient: false,
      message: 'No matching procedure found for this data combination',
      missing: []
    };
  }
  
  const req = PROC_REQUIREMENTS[procId];
  const missing = [];
  
  req.required.forEach(field => {
    if (!extractedData[field]) {
      missing.push(formatFieldName(field));
    }
  });
  
  if (req.special === 'phi_must_be_zero' && extractedData.phi && extractedData.phi.value !== 0) {
    missing.push('φ must be 0 (line parallel to VP)');
  }
  
  const sufficient = missing.length === 0;
  
  return {
    sufficient,
    slotsFound: countSlots(extractedData).total,
    slotsRequired: 5,
    missing,
    requiredForProc: req.required,
    message: sufficient 
      ? `✓ Complete: All 5 required data items found for ${req.description}`
      : `✗ Incomplete: Missing ${missing.join(', ')} for ${req.description}`
  };
}

function formatFieldName(field) {
  const MAP = {
    'TL': 'TL (D01 — true length in mm)',
    'theta': 'θ (D02 — true inclination to HP in degrees)',
    'phi': 'φ (D03 — true inclination to VP in degrees)',
    'h_A': 'h_A (D04 — height of end A above HP in mm)',
    'd_A': 'd_A (D05 — distance of end A in front of VP in mm)',
    // ... all fields
  };
  return MAP[field] || field;
}
```

---

## 10. Validator — Domain Rules

### 10.1 Complete Validation Implementation

```javascript
class ConstraintValidator {
  constructor() {
    this.tolerances = {
      length: 0.5,  // mm
      angle: 0.5,   // degrees
      ratio: 0.01   // for cos/sin checks
    };
  }
  
  validate(givenData) {
    const errors = [];
    const warnings = [];
    const checks = [];
    
    // V01: TL must be positive
    if (givenData.TL) {
      const check = { rule: 'V01', field: 'TL', result: 'pass' };
      if (givenData.TL.value <= 0) {
        errors.push({
          rule: 'V01',
          field: 'TL',
          message: `True length must be positive (got ${givenData.TL.value}mm)`,
          explanation: 'A line cannot have zero or negative length'
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V02: θ in [0°, 90°]
    if (givenData.theta) {
      const check = { rule: 'V02', field: 'theta', result: 'pass' };
      const θ = givenData.theta.value;
      if (θ < 0 || θ > 90) {
        errors.push({
          rule: 'V02',
          field: 'theta',
          message: `θ must be in [0°, 90°] (got ${θ}°)`,
          explanation: 'Inclination to HP cannot exceed 90° or be negative'
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V03: φ in [0°, 90°]
    if (givenData.phi) {
      const check = { rule: 'V03', field: 'phi', result: 'pass' };
      const φ = givenData.phi.value;
      if (φ < 0 || φ > 90) {
        errors.push({
          rule: 'V03',
          field: 'phi',
          message: `φ must be in [0°, 90°] (got ${φ}°)`,
          explanation: 'Inclination to VP cannot exceed 90° or be negative'
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V04: θ + φ ≤ 90°
    if (givenData.theta && givenData.phi) {
      const check = { rule: 'V04', field: 'theta+phi', result: 'pass' };
      const sum = givenData.theta.value + givenData.phi.value;
      
      if (sum > 90 + this.tolerances.angle) {
        errors.push({
          rule: 'V04',
          field: 'theta+phi',
          message: `θ + φ = ${sum.toFixed(1)}° exceeds 90° — geometrically impossible`,
          explanation: 'For any real line in 3D space, the sum of inclinations to two perpendicular planes cannot exceed 90°'
        });
        check.result = 'fail';
      } else if (Math.abs(sum - 90) < this.tolerances.angle) {
        warnings.push({
          rule: 'V04',
          message: `θ + φ ≈ 90° → Line lies in Profile Plane (Case D★)`,
          type: 'profile_plane_detected'
        });
        check.result = 'warn';
      }
      checks.push(check);
    }
    
    // V05: L_TV ≤ TL
    if (givenData.TL && givenData.L_TV) {
      const check = { rule: 'V05', field: 'L_TV', result: 'pass' };
      if (givenData.L_TV.value > givenData.TL.value + this.tolerances.length) {
        errors.push({
          rule: 'V05',
          field: 'L_TV',
          message: `L_TV (${givenData.L_TV.value}mm) > TL (${givenData.TL.value}mm)`,
          explanation: 'Projected length in top view cannot exceed true length'
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V06: L_FV ≤ TL
    if (givenData.TL && givenData.L_FV) {
      const check = { rule: 'V06', field: 'L_FV', result: 'pass' };
      if (givenData.L_FV.value > givenData.TL.value + this.tolerances.length) {
        errors.push({
          rule: 'V06',
          field: 'L_FV',
          message: `L_FV (${givenData.L_FV.value}mm) > TL (${givenData.TL.value}mm)`,
          explanation: 'Projected length in front view cannot exceed true length'
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V09: CRITICAL — ∥ HP → θ = 0  (BUG-04 FIX)
    const parHP = givenData.special?.some(s => s.type === 'PARALLEL_HP');
    if (parHP && givenData.theta) {
      const check = { rule: 'V09', field: 'theta', result: 'pass' };
      if (Math.abs(givenData.theta.value) > this.tolerances.angle) {
        errors.push({
          rule: 'V09',
          field: 'theta',
          message: `Conflict: Line stated as ∥ HP requires θ=0°, but θ=${givenData.theta.value}° was given`,
          explanation: '"Parallel to HP" means the line makes 0° angle WITH HP. The angle TO HP is θ. Therefore ∥ HP → θ=0, NOT φ=0. This is the most common validation bug.'
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V10: CRITICAL — ∥ VP → φ = 0  (BUG-05 FIX)
    const parVP = givenData.special?.some(s => s.type === 'PARALLEL_VP');
    if (parVP && givenData.phi) {
      const check = { rule: 'V10', field: 'phi', result: 'pass' };
      if (Math.abs(givenData.phi.value) > this.tolerances.angle) {
        errors.push({
          rule: 'V10',
          field: 'phi',
          message: `Conflict: Line stated as ∥ VP requires φ=0°, but φ=${givenData.phi.value}° was given`,
          explanation: '"Parallel to VP" means the line makes 0° angle WITH VP. The angle TO VP is φ. Therefore ∥ VP → φ=0, NOT θ=0.'
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V11: ⊥ HP → θ = 90
    const perpHP = givenData.special?.some(s => s.type === 'PERP_HP');
    if (perpHP && givenData.theta) {
      const check = { rule: 'V11', field: 'theta', result: 'pass' };
      if (Math.abs(givenData.theta.value - 90) > this.tolerances.angle) {
        errors.push({
          rule: 'V11',
          field: 'theta',
          message: `Conflict: Line stated as ⊥ HP requires θ=90°, but θ=${givenData.theta.value}° was given`
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    // V12: ⊥ VP → φ = 90
    const perpVP = givenData.special?.some(s => s.type === 'PERP_VP');
    if (perpVP && givenData.phi) {
      const check = { rule: 'V12', field: 'phi', result: 'pass' };
      if (Math.abs(givenData.phi.value - 90) > this.tolerances.angle) {
        errors.push({
          rule: 'V12',
          field: 'phi',
          message: `Conflict: Line stated as ⊥ VP requires φ=90°, but φ=${givenData.phi.value}° was given`
        });
        check.result = 'fail';
      }
      checks.push(check);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      checks,
      summary: {
        text: errors.length === 0 
          ? `✓ All ${checks.length} validation checks passed`
          : `✗ ${errors.length} validation error(s) found`,
        errorCount: errors.length,
        warningCount: warnings.length
      }
    };
  }
}
```

---

## 11. Renderer Architecture

### 11.1 Drawing Function Interface

Every PROC function must implement this interface:

```typescript
interface ProcFunction {
  (givenData: GivenData, canvas: CanvasContext, config: RenderConfig): DrawResult;
}

interface DrawResult {
  steps: Step[];           // Step-by-step instructions
  annotations: Annotation[]; // Final labels and dimensions
  result: ConstructionResult;  // Values found by construction
}

interface Step {
  id: number | string;
  title: string;          // Short title for step counter
  text: string;           // Instruction (can use {template} vars)
  why: string;            // Pedagogical explanation
  constructionLines?: ConstructionLine[];
  foundByConstruction?: boolean;
}

interface ConstructionResult {
  TL_found?: number;      // If TL was derived
  theta_found?: number;   // If θ was derived
  phi_found?: number;     // If φ was derived
}
```

### 11.2 Example: PROC-01 Implementation

```javascript
window.DRAWING_PROCEDURES = {
  
  'PROC-01': function drawOblique_Standard(givenData, canvas, cfg) {
    // Given: TL, θ, φ, h_A, d_A
    // Method: Rotating line (auxiliary view) method
    
    const TL = givenData.TL.value;
    const theta = givenData.theta.value;
    const phi = givenData.phi.value;
    const h_A = givenData.h_A.value;
    const d_A = givenData.d_A.value;
    
    return {
      steps: [
        {
          id: 1,
          title: "Draw XY and mark endpoint A",
          text: `Draw the reference line XY horizontally. Mark point a at d_A=${d_A}mm BELOW XY (this is end A in Top View). Mark point a' at h_A=${h_A}mm ABOVE XY (this is end A in Front View). Draw a vertical projector through a and a'.`,
          why: "The XY line represents the intersection of HP and VP. Points below XY are in the TV region (HP); points above are in the FV region (VP). Every point on the line has two projections: one in each view.",
          constructionLines: [
            { type: 'xy_line', style: 'solid', color: '#7D8590' },
            { type: 'point', id: 'a', x: 100, y: cfg.XY_Y + cfg.scale * d_A },
            { type: 'point', id: "a'", x: 100, y: cfg.XY_Y - cfg.scale * h_A },
            { type: 'projector', from: 'a', to: "a'", style: 'dashed' }
          ]
        },
        {
          id: 2,
          title: `Draw Auxiliary Front View at θ=${theta}°`,
          text: `From a', draw a line at ${theta}° to XY (upward, to the right), length TL=${TL}mm. Label its end p. This is the AUXILIARY FRONT VIEW — it shows what the FV would look like if the line were parallel to VP.`,
          why: `When a line is parallel to VP, its front view shows the TRUE length and TRUE inclination to HP (θ). By temporarily imagining the line in this position, we isolate θ and TL in the FV. This auxiliary line a'p is drawn at the TRUE angle θ = ${theta}°.`,
          constructionLines: [
            { type: 'line', from: "a'", angle: theta, length: TL * cfg.scale, 
              id: 'aux_fv', style: 'dashed', color: '#D29922', label: 'Aux. FV' }
          ]
        },
        {
          id: 3,
          title: `Draw Auxiliary Top View at φ=${phi}°`,
          text: `From a, draw a line at ${phi}° to XY (to the right), length TL=${TL}mm. Label its end q. This is the AUXILIARY TOP VIEW — it shows what the TV would look like if the line were parallel to HP.`,
          why: `When a line is parallel to HP, its top view shows the TRUE length and TRUE inclination to VP (φ). The auxiliary line aq at angle φ = ${phi}° isolates φ and TL in the TV.`,
          constructionLines: [
            { type: 'line', from: 'a', angle: phi, length: TL * cfg.scale,
              id: 'aux_tv', style: 'dashed', color: '#A371F7', label: 'Aux. TV' }
          ]
        },
        {
          id: 4,
          title: "Locate end B in Front View (b')",
          text: `From p, draw a vertical projector (perpendicular to XY). With centre a', swing an arc of radius TL=${TL}mm to cut this projector. The intersection is b' (position of end B in FV).`,
          why: `End B must be at distance TL from end A (that is the true length). But b' must also be directly above or below where b will be in the TV. The arc from a' of radius TL gives all possible positions of b' — the projector from p selects the one that is geometrically consistent with the oblique orientation.`,
          constructionLines: [
            { type: 'projector', from: 'p', vertical: true },
            { type: 'arc', center: "a'", radius: TL * cfg.scale, color: '#F78166' },
            { type: 'point', id: "b'", at: 'intersection' }
          ]
        },
        {
          id: 5,
          title: "Locate end B in Top View (b)",
          text: `From b', draw a vertical projector downward. From a, swing an arc of radius TL=${TL}mm. The intersection with the projector from b' gives point b (position of end B in TV).`,
          why: `By the same logic: b must be at true length TL from a, AND it must be directly below b'. The arc from a ensures the true length is maintained; the projector from b' constrains the position.`,
          constructionLines: [
            { type: 'projector', from: "b'", vertical: true },
            { type: 'arc', center: 'a', radius: TL * cfg.scale, color: '#F78166' },
            { type: 'point', id: 'b', at: 'intersection' }
          ]
        },
        {
          id: 6,
          title: "Draw the Final Views",
          text: `Draw the FRONT VIEW: join a' to b' (blue). Draw the TOP VIEW: join a to b (green). Both views are now complete.`,
          why: `a'b' is the Front View (projection onto VP). ab is the Top View (projection onto HP). These are the required engineering drawings of the line AB.`,
          constructionLines: [
            { type: 'line', from: "a'", to: "b'", style: 'solid', color: '#58A6FF', width: 2, label: 'FV' },
            { type: 'line', from: 'a', to: 'b', style: 'solid', color: '#3FB950', width: 2, label: 'TV' }
          ]
        },
        {
          id: 7,
          title: "Measure and annotate apparent angles",
          text: `Measure angle α = angle that ab makes with XY. Measure angle β = angle that a'b' makes with XY. Annotate both. Note: α ≠ φ and β ≠ θ in general.`,
          why: `α and β are the APPARENT angles — what the line looks like in each view. They are always LESS than or EQUAL to the true angles θ and φ. This is because projected views foreshorten the line. Students often confuse apparent angles with true inclinations.`
        }
      ],
      
      annotations: [
        { type: 'dimension', points: ['a', 'b'], label: `L_TV = ${(TL * Math.cos(theta * Math.PI/180)).toFixed(1)}mm` },
        { type: 'dimension', points: ["a'", "b'"], label: `L_FV = ${(TL * Math.cos(phi * Math.PI/180)).toFixed(1)}mm` },
        { type: 'angle', vertex: "a'", label: `β` },
        { type: 'angle', vertex: 'a', label: `α` }
      ],
      
      result: {
        // No values found by construction in PROC-01 — all were given
      }
    };
  },
  
  // ... 27 more PROC functions
};
```

---

## 12. Step-by-Step Procedures

### 12.1 PROC-15: L_TV + θ (Case C Variant)

**Given Data:** `L_TV, θ, φ=0, h_A, d_A`

```javascript
'PROC-15': function drawLTV_Theta_CaseC(givenData, canvas, cfg) {
  const L_TV = givenData.L_TV.value;
  const theta = givenData.theta.value;
  const h_A = givenData.h_A.value;
  const d_A = givenData.d_A.value;
  // phi = 0 (parallel to VP)
  
  return {
    steps: [
      {
        id: 1,
        title: "Mark endpoint A",
        text: `Draw XY. Mark a at d_A=${d_A}mm below XY. Mark a' at h_A=${h_A}mm above XY.`,
        why: "Standard starting point for all procedures."
      },
      {
        id: 2,
        title: "Draw Top View horizontal",
        text: `Draw TV: line ab PARALLEL to XY, length L_TV=${L_TV}mm.`,
        why: `φ=0 means the line is parallel to VP. When parallel to VP, every point on the line is at the same distance from VP. The top view, which maps distances from VP, therefore appears as a horizontal line — all points project to the same y-level below XY.`,
        constructionLines: [
          { type: 'line', from: 'a', horizontal: true, length: L_TV * cfg.scale, 
            color: '#3FB950', width: 2, label: 'TV (L_TV given)' }
        ]
      },
      {
        id: 3,
        title: `Draw Front View at θ=${theta}°`,
        text: `From a', draw a line at ${theta}° to XY (upward). Extend until it meets the projector from b. This intersection is b'.`,
        why: `The line makes θ=${theta}° with HP. Since φ=0 (line is ∥ VP), the front view directly shows this true inclination at angle θ. The FV line from a' at θ intersects the vertical projector from b — this geometric intersection determines b' and simultaneously determines TL.`,
        constructionLines: [
          { type: 'projector', from: 'b', vertical: true },
          { type: 'line', from: "a'", angle: theta, extendTo: 'projector_from_b',
            color: '#58A6FF', width: 2, label: 'FV at θ' },
          { type: 'point', id: "b'", at: 'intersection' }
        ],
        foundByConstruction: true
      },
      {
        id: 4,
        title: "Measure True Length",
        text: `Measure the length a'b'. This is TL (true length), found by construction.`,
        why: `TL was NOT given in the problem. It emerges from the geometric construction. When the TV is horizontal (φ=0) and has length L_TV, and the FV is drawn at angle θ, the length a'b' in the FV equals the true length. This demonstrates the relationship: TL = L_TV / cos(θ).`,
        foundByConstruction: true
      }
    ],
    
    annotations: [
      { type: 'dimension', points: ['a', 'b'], label: `L_TV = ${L_TV}mm (given)` },
      { type: 'dimension', points: ["a'", "b'"], 
        label: `TL = ${(L_TV / Math.cos(theta * Math.PI/180)).toFixed(1)}mm (found)`,
        color: '#79C0FF', style: 'italic' }
    ],
    
    result: {
      TL_found: L_TV / Math.cos(theta * Math.PI/180)
    }
  };
}
```

---

## 13. Stable Output Shape

```typescript
interface ParseResult {
  // Core status
  success: boolean;
  procId: string | null;                    // 'PROC-01' through 'PROC-28'
  caseType: string | null;                  // 'A'|'B'|'C'|'D'|'D★'|'2A'|'2B'
  
  // Extracted data (ONLY what was explicitly given)
  givenData: {
    // Numerical data types
    TL: ConstraintValue | null;
    theta: ConstraintValue | null;
    phi: ConstraintValue | null;
    alpha: ConstraintValue | null;
    beta: ConstraintValue | null;
    h_A: ConstraintValue | null;
    d_A: ConstraintValue | null;
    h_B: ConstraintValue | null;
    d_B: ConstraintValue | null;
    L_TV: ConstraintValue | null;
    L_FV: ConstraintValue | null;
    delta_X: ConstraintValue | null;
    h_mid: ConstraintValue | null;
    d_mid: ConstraintValue | null;
    VT_h: ConstraintValue | null;
    HT_d: ConstraintValue | null;
    L_SV: ConstraintValue | null;
    gamma: ConstraintValue | null;
    
    // Special conditions
    special: SpecialConstraint[];
  };
  
  // Slot accounting
  slotsConsumed: number;                    // Should = 5 if sufficient
  dataTypesFound: string[];                 // ['D01','D02','D03','D04','D05']
  
  // Completeness assessment
  completeness: {
    sufficient: boolean;
    slotsFound: number;
    slotsRequired: 5;
    missing: string[];                      // Named missing fields
    requiredForProc: string[];              // What this PROC needs
    nearestProcId: string | null;           // If insufficient
    nearestMissing: string[];               // What's missing for nearest
    procCandidates: Array<{                 // Alternative PROCs
      procId: string;
      missing: string[];
    }>;
  };
  
  // Validation results
  validation: {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    checks: ValidationCheck[];
    summary: {
      text: string;
      errorCount: number;
      warningCount: number;
    };
  };
  
  // Modifiers
  traceRequired: boolean;                   // If SK12 detected
  
  // Metadata
  metadata: {
    originalText: string;
    normalizedText: string;
    endpoints: string[];                    // ['A', 'B']
    primaryEndpoint: string;                // 'A'
    patternsMatched: PatternMatch[];
  };
}

interface ConstraintValue {
  value: number;
  confidence: number;                       // 0.70 - 0.99
  sourceText: string;
  position: number;
  // NOTE: 'inferred' property must NEVER exist
}

interface SpecialConstraint {
  type: string;                             // 'PARALLEL_HP', etc.
  value?: number;                           // For SK08: the N value
  sourceText: string;
  slotsConsumed: number;                    // 1 or 2
}

interface ValidationError {
  rule: string;                             // 'V01', 'V02', etc.
  field?: string;
  message: string;
  explanation?: string;
}
```

---

## 14. Test Suite — 25 Problems

### 14.1 Complete Test Definitions

```javascript
const REGRESSION_TESTS = [
  
  // T01: Standard oblique with cross-endpoints
  {
    id: 'T01',
    name: 'Standard Oblique — Cross-Endpoints (h_A + d_B)',
    input: 'A straight line AB 50mm long has its end A 10mm above HP and end B 50mm in front of VP. It is inclined at 30° to HP and 45° to VP.',
    expected: {
      procId: 'PROC-03',
      caseType: 'D',
      slotsConsumed: 5,
      givenData: {
        TL: { value: 50, confidence: 0.97 },
        theta: { value: 30, confidence: 0.98 },
        phi: { value: 45, confidence: 0.98 },
        h_A: { value: 10, confidence: 0.97 },
        d_B: { value: 50, confidence: 0.97 },
      },
      mustBeNull: ['h_B', 'd_A', 'L_TV', 'L_FV', 'alpha', 'beta'],
      noInferredFlags: true
    }
  },
  
  // T02: Reversed angle order
  {
    id: 'T02',
    name: 'Reversed Angle Order — φ before θ',
    input: 'One end of line CD 70mm long is 20mm above HP and 15mm in front of VP. It is inclined at 40° to VP and 50° to HP.',
    expected: {
      procId: 'PROC-01',
      caseType: 'D',
      slotsConsumed: 5,
      givenData: {
        TL: { value: 70 },
        theta: { value: 50 },  // ← Note: 50 is to HP
        phi: { value: 40 },    // ← Note: 40 is to VP (reversed in text)
        h_A: { value: 20 },
        d_A: { value: 15 },
      },
      mustBeNull: ['h_B', 'd_B'],
      noInferredFlags: true
    }
  },
  
  // T03: Both endpoints — find angles (inverse problem)
  {
    id: 'T03',
    name: 'Both Endpoints Given — Find Inclinations',
    input: 'A line AB 85mm long has end A 25mm above HP and 20mm in front of VP. End B is 60mm above HP and 50mm in front of VP.',
    expected: {
      procId: 'PROC-24',
      caseType: 'D',
      slotsConsumed: 5,
      givenData: {
        TL: { value: 85 },
        h_A: { value: 25 },
        d_A: { value: 20 },
        h_B: { value: 60 },
        d_B: { value: 50 },
      },
      mustBeNull: ['theta', 'phi', 'L_TV', 'L_FV'],  // NOT computed
      noInferredFlags: true
    }
  },
  
  // T07: L_TV + θ + equidistant — TL NOT inferred (BUG-08 check)
  {
    id: 'T07',
    name: 'L_TV Given + Equidistant — TL Stays NULL',
    input: 'Line CD inclined at 25° to HP measures 80mm in top view. End C in first quadrant, 25mm and 15mm from HP and VP. End D equidistant from both planes.',
    expected: {
      procId: 'PROC-13',  // or similar
      caseType: null,     // Can't determine without TL
      slotsConsumed: 5,
      givenData: {
        L_TV: { value: 80 },
        theta: { value: 25 },
        h_A: { value: 25 },
        d_A: { value: 15 },
      },
      mustBeNull: ['TL', 'phi'],  // ← CRITICAL: TL NOT inferred
      specialFlags: ['EQUAL_DIST', 'FIRST_QUAD'],
      noInferredFlags: true
    }
  },
  
  // T13: Midpoint given — h_A/h_B stay NULL (BUG-06 check)
  {
    id: 'T13',
    name: 'Midpoint Given — Endpoints NOT Derived',
    input: 'Midpoint of line AB is 60mm above HP and 50mm in front of VP. Line is 80mm long, inclined at 30° to HP and 45° to VP.',
    expected: {
      procId: 'PROC-05',
      caseType: 'D',
      slotsConsumed: 5,
      givenData: {
        TL: { value: 80 },
        theta: { value: 30 },
        phi: { value: 45 },
        h_mid: { value: 60 },
        d_mid: { value: 50 },
      },
      mustBeNull: ['h_A', 'd_A', 'h_B', 'd_B'],  // ← NOT derived from midpoint
      noInferredFlags: true
    }
  },
  
  // T14: "Nmm from both planes" — 2 slots (BUG-07 check)
  {
    id: 'T14',
    name: 'N From Both Planes — 2 Slots',
    input: 'Line AB 85mm. End A 25mm from both HP and VP, in first quadrant. Inclined at 50° to HP and 30° to VP. Mark the traces.',
    expected: {
      procId: 'PROC-01',
      caseType: 'D',
      slotsConsumed: 5,
      givenData: {
        TL: { value: 85 },
        theta: { value: 50 },
        phi: { value: 30 },
        h_A: { value: 25 },  // ← From "25mm from both"
        d_A: { value: 25 },  // ← From "25mm from both"
      },
      specialFlags: ['N_FROM_BOTH', 'FIRST_QUAD', 'TRACE_REQ'],
      traceRequired: true,
      noInferredFlags: true
    }
  },
  
  // T21: "deg" variant — BUG-01 check
  {
    id: 'T21',
    name: 'Degree Variant "deg" — Must NOT Produce "40°g"',
    input: 'Line FG 50mm long. End F 10mm above HP and 15mm in front of VP. Inclined at 35 deg to HP and 55 deg to VP.',
    expected: {
      procId: 'PROC-01',
      caseType: 'D',
      slotsConsumed: 5,
      givenData: {
        TL: { value: 50 },
        theta: { value: 35 },  // ← From "35 deg"
        phi: { value: 55 },    // ← From "55 deg"
        h_A: { value: 10 },
        d_A: { value: 15 },
      },
      noInferredFlags: true
    },
    bugCheck: 'BUG-01'
  },
  
  // ... 18 more tests for complete 25-test suite
  
];
```

### 14.2 Test Verification Logic

```javascript
function verifyTest(testCase, parseResult) {
  const failures = [];
  
  // 1. Check PROC-ID
  if (parseResult.procId !== testCase.expected.procId) {
    failures.push(`PROC-ID: expected ${testCase.expected.procId}, got ${parseResult.procId}`);
  }
  
  // 2. Check slot count
  if (parseResult.slotsConsumed !== testCase.expected.slotsConsumed) {
    failures.push(`Slots: expected ${testCase.expected.slotsConsumed}, got ${parseResult.slotsConsumed}`);
  }
  
  // 3. Check each given value
  Object.entries(testCase.expected.givenData).forEach(([field, expected]) => {
    const actual = parseResult.givenData[field];
    
    if (!actual) {
      failures.push(`${field}: expected ${expected.value}, got null`);
      return;
    }
    
    if (Math.abs(actual.value - expected.value) > 0.5) {
      failures.push(`${field}: expected ${expected.value}, got ${actual.value}`);
    }
    
    // CRITICAL: Check no 'inferred' flag
    if (actual.inferred) {
      failures.push(`${field}: ILLEGAL INFERENCE — field was marked as inferred`);
    }
  });
  
  // 4. Check mustBeNull fields
  (testCase.expected.mustBeNull || []).forEach(field => {
    if (parseResult.givenData[field] !== null) {
      failures.push(`${field}: should be NULL (not inferred), but got ${parseResult.givenData[field]?.value}`);
    }
  });
  
  // 5. Global no-inference check
  if (testCase.expected.noInferredFlags) {
    Object.entries(parseResult.givenData).forEach(([field, value]) => {
      if (value && value.inferred) {
        failures.push(`GLOBAL: ${field} has inferred flag (all fields must be explicitly extracted)`);
      }
    });
  }
  
  return {
    testId: testCase.id,
    passed: failures.length === 0,
    failures,
    summary: failures.length === 0 
      ? `✅ ${testCase.id}: ${testCase.name}` 
      : `❌ ${testCase.id}: ${failures.length} error(s)`
  };
}
```

---

## 15. Pedagogical Design Guidelines

### 15.1 Teaching Progression (Recommended Order)

| Week | Level | Cases | PROCs | Learning Objective |
|---|---|---|---|---|
| 1 | Foundation | Case A | PROC-12 | Understand XY line, HP, VP, projectors. Both views show TL. |
| 2 | Single Inclin. (HP) | Case C | PROC-07 | FV shows true angle θ. TV is horizontal. WHY? |
| 3 | Single Inclin. (VP) | Case B | PROC-08 | TV shows true angle φ. FV is horizontal. WHY? |
| 4 | Perpendiculars | 2A, 2B | PROC-09, 11 | One view collapses to a point. The geometric reason. |
| 5-6 | Oblique Standard | Case D | PROC-01 | Rotating line method. Auxiliary views. Master skill. |
| 7 | L_TV/L_FV Given | Case D | PROC-13, 15 | Projected lengths used directly. TL emerges. |
| 8 | Both Endpoints | Case D | PROC-24, 25 | Inverse: find TL and angles from positions. |
| 9 | Advanced | Mixed | PROC-05, 17, 19-28 | Midpoint, apparent angles, traces, mixed data. |

### 15.2 "Why?" Annotation System

Every step must have pedagogical explanation:

| Drawing Action | Why? Explanation |
|---|---|
| TV ∥ XY when φ=0 | When line ∥ VP, every point is at same distance from VP. TV (mapping distances from VP) appears horizontal. |
| FV ∥ XY when θ=0 | When line ∥ HP, every point is at same height above HP. FV (mapping heights) appears horizontal. |
| Swing arc of TL | Arc shows ALL positions where B could be at distance TL from A. Projector selects the geometrically consistent one. |
| Rotate to horizontal | When FV is horizontal, line is ∥ HP. In this position, FV shows TL. Rotation reveals the true length geometrically. |
| TV = point when ⊥ HP | Line drops straight into HP. Every point maps to same location on HP. Entire TV collapses to one point. |
| Auxiliary view at θ | If line were ∥ VP, FV would show TL at angle θ. This imaginary position sets up the arc for construction. |

---

## 16. Bug Registry

| ID | Bug Description | Location | Root Cause | Fix | Test | Priority |
|---|---|---|---|---|---|---|
| **BUG-01** | "40 deg" → "40°g" | normalizer | Regex captures trailing 'g' | Use `/deg(?![a-z])/gi` | T21 | 🔴 CRITICAL |
| **BUG-02** | Article "A" → endpoint A | extractor | Single-letter scan | Only from labels or "end A" | T01-25 | 🔴 CRITICAL |
| **BUG-03** | L_TV=70 parsed as TL=70 | extractor | Missing context check | Check "top view" before classifying | T05, T07 | 🟠 HIGH |
| **BUG-04** | ∥ HP sets φ=0 | classifier | Rules swapped | ∥ HP → θ=0 NOT φ=0 | validator | 🔴 CRITICAL |
| **BUG-05** | ∥ VP sets θ=0 | classifier | Rules swapped | ∥ VP → φ=0 NOT θ=0 | validator | 🔴 CRITICAL |
| **BUG-06** | h_mid → h_A | extractor | No midpoint routing | Route to D13/D14 when SK11 active | T13 | 🟠 HIGH |
| **BUG-07** | "15mm both" → only h=15 | extractor | Incomplete pattern | Extract h=15 AND d=15 | T14, T17 | 🟠 HIGH |
| **BUG-08** | TL inferred from L_TV | classifier | Inference code exists | REMOVE all inference | T07 | 🔴 CRITICAL |
| **BUG-09** | Null crash in UI | integration | No null checks | Use `?.` optional chaining | all | 🟠 HIGH |
| **BUG-10** | parse() throws | orchestrator | No try/catch | Wrap entire parse() | all | 🟠 HIGH |
| **BUG-11** | Generic "Only N of 5" | classifier | Count-based message | Return named fields | all | 🟡 MEDIUM |
| **BUG-12** | Wrong h_A from TL | extractor | Small context window | Expand to 100 chars | — | 🟡 MEDIUM |
| **BUG-13** | α confused with θ | extractor | Same pattern | Separate patterns for XY angles | T10, T20 | 🟡 MEDIUM |

---

## 17. Implementation Checklist

### 17.1 Week-by-Week Schedule

**Week 1-2: Parser Core**
- [ ] Implement normalizer with BUG-01 fix
- [ ] Implement extractor with all 22 data type patterns
- [ ] Fix BUG-02 (endpoint detection)
- [ ] Fix BUG-06 (midpoint routing)
- [ ] Fix BUG-07 (N_FROM_BOTH pattern)
- [ ] Unit tests for each extraction pattern

**Week 2-3: Classifier & Validator**
- [ ] Implement slot counter with 2-slot items
- [ ] Implement PROC matcher for all 28 combinations
- [ ] Remove ALL inference code (BUG-08)
- [ ] Implement validator with V01-V17
- [ ] Fix BUG-04/05 (parallel rules)
- [ ] Named missing field messages (BUG-11)

**Week 3: Orchestrator & Integration**
- [ ] Implement orchestrator with stable ParseResult
- [ ] Fix BUG-10 (try/catch wrapper)
- [ ] Implement integration layer
- [ ] Fix BUG-09 (null-safe rendering)
- [ ] Parser complete — run all 25 tests
- [ ] **Milestone: 25/25 parser tests pass**

**Week 4: Core PROCs**
- [ ] PROC-01 (master oblique)
- [ ] PROC-07, 08, 12 (basic cases)
- [ ] PROC-09, 11 (perpendicular)
- [ ] Visual standards (colors, annotations)
- [ ] Step-by-step with "Why?" explanations

**Week 5-6: Advanced PROCs**
- [ ] PROC-13, 14, 15, 16 (projected lengths)
- [ ] PROC-17 (two-arc method)
- [ ] PROC-05 (midpoint)
- [ ] PROC-19 (apparent angles)

**Week 7-8: Complete & Polish**
- [ ] PROC-20-27 (remaining)
- [ ] PROC-28 (trace modifier)
- [ ] All 28 PROCs implemented
- [ ] Integration testing
- [ ] User acceptance testing
- [ ] **Final Milestone: Production ready**

---

## 18. File Architecture

```
virtual-lab/
├── lines-index.html                      [Main UI entry point]
├── lines-styles.css                      [UI styling]
│
├── lines-core.js                         [Canvas utilities — unchanged]
├── lines-shared.js                       [Shared helpers — unchanged]
│
├── [PARSER MODULES — load order critical]
│   ├── lines-parser-normalizer.js        [Stage 1: Text normalization]
│   ├── lines-parser-extractor.js         [Stage 2: Entity extraction]
│   ├── lines-parser-classifier.js        [Stage 3: PROC-ID matching]
│   ├── lines-parser-validator.js         [Stage 4: Domain validation]
│   ├── lines-parser-disambig.js          [Stage 5: Ambiguity resolution]
│   ├── lines-parser-orchestrator.js      [Coordinates all stages]
│   └── lines-parser-integration.js       [UI integration layer]
│
├── [DRAWING PROCEDURES — NEW]
│   └── lines-drawing-procedures.js       [All 28 PROC functions]
│
└── [TESTING]
    └── lines-parser-tests.html           [25 regression tests]
```

---

## Appendix A — Confidence Scoring

| Source of Value | Confidence Score | Reason |
|---|---|---|
| Explicit paired angles | 0.98 | Very clear θ and φ assignment |
| Explicit individual angle | 0.95 | Clear context (to HP/to VP) |
| Special keyword (∥, ⊥) | 0.99 | Unambiguous |
| Explicit endpoint position | 0.97 | Endpoint letter + value + plane |
| Implicit position (first) | 0.90 | Inferred endpoint from sentence |
| Implicit position (second) | 0.85 | Less certain assignment |
| True length near label | 0.97 | Clear context |
| Projected length | 0.92 | "top view" or "front view" explicit |
| Apparent angle | 0.90 | "with XY" indicates apparent |
| Midpoint | 0.96 | "midpoint" keyword present |
| Over-determined value | 0.80 | Extra data (serves as check) |

---

## Appendix B — All 28 PROC-IDs Quick Reference

| PROC | 5 Data | Method | Case |
|---|---|---|---|
| 01 | TL,θ,φ,h_A,d_A | Rotating line from A | D |
| 02 | TL,θ,φ,h_B,d_B | Rotating line from B | D |
| 03 | TL,θ,φ,h_A,d_B | Cross-endpoint | D |
| 04 | TL,θ,φ,h_B,d_A | Cross-endpoint | D |
| 05 | TL,θ,φ,h_mid,d_mid | Midpoint method | D |
| 06 | TL,θ,φ,h_mid,d_A | Midpoint+endpoint | D |
| 07 | TL,θ,φ=0,h_A,d_A | FV at θ; TV horizontal | C |
| 08 | TL,θ=0,φ,h_A,d_A | TV at φ; FV horizontal | B |
| 09 | TL,θ=90,φ=0,h_A,d_A | TV=point; FV=vertical | 2A |
| 10 | (same as 09) | Variant | 2A |
| 11 | TL,θ=0,φ=90,h_A,d_A | FV=point; TV=horizontal | 2B |
| 12 | TL,θ=0,φ=0,h_A,d_A | Both horizontal | A |
| 13 | L_TV,θ,φ,h_A,d_A | TV first; TL found | D |
| 14 | L_FV,θ,φ,h_A,d_A | FV first; TL found | D |
| 15 | L_TV,θ,φ=0,h_A,d_A | TV horizontal | C |
| 16 | L_FV,θ=0,φ,h_A,d_A | FV horizontal | B |
| 17 | L_TV,L_FV,h_A,d_A,Δx | Two-arc method | D |
| 18 | L_TV,L_FV,h_A=0,d_A,Δx | Arc; A on HP | D |
| 19 | TL,α,β,h_A,d_A | Apparent angles | D |
| 20 | L_TV,α,h_A,d_A,h_B | TV at α | D |
| 21 | L_FV,β,h_A,d_A,d_B | FV at β | D |
| 22 | TL,α,h_A,d_A,h_B | TL + TV angle | D |
| 23 | TL,β,h_A,d_A,d_B | TL + FV angle | D |
| 24 | TL,h_A,d_A,h_B,d_B | Both ends; find angles | D |
| 25 | h_A,d_A,h_B,d_B,Δx | All pos; find TL | D |
| 26 | TL,h_A,d_A,h_B,Δx | Partial endpoints | D |
| 27 | TL,h_A,d_A,d_B,Δx | Partial endpoints | D |
| 28 | [any]+SK12 | +Trace steps | any |

---

## Appendix C — Common Textbook Phrasings

*(See Section 4 for complete data type catalogue with all phrasings)*

---

## Appendix D — Algorithm Pseudocode

*(See Section 7, 9 for complete algorithms)*

---

## Appendix E — Error Message Templates

*(See Section 10 for validation error templates)*

---

## Appendix F — Integration with Existing Lab

**Minimal changes required:**
1. Replace 7 parser module files (same filenames)
2. Add 1 new file: lines-drawing-procedures.js
3. Update integration point in lines-parser-integration.js
4. No changes to HTML, CSS, or canvas core

---

## Appendix G — Future Enhancements

1. Sketch recognition (touch/stylus input)
2. Timeline slider (scrub through construction steps)
3. Multiple solution paths for same data
4. Error injection mode (teacher mode)
5. 3D view (rotate to see actual 3D line)
6. Export to CAD (DXF format)
7. Collaborative mode (two students, one problem)

---

## Document Metadata

**Version:** 3.0.0  
**Date:** February 2024  
**Status:** Authoritative Reference  
**Estimated Effort:** 8 weeks, 36 person-days  
**Test Corpus:** 443 textbook problems analyzed  
**Coverage:** 28 drawing procedures, 25 regression tests  
**Document Length:** ~1500 lines of comprehensive specification  

---

*End of Complete Virtual Lab Development Specification*
