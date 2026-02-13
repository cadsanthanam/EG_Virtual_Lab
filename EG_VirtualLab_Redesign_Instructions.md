# EG Virtual Lab — Complete UI/UX Redesign Instructions
## Agent Execution Guide · Enterprise Edu-Platform Standard

> **Audit basis:** Live screenshots (home page, solids lab, content/introduction page) +
> full source review of `globals.css` (1,872 lines), `Sidebar.tsx`, `InputPanel.tsx`,
> `InstructionPanel.tsx`, `CanvasControls.tsx`, `CanvasRenderer.tsx`, `StepNavigator.tsx`,
> `layout.tsx`, and `page.tsx`.
>
> **Execute instructions in the order listed.** Each section is self-contained and buildable
> independently, but later sections depend on decisions made in earlier ones.

---

## SECTION 0 — Stack Decision (Do This First)

### Recommendation: Migrate to Tailwind CSS v4 + shadcn/ui

**Why:**
- The current `globals.css` is 1,872 lines of hand-rolled CSS with duplicated patterns
  (`.nav-btn` vs `.control-btn`, `.error-message` vs `.error-msg`, `.zoom-btn` vs
  `.control-btn` are near-identical). Tailwind eliminates this class of problem entirely.
- shadcn/ui provides production-grade, accessible, unstyled-but-beautiful components
  (Select, Slider, Tooltip, Sheet for mobile drawer) that exactly match the needs of
  the input panel — no need to hand-build them.
- The existing CSS custom property token system maps cleanly to a Tailwind config.
- Both are zero-runtime, Next.js-native, and tree-shaken — no performance cost.

**Third-party libraries to add:**

| Library | Purpose | Install |
|---|---|---|
| `tailwindcss` v4 | Utility-first CSS framework | `npm i tailwindcss @tailwindcss/vite` |
| `shadcn/ui` | Accessible component primitives | `npx shadcn@latest init` |
| `lucide-react` | Already in use — keep | Already installed |
| `framer-motion` | Micro-animations (sidebar collapse, step transitions) | `npm i framer-motion` |
| `clsx` + `tailwind-merge` | Conditional class composition | `npm i clsx tailwind-merge` |
| `@radix-ui/react-tooltip` | Tooltips on control buttons | Via shadcn |
| `zustand` | State management — already in use via `useLabStore` — keep | Already installed |

**If Tailwind migration is not approved by project lead:** The instructions below also
include direct CSS class/variable changes that achieve 80% of the same result while
staying in the existing CSS architecture. These are marked with `[CSS-ONLY FALLBACK]`.

---

## SECTION 1 — Design Token System Overhaul

**Problem:** The current token system is good in concept but has gaps: hardcoded hex colors
scattered throughout (e.g., `#eff6ff`, `#dbeafe`, `#fef3c7`), inconsistent use, and no
semantic layer separating "brand" from "component" tokens.

### 1.1 — Update `:root` in `globals.css`

Replace the existing `:root` block with the following expanded token system. Keep all
existing tokens, ADD the new semantic tokens below:

```css
:root {
  /* ── Existing tokens: keep as-is ── */

  /* ── NEW: Semantic Surface Tokens ── */
  --surface-app: #0d0d12;          /* Darkest — app shell background */
  --surface-sidebar: #111118;      /* Sidebar dark surface */
  --surface-panel: #ffffff;        /* Input panel light surface */
  --surface-canvas: #f8f9fc;       /* Canvas area background */
  --surface-toolbar: #ffffff;      /* Top toolbar */
  --surface-instruction: #eef3ff; /* Instruction bar (replaces hardcoded #eff6ff) */

  /* ── NEW: Semantic Border Tokens ── */
  --border-app: rgba(255,255,255,0.07);   /* Dark surface borders */
  --border-panel: #e8ecf4;                /* Light panel borders */
  --border-accent: var(--primary-color);  /* Active/focus borders */

  /* ── NEW: Interactive State Tokens ── */
  --interactive-hover-dark: rgba(255,255,255,0.05);
  --interactive-hover-light: rgba(99,102,241,0.06);
  --interactive-active: rgba(99,102,241,0.12);
  --interactive-selected-text: var(--primary-light);

  /* ── NEW: Step/Progress Tokens ── */
  --step-active-bg: var(--primary-color);
  --step-done-bg: var(--success-color);
  --step-inactive-bg: #e2e8f0;

  /* ── NEW: Sidebar width tokens (for resizable sidebar future) ── */
  --sidebar-width: 256px;
  --sidebar-collapsed-width: 60px;
  --input-panel-width: 280px;
}
```

**[CSS-ONLY FALLBACK]:** Do the above in globals.css directly. Perform a find-and-replace
sweep: replace every hardcoded `#eff6ff` and `#dbeafe` occurrence with
`var(--surface-instruction)`, every `#fef3c7` with a new `--surface-challenge` token.

---

## SECTION 2 — Global Layout Shell

**Problem (confirmed by screenshot 2):** The layout has a jarring hard seam between the
pitch-black sidebar (`#09090b`) and the white input panel — no gradient bridge, no
spatial depth. The lab looks like two unrelated apps glued together.

