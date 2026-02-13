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
                    50: '#eef2ff',
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
                    app: '#09090b',  // body / outermost shell (zinc-950)
                    sidebar: '#0f0f14',  // sidebar panel — slightly lighter than app
                    'sidebar-hover': '#16161d', // sidebar item hover
                    panel: '#ffffff',  // input panel
                    canvas: '#f4f6fb',  // canvas area background
                    toolbar: '#ffffff',  // top toolbar
                    instruction: '#f0f4ff',  // instruction bar (replaces hardcoded #eff6ff)
                    elevated: '#18181b',  // cards on dark bg (zinc-900)
                },

                // Border palette
                edge: {
                    dark: 'rgba(255,255,255,0.07)',  // borders on dark surfaces
                    light: '#e8ecf4',                // borders on light surfaces
                    accent: '#6366f1',                // focused/active borders
                    subtle: 'rgba(99,102,241,0.15)',   // very subtle accent borders
                },

                // Text palette — semantic
                ink: {
                    DEFAULT: '#0f172a',   // primary text on light
                    secondary: '#475569', // secondary text
                    muted: '#94a3b8',  // muted/placeholder
                    ghost: '#cbd5e1',  // very faint
                    inverse: '#f1f5f9',  // text on dark
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
                danger: '#ef4444',
            },

            // ─────────────────────────────────────────────
            // TYPOGRAPHY
            // ─────────────────────────────────────────────
            fontFamily: {
                sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
                heading: ['var(--font-heading)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
            },

            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.8125rem', { lineHeight: '1.25rem' }],
                base: ['0.875rem', { lineHeight: '1.5rem' }],
                md: ['0.9375rem', { lineHeight: '1.5rem' }],
                lg: ['1rem', { lineHeight: '1.625rem' }],
                xl: ['1.125rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.25rem', { lineHeight: '1.875rem' }],
                '3xl': ['1.5rem', { lineHeight: '2rem' }],
                '4xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '5xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '6xl': ['3rem', { lineHeight: '1.1' }],
                '7xl': ['3.75rem', { lineHeight: '1.05' }],
            },

            // ─────────────────────────────────────────────
            // SPACING — Keep consistent scale
            // ─────────────────────────────────────────────
            spacing: {
                '4.5': '1.125rem',
                '13': '3.25rem',
                '15': '3.75rem',
                '18': '4.5rem',
                '22': '5.5rem',
            },

            // ─────────────────────────────────────────────
            // BORDER RADIUS
            // ─────────────────────────────────────────────
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
            },

            // ─────────────────────────────────────────────
            // BOX SHADOWS — Layered system
            // ─────────────────────────────────────────────
            boxShadow: {
                'xs': '0 1px 2px rgba(0,0,0,0.04)',
                'sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                'md': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
                'lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
                'xl': '0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.06)',
                'glow-sm': '0 0 12px rgba(99,102,241,0.20)',
                'glow-md': '0 0 24px rgba(99,102,241,0.25)',
                'glow-lg': '0 0 40px rgba(99,102,241,0.30)',
                'panel': '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.04)',
                'canvas': '0 4px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                'btn': '0 1px 3px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.15)',
                'btn-hover': '0 4px 16px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.20)',
                'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.04)',
            },

            // ─────────────────────────────────────────────
            // ANIMATION / KEYFRAMES
            // ─────────────────────────────────────────────
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'fade-in-up': {
                    from: { opacity: '0', transform: 'translateY(16px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-left': {
                    from: { opacity: '0', transform: 'translateX(-12px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                'slide-in-down': {
                    from: { opacity: '0', transform: 'translateY(-8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                'gradient-shift': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                'canvas-reveal': {
                    from: { opacity: '0.5', transform: 'scale(0.99)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'fade-in-up': 'fade-in-up 0.4s ease-out both',
                'slide-in-left': 'slide-in-left 0.3s ease-out',
                'slide-in-down': 'slide-in-down 0.25s ease-out',
                shimmer: 'shimmer 1.6s linear infinite',
                float: 'float 4s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 6s ease infinite',
                'canvas-reveal': 'canvas-reveal 0.2s ease-out',
                'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
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
                'grid-16': '16px 16px',
                'grid-24': '24px 24px',
                'grid-32': '32px 32px',
                '200%': '200% 100%',
            },

            // Width tokens for sidebar, panel
            width: {
                'sidebar': '256px',
                'sidebar-sm': '220px',
                'sidebar-icon': '60px',
                'input-panel': '280px',
                'input-panel-sm': '240px',
            },

            minWidth: {
                'sidebar': '256px',
                'input-panel': '280px',
            },

            // Height tokens
            height: {
                'toolbar': '52px',
                'nav': '60px',
            },

            minHeight: {
                'instruction': '68px',
                'canvas': '400px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),  // npm install @tailwindcss/typography
        require('tailwindcss-animate'),       // npm install tailwindcss-animate
    ],
}

export default config
