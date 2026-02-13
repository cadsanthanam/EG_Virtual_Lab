# EG Virtual Lab — Tailwind CSS v4 + shadcn/ui
# Complete Enterprise Redesign Masterplan
## Agent Execution Instructions · Every Element · Every State

> **Source audit:** `globals.css` (1,872 lines), `Sidebar.tsx`, `InputPanel.tsx`,
> `InstructionPanel.tsx`, `CanvasControls.tsx`, `CanvasRenderer.tsx`,
> `StepNavigator.tsx`, `layout.tsx` (root + lab), `page.tsx`
> **Screenshots reviewed:** Home page, Solids Lab (/lab/solids), Content page (/lab/introduction/importance)
> **Design target:** Linear.app-grade engineering edu-platform. Dark sidebar shell,
> clean light workspace, precision canvas. Think Vercel + Notion + Coursera Pro.

---

## PHASE 0 — COMPLETE INSTALLATION & CONFIGURATION

### 0.1 Install All Packages

Run in project root:

```bash
# Core framework
npm install tailwindcss@latest @tailwindcss/vite autoprefixer postcss

# shadcn/ui dependencies
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot
npm install lucide-react   # already installed — verify version ≥ 0.344.0

# shadcn/ui init (run interactively)
npx shadcn@latest init

# shadcn components — install every component used in this project
npx shadcn@latest add button
npx shadcn@latest add select
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add separator
npx shadcn@latest add badge
npx shadcn@latest add tooltip
npx shadcn@latest add sheet
npx shadcn@latest add scroll-area
npx shadcn@latest add progress
npx shadcn@latest add skeleton
npx shadcn@latest add alert
npx shadcn@latest add collapsible

# Animation
npm install framer-motion

# Utility
npm install tailwind-merge clsx
```

### 0.2 Configure Tailwind v4

Create `tailwind.config.ts` at project root:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─────────────────────────────────────────────
      // COLOR SYSTEM — Maps to CSS variables below
      // Reference: --primary = indigo-500 (#6366f1)
      // ─────────────────────────────────────────────
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',   // ← brand primary
          600: '#4f46e5',   // ← brand dark
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          violet: '#8b5cf6',
          purple: '#a855f7',
        },

        // App shell surfaces
        surface: {
          app:         '#09090b',  // body / outermost shell (zinc-950)
          sidebar:     '#0f0f14',  // sidebar panel — slightly lighter than app
          'sidebar-hover': '#16161d', // sidebar item hover
          panel:       '#ffffff',  // input panel
          canvas:      '#f4f6fb',  // canvas area background
          toolbar:     '#ffffff',  // top toolbar
          instruction: '#f0f4ff',  // instruction bar (replaces hardcoded #eff6ff)
          elevated:    '#18181b',  // cards on dark bg (zinc-900)
        },

        // Border palette
        edge: {
          dark:    'rgba(255,255,255,0.07)',  // borders on dark surfaces
          light:   '#e8ecf4',                // borders on light surfaces
          accent:  '#6366f1',                // focused/active borders
          subtle:  'rgba(99,102,241,0.15)',   // very subtle accent borders
        },

        // Text palette — semantic
        ink: {
          DEFAULT: '#0f172a',   // primary text on light
          secondary: '#475569', // secondary text
          muted:    '#94a3b8',  // muted/placeholder
          ghost:    '#cbd5e1',  // very faint
          inverse:  '#f1f5f9',  // text on dark
          'inverse-muted': 'rgba(255,255,255,0.45)',
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },

      // ─────────────────────────────────────────────
      // TYPOGRAPHY
      // ─────────────────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',   { lineHeight: '1rem'     }],
        sm:    ['0.8125rem', { lineHeight: '1.25rem'  }],
        base:  ['0.875rem',  { lineHeight: '1.5rem'   }],
        md:    ['0.9375rem', { lineHeight: '1.5rem'   }],
        lg:    ['1rem',      { lineHeight: '1.625rem' }],
        xl:    ['1.125rem',  { lineHeight: '1.75rem'  }],
        '2xl': ['1.25rem',   { lineHeight: '1.875rem' }],
        '3xl': ['1.5rem',    { lineHeight: '2rem'     }],
        '4xl': ['1.875rem',  { lineHeight: '2.25rem'  }],
        '5xl': ['2.25rem',   { lineHeight: '2.5rem'   }],
        '6xl': ['3rem',      { lineHeight: '1.1'      }],
        '7xl': ['3.75rem',   { lineHeight: '1.05'     }],
      },

      // ─────────────────────────────────────────────
      // SPACING — Keep consistent scale
      // ─────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },

      // ─────────────────────────────────────────────
      // BORDER RADIUS
      // ─────────────────────────────────────────────
      borderRadius: {
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
        xl:   '1rem',
        '2xl':'1.25rem',
        '3xl':'1.5rem',
      },

      // ─────────────────────────────────────────────
      // BOX SHADOWS — Layered system
      // ─────────────────────────────────────────────
      boxShadow: {
        'xs':     '0 1px 2px rgba(0,0,0,0.04)',
        'sm':     '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'md':     '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
        'lg':     '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
        'xl':     '0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.06)',
        'glow-sm':'0 0 12px rgba(99,102,241,0.20)',
        'glow-md':'0 0 24px rgba(99,102,241,0.25)',
        'glow-lg':'0 0 40px rgba(99,102,241,0.30)',
        'panel':  '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.04)',
        'canvas': '0 4px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
        'btn':    '0 1px 3px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.15)',
        'btn-hover': '0 4px 16px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.20)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.04)',
      },

      // ─────────────────────────────────────────────
      // ANIMATION / KEYFRAMES
      // ─────────────────────────────────────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'canvas-reveal': {
          from: { opacity: '0.5', transform: 'scale(0.99)' },
          to:   { opacity: '1',   transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in':         'fade-in 0.3s ease-out',
        'fade-in-up':      'fade-in-up 0.4s ease-out both',
        'slide-in-left':   'slide-in-left 0.3s ease-out',
        'slide-in-down':   'slide-in-down 0.25s ease-out',
        shimmer:           'shimmer 1.6s linear infinite',
        float:             'float 4s ease-in-out infinite',
        'gradient-shift':  'gradient-shift 6s ease infinite',
        'canvas-reveal':   'canvas-reveal 0.2s ease-out',
        'pulse-soft':      'pulse-soft 2s ease-in-out infinite',
      },

      // ─────────────────────────────────────────────
      // TRANSITIONS
      // ─────────────────────────────────────────────
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-material': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ─────────────────────────────────────────────
      // BACKDROP BLUR
      // ─────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        md: '16px',
        lg: '24px',
      },

      // ─────────────────────────────────────────────
      // BACKGROUND IMAGE UTILITIES (canvas grid, gradients)
      // ─────────────────────────────────────────────
      backgroundImage: {
        'grid-dots': `
          radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)
        `,
        'grid-lines': `
          linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)
        `,
        'hero-radial': `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.28), transparent),
          radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139,92,246,0.15), transparent)
        `,
        'sidebar-glow': `
          radial-gradient(ellipse 100% 40% at 50% 0%, rgba(99,102,241,0.08), transparent)
        `,
        'instruction-bar': `
          linear-gradient(135deg, #eef3ff 0%, #e8f0ff 100%)
        `,
        'btn-primary': `
          linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)
        `,
        'btn-primary-hover': `
          linear-gradient(135deg, #818cf8 0%, #6366f1 100%)
        `,
        'gradient-accent': `
          linear-gradient(135deg, #818cf8 0%, #8b5cf6 50%, #c084fc 100%)
        `,
        'shimmer-gradient': `
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)
        `,
      },

      backgroundSize: {
        'grid-16':  '16px 16px',
        'grid-24':  '24px 24px',
        'grid-32':  '32px 32px',
        '200%':     '200% 100%',
      },

      // Width tokens for sidebar, panel
      width: {
        'sidebar':       '256px',
        'sidebar-sm':    '220px',
        'sidebar-icon':  '60px',
        'input-panel':   '280px',
        'input-panel-sm':'240px',
      },

      minWidth: {
        'sidebar':     '256px',
        'input-panel': '280px',
      },

      // Height tokens
      height: {
        'toolbar': '52px',
        'nav':     '60px',
      },

      minHeight: {
        'instruction': '68px',
        'canvas':      '400px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),  // npm install @tailwindcss/typography
    require('tailwindcss-animate'),       // npm install tailwindcss-animate
  ],
}

