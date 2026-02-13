'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowLeft } from 'lucide-react';

function ComingSoonContent() {
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || 'this topic';

    const topicNames: Record<string, string> = {
        'instruments': 'Drafting Instruments',
        'conventions': 'BIS Conventions',
        'layout': 'Drawing Sheet Layout',
        'lettering': 'Lettering & Dimensioning',
        'parabola': 'Parabola Construction',
        'hyperbola': 'Hyperbola Construction',
        'epicycloid': 'Epicycloid Curve',
        'hypocycloid': 'Hypocycloid Curve',
        'involutes': 'Involutes',
        'tangents': 'Tangents & Normals',
        'points': 'Projection of Points',
        'straight-lines': 'Projection of Lines',
        'true-lengths': 'True Lengths',
        'polygonal': 'Polygonal Surfaces',
        'circular': 'Circular Surfaces',
        'prisms': 'Prisms',
        'pyramids': 'Pyramids',
        'cylinder': 'Cylinder',
        'cone': 'Cone',
        'sectioning': 'Sectioning of Solids',
        'true-shape': 'True Shape of Section',
        'dev-prisms': 'Development of Prisms',
        'dev-pyramids': 'Development of Pyramids',
        'dev-cylinder': 'Development of Cylinders',
        'dev-cone': 'Development of Cones',
        'isometric-principles': 'Isometric Principles',
        'isometric-solids': 'Isometric of Solids',
        'multiple-views': 'Multiple Views',
        'pictorial-views': 'Pictorial Views',
        'perspective-prism': 'Perspective: Prisms',
        'perspective-pyramid': 'Perspective: Pyramids',
        'perspective-cylinder': 'Perspective: Cylinder',
        'perspective-cone': 'Perspective: Cone',
    };

    const title = topicNames[topic] || topic;

    return (
        <div className="coming-soon-page">
            <div className="coming-soon-card">
                <Clock size={48} className="coming-soon-icon" />
                <h1>{title}</h1>
                <p>This module is under development and will be available soon.</p>
                <p className="coming-soon-detail">
                    We&apos;re actively building interactive step-by-step constructions
                    for this topic. Check back soon!
                </p>
                <div className="coming-soon-actions">
                    <Link href="/lab/solids" className="btn-primary">
                        Try Projections of Solids →
                    </Link>
                    <Link href="/" className="btn-secondary">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ComingSoonPage() {
    return (
        <Suspense fallback={
            <div className="coming-soon-page">
                <div className="coming-soon-card">
                    <Clock size={48} className="coming-soon-icon" />
                    <h1>Loading...</h1>
                </div>
            </div>
        }>
            <ComingSoonContent />
        </Suspense>
    );
}