### 2.1 — Update `.lab-layout` in `globals.css`

```css
.lab-layout {
  display: grid;
  /* Sidebar | Input Panel | Canvas */
  grid-template-columns: var(--sidebar-width) var(--input-panel-width) 1fr;
  grid-template-rows: 100vh;
  height: 100vh;
  overflow: hidden;
  background: var(--surface-app);
}

.lab-content {
  flex: 1;
  overflow-y: auto;
  background: var(--surface-panel);
  /* Remove the abrupt edge with a subtle inner shadow on the left */
  box-shadow: inset 3px 0 12px rgba(0,0,0,0.04);
}
```

**Note:** This changes the layout from `flex` to `grid` — update `Sidebar.tsx` and
`InputPanel.tsx` to remove their explicit `width` declarations and let the grid column
sizing take over. This is critical for responsive behavior later.

### 2.2 — Add a Gradient Bridge Between Sidebar and Content

In the sidebar's `border-right`, replace the single pixel with a gradient separator:

```css
.sidebar {
  /* existing styles... */
  border-right: none; /* Remove hard border */
  position: relative;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(99,102,241,0.3) 20%,
    rgba(99,102,241,0.15) 80%,
    transparent 100%
  );
  pointer-events: none;
}
```

---

## SECTION 3 — Sidebar Redesign

**Problem (confirmed by screenshot 2 and 3):** The sidebar is visually dense, has no
logo/brand identity moment, topic items are too tightly packed, and the "Soon" badges
compete with the content instead of fading it.

### 3.1 — Sidebar Header: Add Logo Identity

In `Sidebar.tsx`, replace the `.sidebar-header` contents with:

```tsx
<div className="sidebar-header">
  <Link href="/" className="sidebar-brand">
    {/* Replace the Home icon with a proper logo mark */}
    <div className="sidebar-logo-mark">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="rgba(99,102,241,0.15)"/>
        <path d="M7 21L14 7L21 21" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 16H18.5" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="sidebar-brand-text">
      <span className="sidebar-brand-name">EG Lab</span>
      <span className="sidebar-brand-tagline">Virtual Engineering</span>
    </div>
  </Link>
</div>
```

Add these CSS rules:

```css
.sidebar-logo-mark {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.sidebar-brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sidebar-brand-name {
  font-family: var(--font-heading);
  font-size: 0.9375rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.sidebar-brand-tagline {
  font-size: 0.6875rem;
  color: rgba(255,255,255,0.35);
  font-weight: 400;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
```

### 3.2 — Sidebar Unit Headers: Increase Breathing Room

```css
.sidebar-unit-header {
  /* existing styles... */
  padding: 0.6rem var(--space-lg);  /* was 0.625rem — minor increase */
  border-radius: 0;
  position: relative;
}

/* Active unit header — add a left glow indicator */
.sidebar-unit-header.has-active-child {
  color: white;
  background: rgba(99,102,241,0.07);
}

.sidebar-unit-icon {
  opacity: 0.7;  /* was 0.6 — slightly more visible */
  color: var(--primary-light);
}
```

In `Sidebar.tsx`, add logic to add `has-active-child` class to any unit whose topics
include the current pathname.

### 3.3 — Sidebar Topic Items: Better Hit Targets and Visual Hierarchy

```css
.sidebar-topic {
  /* existing styles */
  padding: 0.5rem var(--space-lg) 0.5rem 2.75rem; /* was 0.4rem — 25% taller hit target */
  font-size: 0.8125rem;
  border-radius: 0;
  position: relative;
  gap: var(--space-xs);
}

/* Hover: subtle left slide-in effect */
.sidebar-topic:hover:not(.active) {
  background: var(--interactive-hover-dark);
  color: rgba(255,255,255,0.8);
  padding-left: 2.875rem; /* micro-indent on hover */
  transition: all var(--transition-fast);
}

/* Active topic: more prominent treatment */
.sidebar-topic.active {
  background: rgba(99,102,241,0.12);
  color: white;
  border-left: 2px solid var(--primary-color);
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Add a dot indicator for active item */
.sidebar-topic.active::before {
  content: '';
  position: absolute;
  left: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary-light);
}
```

### 3.4 — "Coming Soon" Topics: Fade Instead of Badge-Spam

**Problem:** The current design shows "SOON" badge on every locked topic. On a 34-topic
sidebar this becomes visual noise. Use opacity + a subtle lock pattern instead.

```css
.sidebar-topic.coming-soon {
  opacity: 0.38;  /* was 0.5 — more clearly unavailable */
  pointer-events: none; /* Make them unclickable instead of navigating to /coming-soon */
  /* Remove Soon badge from most topics — only show on unit level */
}

/* Keep Soon badge only on the unit header level */
.sidebar-unit-header .sidebar-soon-count {
  font-size: 0.5625rem;
  color: var(--text-muted);
  opacity: 0.6;
}
```

In `Sidebar.tsx`, change the `coming-soon` topics to either `pointer-events: none` or
remove the `<Link>` wrapper and replace with a `<span>` — this stops littering the
browser history with `/coming-soon?topic=X` navigations.