export default config
```

### 0.3 Update `globals.css` — Replace Entirely

Delete the existing 1,872-line `globals.css` and replace with:

```css
/* globals.css — EG Virtual Lab · Tailwind + shadcn/ui base */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─────────────────────────────────────────────────────────
   CSS CUSTOM PROPERTIES — shadcn/ui HSL token layer
   These are consumed by shadcn components automatically.
   Mapped from the Tailwind color config above.
───────────────────────────────────────────────────────── */
@layer base {
  :root {
    /* shadcn/ui required tokens */
    --background:         0 0% 100%;
    --foreground:         222 47% 11%;
    --card:               0 0% 100%;
    --card-foreground:    222 47% 11%;
    --popover:            0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary:            239 84% 67%;     /* indigo-500: #6366f1 */
    --primary-foreground: 0 0% 100%;
    --secondary:          215 16% 47%;
    --secondary-foreground: 0 0% 100%;
    --muted:              220 14% 96%;
    --muted-foreground:   215 16% 47%;
    --accent:             263 70% 64%;     /* violet: #8b5cf6 */
    --accent-foreground:  0 0% 100%;
    --destructive:        0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border:             214 32% 91%;
    --input:              214 32% 91%;
    --ring:               239 84% 67%;
    --radius:             0.5rem;
  }

  /* ── Base resets ── */
  * {
    @apply border-border;
  }

  body {
    @apply bg-surface-canvas text-ink antialiased;
    font-family: var(--font-body, 'Inter', system-ui, sans-serif);
    height: 100vh;
    overflow: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading, 'Plus Jakarta Sans', system-ui, sans-serif);
  }

  /* ── Screen-reader only utility ── */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* ─────────────────────────────────────────────────────────
   CANVAS DRAWING COLORS — Used by canvas-renderer.ts
   These should NOT move to Tailwind (runtime JS reads them)
───────────────────────────────────────────────────────── */
:root {
  --canvas-bg:            #f8f9fc;
  --canvas-xy-line:       #1e293b;
  --canvas-visible-edge:  #0f172a;
  --canvas-hidden-edge:   #64748b;
  --canvas-construction:  #cbd5e1;
  --canvas-label-color:   #374151;
  --canvas-point-color:   #6366f1;
}

/* ─────────────────────────────────────────────────────────
   FOCUS VISIBLE — WCAG 2.1 AA keyboard navigation
───────────────────────────────────────────────────────── */
@layer base {
  :focus-visible {
    @apply outline-none ring-2 ring-primary-500 ring-offset-2;
  }

  :focus:not(:focus-visible) {
    @apply outline-none;
  }
}

/* ─────────────────────────────────────────────────────────
   SCROLLBAR — Thin, elegant, platform-consistent
───────────────────────────────────────────────────────── */
@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgba(99,102,241,0.2) transparent;
  }

  .scrollbar-thin::-webkit-scrollbar       { width: 5px; height: 5px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(99,102,241,0.2);
    border-radius: 999px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(99,102,241,0.35);
  }

  .scrollbar-dark {
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  .scrollbar-dark::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
  }
  .scrollbar-dark::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.2);
  }
}
```

### 0.4 Create `lib/utils.ts`

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 0.5 Update shadcn `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsx": false,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## PHASE 1 — DESIGN LANGUAGE & VISUAL SYSTEM

### 1.1 Visual Personality

The redesign targets this specific aesthetic north star:
- **Shell:** Near-black zinc sidebar (`#0f0f14`) — deep, focused, authoritative
- **Workspace:** Clean white/very-light-blue canvas area — precision, clarity
- **Accent:** Indigo-violet (`#6366f1` → `#8b5cf6`) — modern, educational, trustworthy
- **Typography contrast:** `Plus Jakarta Sans` headings (geometric, confident) vs `Inter` body (neutral, readable)
- **Motion:** Purposeful only — no decoration. Step transitions, sidebar collapse, dynamic input entrance

**Reference products:** Linear.app (shell + sidebar), Vercel dashboard (toolbar precision),
Coursera (content readability), Figma (canvas workspace feel)

### 1.2 Elevation System (Z-axis)

| Level | Element | Background | Shadow |
|---|---|---|---|
| 0 | Canvas area | `surface-canvas` | none |
| 1 | Instruction bar | `surface-instruction` | border-bottom only |
| 2 | Toolbar | `surface-toolbar` | `shadow-sm` |
| 3 | Input panel | `white` | `shadow-panel` |
| 4 | Sidebar | `surface-sidebar` | right border |
| 5 | Tooltips, popovers | `white` | `shadow-xl` |
| 6 | Mobile drawer overlay | `surface-sidebar` | `shadow-xl` + backdrop |

### 1.3 Color Usage Rules

- **Indigo-500 (`#6366f1`):** Primary CTA, active states, focus rings, progress bars, step badges
- **Indigo-400 (`#818cf8`):** Hover text on dark, active sidebar text, gradient endpoint
- **Violet (`#8b5cf6`):** Accent gradient endpoint, hero gradient, module card tops
- **Zinc-950 (`#09090b`):** App body background
- **Zinc-900 (`#0f0f14`):** Sidebar
- **Zinc-800 (`#18181b`):** Elevated dark cards, hover states on sidebar
- **White:** Input panel, canvas, toolbar — the "workspace" zone
- **Slate-50 (`#f8fafc`):** Canvas container background
- **Emerald-500 (`#10b981`):** Success, "ready" badges, completed steps
- **Amber-500 (`#f59e0b`):** "Coming soon" badges, warning states

---

## PHASE 2 — ROOT LAYOUT (`layout.tsx`)

No changes needed to font loading. Verify these classes are on `<html>`:

```tsx
// app/layout.tsx
<html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
  <body className="h-screen overflow-hidden bg-[#09090b] text-slate-100 antialiased">
    {children}
  </body>
</html>
```

---

## PHASE 3 — LAB LAYOUT (`app/lab/layout.tsx`)

Replace the entire file:

```tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileTopbar from '@/components/layout/MobileTopbar';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#09090b]">

      {/* ── Sidebar (desktop: always visible, mobile: drawer) ── */}
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* ── Mobile backdrop overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main content shell ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile topbar — only visible on small screens */}
        <MobileTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## PHASE 4 — SIDEBAR COMPONENT (Complete Rebuild)

Delete the existing `Sidebar.tsx` CSS classes. Replace with full Tailwind + shadcn implementation.

### 4.1 `MobileTopbar.tsx` (New Component)

Create `components/layout/MobileTopbar.tsx`:

```tsx
'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';

