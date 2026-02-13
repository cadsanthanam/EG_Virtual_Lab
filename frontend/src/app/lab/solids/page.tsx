'use client';

import { useLabStore } from '@/stores/labStore';
import InputPanel from '@/components/lab/InputPanel';
import CanvasControls from '@/components/canvas/CanvasControls';
import InstructionPanel from '@/components/lab/InstructionPanel';
import CanvasRenderer from '@/components/canvas/CanvasRenderer';
import { PenTool } from 'lucide-react';

export default function SolidsLabPage() {
    const { projectionResponse, isLoading } = useLabStore();

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* ─── Left Sidebar: Input Parameters ─── */}
            <InputPanel />

            {/* ─── Right Area: Workspace ─── */}
            <div className="flex flex-1 flex-col min-w-0 bg-surface-canvas">

                {/* Top: Controls & Toolbar */}
                <CanvasControls />

                {/* Middle: Progress & Instructions */}
                <InstructionPanel />

                {/* Bottom: Canvas Workspace */}
                <div className="
          relative flex-1 overflow-hidden p-6
          bg-grid-lines bg-grid-24
        ">
                    {!projectionResponse ? (
                        /* ─── Empty State ─── */
                        <div className="
               absolute inset-0 flex flex-col items-center justify-center
               text-slate-400 animate-fade-in
             ">
                            <div className="
                 mb-6 flex h-24 w-24 items-center justify-center
                 rounded-3xl bg-white shadow-xl ring-1 ring-black/[0.04]
                 animate-float
               ">
                                <PenTool size={48} className="text-primary-200" strokeWidth={1.5} />
                            </div>

                            <h3 className="mb-2 font-heading text-xl font-bold text-slate-700">
                                Ready to Visualize
                            </h3>
                            <p className="max-w-xs text-center text-sm leading-relaxed text-slate-500">
                                Select a solid and case type from the panel, then click
                                <strong className="font-semibold text-primary-600"> Generate Projection</strong>.
                            </p>
                        </div>
                    ) : (
                        /* ─── Canvas Renderer ─── */
                        <div className="h-full w-full animate-canvas-reveal">
                            <CanvasRenderer />
                        </div>
                    )}

                    {/* ─── Loading Overlay ─── */}
                    {isLoading && (
                        <div className="
              absolute inset-0 z-50 flex items-center justify-center
              bg-white/60 backdrop-blur-[2px] animate-fade-in
            ">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full w-1/2 animate-shimmer bg-shimmer-gradient" />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-widest text-primary-600">
                                    Rendering...
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