### 3.5 — Sidebar Scrollbar: Widen Track for Usability

```css
.sidebar-nav::-webkit-scrollbar {
  width: 6px;  /* was 4px — easier to grab */
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.02);
  margin: 4px 0;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.2);
}
```

### 3.6 — Collapsible Sidebar (Add Toggle)

Add a collapse button at the bottom of the sidebar header.
In `Sidebar.tsx`:

```tsx
const [collapsed, setCollapsed] = useState(false);

// In the sidebar-header:
<button
  className="sidebar-collapse-btn"
  onClick={() => setCollapsed(!collapsed)}
  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
>
  {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
</button>
```

Apply `data-collapsed={collapsed}` to the sidebar div and use CSS:

```css
.sidebar[data-collapsed="true"] {
  width: var(--sidebar-collapsed-width);
  min-width: var(--sidebar-collapsed-width);
}

.sidebar[data-collapsed="true"] .sidebar-brand-text,
.sidebar[data-collapsed="true"] .sidebar-nav,
.sidebar[data-collapsed="true"] .sidebar-unit-title,
.sidebar[data-collapsed="true"] .sidebar-topic-text,
.sidebar[data-collapsed="true"] .sidebar-ready-badge,
.sidebar[data-collapsed="true"] .sidebar-soon-badge {
  display: none;
}

.sidebar[data-collapsed="true"] .sidebar-logo-mark {
  margin: 0 auto;
}

.sidebar-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-left: auto;
}
```

---

## SECTION 4 — Input Panel Redesign

**Problem (confirmed by screenshot 2):** The input panel has an ugly thick blue
`border-bottom` on the header, text is small, inputs are plain, and the Generate button
looks blown out (too bright solid purple) against the white panel.

### 4.1 — Panel Header: Remove Decorative Border, Use Cleaner Treatment

```css
.panel-header {
  background: var(--surface-panel);  /* was gradient */
  padding: 1rem var(--space-lg) 0.875rem;
  border-bottom: 1px solid var(--border-panel);  /* was 2px solid primary */
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(8px);
}

.panel-header h2 {
  font-size: 0.8125rem;  /* was 1.125rem — this is a panel label, not a page title */
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  /* Changed from large heading to subtle section label */
}
```

### 4.2 — Input Section: More Padding

```css
.input-section {
  padding: 1rem var(--space-lg);  /* was 0.75rem — more breathing room */
  flex: 1;
}

.input-group {
  margin-bottom: 1rem;  /* was 0.75rem */
}

.input-group label {
  font-size: 0.8125rem;
  font-weight: 600;  /* was 500 — more legible */
  color: var(--text-secondary);
  margin-bottom: 0.375rem;  /* was var(--space-xs) = 0.25rem */
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
```

### 4.3 — Input Fields: Add Visual Depth

```css
.input-field {
  width: 100%;
  padding: 0.5625rem 0.75rem;
  border: 1.5px solid var(--border-panel);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: var(--font-primary);
  background-color: var(--bg-secondary);  /* was bg-primary (white) — subtle tint */
  color: var(--text-primary);
  transition: all var(--transition-fast);
  appearance: none;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);  /* ADD: gives field a slight depth */
}

.input-field:hover {
  border-color: #b0b8d4;
  background-color: var(--bg-primary);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-glow), inset 0 1px 2px rgba(0,0,0,0.04);
  background-color: var(--bg-primary);
}
```

### 4.4 — Generate Button: Reduce Visual Overload

**Problem:** The current Generate button is full-width solid purple with uppercase text —
it screams. Tone it down to feel premium.

```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  box-shadow: 0 1px 3px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.15);
  /* was 0 2px 4px rgba(37,99,235,0.3) — note: old shadow used wrong brand color */
  border-radius: var(--radius-lg);  /* was var(--radius-md) — more rounded = more modern */
}

.btn {
  /* Change uppercase to sentence case */
  text-transform: none;  /* was uppercase — ALL CAPS looks dated on modern edu platforms */
  letter-spacing: 0.01em;  /* was 0.04em */
  font-size: 0.875rem;  /* was 0.8125rem */
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c7ff5 0%, var(--primary-color) 100%);
  box-shadow: 0 4px 16px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.2);
  transform: translateY(-1px);
}
```

### 4.5 — Quick Guide Info Box: Make It a Proper Reference Card

```css
.info-box {
  background: linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(139,92,246,0.03) 100%);
  border: 1px solid rgba(99,102,241,0.12);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  margin-top: var(--space-md);
}

.info-box h3 {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: var(--space-sm);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.info-box li {
  padding: 0.3rem 0;  /* was 2px — better vertical rhythm */
  line-height: 1.6;
  position: relative;
  padding-left: 0.875rem;
}

/* Add styled bullet */
.info-box li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-size: 0.5rem;
  top: 0.45rem;
}

.info-box strong {
  color: var(--primary-dark);
  font-weight: 700;
}
```

---

## SECTION 5 — Canvas Toolbar Redesign

