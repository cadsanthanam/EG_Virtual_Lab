'use client';

import { useLabStore } from '@/stores/labStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    RotateCcw,
    Maximize
} from 'lucide-react';
import { SOLID_OPTIONS, CASE_OPTIONS } from '@/types/projection';
import { cn } from '@/lib/utils';

export default function CanvasControls() {
    const {
        zoomIn, zoomOut, resetView,
        currentStep, totalSteps, nextStep, prevStep,
        solidType, caseType,
        projectionResponse
    } = useLabStore();

    const handleReset = () => {
        resetView();
    }

    // Find labels for context display
    const solidLabel = SOLID_OPTIONS.find(s => s.value === solidType)?.label || 'Solid';
    const caseLabel = CASE_OPTIONS.find(c => c.value === caseType)?.label || 'Case';

    // Calculate progress percentage
    const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

    if (!projectionResponse) return null;

    return (
        <div className="flex flex-col border-b border-edge-light bg-white shadow-sm relative z-20">
            {/* ─── Toolbar Row ─── */}
            <div className="flex h-[52px] items-center justify-between px-4">

                {/* Left: Zoom Controls */}
                <div className="flex items-center gap-1">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                                    onClick={zoomIn}
                                    aria-label="Zoom In"
                                >
                                    <Plus size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Zoom In</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                                    onClick={zoomOut}
                                    aria-label="Zoom Out"
                                >
                                    <Minus size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Zoom Out</TooltipContent>
                        </Tooltip>

                        <Separator orientation="vertical" className="mx-1 h-5" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost" size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                                    onClick={handleReset}
                                    aria-label="Reset View"
                                >
                                    <Maximize size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Reset View</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Center: Context Label */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-heading font-bold text-slate-800">
                            {solidLabel}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded text-xs">
                            {caseLabel}
                        </span>
                    </div>
                </div>

                {/* Right: Step Navigation */}
                <div className="flex items-center">
                    <div className="
              flex items-center gap-1 p-1
              rounded-lg border border-slate-200 bg-slate-50/50
            ">
                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 rounded-md hover:bg-white hover:shadow-xs disabled:opacity-30"
                            onClick={prevStep}
                            disabled={currentStep <= 1}
                            aria-label="Previous Step"
                        >
                            <ChevronLeft size={16} />
                        </Button>

                        <span className="min-w-[4rem] text-center font-mono text-sm font-medium text-slate-600 tabular-nums">
                            {currentStep} / {totalSteps}
                        </span>

                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 rounded-md hover:bg-white hover:shadow-xs disabled:opacity-30"
                            onClick={nextStep}
                            disabled={currentStep >= totalSteps}
                            aria-label="Next Step"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ─── Progress Bar (Bottom Edge) ─── */}
            <div className="h-[3px] w-full bg-slate-100 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-violet-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
