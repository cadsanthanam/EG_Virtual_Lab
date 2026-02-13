'use client';

import { useState } from 'react';

export default function ImportancePage() {
    const [revealVisible, setRevealVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('manufacturing');
    const [currentEra, setCurrentEra] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const eras = [
        { id: 'ancient', title: 'Ancient Beginnings (Before 1500 CE)', text: 'The earliest technical drawings appear in ancient civilizations. Leonardo da Vinci elevated technical drawing with detailed mechanical drawings and exploded views, establishing techniques still recognized today.' },
        { id: 'industrial', title: 'Industrial Revolution (1760-1840)', text: 'As manufacturing moved from craft to industrial production, engineering drawings became critical for communicating designs between engineers and craftsmen.' },
        { id: 'standardization', title: 'Standardization Period (1840-1970)', text: 'With international trade expanding, standardized drawing practices developed through organizations like ANSI and BSI.' },
        { id: 'digital', title: 'Digital Revolution (1970-Present)', text: 'Computer-Aided Design (CAD) transformed engineering graphics. Despite technological advances, fundamental principles of projection theory and dimensioning remain unchanged.' },
    ];

    const correctAnswers: Record<string, string> = { q1: 'b', q2: 'c', q3: 'b' };

    const checkQuiz = () => {
        setQuizSubmitted(true);
    };

    const score = Object.keys(correctAnswers).filter(q => quizAnswers[q] === correctAnswers[q]).length;

    return (
        <div className="content-page">
            {/* Challenge Section */}
            <section className="content-section">
                <h2>The Power of Engineering Graphics</h2>
                <div className="challenge-box">
                    <h3>🎮 Challenge: Draw from Description</h3>
                    <p>Try to draw this shape based on this description:</p>
                    <blockquote className="description-quote">
                        &quot;A shape contains 5 sides, three sides are equal in length, all perpendicular to each other on the right, bottom and left. The top is closed by two inclined lines.&quot;
                    </blockquote>
                    <button onClick={() => setRevealVisible(!revealVisible)} className="reveal-btn">
                        🔍 {revealVisible ? 'Hide' : 'Reveal'} the Shape
                    </button>
                    {revealVisible && (
                        <div className="reveal-content">
                            <h4>It&apos;s an outline of a house!</h4>
                            <svg width="200" height="150" viewBox="0 0 200 150" className="shape-svg">
                                <path d="M50,100 L50,50 L150,50 L150,100 L50,100 Z M50,50 L100,20 L150,50"
                                    fill="var(--accent-primary)" stroke="var(--border-hover)" strokeWidth="2" />
                            </svg>
                            <p className="moral-text">
                                <strong>Moral:</strong> Words alone are ambiguous! Without a visual, even simple shapes get misinterpreted. That&apos;s why engineers use graphics — the universal language of precision.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Importance */}
            <section className="content-section">
                <h2>The Universal Language of Engineering</h2>
                <blockquote>&quot;Engineering graphics is the art of turning imagination into blueprints and blueprints into reality.&quot;</blockquote>
                <blockquote>&quot;The engineer&apos;s first tool is not a calculator — it&apos;s a pencil.&quot; <cite>— Adapted from Henry Petroski</cite></blockquote>
                <p>Engineering graphics provides a standardized visual system that communicates:</p>
                <ul>
                    <li>Exact shapes and dimensions</li>
                    <li>Spatial relationships between components</li>
                    <li>Assembly instructions</li>
                    <li>Manufacturing specifications</li>
                </ul>
            </section>

            {/* Disciplines Table */}
            <section className="content-section">
                <h2>Necessity Across Disciplines</h2>
                <table className="content-table">
                    <thead>
                        <tr><th>Discipline</th><th>How They Use Engineering Graphics</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Mechanical</td><td>Designing gears, engines, and CNC machining plans</td></tr>
                        <tr><td>Civil</td><td>Blueprints for bridges, dams, and urban layouts</td></tr>
                        <tr><td>Computer Science</td><td>CAD modeling for game assets, UI/UX wireframes, and 3D printing</td></tr>
                        <tr><td>Electrical</td><td>Circuit diagrams, PCB layouts, and sensor networks</td></tr>
                        <tr><td>Aerospace</td><td>Airfoil curves, spacecraft assembly diagrams</td></tr>
                    </tbody>
                </table>
            </section>

            {/* Brain Enhancement */}
            <section className="content-section">
                <h2>How Engineering Graphics Enhances Your Brain 🧠</h2>
                <div className="skills-grid">
                    <div className="skill-card"><h3>💡 Imagination</h3><p>Translating abstract ideas into tangible sketches</p></div>
                    <div className="skill-card"><h3>👁️ Visualization</h3><p>Rotating 3D objects mentally (critical for VR/AR!)</p></div>
                    <div className="skill-card"><h3>🧩 Spatial Thinking</h3><p>Understanding how parts fit together</p></div>
                    <div className="skill-card"><h3>⚙️ Problem-Solving</h3><p>Identifying design flaws before manufacturing</p></div>
                </div>
            </section>

            {/* Daily Life Tabs */}
            <section className="content-section">
                <h2>Engineering Graphics in Daily Life</h2>
                <div className="tabs-container">
                    <div className="tabs-row">
                        {['manufacturing', 'services', 'everyday'].map(tab => (
                            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="tab-panel">
                        {activeTab === 'manufacturing' && <p>Every iPhone, car, or chair starts as a detailed drawing. LEGO bricks have tolerances of 0.002mm — achieved through meticulous drafting.</p>}
                        {activeTab === 'services' && <p>Google Maps: Built from geographic GIS diagrams. Medical Imaging: MRI scans are 3D visualizations of the human body.</p>}
                        {activeTab === 'everyday' && <p>Road signs, emojis 📱, and even meme templates rely on visual communication!</p>}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="content-section">
                <h2>Historical Evolution</h2>
                <div className="timeline-nav">
                    <button onClick={() => setCurrentEra(e => Math.max(0, e - 1))} disabled={currentEra === 0} className="nav-btn">← Previous</button>
                    <span className="era-indicator">{currentEra + 1} / {eras.length}</span>
                    <button onClick={() => setCurrentEra(e => Math.min(eras.length - 1, e + 1))} disabled={currentEra === eras.length - 1} className="nav-btn">Next →</button>
                </div>
                <div className="era-card">
                    <h3>{eras[currentEra].title}</h3>
                    <p>{eras[currentEra].text}</p>
                </div>
            </section>

            {/* Quiz */}
            <section className="content-section">
                <h2>Quick Assessment</h2>
                <div className="quiz">
                    <div className="quiz-q">
                        <p><strong>1.</strong> Why is engineering graphics called the &quot;universal language&quot;?</p>
                        {['a) All engineers speak English', 'b) Standardized visual communication transcends language barriers', 'c) Only used in universities', 'd) Easier than mathematics'].map((opt, i) => (
                            <label key={i} className="quiz-option">
                                <input type="radio" name="q1" value={String.fromCharCode(97 + i)}
                                    onChange={e => setQuizAnswers(prev => ({ ...prev, q1: e.target.value }))} />
                                {opt}
                            </label>
                        ))}
                    </div>
                    <div className="quiz-q">
                        <p><strong>2.</strong> Which cognitive skill does engineering graphics NOT directly enhance?</p>
                        {['a) Spatial thinking', 'b) Visualization', 'c) Speed reading', 'd) Problem-solving'].map((opt, i) => (
                            <label key={i} className="quiz-option">
                                <input type="radio" name="q2" value={String.fromCharCode(97 + i)}
                                    onChange={e => setQuizAnswers(prev => ({ ...prev, q2: e.target.value }))} />
                                {opt}
                            </label>
                        ))}
                    </div>
                    <div className="quiz-q">
                        <p><strong>3.</strong> What happened to the Tacoma Narrows Bridge?</p>
                        {['a) It was too heavy', 'b) Aerodynamic instability caused collapse', 'c) It was never built', 'd) Earthquake damage'].map((opt, i) => (
                            <label key={i} className="quiz-option">
                                <input type="radio" name="q3" value={String.fromCharCode(97 + i)}
                                    onChange={e => setQuizAnswers(prev => ({ ...prev, q3: e.target.value }))} />
                                {opt}
                            </label>
                        ))}
                    </div>
                    <button onClick={checkQuiz} className="btn-generate">Submit Quiz</button>
                    {quizSubmitted && (
                        <div className={`quiz-result ${score === 3 ? 'success' : 'partial'}`}>
                            You got {score} out of 3 correct! {score === 3 ? '🎉 Perfect!' : 'Review the material above.'}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