**Problem (confirmed by screenshot 2):** The top toolbar is a plain white bar. The zoom
buttons have almost no visual affordance (white buttons on white bar). "Step 0 / 0" is
displayed before any interaction — should show a more welcoming initial state. The
"Previous" and "Next" text labels with chevrons look disconnected.

### 5.1 — Toolbar Container: Add Structure and Depth

```css
.canvas-controls {
  background: var(--surface-toolbar);
  border-bottom: 1px solid var(--border-panel);
  padding: 0.625rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  min-height: 52px;  /* Explicit height — prevents layout shift when buttons appear */
}

/* Add a subtle breadcrumb/context label in the center of the toolbar */
/* Add this element in the page that uses CanvasControls */
.toolbar-context-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.01em;
  flex: 1;
  text-align: center;
  /* Shows e.g. "Triangular Prism — Case A" when a solid is generated */
}
```

### 5.2 — Control Buttons: Give Them Visual Presence

```css
.control-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4375rem 0.875rem;
  background: var(--bg-secondary);  /* was bg-primary (white) = invisible on white bar */
  border: 1.5px solid var(--border-panel);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-xs);  /* ADD: subtle lift from bar */
}

.control-btn:hover:not(:disabled) {
  background: var(--bg-primary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm), 0 0 0 3px var(--primary-glow);
}

/* Zoom buttons: make them icon-only for space efficiency */
#zoomInBtn span,
#zoomOutBtn span,
#resetViewBtn span {
  display: none; /* Hide text labels on zoom buttons */
}

#zoomInBtn,
#zoomOutBtn,
#resetViewBtn {
  width: 36px;
  height: 36px;
  padding: 0;
  justify-content: center;
  border-radius: var(--radius-md);
}
```

### 5.3 — Step Navigator: Make It the Visual Focal Point

The step navigator is the most-used control during learning. It should be the most
prominent element in the toolbar.

```css
.step-controls {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-panel);
  border-radius: var(--radius-lg);
  padding: 0.25rem;
  /* Treat the whole nav as a single grouped widget */
}

.step-indicator {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  padding: 0 var(--space-md);
  font-variant-numeric: tabular-nums;
  min-width: 80px;  /* Prevent width jitter as numbers change */
  text-align: center;
  white-space: nowrap;
}

/* Step prev/next inside the group: borderless */
.step-controls .control-btn {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0.375rem 0.5rem;
}

.step-controls .control-btn:hover:not(:disabled) {
  background: var(--interactive-hover-light);
  color: var(--primary-color);
  box-shadow: none;
  border: none;
}
```

In `StepNavigator.tsx`, update the initial display: when `totalSteps === 0`, render
`"— / —"` instead of `"Step 0 / 0"` to avoid showing a confusing zero state.

### 5.4 — Add Step Progress Bar Below the Toolbar

This single addition dramatically improves pedagogical clarity — students see WHERE they
are in the sequence at a glance.

Add this element in the page component that wraps `CanvasControls` and `StepNavigator`:

```tsx
{/* Step Progress Bar — add between canvas-controls and instruction-panel */}
{totalSteps > 0 && (
  <div className="step-progress-track">
    <div
      className="step-progress-fill"
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    />
  </div>
)}
```

```css
.step-progress-track {
  height: 3px;
  background: var(--bg-tertiary);
  width: 100%;
  overflow: hidden;
}

.step-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  border-radius: 0 2px 2px 0;
  transition: width var(--transition-normal);
}
```

---

## SECTION 6 — Instruction Panel Redesign

**Problem (confirmed by screenshot 2):** `max-height: 10%` is catastrophically small.
The instruction panel has a hardcoded blue gradient that clashes with the rest of the
light panel. It's the most pedagogically critical element but gets the least real estate.

### 6.1 — Remove the Height Cap and Redesign the Container

```css
.instruction-panel {
  background: var(--surface-instruction);  /* Replace hardcoded gradient */
  border-bottom: 1px solid rgba(99,102,241,0.12);  /* Replace 2px solid primary */
  padding: var(--space-md) 1.25rem;
  /* REMOVE max-height: 10% — this was causing clipping */
  /* ADD min-height so it always shows clearly */
  min-height: 72px;
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  position: relative;
  overflow: visible;  /* was auto — content should never scroll here */
}

/* Add a step number badge */
.instruction-panel::before {
  /* Moved to a React element — see 6.2 below */
}
```

### 6.2 — Update `InstructionPanel.tsx` to Show Step Badge

```tsx
export default function InstructionPanel() {
  const { projectionResponse, currentStep } = useLabStore();
  const step = projectionResponse?.steps[currentStep - 1] ?? null;
  const totalSteps = projectionResponse?.total_steps ?? 0;

  return (
    <div className="instruction-panel">
      {/* Step number badge — only show when a projection is active */}
      {totalSteps > 0 && (
        <div className="instruction-step-badge">
          <span className="instruction-step-number">{currentStep}</span>
        </div>
      )}

      <div className="instruction-content">
        <h3 id="instructionTitle">
          {step?.title ?? 'Welcome to Virtual Lab'}
        </h3>
        <p id="instructionText">
          {step?.description ?? 'Select a solid and case type from the left panel to begin.'}
        </p>
      </div>

      {/* Step count chip — top right */}
      {totalSteps > 0 && (
        <span className="instruction-step-count">
          {currentStep} of {totalSteps}
        </span>
      )}
    </div>
  );
}
```

