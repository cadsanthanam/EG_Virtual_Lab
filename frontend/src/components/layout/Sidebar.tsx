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
interface Unit { id: string; title: string; icon: React.ReactNode; topics: Topic[] }

/* ─── Data ─── */
const UNITS: Unit[] = [
    {
        id: 'introduction',
        title: 'Introduction',
        icon: <BookOpen size={16} />,
        topics: [
            { id: 'importance', title: 'Importance of Graphics', href: '/lab/introduction/importance', ready: true },
            { id: 'introduction', title: 'Introduction to EG', href: '/lab/introduction', ready: true },
            { id: 'instruments', title: 'Drafting Instruments', href: '/lab/coming-soon?topic=instruments', ready: false },
            { id: 'conventions', title: 'BIS Conventions', href: '/lab/coming-soon?topic=conventions', ready: false },
            { id: 'layout', title: 'Drawing Sheet Layout', href: '/lab/coming-soon?topic=layout', ready: false },
            { id: 'lettering', title: 'Lettering & Dimensioning', href: '/lab/coming-soon?topic=lettering', ready: false },
        ],
    },
    {
        id: 'curves',
        title: 'Unit 1: Plane Curves',
        icon: <Compass size={16} />,
        topics: [
            { id: 'ellipse', title: 'Ellipse Construction', href: '/lab/curves/ellipse', ready: true },
            { id: 'parabola', title: 'Parabola Construction', href: '/lab/coming-soon?topic=parabola', ready: false },
            { id: 'hyperbola', title: 'Hyperbola Construction', href: '/lab/coming-soon?topic=hyperbola', ready: false },
            { id: 'cycloid', title: 'Cycloid Curve', href: '/lab/curves/cycloid', ready: true },
            { id: 'epicycloid', title: 'Epicycloid Curve', href: '/lab/coming-soon?topic=epicycloid', ready: false },
            { id: 'hypocycloid', title: 'Hypocycloid Curve', href: '/lab/coming-soon?topic=hypocycloid', ready: false },
            { id: 'involutes', title: 'Involutes', href: '/lab/coming-soon?topic=involutes', ready: false },
            { id: 'tangents', title: 'Tangents & Normals', href: '/lab/coming-soon?topic=tangents', ready: false },
        ],
    },
    {
        id: 'projections-lines',
        title: 'Unit 2: Lines & Planes',
        icon: <PenTool size={16} />,
        topics: [
            { id: 'points', title: 'Projection of Points', href: '/lab/coming-soon?topic=points', ready: false },
            { id: 'straight-lines', title: 'Projection of Lines', href: '/lab/coming-soon?topic=straight-lines', ready: false },
            { id: 'true-lengths', title: 'True Lengths', href: '/lab/coming-soon?topic=true-lengths', ready: false },
            { id: 'polygonal', title: 'Polygonal Surfaces', href: '/lab/coming-soon?topic=polygonal', ready: false },
            { id: 'circular', title: 'Circular Surfaces', href: '/lab/coming-soon?topic=circular', ready: false },
        ],
    },
    {
        id: 'projections-solids',
        title: 'Unit 3: Projection of Solids',
        icon: <Box size={16} />,
        topics: [
            { id: 'solids', title: 'Projections of Solids', href: '/lab/solids', ready: true },
            { id: 'prisms', title: 'Prisms', href: '/lab/coming-soon?topic=prisms', ready: false },
            { id: 'pyramids', title: 'Pyramids', href: '/lab/coming-soon?topic=pyramids', ready: false },
            { id: 'cylinder', title: 'Cylinder', href: '/lab/coming-soon?topic=cylinder', ready: false },
            { id: 'cone', title: 'Cone', href: '/lab/coming-soon?topic=cone', ready: false },
            { id: 'sectioning', title: 'Sectioning of Solids', href: '/lab/coming-soon?topic=sectioning', ready: false },
            { id: 'true-shape', title: 'True Shape of Section', href: '/lab/coming-soon?topic=true-shape', ready: false },
        ],
    },
    {
        id: 'development',
        title: 'Unit 4: Development',
        icon: <Layers size={16} />,
        topics: [
            { id: 'dev-prisms', title: 'Dev. of Prisms', href: '/lab/coming-soon?topic=dev-prisms', ready: false },
            { id: 'dev-pyramids', title: 'Dev. of Pyramids', href: '/lab/coming-soon?topic=dev-pyramids', ready: false },
            { id: 'dev-cylinder', title: 'Dev. of Cylinders', href: '/lab/coming-soon?topic=dev-cylinder', ready: false },
            { id: 'dev-cone', title: 'Dev. of Cones', href: '/lab/coming-soon?topic=dev-cone', ready: false },
            { id: 'isometric-principles', title: 'Isometric Principles', href: '/lab/coming-soon?topic=isometric-principles', ready: false },
            { id: 'isometric-solids', title: 'Isometric of Solids', href: '/lab/coming-soon?topic=isometric-solids', ready: false },
        ],
    },
    {
        id: 'sketching',
        title: 'Unit 5: Sketching & Perspective',
        icon: <Eye size={16} />,
        topics: [
            { id: 'multiple-views', title: 'Multiple Views', href: '/lab/coming-soon?topic=multiple-views', ready: false },
            { id: 'pictorial-views', title: 'Pictorial Views', href: '/lab/coming-soon?topic=pictorial-views', ready: false },
            { id: 'perspective-prism', title: 'Perspective: Prisms', href: '/lab/coming-soon?topic=perspective-prism', ready: false },
            { id: 'perspective-pyramid', title: 'Perspective: Pyramids', href: '/lab/coming-soon?topic=perspective-pyramid', ready: false },
            { id: 'perspective-cylinder', title: 'Perspective: Cylinder', href: '/lab/coming-soon?topic=perspective-cylinder', ready: false },
            { id: 'perspective-cone', title: 'Perspective: Cone', href: '/lab/coming-soon?topic=perspective-cone', ready: false },
        ],
    },
];

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

    const SidebarContent = () => (
        <>
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
                        collapsed && 'mx-auto mt-1',
                        'md:flex hidden' // Only show on desktop
                    )}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed
                        ? <ChevronRight size={12} />
                        : <ChevronLeft size={12} />
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
                                        <TooltipContent side="right" className="font-medium bg-zinc-900 border-zinc-800 text-slate-200">
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
        </>
    );

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
                <SidebarContent />
            </aside>

            {/* ─── Mobile Drawer (separate instance) ─── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop excluded here as it's in layout.tsx, but sidebar structure itself needs the panel */}
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
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

        </TooltipProvider>
    );
}