interface Props {
  onMenuClick: () => void;
}

export default function MobileTopbar({ onMenuClick }: Props) {
  return (
    <header className="
      flex h-[52px] items-center gap-3 border-b border-white/[0.06]
      bg-[#0f0f14] px-4 md:hidden
    ">
      <button
        onClick={onMenuClick}
        className="
          flex h-9 w-9 items-center justify-center
          rounded-lg border border-white/[0.08]
          bg-white/[0.04] text-slate-400
          transition-colors hover:bg-white/[0.07] hover:text-white
        "
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      <Link
        href="/"
        className="flex items-center gap-2 font-heading text-sm font-bold text-white"
      >
        <span className="
          flex h-7 w-7 items-center justify-center
          rounded-lg bg-gradient-to-br from-primary-500 to-violet-600
          text-[11px] font-black text-white
        ">
          EG
        </span>
        Virtual Lab
      </Link>
    </header>
  );
}
```

### 4.2 Full `Sidebar.tsx` Rebuild

Replace entire file:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { BookOpen, Compass, Box, Layers, PenTool, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ─── */
interface Topic { id: string; title: string; href: string; ready: boolean }
interface Unit   { id: string; title: string; icon: React.ReactNode; topics: Topic[] }

/* ─── Data — unchanged from original ─── */
const UNITS: Unit[] = [ /* ... same UNITS array as original Sidebar.tsx ... */ ];

/* ─── Props ─── */
interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    new Set(UNITS.map(u => u.id))
  );

  const toggleUnit = (id: string) =>
    setExpandedUnits(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <TooltipProvider delayDuration={300}>
      {/*
        DESKTOP: fixed-width sidebar always shown
        MOBILE:  fixed overlay drawer, controlled by mobileOpen prop
      */}
      <aside
        className={cn(
          // Base layout
          'flex h-full flex-col bg-[#0f0f14] text-slate-200',
          'border-r border-white/[0.06]',
          'transition-[width] duration-300 ease-in-out',
          // Desktop width
          'hidden md:flex',
          collapsed ? 'w-[60px] min-w-[60px]' : 'w-sidebar min-w-sidebar',
          // Mobile: fixed drawer overlay
          'md:relative md:translate-x-0',
        )}
        aria-label="Main navigation"
      >
        {/* ─── Brand Header ─── */}
        <div className={cn(
          'flex items-center border-b border-white/[0.06]',
          'h-[60px] shrink-0 px-4',
          collapsed ? 'justify-center' : 'gap-3'
        )}>

          {/* Logo mark */}
          <Link
            href="/"
            className="
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-lg bg-gradient-to-br from-primary-500 to-violet-600
              text-[11px] font-black text-white shadow-glow-sm
              transition-transform hover:scale-105
            "
            aria-label="EG Virtual Lab Home"
          >
            EG
          </Link>

          {/* Brand text — hidden when collapsed */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <span className="font-heading text-[0.9rem] font-bold leading-tight text-white">
                  EG Lab
                </span>
                <span className="text-2xs font-medium uppercase tracking-widest text-white/30">
                  Virtual Engineering
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center',
              'rounded-md border border-white/[0.08] bg-white/[0.04]',
              'text-slate-500 transition-colors hover:bg-white/[0.08] hover:text-slate-300',
              collapsed && 'mx-auto mt-1'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={12} />
              : <ChevronLeft  size={12} />
            }
          </button>
        </div>

        {/* ─── Navigation ─── */}
        <ScrollArea className="flex-1 scrollbar-dark">
          <nav className="py-2" aria-label="Course navigation">
            {UNITS.map((unit, unitIndex) => {
              const isExpanded = expandedUnits.has(unit.id);
              const readyCount = unit.topics.filter(t => t.ready).length;
              const hasActiveTopic = unit.topics.some(t => t.href === pathname);

              return (
                <div key={unit.id} className="mb-px">

                  {/* Unit header button */}
                  {collapsed ? (
                    /* Collapsed: icon only with tooltip */
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'flex w-full items-center justify-center py-3',
                            'text-slate-500 transition-colors hover:text-slate-300',
                            hasActiveTopic && 'text-primary-400'
                          )}
                        >
                          {unit.icon}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {unit.title}
                        {readyCount > 0 && (
                          <span className="ml-1.5 text-primary-400">({readyCount})</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    /* Expanded: full unit header */
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-4 py-2.5',
                        'font-heading text-xs font-semibold',
                        'transition-colors duration-150',
                        'hover:bg-white/[0.04]',
                        hasActiveTopic
                          ? 'text-slate-200 bg-white/[0.03]'
                          : 'text-slate-500 hover:text-slate-300'
                      )}
                    >
                      {/* Unit icon */}
                      <span className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center',
                        'transition-colors',
                        hasActiveTopic ? 'text-primary-400' : 'text-slate-600'
                      )}>
                        {unit.icon}
                      </span>

                      {/* Unit title */}
                      <span className="flex-1 truncate text-left">{unit.title}</span>

                      {/* Ready badge */}
                      {readyCount > 0 && (
                        <span className="
                          flex h-4 min-w-[16px] items-center justify-center
                          rounded-full bg-primary-500/20 px-1
                          text-[10px] font-bold text-primary-400
                        ">
                          {readyCount}
                        </span>
                      )}

                      {/* Chevron */}
                      <ChevronDown
                        size={12}
                        className={cn(
                          'shrink-0 text-slate-600 transition-transform duration-200',
                          isExpanded ? 'rotate-0' : '-rotate-90'
                        )}
                      />
                    </button>
                  )}

                  {/* Topics list */}
                  <AnimatePresence initial={false}>
                    {isExpanded && !collapsed && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        {unit.topics.map(topic => {
                          const isActive = pathname === topic.href;

                          if (!topic.ready) {
                            return (
                              <li key={topic.id}>
                                <span className="
                                  flex items-center gap-2 py-1.5 pl-11 pr-4
                                  text-sm text-slate-700 cursor-not-allowed
                                  select-none
                                ">
                                  <span className="flex-1 truncate">{topic.title}</span>
                                  <span className="
                                    rounded px-1 py-px
                                    text-[9px] font-bold uppercase tracking-wider
                                    text-amber-600/70 bg-amber-500/[0.08]
                                  ">
                                    Soon
                                  </span>
                                </span>
                              </li>
                            );
                          }

                          return (
                            <li key={topic.id}>
                              <Link
                                href={topic.href}
                                className={cn(
                                  'flex items-center gap-2 py-1.5 pl-11 pr-4',
                                  'text-sm transition-all duration-150',
                                  'relative',
                                  isActive
                                    ? [
                                        'bg-primary-500/[0.1] text-white font-semibold',
                                        'before:absolute before:left-0 before:top-0.5 before:bottom-0.5',
                                        'before:w-0.5 before:rounded-r-full before:bg-primary-500',
                                      ]
                                    : [
                                        'text-slate-500 hover:text-slate-200',
                                        'hover:bg-white/[0.03]',
                                        'hover:pl-[46px]', // subtle indent on hover
                                      ]
                                )}
                              >
                                {/* Active dot */}
                                {isActive && (
                                  <span className="
                                    absolute left-[22px] top-1/2 -translate-y-1/2
                                    h-1 w-1 rounded-full bg-primary-400
                                  " />
                                )}
                                <span className="truncate">{topic.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* ─── Sidebar Footer ─── */}
        {!collapsed && (
          <div className="border-t border-white/[0.06] p-3">
            <Link
              href="/"
              className="
                flex items-center gap-2 rounded-lg px-3 py-2
                text-xs text-slate-600 transition-colors
                hover:bg-white/[0.04] hover:text-slate-300
              "
            >
              <Home size={13} />
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </aside>

      {/* ─── Mobile Drawer (separate instance) ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="
              fixed inset-y-0 left-0 z-[160]
              flex w-[280px] flex-col
              bg-[#0f0f14] border-r border-white/[0.06]
              md:hidden
            "
          >
            {/* Same inner content as desktop sidebar */}
            {/* Tip: extract inner JSX to a <SidebarInner> sub-component and reuse */}
          </motion.aside>
        )}
      </AnimatePresence>

    </TooltipProvider>
  );
}
```

**Design notes for Sidebar:**
- Logo mark: `8x8` indigo→violet gradient square, `font-black` "EG" text, `rounded-lg`
- Collapsed state: 60px wide, icons only with right-side Tooltip
- Unit headers: `text-xs font-semibold font-heading`, subdued `text-slate-500`, brightens to `text-slate-200` when unit has active child
- Active topic: `bg-primary-500/[0.10]`, `text-white`, 2px left border indicator (`bg-primary-500`), small active dot left of text
- Coming-soon topics: `opacity` not used — instead pointer-events removed, text is `text-slate-700` (very faint)
- Collapse animation: `framer-motion` width transition on the aside, content fade with `AnimatePresence`

---

## PHASE 5 — INPUT PANEL (`InputPanel.tsx`)

Replace all ad-hoc CSS class names with Tailwind. Use shadcn `Select`, `Input`, `Label`.

```tsx
'use client';

import { useCallback } from 'react';
import { useLabStore } from '@/stores/labStore';
import type { CaseType, RestingOn, SolidType } from '@/types/projection';
import { CASE_OPTIONS, RESTING_OPTIONS, SOLID_OPTIONS } from '@/types/projection';

import { Button }   from '@/components/ui/button';
import { Label }    from '@/components/ui/label';
import { Input }    from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Loader2, RotateCcw, Zap } from 'lucide-react';

/* ─── Section label subcomponent ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-2xs font-bold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

/* ─── Field wrapper subcomponent ─── */
function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {children}
    </div>
  );
}

export default function InputPanel() {
  const {
    solidType, caseType, baseEdge, axisLength,
    edgeAngle, axisAngleHP, axisAngleVP, restingOn,
    isLoading, error,
    setSolidType, setCaseType, setBaseEdge, setAxisLength,
    setEdgeAngle, setAxisAngleHP, setAxisAngleVP, setRestingOn,
    generate, resetAll,
  } = useLabStore();

  const handleGenerate = useCallback(() => {
    const container = document.querySelector('.canvas-container');
    const w = container ? container.clientWidth - 40 : 1200;
    const h = container ? container.clientHeight - 40 : 700;
    generate(w, h);
  }, [generate]);

  const showEdgeAngle   = caseType === 'A' || caseType === 'B';
  const showAxisAngleHP = caseType === 'C' || caseType === 'D';
  const showAxisAngleVP = caseType === 'D';
  const showRestingOn   = caseType === 'C' || caseType === 'D';

  return (
    <aside className="
      flex w-input-panel min-w-input-panel flex-col
      border-r border-edge-light bg-white
      shadow-panel
    ">

      {/* ─── Panel Header ─── */}
      <div className="
        sticky top-0 z-10 shrink-0
        border-b border-edge-light bg-white/95
        px-5 py-4 backdrop-blur-sm
      ">
        <p className="text-2xs font-bold uppercase tracking-widest text-slate-400">
          Parameters
        </p>
        <h2 className="font-heading text-base font-bold text-slate-900 leading-tight mt-0.5">
          Input Panel
        </h2>
      </div>

      {/* ─── Scrollable Body ─── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin space-y-5">

        {/* ── Solid & Case Selection ── */}
        <div className="space-y-3">
          <SectionLabel>Solid Type</SectionLabel>

          <FieldGroup>
            <Label htmlFor="solidType" className="text-sm font-medium text-slate-700">
              Select Solid
            </Label>
            <Select
              value={solidType}
              onValueChange={(v) => setSolidType(v as SolidType | '')}
            >
              <SelectTrigger
                id="solidType"
                className="
                  h-9 w-full border-slate-200 bg-slate-50 text-sm
                  text-slate-800 transition-colors
                  hover:border-slate-300 hover:bg-white
                  focus:border-primary-500 focus:ring-primary-500/20
                "
              >
                <SelectValue placeholder="— Select Solid —" />
              </SelectTrigger>
              <SelectContent>
                {SOLID_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="caseType" className="text-sm font-medium text-slate-700">
              Select Case
            </Label>
            <Select
              value={caseType}
              onValueChange={(v) => setCaseType(v as CaseType | '')}
            >
              <SelectTrigger
                id="caseType"
                className="
                  h-9 w-full border-slate-200 bg-slate-50 text-sm
                  text-slate-800 transition-colors
                  hover:border-slate-300 hover:bg-white
                  focus:border-primary-500 focus:ring-primary-500/20
                "
              >
                <SelectValue placeholder="— Select Case —" />
              </SelectTrigger>
              <SelectContent>
                {CASE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>

        <Separator className="bg-edge-light" />

        {/* ── Dimension Parameters ── */}
        <div className="space-y-3">
          <SectionLabel>Dimensions</SectionLabel>

          <FieldGroup>
            <Label htmlFor="baseEdge" className="text-sm font-medium text-slate-700">
              Base Edge Length
              <span className="ml-1 text-slate-400 font-normal">(mm)</span>
            </Label>
            <Input
              id="baseEdge"
              type="number"
              min={10} max={100}
              value={baseEdge}
              onChange={e => setBaseEdge(Number(e.target.value))}
              className="
                h-9 border-slate-200 bg-slate-50 text-sm
                shadow-inner-sm transition-colors
                hover:border-slate-300 hover:bg-white
                focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
              "
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="axisLength" className="text-sm font-medium text-slate-700">
              Axis Length
              <span className="ml-1 text-slate-400 font-normal">(mm)</span>
            </Label>
            <Input
              id="axisLength"
              type="number"
              min={20} max={150}
              value={axisLength}
              onChange={e => setAxisLength(Number(e.target.value))}
              className="
                h-9 border-slate-200 bg-slate-50 text-sm
                shadow-inner-sm transition-colors
                hover:border-slate-300 hover:bg-white
                focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
              "
            />
          </FieldGroup>
        </div>

        {/* ── Dynamic Case-Specific Parameters ── */}
        {(showEdgeAngle || showAxisAngleHP || showAxisAngleVP || showRestingOn) && (
          <>
            <Separator className="bg-edge-light" />
            <div className="space-y-3">
              <SectionLabel>Case Parameters</SectionLabel>

              {showEdgeAngle && (
                <FieldGroup className="animate-slide-in-down">
                  <Label htmlFor="edgeAngle" className="text-sm font-medium text-slate-700">
                    Edge Angle with VP
                    <span className="ml-1 text-slate-400 font-normal">(°)</span>
                  </Label>
                  <Input
                    id="edgeAngle"
                    type="number"
                    min={0} max={90}
                    value={edgeAngle}
                    onChange={e => setEdgeAngle(Number(e.target.value))}
                    className="h-9 border-slate-200 bg-slate-50 text-sm focus:border-primary-500"
                  />
                </FieldGroup>
              )}

              {showAxisAngleHP && (
                <FieldGroup className="animate-slide-in-down">
                  <Label htmlFor="axisAngleHP" className="text-sm font-medium text-slate-700">
                    Axis Inclination to HP
                    <span className="ml-1 text-slate-400 font-normal">(°)</span>
                  </Label>
                  <Input
                    id="axisAngleHP"
                    type="number"
                    min={0} max={90}
                    value={axisAngleHP}
                    onChange={e => setAxisAngleHP(Number(e.target.value))}
                    className="h-9 border-slate-200 bg-slate-50 text-sm focus:border-primary-500"
                  />
                </FieldGroup>
              )}

              {showAxisAngleVP && (
                <FieldGroup className="animate-slide-in-down">
                  <Label htmlFor="axisAngleVP" className="text-sm font-medium text-slate-700">
                    Axis Inclination to VP
                    <span className="ml-1 text-slate-400 font-normal">(°)</span>
                  </Label>
                  <Input
                    id="axisAngleVP"
                    type="number"
                    min={0} max={90}
                    value={axisAngleVP}
                    onChange={e => setAxisAngleVP(Number(e.target.value))}
                    className="h-9 border-slate-200 bg-slate-50 text-sm focus:border-primary-500"
                  />
                </FieldGroup>
              )}

              {showRestingOn && (
                <FieldGroup className="animate-slide-in-down">
                  <Label htmlFor="restingOn" className="text-sm font-medium text-slate-700">
                    Resting Condition
                  </Label>
                  <Select
                    value={restingOn}
                    onValueChange={v => setRestingOn(v as RestingOn)}
                  >
                    <SelectTrigger
                      id="restingOn"
                      className="h-9 w-full border-slate-200 bg-slate-50 text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESTING_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldGroup>
              )}
            </div>
          </>
        )}

        {/* ── Error Display ── */}
        {error && (
          <div className="
            rounded-lg border border-red-200/60 bg-red-50/80
            px-4 py-3 animate-slide-in-down
          ">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* ── Quick Reference Guide ── */}
        <Separator className="bg-edge-light" />
        <div className="
          rounded-xl border border-primary-500/[0.12]
          bg-gradient-to-br from-primary-50/60 to-violet-50/40
          p-4
        ">
          <p className="mb-2.5 text-2xs font-bold uppercase tracking-widest text-primary-600">
            Quick Guide
          </p>
          <ul className="space-y-1.5">
            {[
              { key: 'A', desc: 'Axis ⊥ HP — True shape in Top View' },
              { key: 'B', desc: 'Axis ⊥ VP — True shape in Front View' },
              { key: 'C', desc: 'Axis inclined to HP' },
              { key: 'D', desc: 'Axis inclined to VP' },
            ].map(item => (
              <li key={item.key} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="
                  mt-px flex h-4 w-4 shrink-0 items-center justify-center
                  rounded bg-primary-500/10
                  text-[10px] font-bold text-primary-600
                ">
                  {item.key}
                </span>
                {item.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Action Buttons — Sticky Footer ─── */}
      <div className="
        shrink-0 border-t border-edge-light bg-white/95
        px-5 py-4 backdrop-blur-sm space-y-2
      ">
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !solidType || !caseType}
          className="
            w-full h-10 gap-2 font-semibold
            bg-btn-primary text-white shadow-btn
            transition-all duration-150
            hover:bg-btn-primary-hover hover:shadow-btn-hover hover:-translate-y-px
            active:translate-y-0 active:shadow-btn
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          {isLoading ? (
            <><Loader2 size={14} className="animate-spin" /> Computing…</>
          ) : (
            <><Zap size={14} /> Generate Projection</>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={resetAll}
          className="
            w-full h-9 gap-1.5 text-sm font-medium
            border-slate-200 text-slate-600
            hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800
          "
        >
          <RotateCcw size={13} />
          Reset
        </Button>
      </div>
    </aside>
  );
}
```

**Design notes for InputPanel:**
- Two-zone layout: scrollable body + sticky footer for action buttons
- shadcn `Select` replaces native `<select>` — custom dropdown, keyboard navigable, accessible
- All inputs: `h-9` (36px) — optimal for dense professional tools
- `bg-slate-50` resting state → `bg-white` on hover/focus — creates depth illusion
- Generate button: full width, `h-10`, gradient via `bg-btn-primary` custom utility
- Generate button shows `Loader2` spinner (Lucide) when computing — no text change needed
- Section separators between logical groups — prevents visual crush
- Quick Guide redesigned as styled reference card with case key badges

---

## PHASE 6 — CANVAS TOOLBAR (Complete Component)

In `app/lab/solids/page.tsx` (or wherever the canvas controls live):

```tsx
/* CanvasToolbar section — replace .canvas-controls div */
<div className="
  flex h-toolbar shrink-0 items-center justify-between
  gap-3 border-b border-edge-light
  bg-white px-5 shadow-sm
">

  {/* ── Left: Zoom controls ── */}
  <div className="flex items-center gap-1">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomIn}
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Zoom In</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomOut}
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Zoom Out</TooltipContent>
    </Tooltip>

    <div className="mx-1 h-4 w-px bg-slate-200" aria-hidden="true" />

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetView}
          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          aria-label="Reset view"
        >
          <RefreshCw size={15} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Reset View</TooltipContent>
    </Tooltip>
  </div>

  {/* ── Center: Context label (solid + case) ── */}
  <div className="flex-1 text-center">
    {solidType && caseType ? (
      <p className="text-sm font-medium text-slate-600">
        <span className="font-semibold text-slate-800">
          {SOLID_OPTIONS.find(o => o.value === solidType)?.label}
        </span>
        <span className="mx-2 text-slate-300">·</span>
        <span className="text-primary-600 font-medium">
          Case {caseType}
        </span>
      </p>
    ) : (
      <p className="text-sm text-slate-400">No projection active</p>
    )}
  </div>

  {/* ── Right: Step Navigation ── */}
  <div
    className="
      flex items-center gap-1 rounded-xl
      border border-edge-light bg-slate-50 p-1
    "
    role="group"
    aria-label="Step navigation"
  >
    <Button
      variant="ghost"
      size="icon"
      onClick={prevStep}
      disabled={currentStep <= 1}
      className="
        h-7 w-7 rounded-lg text-slate-500
        hover:bg-white hover:text-slate-800 hover:shadow-sm
        disabled:opacity-30
      "
      aria-label="Previous step"
    >
      <ChevronLeft size={15} />
    </Button>

    <span
      className="
        min-w-[72px] text-center text-sm font-bold
        tabular-nums text-slate-800
      "
      aria-live="polite"
      aria-atomic="true"
    >
      {totalSteps > 0 ? `${currentStep} / ${totalSteps}` : '— / —'}
    </span>

    <Button
      variant="ghost"
      size="icon"
      onClick={nextStep}
      disabled={currentStep >= totalSteps}
      className="
        h-7 w-7 rounded-lg text-slate-500
        hover:bg-white hover:text-slate-800 hover:shadow-sm
        disabled:opacity-30
      "
      aria-label="Next step"
    >
      <ChevronRight size={15} />
    </Button>
  </div>
</div>
```

**Below the toolbar, add the step progress bar:**

```tsx
{/* Step Progress Bar — full width, 3px high, under toolbar */}
<div className="h-[3px] w-full bg-slate-100" aria-hidden="true">
  <div
    className="
      h-full bg-gradient-to-r from-primary-500 to-violet-500
      rounded-r-full transition-[width] duration-300 ease-material
    "
    style={{ width: totalSteps > 0 ? `${(currentStep / totalSteps) * 100}%` : '0%' }}
  />
</div>
```

**Design notes for toolbar:**
- Icon-only zoom buttons with Tooltip — clean, no label clutter
- `h-toolbar` = 52px fixed height prevents layout shift
- Center context label shows "Triangular Prism · Case A" — pedagogical orientation
- Step nav: grouped in a `rounded-xl border bg-slate-50` pill container
- Step counter: `tabular-nums`, `min-w-[72px]` to prevent width jitter
- Progress bar: 3px, indigo→violet gradient, smooth CSS transition

---

## PHASE 7 — INSTRUCTION PANEL (Rebuild)

Replace `InstructionPanel.tsx` entirely:

```tsx
'use client';

import { useLabStore } from '@/stores/labStore';
import { cn } from '@/lib/utils';

export default function InstructionPanel() {
  const { projectionResponse, currentStep } = useLabStore();
  const step = projectionResponse?.steps[currentStep - 1] ?? null;
  const totalSteps = projectionResponse?.total_steps ?? 0;

  const isWelcome = !step;

  return (
    <div className="
      relative flex min-h-[68px] items-start gap-4
      border-b border-primary-100
      bg-instruction-bar px-5 py-3.5
    "
    style={{
      background: 'linear-gradient(135deg, #eef3ff 0%, #e8f0ff 100%)',
    }}>

      {/* ── Step badge ── */}
      {!isWelcome && (
        <div className="
          mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center
          rounded-full bg-primary-500 shadow-glow-sm
        ">
          <span className="text-xs font-black tabular-nums text-white">
            {currentStep}
          </span>
        </div>
      )}

      {/* ── Text content ── */}
      <div className="flex-1 min-w-0">
        <h3 className="
          font-heading text-[0.9rem] font-bold
          leading-snug text-primary-800
          tracking-[-0.01em]
        ">
          {step?.title ?? 'Welcome to Virtual Lab'}
        </h3>
        <p className="
          mt-0.5 text-sm leading-relaxed text-slate-600
          max-w-[900px]
        ">
          {step?.description ?? (
            'Select a solid and case type from the left panel to begin. ' +
            'Step-by-step procedure will guide you through first-angle projections.'
          )}
        </p>
      </div>

      {/* ── Step count chip — top right ── */}
      {totalSteps > 0 && (
        <span className="
          absolute right-4 top-3
          flex items-center gap-1 rounded-full
          bg-primary-500/10 px-2.5 py-0.5
          text-[11px] font-bold text-primary-600
          whitespace-nowrap
        ">
          {currentStep} of {totalSteps}
        </span>
      )}
    </div>
  );
}
```

**Design notes:**
- Remove `max-height: 10%` entirely — use `min-h-[68px]` instead, grows with content
- `bg-instruction-bar` = `linear-gradient(135deg, #eef3ff, #e8f0ff)` — replaces hardcoded `#eff6ff`
- Step badge: filled `bg-primary-500` circle, white bold number
- "Welcome" state: no badge, full-width text block
- `max-w-[900px]` on description prevents extremely long lines on ultra-wide displays
- Step count chip: top-right absolute, indigo pill

---

## PHASE 8 — CANVAS RENDERER & CONTAINER

In the solids page component, wrap `CanvasRenderer` with:

```tsx
{/* Canvas area — fills remaining vertical space */}
<div className="
  relative flex flex-1 flex-col overflow-hidden
  bg-surface-canvas
  bg-grid-lines bg-grid-24
">
  {/* Dot grid overlay creates engineering drawing feel */}

  {/* Empty state */}
  {!projectionResponse && !isLoading && (
    <div className="
      absolute inset-0 flex flex-col items-center
      justify-center gap-4 pointer-events-none
    ">
      <div className="animate-float opacity-40">
        {/* Engineering drawing placeholder SVG */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="8"  y="8"  width="40" height="30" rx="2"
            stroke="#818cf8" strokeWidth="1.5" strokeDasharray="5 3"/>
          <rect x="20" y="44" width="40" height="30" rx="2"
            stroke="#818cf8" strokeWidth="1.5" strokeDasharray="5 3"/>
          <line x1="8"  y1="38" x2="20" y2="74"
            stroke="#c7d2fe" strokeWidth="1"/>
          <line x1="48" y1="8"  x2="60" y2="44"
            stroke="#c7d2fe" strokeWidth="1"/>
          <circle cx="40" cy="40" r="3" fill="#818cf8" opacity="0.5"/>
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-400">Ready to Visualize</p>
      <p className="text-xs text-slate-400/70 text-center max-w-[200px] leading-relaxed">
        Configure parameters and click Generate Projection
      </p>
    </div>
  )}

  {/* Loading skeleton */}
  {isLoading && (
    <div className="
      absolute inset-0 flex flex-col items-center
      justify-center gap-4 bg-surface-canvas
    ">
      <div className="space-y-3 w-[60%]">
        <div className="h-4 rounded-full bg-slate-200 animate-shimmer
          bg-shimmer-gradient bg-[length:200%_100%]" />
        <div className="h-4 w-3/4 rounded-full bg-slate-200 animate-shimmer
          bg-shimmer-gradient bg-[length:200%_100%]" />
        <div className="h-64 rounded-2xl bg-slate-200 animate-shimmer
          bg-shimmer-gradient bg-[length:200%_100%]" />
      </div>
    </div>
  )}

  {/* The canvas itself */}
  <CanvasRenderer />
</div>
```

**Update `CanvasRenderer.tsx` canvas styling:**

```tsx
// In the return JSX, the canvas element:
<canvas
  ref={canvasRef}
  id="drawingCanvas"
  className="
    block rounded-xl bg-white
    shadow-canvas
    cursor-crosshair
  "
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  onWheel={handleWheel}
/>
```

**Design notes for canvas:**
- `bg-grid-lines bg-grid-24`: Engineering dot-grid background communicates drawing context
- Empty state: floating SVG illustration (animated with `animate-float`), two-line copy
- Loading: shimmer skeleton bars matching expected canvas dimensions
- Canvas itself: `rounded-xl`, `shadow-canvas` (`0 4px 32px rgba(0,0,0,0.12)`)

---

## PHASE 9 — HOME PAGE COMPLETE REBUILD

Replace `app/page.tsx` entirely:

```tsx
import Link from 'next/link';
import { ArrowRight, BookOpen, Box, Compass, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-y-auto bg-[#09090b] text-slate-100 scrollbar-dark">

      {/* ─────────────── STICKY NAV ─────────────── */}
      <header className="
        sticky top-0 z-50
        border-b border-white/[0.06]
        bg-[#09090b]/80 backdrop-blur-md
      ">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-8 px-6">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="
              flex h-7 w-7 items-center justify-center
              rounded-lg bg-gradient-to-br from-primary-500 to-violet-600
              text-[11px] font-black text-white shadow-glow-sm
            ">
              EG
            </span>
            <span className="font-heading text-sm font-bold text-white">
              Virtual Lab
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {[
              { label: 'Introduction',   href: '/lab/introduction/importance' },
              { label: 'Plane Curves',   href: '/lab/curves/ellipse'          },
              { label: 'Solids Lab',     href: '/lab/solids'                  },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  text-sm text-slate-500 transition-colors
                  hover:text-slate-200
                "
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="ml-auto">
            <Button
              asChild
              size="sm"
              className="
                gap-1.5 bg-primary-500 text-white font-semibold
                shadow-glow-sm
                hover:bg-primary-600 hover:-translate-y-px
                transition-all duration-150
              "
            >
              <Link href="/lab/solids">
                Open Lab <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─────────────── HERO ─────────────── */}
      <section className="
        relative overflow-hidden
        py-28 px-6 text-center
        bg-hero-radial
      ">
        {/* Bottom fade */}
        <div className="
          pointer-events-none absolute inset-x-0 bottom-0 h-32
          bg-gradient-to-t from-[#09090b] to-transparent
        " />

        <div className="relative z-10 mx-auto max-w-3xl">

          {/* Badge */}
          <div className="
            mb-8 inline-flex items-center gap-2 rounded-full
            border border-primary-500/20 bg-primary-500/10
            px-4 py-1.5 text-xs font-bold uppercase
            tracking-widest text-primary-400
            animate-fade-in-up
          ">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse-soft" />
            Engineering Graphics Virtual Lab
          </div>

          {/* Heading */}
          <h1 className="
            font-heading text-[clamp(2.25rem,5vw,3.75rem)]
            font-black leading-[1.08] tracking-[-0.035em]
            text-white
            animate-fade-in-up [animation-delay:100ms]
          ">
            Master Engineering
            <span className="
              block bg-gradient-accent bg-clip-text
              text-transparent animate-gradient-shift bg-[length:200%_auto]
            ">
              Graphics Interactively
            </span>
          </h1>

          {/* Subtitle */}
          <p className="
            mx-auto mt-6 max-w-[520px] text-lg
            leading-relaxed text-slate-400
            animate-fade-in-up [animation-delay:200ms]
          ">
            Step-by-step constructions for curves, projections, and solids.
            Every step computed and visualized in real time.
          </p>

          {/* CTAs */}
          <div className="
            mt-10 flex flex-wrap items-center justify-center gap-3
            animate-fade-in-up [animation-delay:300ms]
          ">
            <Button
              asChild
              size="lg"
              className="
                h-12 gap-2 rounded-xl px-7
                bg-primary-500 font-semibold text-white
                shadow-[0_4px_24px_rgba(99,102,241,0.40)]
                hover:bg-primary-600
                hover:shadow-[0_8px_32px_rgba(99,102,241,0.50)]
                hover:-translate-y-0.5
                transition-all duration-200
              "
            >
              <Link href="/lab/solids">
                Launch Lab <ArrowRight size={16} />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="
                h-12 gap-2 rounded-xl px-7
                border-white/10 bg-white/[0.04]
                text-slate-300 font-medium
                hover:border-white/20 hover:bg-white/[0.08] hover:text-white
                transition-all duration-200
              "
            >
              <Link href="/lab/introduction/importance">
                Why Engineering Graphics?
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="
            mt-16 flex justify-center
            animate-fade-in-up [animation-delay:400ms]
          ">
            <div className="
              grid grid-cols-3
              divide-x divide-white/[0.06]
              rounded-2xl border border-white/[0.07]
              bg-white/[0.02]
            ">
              {[
                { n: '5',  label: 'Interactive Labs'  },
                { n: '34', label: 'Topics Planned'    },
                { n: '∞',  label: 'Input Combinations'},
              ].map(stat => (
                <div key={stat.label} className="px-10 py-5 text-center">
                  <span className="
                    block font-heading text-3xl font-black
                    text-white tracking-tight
                  ">
                    {stat.n}
                  </span>
                  <span className="
                    mt-1 block text-2xs font-semibold uppercase
                    tracking-widest text-slate-600
                  ">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FEATURES ─────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: <Zap size={20} className="text-primary-400" />,
              title: 'Interactive Construction',
              body:  'Build curves and projections step-by-step with live visual feedback. No more static diagrams.',
            },
            {
              icon: <Compass size={20} className="text-violet-400" />,
              title: 'Precise Geometry Engine',
              body:  'Backend-computed geometry ensures accuracy. Every angle, edge, and projection is exact.',
            },
            {
              icon: <Box size={20} className="text-sky-400" />,
              title: 'Real-time Visualization',
              body:  'Instant rendering with zoom, pan, and step navigation. Explore at your own pace.',
            },
          ].map((card, i) => (
            <div
              key={card.title}
              className="
                group relative overflow-hidden rounded-2xl
                border border-white/[0.07] bg-white/[0.03]
                p-6 transition-all duration-300
                hover:border-white/[0.12] hover:bg-white/[0.05]
                hover:-translate-y-1
                animate-fade-in-up
              "
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              {/* Top line accent — appears on hover */}
              <div className="
                absolute inset-x-0 top-0 h-px
                bg-gradient-to-r from-transparent via-primary-500/50 to-transparent
                opacity-0 transition-opacity duration-300
                group-hover:opacity-100
              " />

              <div className="
                mb-4 flex h-10 w-10 items-center justify-center
                rounded-xl bg-white/[0.05] border border-white/[0.06]
              ">
                {card.icon}
              </div>
              <h3 className="font-heading text-base font-bold text-white mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────── MODULES GRID ─────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="font-heading text-2xl font-bold text-white mb-6 tracking-tight">
          Explore <span className="text-primary-400">Modules</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <BookOpen size={22} className="text-primary-400"/>,
              title: 'Introduction',
              body: 'The power and importance of engineering graphics.',
              status: 'ready', statusLabel: '2 Topics Ready',
              href: '/lab/introduction/importance',
              featured: false,
            },
            {
              icon: <Compass size={22} className="text-violet-400"/>,
              title: 'Plane Curves',
              body: 'Ellipse, parabola, cycloid — constructed step by step.',
              status: 'ready', statusLabel: '2 Labs Ready',
              href: '/lab/curves/ellipse',
              featured: false,
            },
            {
              icon: <Box size={22} className="text-primary-300"/>,
              title: 'Projection of Solids',
              body: 'Orthographic projections with 8 solid types across 4 cases.',
              status: 'featured', statusLabel: '★ Fully Interactive',
              href: '/lab/solids',
              featured: true,
            },
            {
              icon: <Layers size={22} className="text-slate-500"/>,
              title: 'Development',
              body: 'Surface development of prisms, pyramids, cylinders, cones.',
              status: 'soon', statusLabel: 'Coming Soon',
              href: '/lab/coming-soon?topic=dev-prisms',
              featured: false,
            },
            {
              icon: <Eye size={22} className="text-slate-500"/>,
              title: 'Sketching & Perspective',
              body: 'Freehand sketching, multiple views, perspective projections.',
              status: 'soon', statusLabel: 'Coming Soon',
              href: '/lab/coming-soon?topic=multiple-views',
              featured: false,
            },
          ].map((mod, i) => (
            <Link
              key={mod.title}
              href={mod.href}
              className={`
                group relative flex flex-col overflow-hidden rounded-2xl
                border p-5 text-white no-underline
                transition-all duration-300
                animate-fade-in-up
                ${mod.featured
                  ? 'border-primary-500/25 bg-primary-500/[0.06] hover:border-primary-500/40'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                }
                hover:-translate-y-1.5
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]
              `}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Top color bar */}
              <div className={`
                absolute inset-x-0 top-0 h-[2px]
                bg-gradient-to-r from-primary-500 to-violet-500
                ${mod.featured ? 'opacity-100' : 'opacity-0 transition-opacity group-hover:opacity-100'}
              `} />

              <div className="
                mb-3 flex h-9 w-9 items-center justify-center
                rounded-xl bg-white/[0.05] border border-white/[0.06]
              ">
                {mod.icon}
              </div>

              <h3 className="font-heading text-[0.95rem] font-bold leading-tight mb-1.5">
                {mod.title}
              </h3>
              <p className="flex-1 text-sm text-slate-500 leading-relaxed">
                {mod.body}
              </p>

              <div className="mt-3">
                <span className={`
                  inline-flex items-center rounded-full px-2.5 py-0.5
                  text-[10px] font-bold uppercase tracking-wider
                  ${mod.status === 'ready' || mod.status === 'featured'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-500'
                  }
                `}>
                  {mod.statusLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t border-white/[0.05] py-8 text-center">
        <p className="text-sm text-slate-600">Engineering Graphics Virtual Lab</p>
        <p className="mt-1 text-xs text-slate-800">Next.js · FastAPI · Canvas API</p>
      </footer>
    </div>
  );
}
```

