'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { computeCycloid, type CurveResponse } from '@/lib/api';
import { renderElements } from '@/lib/canvas-renderer';
import {
    ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw,
    Play, Loader2,
} from 'lucide-react';

/* ================================================================
   Animation State Machine
   ================================================================
   Steps 8 & 9 have optional "guided mode" animations that mimic
   the legacy cycloid.html behavior:
   1. Blink the center point 3 times (red pulse)
   2. Sweep an arc from the center to the intersection
   3. Blink the radius line 3 times

   The animation only runs when the user first advances TO steps 8/9.
   Once complete, stepping backwards and forwards skips the animation.
   ================================================================ */

interface AnimPhase {
    type: 'blink-center' | 'sweep-arc' | 'blink-radius' | 'done';
    centerIdx: number;   // which center O1..O8
    pointLabel: string;  // 'b', 'c', etc.
    progress: number;    // 0..1 for sweep, blink count for blink
}

export default function CycloidPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [diameter, setDiameter] = useState(100);
    const [data, setData] = useState<CurveResponse | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(1.0);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Animation state
    const [animActive, setAnimActive] = useState(false);
    const [animPhase, setAnimPhase] = useState<AnimPhase | null>(null);
    const animFrameRef = useRef<number>(0);
    const step8AnimDone = useRef(false);
    const step9AnimDone = useRef(false);

    const generate = useCallback(async () => {
        setLoading(true);
        setError(null);
        step8AnimDone.current = false;
        step9AnimDone.current = false;
        try {
            const result = await computeCycloid({ diameter });
            setData(result);
            setCurrentStep(1);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Generation failed');
        } finally {
            setLoading(false);
        }
    }, [diameter]);

    // ── Derived geometry from data.metadata ──
    const getGeometry = useCallback(() => {
        if (!data?.metadata?.parameters) return null;
        const d = data.metadata.parameters.diameter as number;
        const r = data.metadata.parameters.radius as number;
        const circ = data.metadata.parameters.circumference as number;
        const startX = 150;
        const startY = 350;
        const segLen = circ / 8;

        // Circle division points (8 parts, clockwise from bottom)
        const circlePoints: { x: number; y: number }[] = [];
        for (let i = 0; i < 8; i++) {
            const angle = Math.PI * 0.5 - (Math.PI * 2 / 8 * i);
            circlePoints.push({
                x: startX + r * Math.cos(angle),
                y: (startY - r) + r * Math.sin(angle),
            });
        }

        // Centers O, O1-O8
        const centerY = startY - r;
        const centers: { x: number; y: number }[] = [{ x: startX, y: centerY }];
        for (let i = 1; i <= 8; i++) {
            centers.push({ x: startX + segLen * i, y: centerY });
        }

        // Cycloid points
        const cycloidPoints: { x: number; y: number; label: string }[] = [];

        // a
        cycloidPoints.push({ x: circlePoints[0].x, y: circlePoints[0].y, label: 'a' });

        // b, c, d (left side)
        for (const [idx, label] of [[1, 'b'], [2, 'c'], [3, 'd']] as [number, string][]) {
            const ty = circlePoints[idx].y;
            const dySq = (ty - centers[idx].y) ** 2;
            if (r * r >= dySq) {
                const dx = Math.sqrt(r * r - dySq);
                cycloidPoints.push({ x: centers[idx].x - dx, y: ty, label });
            }
        }

        // e (top)
        cycloidPoints.push({ x: centers[4].x, y: centers[4].y - r, label: 'e' });

        // f, g, h (right side)
        for (const [idx, label] of [[5, 'f'], [6, 'g'], [7, 'h']] as [number, string][]) {
            const ty = circlePoints[idx].y;
            const dySq = (ty - centers[idx].y) ** 2;
            if (r * r >= dySq) {
                const dx = Math.sqrt(r * r - dySq);
                cycloidPoints.push({ x: centers[idx].x + dx, y: ty, label });
            }
        }

        // i (bottom from O8)
        cycloidPoints.push({ x: centers[8].x, y: centers[8].y + r, label: 'i' });

        return { d, r, circ, startX, startY, circlePoints, centers, cycloidPoints };
    }, [data]);

    // ── Animation sequences for steps 8 and 9 ──
    // Step 8 animates: O1→b, O2→c, O3→d
    // Step 9 animates: O4→e, O5→f, O6→g, O7→h, O8→i
    const step8Sequence = [
        { centerIdx: 1, pointLabel: 'b' },
        { centerIdx: 2, pointLabel: 'c' },
        { centerIdx: 3, pointLabel: 'd' },
    ];

    const step9Sequence = [
        { centerIdx: 4, pointLabel: 'e' },
        { centerIdx: 5, pointLabel: 'f' },
        { centerIdx: 6, pointLabel: 'g' },
        { centerIdx: 7, pointLabel: 'h' },
        { centerIdx: 8, pointLabel: 'i' },
    ];

    const runAnimation = useCallback((
        sequence: { centerIdx: number; pointLabel: string }[],
        seqIdx: number,
        onComplete: () => void,
    ) => {
        if (seqIdx >= sequence.length) {
            setAnimActive(false);
            setAnimPhase(null);
            onComplete();
            return;
        }

        const item = sequence[seqIdx];

        // Phase 1: Blink center 3 times
        let blinkCount = 0;
        let blinkOn = false;
        const blinkInterval = setInterval(() => {
            blinkOn = !blinkOn;
            setAnimPhase({
                type: 'blink-center',
                centerIdx: item.centerIdx,
                pointLabel: item.pointLabel,
                progress: blinkOn ? 1 : 0,
            });
            if (!blinkOn) {
                blinkCount++;
                if (blinkCount >= 3) {
                    clearInterval(blinkInterval);
                    // Phase 2: Arc sweep
                    const startTime = performance.now();
                    const duration = 800;
                    const sweep = (time: number) => {
                        const elapsed = time - startTime;
                        const fraction = Math.min(elapsed / duration, 1);
                        setAnimPhase({
                            type: 'sweep-arc',
                            centerIdx: item.centerIdx,
                            pointLabel: item.pointLabel,
                            progress: fraction,
                        });
                        if (fraction < 1) {
                            animFrameRef.current = requestAnimationFrame(sweep);
                        } else {
                            // Phase 3: Blink radius line 3 times
                            let lineBlinkCount = 0;
                            let lineOn = true;
                            const lineInterval = setInterval(() => {
                                lineOn = !lineOn;
                                setAnimPhase({
                                    type: 'blink-radius',
                                    centerIdx: item.centerIdx,
                                    pointLabel: item.pointLabel,
                                    progress: lineOn ? 1 : 0,
                                });
                                if (!lineOn) {
                                    lineBlinkCount++;
                                    if (lineBlinkCount >= 3) {
                                        clearInterval(lineInterval);
                                        // Move to next in sequence
                                        runAnimation(sequence, seqIdx + 1, onComplete);
                                    }
                                }
                            }, 400);
                        }
                    };
                    animFrameRef.current = requestAnimationFrame(sweep);
                }
            }
        }, 500);
    }, []);

    // ── Handle step changes with animation triggers ──
    const goToStep = useCallback((newStep: number) => {
        // Cancel any running animation
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }
        setAnimActive(false);
        setAnimPhase(null);

        setCurrentStep(newStep);

        // Trigger animation if stepping TO 8 or 9 for the first time
        if (newStep === 8 && !step8AnimDone.current) {
            setAnimActive(true);
            runAnimation(step8Sequence, 0, () => {
                step8AnimDone.current = true;
            });
        }
        if (newStep === 9 && !step9AnimDone.current) {
            setAnimActive(true);
            runAnimation(step9Sequence, 0, () => {
                step9AnimDone.current = true;
            });
        }
    }, [runAnimation]);

    // ── Canvas rendering ──
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || currentStep === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, rect.width, rect.height);

        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(scale, scale);

        // Draw the base step elements
        const step = data.steps[currentStep - 1];
        if (step) {
            renderElements(ctx, step.elements, false);
        }

        // ── Overlay animation elements ──
        if (animActive && animPhase) {
            const geo = getGeometry();
            if (geo) {
                const center = geo.centers[animPhase.centerIdx];
                const point = geo.cycloidPoints.find(p => p.label === animPhase.pointLabel);

                if (center && point) {
                    if (animPhase.type === 'blink-center') {
                        // Blink: draw center as large red dot when on
                        if (animPhase.progress > 0) {
                            ctx.save();
                            ctx.fillStyle = '#ef4444';
                            ctx.beginPath();
                            ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
                            ctx.fill();
                            // Label
                            ctx.fillStyle = '#ef4444';
                            ctx.font = 'bold 13px sans-serif';
                            ctx.fillText(`O${animPhase.centerIdx}`, center.x + 8, center.y - 8);
                            ctx.restore();
                        }
                    }

                    if (animPhase.type === 'sweep-arc') {
                        const angle = Math.atan2(point.y - center.y, point.x - center.x);
                        const arcStart = angle - 0.25;
                        const arcEnd = angle + 0.25;
                        const currentEnd = arcStart + animPhase.progress * (arcEnd - arcStart);

                        ctx.save();
                        ctx.strokeStyle = '#2563eb';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(center.x, center.y, geo.r, arcStart, currentEnd, false);
                        ctx.stroke();

                        // Draw the found point if sweep is nearly complete
                        if (animPhase.progress > 0.8) {
                            ctx.fillStyle = '#ef4444';
                            ctx.beginPath();
                            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = '#0f172a';
                            ctx.font = '12px sans-serif';
                            ctx.fillText(point.label, point.x + 5, point.y - 5);
                        }
                        ctx.restore();
                    }

                    if (animPhase.type === 'blink-radius') {
                        // Draw the full arc
                        const angle = Math.atan2(point.y - center.y, point.x - center.x);
                        ctx.save();
                        ctx.strokeStyle = '#2563eb';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(center.x, center.y, geo.r, angle - 0.25, angle + 0.25, false);
                        ctx.stroke();

                        // Blink radius line in red
                        if (animPhase.progress > 0) {
                            ctx.strokeStyle = '#ef4444';
                            ctx.lineWidth = 1.5;
                            ctx.beginPath();
                            ctx.moveTo(center.x, center.y);
                            ctx.lineTo(point.x, point.y);
                            ctx.stroke();
                        }

                        // Always show the point
                        ctx.fillStyle = '#ef4444';
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#0f172a';
                        ctx.font = '12px sans-serif';
                        ctx.fillText(point.label, point.x + 5, point.y - 5);
                        ctx.restore();
                    }
                }
            }
        }

        ctx.restore();
    }, [data, currentStep, scale, panOffset, animPhase, animActive, getGeometry]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, []);

    const stepInfo = data?.steps[currentStep - 1];

    return (
        <div className="curve-lab-page">
            <div className="curve-header">
                <h1>Cycloid Curve Construction</h1>
                <p className="curve-subtitle">
                    A cycloid is traced by a point on the rim of a circle rolling along a straight line.
                </p>
            </div>

            <div className="curve-controls">
                <div className="control-group">
                    <label htmlFor="diameter-input">Circle Diameter (mm):</label>
                    <input
                        id="diameter-input"
                        type="number"
                        min={20}
                        max={200}
                        step={10}
                        value={diameter}
                        onChange={e => setDiameter(Number(e.target.value))}
                    />
                </div>
                <button onClick={generate} className="btn-generate" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
                    Generate
                </button>
            </div>

            {stepInfo && (
                <div className="step-info-bar">
                    <strong>Step {currentStep}/{data?.total_steps}:</strong> {stepInfo.description}
                    {animActive && (
                        <span className="anim-indicator"> — 🔴 Animation in progress…</span>
                    )}
                </div>
            )}

            <div className="curve-canvas-container">
                <canvas ref={canvasRef} className="curve-canvas" />
                {!data && !loading && (
                    <div className="canvas-placeholder">
                        <p>Set circle diameter and click Generate</p>
                    </div>
                )}
            </div>

            {data && (
                <div className="curve-nav">
                    <button
                        onClick={() => goToStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep <= 1 || animActive}
                        className="nav-btn"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span className="step-counter">
                        Step {currentStep} / {data.total_steps}
                    </span>
                    <button
                        onClick={() => goToStep(Math.min(data.total_steps, currentStep + 1))}
                        disabled={currentStep >= data.total_steps || animActive}
                        className="nav-btn"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                    <div className="zoom-controls">
                        <button onClick={() => setScale(s => s * 1.1)} className="zoom-btn">
                            <ZoomIn size={16} />
                        </button>
                        <button onClick={() => setScale(s => s / 1.1)} className="zoom-btn">
                            <ZoomOut size={16} />
                        </button>
                        <button onClick={() => { setScale(1.0); setPanOffset({ x: 0, y: 0 }); }} className="zoom-btn">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="error-msg">{error}</div>}
        </div>
    );
}