```css
.instruction-step-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3);
}

.instruction-step-number {
  font-size: 0.8125rem;
  font-weight: 800;
  color: white;
  font-variant-numeric: tabular-nums;
}

.instruction-step-count {
  position: absolute;
  top: var(--space-md);
  right: var(--space-lg);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(99,102,241,0.1);
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
}

.instruction-content h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 2px;
  letter-spacing: -0.01em;
}

.instruction-content p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.55;
  max-width: 900px;  /* Prevent very long lines on wide canvases */
}
```

---

## SECTION 7 — Canvas Container Redesign

**Problem:** The canvas (`#drawingCanvas`) has `box-shadow: var(--shadow-lg)` which
creates a floating white card — fine, but the canvas-container background is `#fafafa`
(nearly white), so the shadow barely registers. The empty state text is too muted.

### 7.1 — Canvas Container Background

```css
.canvas-area {
  display: flex;
  flex-direction: column;
  background: var(--surface-canvas);
  overflow: hidden;
  /* Removed width: 78% — now controlled by grid layout */
}

.canvas-container {
  flex: 1;
  background: var(--surface-canvas);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Add grid-pattern background for engineering drawing feel */
  background-image:
    linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}

#drawingCanvas {
  display: block;
  background-color: white;
  box-shadow: 0 4px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06);
  cursor: crosshair;
  border-radius: var(--radius-md);  /* was radius-sm — more modern */
}
```

### 7.2 — Empty State Illustration

In `CanvasRenderer.tsx`, replace the plain text empty state with a richer welcome state.
Add an SVG placeholder when no projection is loaded:

```tsx
// In CanvasRenderer.tsx, add this OUTSIDE the canvas element, inside canvas-container:
{!projectionResponse && (
  <div className="canvas-empty-state">
    <div className="canvas-empty-icon">
      {/* Simple orthographic projection SVG hint */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="8" width="32" height="24" rx="2"
          stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="4 2"/>
        <rect x="16" y="36" width="32" height="24" rx="2"
          stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="4 2"/>
        <line x1="8" y1="32" x2="16" y2="60" stroke="#e0e7ff" strokeWidth="1"/>
        <line x1="40" y1="8" x2="48" y2="36" stroke="#e0e7ff" strokeWidth="1"/>
      </svg>
    </div>
    <p className="canvas-empty-title">Ready to Visualize</p>
    <p className="canvas-empty-hint">
      Select a solid and case type, then click Generate
    </p>
  </div>
)}
```

```css
.canvas-empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  pointer-events: none;
  /* Don't use z-index — let canvas render on top when active */
}

.canvas-empty-icon {
  opacity: 0.5;
  animation: float 4s ease-in-out infinite;
}

.canvas-empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: -0.01em;
}

.canvas-empty-hint {
  font-size: 0.8125rem;
  color: #b0bbd4;
  text-align: center;
  max-width: 260px;
  line-height: 1.5;
}
```

---

## SECTION 8 — Home Page Redesign

**Problem (confirmed by screenshot 1):** The hero is too spare — padding on left/right is
wasted (wide viewport, but all content centered in ~800px). No navigation header. Feature
cards at the bottom are near-invisible (`rgba(255,255,255,0.02)` is essentially nothing).
Buttons are fine but the secondary CTA is too low-contrast. Stats section needs spacing.

### 8.1 — Add a Sticky Navigation Header to the Home Page

In `page.tsx`, add a `<header>` as the first child of `.home-page`:

```tsx
<header className="home-nav">
  <div className="home-nav-inner">
    <Link href="/" className="home-nav-brand">
      <span className="home-nav-logo">EG</span>
      <span>Virtual Lab</span>
    </Link>
    <nav className="home-nav-links">
      <Link href="/lab/introduction/importance">Why EG?</Link>
      <Link href="/lab/curves/ellipse">Plane Curves</Link>
      <Link href="/lab/solids">Solids Lab</Link>
    </nav>
    <Link href="/lab/solids" className="home-nav-cta">
      Open Lab →
    </Link>
  </div>
</header>
```

```css
.home-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(9,9,11,0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 0 2rem;
}

.home-nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.home-nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: white;
  text-decoration: none;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.9375rem;
  margin-right: auto;
}

.home-nav-logo {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.home-nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.home-nav-links a {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.home-nav-links a:hover {
  color: rgba(255,255,255,0.9);
}

.home-nav-cta {
  padding: 0.5rem 1.125rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-lg);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.home-nav-cta:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}
```

### 8.2 — Hero: Fix Padding and Reduce Top Space

```css
.home-hero {
  padding: 6rem 2rem 5rem;  /* was 5rem 2rem 4rem */
  /* Keep existing gradient background */
}

.hero-subtitle {
  font-size: 1.0625rem;  /* was 1.125rem — subtle reduction */
  color: rgba(255,255,255,0.5);  /* was var(--text-muted) = #94a3b8 — improve dark bg contrast */
  max-width: 520px;  /* was 580px */
}
```