---

## PHASE 10 — CONTENT PAGES (Introduction, Importance, etc.)

The content pages use `.content-page` and `.content-section`. Replace with Tailwind prose:

```tsx
{/* In any content page: */}
<article className="
  mx-auto max-w-[840px] px-6 py-10
  prose prose-slate
  prose-headings:font-heading prose-headings:tracking-tight
  prose-h1:text-[1.875rem] prose-h1:font-black
  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-12
  prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200
  prose-p:text-slate-600 prose-p:leading-[1.8]
  prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
  prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/40
  prose-blockquote:rounded-r-lg prose-blockquote:not-italic
  prose-strong:text-slate-800 prose-strong:font-semibold
">
  {/* page content */}
</article>
```

**Also install:** `npm install @tailwindcss/typography` and add `require('@tailwindcss/typography')` to plugins array in `tailwind.config.ts`.

**Challenge box:**

```tsx
<div className="
  relative overflow-hidden rounded-2xl
  border border-amber-400/20 bg-gradient-to-br
  from-amber-50/60 to-yellow-50/30
  p-6 my-8
">
  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-400 to-yellow-400" />
  {/* content */}
</div>
```

---

## PHASE 11 — SOLIDS LAB PAGE LAYOUT (`app/lab/solids/page.tsx`)

