'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Box, Compass, Layers,
  PenTool, Zap, Eye, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-slate-200 selection:bg-primary-500/30">

      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="
              flex h-8 w-8 items-center justify-center
              rounded-lg bg-gradient-to-br from-primary-500 to-violet-600
              text-xs font-black text-white shadow-glow-sm
            ">
              EG
            </span>
            <span className="font-heading font-bold text-slate-100">
              Virtual Lab
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {['Introduction', 'Plane Curves', 'Solids Lab'].map((item) => (
              <span key={item} className="text-sm font-medium text-slate-400 cursor-not-allowed opacity-70">
                {item}
              </span>
            ))}
            <Link href="/lab/solids">
              <Button size="sm" className="bg-primary-600 text-white hover:bg-primary-500 shadow-glow-sm">
                Open Lab
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden py-24 text-center md:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-radial opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-dots [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] opacity-40 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          {/* Badge */}
          <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
            </span>
            Engineering Graphics Virtual Lab
          </div>

          {/* Heading */}
          <h1 className="mb-6 animate-fade-in-up font-heading text-5xl font-extrabold tracking-tight text-white md:text-7xl">
            Master Engineering <br />
            <span className="animate-gradient-shift bg-gradient-to-r from-primary-400 via-violet-400 to-primary-400 bg-200% bg-clip-text text-transparent">
              Graphics Interactively
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl animate-fade-in-up text-lg text-slate-400 delay-100 md:text-xl">
            Visualize geometric constructions in real-time.
            Understand projections, solids, and curves through step-by-step
            interactive experiments.
          </p>

          {/* Actions */}
          <div className="flex animate-fade-in-up flex-col items-center justify-center gap-4 delay-200 sm:flex-row">
            <Link href="/lab/solids">
              <Button size="lg" className="h-12 px-8 text-base bg-btn-primary hover:bg-btn-primary-hover shadow-glow-md">
                Launch Lab
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/lab/introduction/importance">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
                Why Engineering Graphics?
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid animate-fade-in-up grid-cols-3 gap-8 border-t border-white/10 pt-8 delay-300 md:gap-16">
            {[
              { label: 'Interactive Labs', value: '5' },
              { label: 'Topics Planned', value: '34' },
              { label: 'Combinations', value: '∞' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-2xl font-bold text-white md:text-3xl">{stat.value}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="border-t border-white/[0.08] bg-[#0c0c10] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Zap className="text-amber-400" />,
                title: 'Real-time Visualization',
                desc: 'Instant rendering with zoom, pan, and step navigation. Explore at your own pace.'
              },
              {
                icon: <Compass className="text-cyan-400" />,
                title: 'Precise Geometry Engine',
                desc: 'Backend-computed geometry ensures accuracy. Every angle and line is mathematically exact.'
              },
              {
                icon: <Box className="text-emerald-400" />,
                title: 'Interactive Construction',
                desc: 'Build curves and projections step-by-step with live visual feedback.'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 transition-all hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  {feature.icon}
                </div>
                <h3 className="mb-3 font-heading text-xl font-bold text-slate-200">{feature.title}</h3>
                <p className="leading-relaxed text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Modules Grid ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
                Explore <span className="text-primary-500">Modules</span>
              </h2>
              <p className="mt-2 text-slate-400">Comprehensive curriculum covering all major topics.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Introduction',
                desc: 'The power and importance of engineering graphics in modern engineering.',
                icon: <GraduationCap size={24} />,
                href: '/lab/introduction/importance',
                status: 'Ready',
                color: 'text-blue-400'
              },
              {
                title: 'Plane Curves',
                desc: 'Ellipse, parabola, hyperbola, cycloid — constructed step by step.',
                icon: <Compass size={24} />,
                href: '/lab/curves/ellipse',
                status: 'Ready',
                color: 'text-amber-400'
              },
              {
                title: 'Projection of Solids',
                desc: 'Orthographic projections with 8 solid types across 4 cases.',
                icon: <Box size={24} />,
                href: '/lab/solids',
                featured: true,
                status: 'Interactive',
                color: 'text-primary-400'
              },
              {
                title: 'Development',
                desc: 'Surface development of prisms, pyramids, cylinders, and cones.',
                icon: <Layers size={24} />,
                href: '#',
                status: 'Coming Soon',
                color: 'text-rose-400'
              },
              {
                title: 'Sketching & Perspective',
                desc: 'Freehand sketching, multiple views, and perspective projections.',
                icon: <PenTool size={24} />,
                href: '#',
                status: 'Coming Soon',
                color: 'text-teal-400'
              }
            ].map((module, i) => (
              <Link
                key={i}
                href={module.href}
                className={cn(
                  'group relative flex flex-col rounded-xl border p-6 transition-all',
                  module.featured
                    ? 'border-primary-500/30 bg-primary-500/[0.04] hover:bg-primary-500/[0.08]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]'
                )}
              >
                {module.featured && (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary-500 to-violet-500" />
                )}

                <div className="mb-4 flex items-start justify-between">
                  <div className={cn('p-3 rounded-lg bg-white/5', module.color)}>
                    {module.icon}
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider',
                    module.status === 'Ready' && 'bg-emerald-500/10 text-emerald-400',
                    module.status === 'Interactive' && 'bg-primary-500/10 text-primary-400',
                    module.status === 'Coming Soon' && 'bg-slate-500/10 text-slate-500 border border-white/5'
                  )}>
                    {module.status}
                  </span>
                </div>

                <h3 className="mb-2 font-heading text-lg font-bold text-slate-100 group-hover:text-white">
                  {module.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">
                  {module.desc}
                </p>

                {module.featured && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary-400">
                    Try Now <ArrowRight size={12} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#050508] py-8 text-center">
        <p className="font-heading font-medium text-slate-400">Engineering Graphics Virtual Lab</p>
        <p className="mt-2 text-xs text-slate-600">Next.js · FastAPI · Canvas 2D</p>
      </footer>
    </div>
  );
}