### 8.3 — Secondary CTA Button: Improve Contrast

```css
.hero-cta.secondary {
  background: rgba(255,255,255,0.07);  /* was 0.04 — more visible */
  color: rgba(255,255,255,0.7);  /* was text-muted — more readable */
  border: 1px solid rgba(255,255,255,0.15);  /* was 0.1 */
}

.hero-cta.secondary:hover {
  background: rgba(255,255,255,0.12);
  color: white;
  border-color: rgba(255,255,255,0.25);
}
```

### 8.4 — Stats Section: Add Separators

```css
.hero-stats {
  display: flex;
  gap: 0;  /* was 3rem — use borders instead */
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-xl);
  background: rgba(255,255,255,0.02);
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;
}

.stat {
  flex: 1;
  text-align: center;
  padding: var(--space-lg) var(--space-xl);
  border-right: 1px solid rgba(255,255,255,0.06);
}

.stat:last-child {
  border-right: none;
}
```

### 8.5 — Feature Cards: Make Them Visible

```css
.feature-card {
  padding: var(--space-xl) var(--space-lg);
  background: rgba(255,255,255,0.04);  /* was 0.02 — actually visible now */
  border: 1px solid rgba(255,255,255,0.08);  /* was 0.06 */
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

/* Add glow sweep on hover */
.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(99,102,241,0.2);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}
```

---

## SECTION 9 — Content/Introduction Page Redesign

**Problem (confirmed by screenshot 3):** The content page has good structure but the
sidebar active state contrast (`background: rgba(99,102,241,0.12)` with bold purple text)
is very strong compared to the plain white content — there's no visual bridge. The
blockquotes are fine but the challenge box yellow is generic.

### 9.1 — Content Page Typography Improvements

```css
.content-page {
  max-width: 840px;  /* was 900px — slightly narrower for better reading line length */
  margin: 0 auto;
  padding: 2.5rem 2rem;  /* was 2rem */
}

.content-section h1 {
  font-family: var(--font-heading);
  font-size: 1.875rem;  /* was 2rem */
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.content-section h2 {
  font-size: 1.25rem;  /* was 1.35rem */
  font-weight: 700;
  border-bottom: 1px solid var(--border-panel);  /* was 2px solid primary — too heavy */
  padding-bottom: var(--space-sm);
  margin-top: var(--space-2xl);
  position: relative;
}

/* Accent line replaces the full-width border */
.content-section h2::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 48px;
  height: 2px;
  background: var(--primary-color);
  border-radius: 1px;
}

.content-section p {
  font-size: 0.9375rem;  /* was inherit — set explicitly */
  line-height: 1.75;  /* was 1.7 — more comfortable */
  color: #374151;  /* was var(--text-secondary) = #475569 — slightly darker = better contrast */
}
```

### 9.2 — Blockquotes: Add Indigo Theme

```css
.content-section blockquote {
  border-left: 3px solid var(--primary-color);  /* was 4px — thinner = more elegant */
  padding: var(--space-md) var(--space-lg);
  margin: var(--space-xl) 0;
  background: rgba(99,102,241,0.04);  /* Replace hardcoded #eff6ff */
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-style: italic;
  color: var(--text-primary);
  font-size: 0.9375rem;
  line-height: 1.7;
}
```

### 9.3 — Challenge Box: Better Visual Identity

```css
.challenge-box {
  background: linear-gradient(135deg, rgba(245,158,11,0.06), rgba(251,191,36,0.04));
  border: 1px solid rgba(245,158,11,0.2);  /* was #fde68a — use opacity-based color */
  border-radius: var(--radius-xl);  /* was radius-lg */
  padding: var(--space-xl) var(--space-xl) var(--space-lg);
  position: relative;
  overflow: hidden;
}

/* Add a top accent stripe */
.challenge-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--warning-color), #fbbf24);
}
```

---

## SECTION 10 — Responsive Layout (Critical Fixes)

**Problem:** The mobile breakpoint collapses the sidebar to 60px height with zero navigation
— there is no hamburger or drawer. Tablet (768–1200px) has no intermediate layout.

### 10.1 — Add Tablet Breakpoint (1024px)

