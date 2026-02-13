'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCcw, Eye } from 'lucide-react';

export default function IntroductionPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // Simple drawing canvas functionality
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 600;
        canvas.height = 300;
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const handleMouseDown = (e: MouseEvent) => {
            setIsDrawing(true);
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        };

        const handleMouseUp = () => setIsDrawing(false);

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [isDrawing]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setShowComparison(false);
    };

    return (
        <article className="
            mx-auto max-w-[840px] px-6 py-12
            prose prose-slate prose-lg
            prose-headings:font-heading prose-headings:tracking-tight
            prose-h1:text-4xl prose-h1:font-black prose-h1:mb-4
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-strong:font-semibold prose-strong:text-slate-900
            prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/30 prose-blockquote:py-1 prose-blockquote:not-italic
        ">
            {/* Header */}
            <div>
                <h1>The Importance of Engineering Graphics</h1>
                <p className="text-xl text-slate-500 font-light mt-0 leading-normal">
                    The universal language that turns imagination into reality
                </p>
            </div>

            {/* Interactive Challenge */}
            <div className="not-prose my-10">
                <div className="
                    relative overflow-hidden rounded-xl border border-amber-400/20
                    bg-gradient-to-br from-amber-50 to-orange-50/50 p-6
                ">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />

                    <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-amber-900">
                        <span className="text-xl">🎮</span> Start with a Challenge!
                    </h3>

                    <p className="mb-4 text-slate-700">
                        <strong>Describe this shape so someone can draw it perfectly:</strong>
                    </p>

                    <blockquote className="mb-5 border-l-4 border-amber-400/40 bg-white/60 p-4 text-slate-600 italic rounded-r-lg">
                        &quot;A closed figure with 4 sides. Two sides are parallel and equal in length. The other two sides are non-parallel but equal. Angles are not 90 degrees.&quot;
                    </blockquote>

                    <details className="group">
                        <summary className="
                            flex cursor-pointer items-center gap-2 font-medium text-amber-700
                            transition-colors hover:text-amber-800
                        ">
                            🔍 <strong>Reveal the Shape</strong> (Spoiler: Isosceles Trapezoid!)
                        </summary>
                        <div className="mt-4 rounded-lg bg-white/60 p-4 border border-amber-200/50 animate-fade-in">
                            <svg width="200" height="120" viewBox="0 0 200 120">
                                <polygon points="60,100 140,100 160,30 40,30"
                                    fill="#f59e0b" stroke="#d97706" strokeWidth="2" fillOpacity="0.2" />
                            </svg>
                            <p className="mt-2 text-sm text-slate-600">
                                <strong>Moral:</strong> Words alone are ambiguous! Engineers use graphics for precision.
                            </p>
                        </div>
                    </details>
                </div>

                {/* Drawing Area */}
                <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="font-heading text-lg font-bold text-slate-800 mb-2">Try Drawing It Yourself!</h3>
                    <p className="text-sm text-slate-500 mb-4">Use your mouse to draw what you think the shape looks like:</p>

                    <div className="mb-4 flex gap-3">
                        <Button variant="outline" size="sm" onClick={clearCanvas}>
                            <RefreshCcw size={14} className="mr-2" /> Clear Canvas
                        </Button>
                        <Button size="sm" onClick={() => setShowComparison(true)}>
                            <Eye size={14} className="mr-2" /> Compare Solution
                        </Button>
                    </div>

                    <div className="relative overflow-hidden rounded-lg border border-slate-100 bg-slate-50/50">
                        <canvas ref={canvasRef} className="block w-full cursor-crosshair touch-none" />

                        {showComparison && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 animate-fade-in">
                                <div className="text-center">
                                    <h4 className="font-heading font-bold text-slate-800 mb-4">Correct Shape</h4>
                                    <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
                                        <polygon points="60,100 140,100 160,30 40,30"
                                            fill="#3b82f6" stroke="#2563eb" strokeWidth="2" fillOpacity="0.2" />
                                        <text x="100" y="70" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="500">Isosceles Trapezoid</text>
                                    </svg>
                                    <Button variant="ghost" size="sm" onClick={() => setShowComparison(false)} className="mt-4">
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Theory */}
            <h2>Why Engineering Graphics?</h2>
            <blockquote>&quot;Engineering graphics is the art of turning imagination into blueprints and blueprints into reality.&quot;</blockquote>

            <h3>Necessity Across Disciplines</h3>
            <div className="not-prose overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Discipline</th>
                            <th className="px-4 py-3">Application</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                            ['Mechanical', 'Designing gears, engines, and CNC machining plans'],
                            ['Civil', 'Blueprints for bridges, dams, and urban layouts'],
                            ['Computer Science', 'CAD modeling, UI/UX wireframes, 3D printing'],
                            ['Electrical', 'Circuit diagrams, PCB layouts, sensor networks'],
                            ['Aerospace', 'Airfoil curves, spacecraft assembly diagrams'],
                        ].map(([d, a], i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-medium text-slate-800">{d}</td>
                                <td className="px-4 py-3 text-slate-600">{a}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Brain Benefits */}
            <h2>How It Enhances Your Brain 🧠</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-2">
                {[
                    { t: '💡 Imagination', d: 'Translating abstract ideas into tangible sketches' },
                    { t: '👁️ Visualization', d: 'Rotating 3D objects mentally' },
                    { t: '🧩 Spatial Thinking', d: 'Understanding how parts fit together' },
                    { t: '⚙️ Problem-Solving', d: 'Identifying flaws before manufacturing' },
                ].map((s, i) => (
                    <div key={i} className="
                        rounded-xl border border-slate-200 bg-white p-5
                        transition-transform hover:-translate-y-1 hover:shadow-md
                    ">
                        <h3 className="mb-2 font-heading font-bold text-slate-800">{s.t}</h3>
                        <p className="text-sm text-slate-500">{s.d}</p>
                    </div>
                ))}
            </div>

            {/* Failure Case Study */}
            <h2>When Graphics Go Wrong</h2>
            <div className="not-prose rounded-xl border border-red-200 bg-red-50/50 p-6">
                <h3 className="mb-3 font-heading text-lg font-bold text-red-900">
                    The Tacoma Narrows Bridge (1940)
                </h3>
                <div className="space-y-2 text-sm text-red-800">
                    <p><strong>Mistake:</strong> Engineers overlooked aerodynamic stability in their drawings.</p>
                    <p><strong>Result:</strong> The &quot;Galloping Gertie&quot; bridge twisted and collapsed in mild winds.</p>
                    <p className="font-medium pt-2 border-t border-red-200 mt-2">
                        Lesson: A pretty drawing ≠ a functional design. Always validate with physics!
                    </p>
                </div>
            </div>

            {/* Closing */}
            <div className="not-prose mt-12 mb-8 p-8 text-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50">
                <blockquote className="text-lg font-medium text-slate-700 italic">
                    &quot;Next time you see a skyscraper, a smartphone, or even a coffee mug, remember: someone, somewhere, drew it first.&quot;
                </blockquote>
                <p className="mt-4 font-heading font-bold text-primary-600 text-xl">
                    What will YOU draw tomorrow?
                </p>
            </div>
        </article>
    );
}