```tsx
export default function SolidsPage() {
  return (
    /*
      Three-column layout:
      1. InputPanel (fixed 280px)
      2. Canvas area (flex-1):
         a. Toolbar (52px)
         b. Progress bar (3px)
         c. Instruction panel (min 68px)
         d. Canvas container (flex-1)
    */
    <div className="flex h-full w-full overflow-hidden bg-white">

      {/* ── 1. Input Panel ── */}
      <InputPanel />

      {/* ── 2. Canvas Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* 2a. Toolbar */}
        {/* ... CanvasControls + StepNavigator per Phase 6 */}

        {/* 2b. Progress bar */}
        {/* ... per Phase 6 */}

        {/* 2c. Instruction panel */}
        <InstructionPanel />

        {/* 2d. Canvas */}
        <div className="
          relative flex flex-1 overflow-hidden
          bg-[#f4f6fb]
          bg-grid-lines bg-grid-24
        ">
          <CanvasRenderer />
          {/* empty state / loading overlays here */}
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 12 — SKELETON & LOADING STATES

Use shadcn `<Skeleton>` from `@/components/ui/skeleton`:

```tsx
// Canvas loading state
{isLoading && (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
    <Skeleton className="h-5 w-[45%] rounded-full" />
    <Skeleton className="h-5 w-[35%] rounded-full" />
    <Skeleton className="h-[280px] w-[80%] rounded-2xl mt-2" />
    <div className="flex gap-3 w-[80%]">
      <Skeleton className="h-16 flex-1 rounded-xl" />
      <Skeleton className="h-16 flex-1 rounded-xl" />
    </div>
  </div>
)}
```

---

## PHASE 13 — ACCESSIBILITY CHECKLIST

Every component must satisfy:

1. **Focus ring:** All interactive elements use `focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`
2. **Color contrast:** All text meets WCAG AA (4.5:1):
   - `text-slate-500` on `#0f0f14` → passes at 5.1:1
   - `text-slate-600` on white → passes at 5.9:1