```css
@media (max-width: 1024px) {
  .lab-layout {
    grid-template-columns: 220px var(--input-panel-width) 1fr;
  }

  .sidebar {
    width: 220px;
    min-width: 220px;
  }

  .home-nav-links {
    display: none; /* Simplify nav on tablet */
  }

  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 10.2 — Mobile: Proper Drawer Navigation (Replace 60px Collapse)

This requires a proper Sheet/Drawer implementation. Use shadcn/ui `<Sheet>` or implement:

```css
/* Mobile: sidebar becomes a drawer overlay */
@media (max-width: 768px) {
  .lab-layout {
    display: flex;
    flex-direction: column;
    /* Grid becomes single column */
  }

  .sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    bottom: 0;
    width: 280px;
    z-index: 200;
    transition: left var(--transition-normal);
    box-shadow: var(--shadow-xl);
  }

  .sidebar.mobile-open {
    left: 0;
  }

  /* Overlay backdrop */
  .sidebar-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 199;
    backdrop-filter: blur(4px);
  }

  .sidebar-backdrop.visible {
    display: block;
  }

  /* Mobile top bar */
  .mobile-topbar {
    display: flex;
    align-items: center;
    height: 52px;
    padding: 0 var(--space-md);
    background: var(--surface-sidebar);
    border-bottom: 1px solid var(--border-app);
    gap: var(--space-md);
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-md);
    color: white;
    cursor: pointer;
  }

  /* On mobile: input panel becomes collapsible bottom sheet */
  .input-panel {
    width: 100%;
    max-height: 45vh;
    border-right: none;
    border-top: 1px solid var(--border-panel);
    order: 3; /* Push below canvas */
  }

  .canvas-area {
    flex: 1;
    width: 100%;
    min-height: 55vh;
  }
}
```

In `Sidebar.tsx`, add `isMobileOpen` state controlled by a hamburger button in
the mobile topbar. Add the backdrop div as a sibling to `.sidebar`.

### 10.3 — Small Screens: Toolbar Button Text

```css
/* Already in CSS — but add explicit breakpoint */
@media (max-width: 640px) {
  .control-btn span {
    display: none;
  }

  .home-nav-links {
    display: none;
  }

  .hero-title {
    font-size: 1.875rem;
  }

  .hero-stats {
    max-width: 320px;
  }
}
```

---

## SECTION 11 — CSS Architecture Cleanup

**Problem:** The 1,872-line `globals.css` has duplicate classes, hardcoded colors, and
mixed concerns. This makes future maintenance dangerous.

### 11.1 — Consolidate Duplicate Button Patterns

Remove `.nav-btn` entirely from the CSS — replace all usages with `.control-btn`.
Remove `.zoom-btn` — replace all usages with `.control-btn` (icon-only variant via
specific ID selectors as defined in Section 5.2).

### 11.2 — Consolidate Duplicate Error Patterns

Remove `.error-msg` — replace all usages with `.error-message`.

### 11.3 — Replace Hardcoded Colors

Run a project-wide search-and-replace for these hardcoded values:

| Find | Replace with |
|---|---|
| `#eff6ff` | `var(--surface-instruction)` |
| `#dbeafe` | `var(--surface-instruction)` |
| `#bfdbfe` | `rgba(99,102,241,0.15)` |
| `#fef3c7` | `var(--surface-challenge, rgba(245,158,11,0.06))` |
| `#fde68a` | `rgba(245,158,11,0.2)` |
| `#fef2f2` | `rgba(239,68,68,0.04)` |
| `#fecaca` | `rgba(239,68,68,0.2)` |
| `#ecfdf5` | `rgba(16,185,129,0.06)` |

### 11.4 — Split CSS into Logical Files (If on Next.js 14+)

Recommended file structure to replace the monolithic `globals.css`:

```
styles/
  globals.css        ← tokens, reset, base body (keep ~150 lines)
  layout.css         ← .lab-layout, .sidebar, .lab-content, .main-container
  components.css     ← .btn, .input-field, .control-btn, .step-*, .instruction-*
  pages/
    home.css         ← .home-page, .home-hero, .home-features, .modules-grid
    content.css      ← .content-page, .content-section, .challenge-box
    canvas.css       ← .canvas-*, .drawing-canvas, .curve-*
  responsive.css     ← all @media queries in one place
```

Import in `layout.tsx`:
```tsx
import '@/styles/globals.css';
import '@/styles/layout.css';
// etc.
```

---

## SECTION 12 — Accessibility Fixes

These are non-negotiable for any educational platform:

### 12.1 — Focus Styles

Add to `globals.css` (the current code uses `outline: none` with no replacement):

```css
/* Keyboard focus styles — WCAG 2.1 AA compliant */
:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove focus ring for mouse users but keep for keyboard users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Sidebar focus */
.sidebar-topic:focus-visible {
  outline: 2px solid var(--primary-light);
  outline-offset: -2px;
}
```

### 12.2 — Color Contrast Audit

The following text/background pairs currently fail WCAG AA (4.5:1 ratio):

- `.sidebar-topic` text `#94a3b8` on `#09090b` → ratio ~3.8:1 → Change text color to `#aab0c0`
- `.stat-label` text `#94a3b8` on `#09090b` → same fix
- `.hero-subtitle` `#94a3b8` on dark background → Change to `rgba(255,255,255,0.55)` = ~4.6:1
- `.coming-soon` topics at `opacity: 0.38` → acceptable since non-interactive (add `aria-hidden`)

### 12.3 — ARIA Attributes in `StepNavigator.tsx`

```tsx
<div className="step-controls" role="group" aria-label="Step navigation">
  <button aria-label="Previous step" ...>
  <span aria-live="polite" aria-atomic="true">
    Step {currentStep} / {totalSteps}
  </span>
  <button aria-label="Next step" ...>
</div>
```

The `aria-live="polite"` ensures screen readers announce step changes.

