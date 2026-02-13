'use client';

import { useLabStore } from '@/stores/labStore';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

export default function InstructionPanel() {
    const { projectionResponse, currentStep, totalSteps } = useLabStore();

    /* ─── Derived State ─── */
    const step =
        projectionResponse && currentStep >= 1 && currentStep <= totalSteps
            ? projectionResponse.steps[currentStep - 1]
            : null;

    const isWelcome = !step;

    return (
        <div className={cn(
            'relative flex min-h-instruction flex-col items-center justify-center p-4',
            'border-b border-edge-light bg-instruction-bar',
            'transition-colors duration-500',
            !isWelcome && 'items-start md:flex-row md:items-center md:justify-start md:px-6'
        )}>

            {/* ─── Top-Right Step Count Chip (Only when steps active) ─── */}
            {!isWelcome && (
                <div className="absolute right-4 top-3 hidden md:block">
                    <span className="
            rounded-full bg-white/60 px-2.5 py-1
            text-[10px] font-bold uppercase tracking-wider text-slate-500
            shadow-inner-sm ring-1 ring-black/[0.04]
          ">
                        Step {currentStep} of {totalSteps}
                    </span>
                </div>
            )}

            {/* ─── Content Container ─── */}
            <div className={cn(
                'flex w-full max-w-4xl gap-4',
                isWelcome ? 'flex-col items-center text-center' : 'flex-row items-center'
            )}>

                {/* ── Icon / Badge ── */}
                <div className="shrink-0">
                    {isWelcome ? (
                        <div className="
              flex h-10 w-10 items-center justify-center
              rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04]
            ">
                            <Info className="text-primary-500" size={20} />
                        </div>
                    ) : (
                        <div className="
              flex h-8 w-8 items-center justify-center
              rounded-full bg-primary-500
              text-sm font-bold text-white shadow-glow-sm
              animate-pulse-soft
            ">
                            {currentStep}
                        </div>
                    )}
                </div>

                {/* ── Text Content ── */}
                <div className="flex-1 space-y-1">
                    <h3 className={cn(
                        'font-heading font-bold leading-tight text-slate-800',
                        isWelcome ? 'text-lg' : 'text-sm md:text-base'
                    )}>
                        {isWelcome ? 'Welcome to Virtual Lab' : step?.title}
                    </h3>

                    <p className="max-w-[800px] text-xs leading-relaxed text-slate-600 md:text-sm">
                        {isWelcome
                            ? 'Configure parameters in the input panel and click Generate Projection to begin the step-by-step visualization.'
                            : step?.description
                        }
                    </p>

                    {/* ── Metadata Display (Beta angle, etc) ── */}
                    {step?.metadata && (
                        <div className="pt-1">
                            {Object.entries(step.metadata).map(([key, val]) => (
                                <span key={key} className="
                  inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5
                  text-[10px] font-medium text-indigo-700
                ">
                                    {key}: {val}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
