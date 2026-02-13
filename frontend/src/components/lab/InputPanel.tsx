'use client';

import { useCallback } from 'react';
import { useLabStore } from '@/stores/labStore';
import type { CaseType, RestingOn, SolidType } from '@/types/projection';
import { CASE_OPTIONS, RESTING_OPTIONS, SOLID_OPTIONS } from '@/types/projection';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

    const showEdgeAngle = caseType === 'A' || caseType === 'B';
    const showAxisAngleHP = caseType === 'C' || caseType === 'D';
    const showAxisAngleVP = caseType === 'D';
    const showRestingOn = caseType === 'C' || caseType === 'D';

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
