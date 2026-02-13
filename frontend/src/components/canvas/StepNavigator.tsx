/**
 * StepNavigator — Previous/Next step buttons with step indicator.
 *
 * Ports HTML lines 196-212: step-controls section with prev/next
 * buttons and "Step X / Y" indicator.
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLabStore } from '@/stores/labStore';

export default function StepNavigator() {
    const { currentStep, totalSteps, nextStep, prevStep } = useLabStore();

    return (
        <div className="step-controls">
            <button
                id="prevStepBtn"
                className="control-btn"
                title="Previous Step"
                onClick={prevStep}
                disabled={currentStep <= 1}
            >
                <ChevronLeft size={20} />
                <span>Previous</span>
            </button>

            <span id="stepIndicator" className="step-indicator">
                Step {currentStep} / {totalSteps}
            </span>

            <button
                id="nextStepBtn"
                className="control-btn"
                title="Next Step"
                onClick={nextStep}
                disabled={currentStep >= totalSteps}
            >
                <span>Next</span>
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
