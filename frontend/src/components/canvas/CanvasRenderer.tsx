'use client';

import { useCallback, useEffect, useRef } from 'react';
import { renderStep } from '@/lib/canvas-renderer';
import { useLabStore } from '@/stores/labStore';

export default function CanvasRenderer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPanningRef = useRef(false);
    const lastPosRef = useRef({ x: 0, y: 0 });

    const {
        projectionResponse,
        currentStep,
        zoom,
        panX,
        panY,
        setPan,
        zoomIn,
        zoomOut
    } = useLabStore();

    /* ─── Resize Handler ─── */
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Match container dimensions accurately
        const { width, height } = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
    }, []);

    /* ─── Draw Handler ─── */
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas frame
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (projectionResponse && currentStep >= 1) {
            const stepIndex = Math.min(currentStep, projectionResponse.total_steps) - 1;
            const step = projectionResponse.steps[stepIndex];
            const displayWidth = canvas.width / dpr;
            const displayHeight = canvas.height / dpr;

            renderStep(ctx, step, displayWidth, displayHeight, { zoom, panX, panY });
        }
    }, [projectionResponse, currentStep, zoom, panX, panY]);

    /* ─── Observers & Lifecycles ─── */
    useEffect(() => {
        resizeCanvas();
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            resizeCanvas();
            draw();
        });
        observer.observe(container);

        return () => observer.disconnect();
    }, [resizeCanvas, draw]);

    useEffect(() => {
        draw();
    }, [draw]);

    /* ─── Mouse Events (Pan/Zoom) ─── */
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isPanningRef.current = true;
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanningRef.current) return;
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        setPan(panX + dx, panY + dy);
    }, [panX, panY, setPan]);

    const handleMouseUp = useCallback(() => {
        isPanningRef.current = false;
        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault(); // Prevent page scroll
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
    }, [zoomIn, zoomOut]);

    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden">
            <canvas
                ref={canvasRef}
                className="block touch-none rounded-xl bg-white shadow-canvas cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            />
        </div>
    );
}