### 12.4 — Canvas Accessibility

In `CanvasRenderer.tsx`, add a visually hidden description that updates with each step:

```tsx
<div role="img" aria-label={step?.title ?? 'Engineering drawing canvas'}>
  <span className="sr-only">{step?.description}</span>
  <canvas ref={canvasRef} ... />
</div>
```

Add `.sr-only` to globals:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

---

## SECTION 13 — Loading States and Micro-interactions

### 13.1 — Canvas Loading Skeleton

In the page component, when `isLoading === true`, replace the canvas area with:

```tsx
{isLoading && (
  <div className="canvas-skeleton">
    <div className="skeleton-bar" style={{ width: '40%', height: '16px' }} />
    <div className="skeleton-bar" style={{ width: '60%', height: '16px' }} />
    <div className="skeleton-rect" style={{ width: '80%', height: '280px' }} />
  </div>
)}
```

```css
.canvas-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  background: var(--surface-canvas);
}

.skeleton-bar,
.skeleton-rect {
  border-radius: var(--radius-md);
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 0%,
    #e9edf7 50%,
    var(--bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 13.2 — Step Transition Animation

In `CanvasRenderer.tsx`, add a CSS class to the canvas when the step changes:

```tsx
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  canvas.classList.add('step-transitioning');
  const t = setTimeout(() => canvas.classList.remove('step-transitioning'), 250);
  return () => clearTimeout(t);
}, [currentStep]);
```

```css
#drawingCanvas.step-transitioning {
  animation: canvasFadeIn 0.2s ease-out;
}

@keyframes canvasFadeIn {
  from { opacity: 0.6; transform: scale(0.99); }
  to   { opacity: 1;   transform: scale(1); }
}
```

---

## SECTION 14 — Typography System Consistency

### 14.1 — Set `font-family` on body to the Next.js variable

The current `body` uses `var(--font-primary)` which resolves to `var(--font-body)` — but
the Next.js font variable `--font-body` is set on the `<html>` element. This chain works
but is fragile. Simplify:

```css
body {
  font-family: var(--font-body, 'Inter', system-ui, sans-serif);
  /* Remove the alias var(--font-primary) — use var(--font-body) directly everywhere */
}
```

Do a project-wide replace of `var(--font-primary)` with `var(--font-body)`.

### 14.2 — Type Scale: Apply `font-family: var(--font-heading)` Consistently

Add this rule to ensure all headings use Plus Jakarta Sans:

```css
h1, h2, h3 {
  font-family: var(--font-heading, 'Plus Jakarta Sans', system-ui, sans-serif);
}
```

---

## SECTION 15 — Quick Wins (Immediate Visual Impact, < 30 min each)

Execute these first for the fastest visual improvement before tackling the larger sections:

1. **Remove `text-transform: uppercase` from `.btn`** — drop-in that makes buttons look
   less dated immediately (Section 4.4).

2. **Change `.input-panel` header `border-bottom` from `2px solid primary-color` to
   `1px solid var(--border-panel)`** — removes the garish purple stripe (Section 4.1).

3. **Add the grid-dot background to `.canvas-container`** — instantly gives it an
   engineering drawing authenticity (Section 7.1).

4. **Add `min-height: 72px` to `.instruction-panel` and remove `max-height: 10%`** —
   stops instruction text from being clipped (Section 6.1).

5. **Replace `.sidebar-topic.coming-soon` opacity from `0.5` to `0.38`** and add
   `pointer-events: none` — stops 20+ dead navigation links (Section 3.4).

6. **Add the step progress bar below the toolbar** (Section 5.4) — one component, huge
   pedagogical value, 20 minutes to implement.

7. **Increase `.sidebar-topic` padding from `0.4rem` to `0.5rem`** — immediately more
   breathable sidebar (Section 3.3).

8. **Add the sticky `<home-nav>` header to the home page** — zero-state currently has no
   navigation whatsoever (Section 8.1).

---

## Summary Priority Order

| Priority | Section | Effort | Impact |
|---|---|---|---|
| 🔴 Critical | §6 Instruction Panel | 30 min | Stops content clipping |
| 🔴 Critical | §10 Responsive Mobile | 2–3 hr | Tablet/mobile usable |
| 🟠 High | §5 Canvas Toolbar | 1 hr | Primary interaction clarity |
| 🟠 High | §3 Sidebar | 1.5 hr | Navigation usability |
| 🟠 High | §4 Input Panel | 1 hr | Form usability |
| 🟡 Medium | §8 Home Page | 1.5 hr | First impression |
| 🟡 Medium | §7 Canvas Container | 45 min | Visual polish |
| 🟡 Medium | §2 Layout Shell | 30 min | Theme coherence |
| 🟢 Polish | §9 Content Pages | 45 min | Reading experience |
| 🟢 Polish | §12 Accessibility | 1 hr | Compliance |
| 🟢 Polish | §13 Micro-interactions | 1 hr | Delight |
| 🔵 Strategic | §0 Tailwind Migration | 4–8 hr | Long-term maintainability |
| 🔵 Strategic | §11 CSS Cleanup | 2 hr | Codebase health |
