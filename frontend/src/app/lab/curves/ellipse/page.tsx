'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { computeEllipse, type CurveResponse } from '@/lib/api';
import { renderElements } from '@/lib/canvas-renderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw,
    Play, Loader2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EllipsePage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [focusDist, setFocusDist] = useState(80);
    const [eccentricity, setEccentricity] = useState('3/5');
    const [data, setData] = useState<CurveResponse | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(2.5);

    const generate = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await computeEllipse({
                focus_dist: focusDist,
                eccentricity,
            });
            setData(result);
            setCurrentStep(1);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Generation failed');
        } finally {
            setLoading(false);
        }
    }, [focusDist, eccentricity]);

    // Render current step
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || currentStep === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Transform: origin at 10% left, 50% top
        ctx.save();
        ctx.translate(rect.width * 0.1, rect.height * 0.5);
        ctx.scale(scale, -scale); // Flip Y

        // Render elements
        const step = data.steps[currentStep - 1];
        if (step) {
            renderElements(ctx, step.elements, true);
        }

        ctx.restore();
    }, [data, currentStep, scale]);

    const stepInfo = data?.steps[currentStep - 1];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden md:flex-row">
            {/* ─── Sidebar Controls ─── */}
            <aside className="
                w-full border-b border-edge-light bg-white p-5
                md:w-80 md:border-b-0 md:border-r md:p-6
                flex flex-col gap-6 overflow-y-auto shrink-0
            ">
                <div className="space-y-1">
                    <h1 className="font-heading text-xl font-bold text-slate-900">
                        Conic Construction
                    </h1>
                    <p className="text-sm text-slate-500">
                        Focus-Directrix Method
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="focus-dist">Focus Distance (AF)</Label>
                        <div className="relative">
                            <Input
                                id="focus-dist"
                                type="number"
                                min={10} max={200} step={5}
                                value={focusDist}
                                onChange={e => setFocusDist(Number(e.target.value))}
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400">mm</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ecc-input">Eccentricity (e)</Label>
                        <Input
                            id="ecc-input"
                            value={eccentricity}
                            onChange={e => setEccentricity(e.target.value)}
                            placeholder="e.g. 3/5"
                        />
                        <p className="text-xs text-slate-400">
                            &lt; 1 Ellipse, = 1 Parabola, &gt; 1 Hyperbola
                        </p>
                    </div>

                    <Button onClick={generate} disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                        Generate Curve
                    </Button>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-auto rounded-lg bg-slate-50 p-4 border border-slate-100">
                    <h3 className="mb-2 font-heading text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Info size={14} className="text-primary-500" /> curve Properties
                    </h3>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="font-medium capitalize text-slate-900">
                                {data?.metadata?.curve_type || '—'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Eccentricity:</span>
                            <span className="font-medium text-slate-900">
                                {data ? eccentricity : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <main className="flex flex-1 flex-col bg-slate-50/50">
                {/* Top Bar: Instructions & Nav */}
                <div className="border-b border-edge-light bg-white px-6 py-3 flex items-center justify-between min-h-[60px]">
                    <div className="flex-1 mr-4">
                        {stepInfo ? (
                            <p className="text-sm text-slate-700">
                                <span className="font-bold text-primary-600 mr-2">Step {currentStep}:</span>
                                {stepInfo.description}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Generate a curve to see steps...</p>
                        )}
                    </div>

                    {/* Step Nav */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                                disabled={!data || currentStep <= 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="px-2 text-xs font-mono font-medium text-slate-600 min-w-[3rem] text-center">
                                {currentStep} / {data?.total_steps || 0}
                            </span>
                            <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={() => setCurrentStep(s => Math.min(data?.total_steps || 0, s + 1))}
                                disabled={!data || currentStep >= (data?.total_steps || 0)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden bg-grid-lines bg-grid-24">
                    <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />

                    {/* Zoom Tools */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-2 rounded-lg bg-white p-1 shadow-md border border-slate-100">
                        <Button variant="ghost" size="icon" onClick={() => setScale(s => s * 1.1)}>
                            <ZoomIn size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setScale(s => s / 1.1)}>
                            <ZoomOut size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setScale(2.5)}>
                            <RotateCcw size={16} />
                        </Button>
                    </div>

                    {!data && !loading && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center text-slate-400">
                                <Info size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Select parameters and click "Generate Curve"</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