3. **ARIA:** `aria-live="polite"` on step indicator; `role="group"` on step nav; `aria-label` on all icon buttons
4. **Keyboard:** shadcn Select and Sheet are fully keyboard navigable out of the box
5. **Reduced motion:** Add to `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## PHASE 14 — FINAL CLEANUP: DELETE GLOBALS.CSS CLASSES

After all components are migrated, perform a search-and-replace sweep to remove
every old CSS class from JSX. Delete these CSS classes from the old globals.css
(or the file entirely since the new globals.css is ~80 lines):

Classes to remove: `.input-panel`, `.panel-header`, `.input-group`, `.input-field`,
`.dynamic-inputs`, `.button-group`, `.btn`, `.btn-primary`, `.btn-secondary`,
`.info-box`, `.error-message`, `.canvas-area`, `.canvas-controls`, `.control-group`,
`.control-btn`, `.step-controls`, `.step-indicator`, `.instruction-panel`,
`.instruction-content`, `.canvas-container`, `.sidebar`, `.sidebar-header`,
`.sidebar-brand`, `.sidebar-nav`, `.sidebar-unit`, `.sidebar-unit-header`,
`.sidebar-topics`, `.sidebar-topic`, `.home-page`, `.home-hero`, `.hero-content`,
`.hero-badge`, `.hero-title`, `.hero-accent`, `.hero-subtitle`, `.hero-actions`,
`.hero-cta`, `.hero-stats`, `.home-features`, `.feature-card`, `.modules-grid`,
`.module-card`, `.content-page`, `.content-section`

---

## PHASE 15 — EXECUTION PRIORITY ORDER

| Priority | Phase | Task | Est. Time |
|---|---|---|---|
| 🔴 P0 | 0 | Install + configure Tailwind + shadcn | 45 min |
| 🔴 P0 | 0.3 | Replace globals.css | 20 min |
| 🔴 P0 | 3 | Lab layout (grid + mobile drawer) | 30 min |
| 🟠 P1 | 4 | Sidebar full rebuild | 90 min |
| 🟠 P1 | 5 | InputPanel with shadcn Select/Input | 60 min |
| 🟠 P1 | 6 | Canvas toolbar + progress bar | 45 min |
| 🟠 P1 | 7 | Instruction panel | 20 min |
| 🟡 P2 | 8 | Canvas container + empty/loading states | 30 min |
| 🟡 P2 | 9 | Home page full rebuild | 90 min |
| 🟡 P2 | 11 | Solids lab page layout | 30 min |
| 🟢 P3 | 10 | Content pages (prose) | 30 min |
| 🟢 P3 | 12 | Skeleton states | 20 min |
| 🟢 P3 | 13 | Accessibility audit | 45 min |
| 🔵 P4 | 14 | CSS cleanup + delete old globals | 60 min |
